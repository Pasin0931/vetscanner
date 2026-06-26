import os
import io
import base64
import functools
from pathlib import Path

import numpy as np
import torch
import cv2
from PIL import Image as PILImage

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime

from torchvision import transforms

if hasattr(torch.serialization, "add_safe_globals"):
    torch.serialization.add_safe_globals([functools.partial])

_original_torch_load = torch.load


def _patched_torch_load(*args, **kwargs):
    kwargs["weights_only"] = False
    return _original_torch_load(*args, **kwargs)


torch.load = _patched_torch_load

from fastai.vision import load_learner

import openslide


# configs

MODEL_DIR = Path(__file__).parent / "model"
SEGMENTATION_MODEL_FILE = "UNet_resnet18_512_2_sdata.pkl"
CLASSIFICATION_MODEL_FILE = "efficientnet_1024_0_sdata.pkl"

SEGMENTATION_PATCH_SIZE = 512
SEGMENTATION_LEVEL = 2

CLASSIFICATION_PATCH_SIZE = 1024
CLASSIFICATION_LEVEL = 0

# Index 5 = "Tumor" in the segmentation label scheme used by the authors
# (Bg=0, Dermis=1, Epidermis=2, Subcutis=3, Inflamm/Necrosis=4, Tumor=5)
SEGMENTATION_TUMOR_CLASS_INDEX = 5

# Classification label scheme used by the authors (index -> name)
# 0 = normal tissue (not a tumor type). The classifier is only ever run on
# tiles segmentation already flagged as tumor, so a "Normal tissue" vote
# here means the classifier disagrees with segmentation on that tile —
# such votes are excluded entirely rather than allowed to win the final
# diagnosis (see _run_classification_on_tiles).
CLASSIFICATION_LABELS = {
    0: "Normal tissue",
    1: "Melanoma",
    2: "Plasmacytoma",
    3: "Mast Cell Tumor",
    4: "Peripheral Nerve Sheath Tumor",
    5: "Squamous Cell Carcinoma",
    6: "Trichoblastoma",
    7: "Histiocytoma",
}

# Fixed RGB color per tumor subtype, used both for annotation boxes on the
# thumbnail and for the matching swatch in the PDF breakdown table. Chosen
# to be visually distinct from one another. Class 0 ("Normal tissue") never
# appears on the thumbnail since those tiles are excluded from
# classification voting, but a color is defined here for completeness.
CLASSIFICATION_COLORS_RGB = {
    0: (160, 160, 160),   # Normal tissue — gray (not actually drawn)
    1: (255, 0, 0),       # Melanoma — bright red
    2: (255, 165, 0),     # Plasmacytoma — bright orange
    3: (180, 0, 255),     # Mast Cell Tumor — bright violet
    4: (0, 230, 200),     # Peripheral Nerve Sheath Tumor — bright teal
    5: (255, 0, 200),     # Squamous Cell Carcinoma — bright pink/magenta
    6: (0, 230, 0),       # Trichoblastoma — bright green
    7: (0, 120, 255),     # Histiocytoma — bright blue
}

MIN_TUMOR_TILES_FOR_DIAGNOSIS = 3  # below this, treat result as inconclusive

# Each SEGMENTATION_PATCH_SIZE tile is subdivided into a grid of
# SUB_TILE_GRID x SUB_TILE_GRID cells when drawing annotations, using the
# per-pixel class map we already computed during segmentation. This gives a
# finer-grained outline that follows the tumor shape more closely than one
# box per full tile, without any extra model inference.
SUB_TILE_GRID = 2


# --- Model loading (runs once at import time) --------------------------------

print("[scan_service] Loading segmentation model...")
segmentation_learner = load_learner(MODEL_DIR, SEGMENTATION_MODEL_FILE)
segmentation_learner.model.eval()

print("[scan_service] Loading classification model...")
classification_learner = load_learner(MODEL_DIR, CLASSIFICATION_MODEL_FILE)
classification_learner.model.eval()

print("[scan_service] Models loaded.")

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# --- Helpers ------------------------------------------------------------------

def _normalize_patch(patch_rgb_float: np.ndarray, stats) -> torch.Tensor:
    """Convert an HxWx3 float [0,1] numpy array into a normalized CHW tensor."""

    tensor = torch.from_numpy(patch_rgb_float.transpose(2, 0, 1)).float()
    mean, std = stats
    
    return transforms.Normalize(mean, std)(tensor)


def _find_tumor_sub_boxes(pred_class_map: np.ndarray, loc_x: int, loc_y: int, downsample: float) -> list:
    """
    Given a tile's per-pixel class map, subdivide it into a SUB_TILE_GRID x
    SUB_TILE_GRID grid of smaller cells and return the level-0 (x, y, w, h)
    box for every cell whose dominant class is Tumor. This produces a
    finer-grained set of boxes that more closely follow the tumor shape
    within the tile than a single box for the whole tile would.
    """
    boxes = []
    map_h, map_w = pred_class_map.shape
    cell_h = max(1, map_h // SUB_TILE_GRID)
    cell_w = max(1, map_w // SUB_TILE_GRID)

    # Level-0 size of one pixel in the (downsampled) class map
    px_size_l0 = downsample * (SEGMENTATION_PATCH_SIZE / map_w)

    for row in range(SUB_TILE_GRID):
        for col in range(SUB_TILE_GRID):
            y0, y1 = row * cell_h, min((row + 1) * cell_h, map_h)
            x0, x1 = col * cell_w, min((col + 1) * cell_w, map_w)
            cell = pred_class_map[y0:y1, x0:x1]
            if cell.size == 0:
                continue

            values, counts = np.unique(cell, return_counts=True)
            dominant_class = values[np.argmax(counts)]
            if dominant_class != SEGMENTATION_TUMOR_CLASS_INDEX:
                continue

            box_x = loc_x + int(x0 * px_size_l0)
            box_y = loc_y + int(y0 * px_size_l0)
            box_w = int((x1 - x0) * px_size_l0)
            box_h = int((y1 - y0) * px_size_l0)
            boxes.append((box_x, box_y, box_w, box_h))

    return boxes


def _generate_annotated_thumbnail_base64(
    slide: "openslide.OpenSlide",
    colored_sub_boxes: list,
    max_size: int = 768,
) -> str:
    """
    Generate a base64-encoded JPEG thumbnail of the whole slide with boxes
    drawn over every fine-grained sub-region flagged as Tumor during
    segmentation, colored by that region's classified tumor subtype.

    colored_sub_boxes is a list of (x, y, w, h, color_rgb) in level-0 slide
    coordinates, where color_rgb is an (R, G, B) tuple.
    """
    thumbnail = slide.get_thumbnail((max_size, max_size)).convert("RGB")
    thumb_w, thumb_h = thumbnail.size
    slide_w, slide_h = slide.level_dimensions[0]

    # Scale factor from level-0 slide coordinates down to thumbnail coordinates
    scale_x = thumb_w / slide_w
    scale_y = thumb_h / slide_h

    thumb_array = np.array(thumbnail)

    for box_x, box_y, box_w, box_h, color_rgb in colored_sub_boxes:
        tx = int(box_x * scale_x)
        ty = int(box_y * scale_y)
        x2 = min(thumb_w - 1, tx + max(2, int(box_w * scale_x)))
        y2 = min(thumb_h - 1, ty + max(2, int(box_h * scale_y)))
        # thumb_array is RGB (built from a PIL .convert("RGB") image), so the
        # color tuple should be written directly without BGR conversion —
        # converting to BGR here would write swapped channels into an
        # already-RGB array, producing incorrect colors.
        cv2.rectangle(thumb_array, (tx, ty), (x2, y2), color_rgb, thickness=2)

    annotated = PILImage.fromarray(thumb_array)
    buffer = io.BytesIO()
    annotated.save(buffer, format="JPEG", quality=88)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"


def _run_segmentation_grid(slide: "openslide.OpenSlide") -> tuple:
    """
    Walk the slide in a grid at SEGMENTATION_LEVEL, run the segmentation
    model on each tile, and return:
      - tumor_tile_coords: level-0 (x, y) of every tile whose DOMINANT
        predicted pixel class is Tumor (used for tile counting and as the
        center point for classification crops, same as before)
      - sub_boxes_by_tile: dict mapping each (x, y) in tumor_tile_coords to
        the list of finer-grained (x, y, w, h) sub-boxes within that tile,
        derived from its per-pixel class map. Kept separate per tile (not
        flattened) so each tile's boxes can later be colored according to
        that same tile's classification result.
    """
    tumor_tile_coords = []
    sub_boxes_by_tile = {}

    level = SEGMENTATION_LEVEL
    patch_size = SEGMENTATION_PATCH_SIZE
    downsample = slide.level_downsamples[level]
    level_w, level_h = slide.level_dimensions[level]

    stats = segmentation_learner.data.stats

    with torch.no_grad():
        for y in range(0, level_h, patch_size):
            for x in range(0, level_w, patch_size):
                # Skip any tile whose patch_size region would extend past
                # the slide's actual dimensions. Since level_w/level_h are
                # almost never exact multiples of patch_size, the last
                # column and last row of the grid would otherwise read
                # partly past the real image into undefined padding data —
                # this is the actual root cause of false tumor strips along
                # slide edges (seen as a solid line of flagged tiles along
                # one edge), not just a rare corner case.
                if x + patch_size > level_w or y + patch_size > level_h:
                    continue

                # location for read_region must be in level-0 coordinates
                loc_x = int(x * downsample)
                loc_y = int(y * downsample)

                region = slide.read_region(
                    location=(loc_x, loc_y), level=level, size=(patch_size, patch_size)
                )
                rgb = np.array(region.convert("RGB"), dtype=np.float32) / 255.0

                # Skip near-blank background tiles cheaply before running the model
                gray = cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
                if gray.mean() > 240:
                    continue

                tensor = _normalize_patch(rgb, stats).unsqueeze(0).to(_device)
                pred = segmentation_learner.model(tensor)
                # Per-pixel class map for this tile (H x W), not a single scalar
                pred_class_map = torch.softmax(pred, dim=1).argmax(dim=1).squeeze(0).cpu().numpy()

                values, counts = np.unique(pred_class_map, return_counts=True)
                dominant_class = values[np.argmax(counts)]

                if dominant_class == SEGMENTATION_TUMOR_CLASS_INDEX:
                    tile_key = (loc_x, loc_y)
                    tumor_tile_coords.append(tile_key)
                    sub_boxes_by_tile[tile_key] = _find_tumor_sub_boxes(
                        pred_class_map, loc_x, loc_y, downsample
                    )

    return tumor_tile_coords, sub_boxes_by_tile


def _run_classification_on_tiles(slide: "openslide.OpenSlide", tumor_tile_coords: list) -> tuple:
    """
    For each tumor-flagged tile location, crop a larger patch at
    CLASSIFICATION_LEVEL/CLASSIFICATION_PATCH_SIZE centered on it and run
    the classification model. Returns:
      - vote_counts: dict of class index -> number of tiles that voted for it
      - class_by_tile: dict mapping each tile's (x, y) to its predicted
        class index, for tiles where the classifier agreed a tumor is
        present (class 0 / "Normal tissue" tiles are omitted from this
        dict entirely, same exclusion logic as the vote count)

    Class 0 ("Normal tissue") votes are excluded — these only occur when
    the classifier disagrees with segmentation about a given tile, and
    letting them count risks an actual tumor slide being mislabeled as
    "Normal tissue" if enough tiles disagree (see process_slide's handling
    of an empty vote_counts result for what happens if ALL tiles disagree).
    """
    patch_size = CLASSIFICATION_PATCH_SIZE
    stats = classification_learner.data.stats
    vote_counts: dict = {}
    class_by_tile: dict = {}

    slide_w, slide_h = slide.level_dimensions[0]
    half = patch_size // 2

    with torch.no_grad():
        for loc_x, loc_y in tumor_tile_coords:
            crop_x = max(0, min(loc_x - half, slide_w - patch_size))
            crop_y = max(0, min(loc_y - half, slide_h - patch_size))

            region = slide.read_region(
                location=(crop_x, crop_y), level=CLASSIFICATION_LEVEL, size=(patch_size, patch_size)
            )
            rgb = np.array(region.convert("RGB"), dtype=np.float32) / 255.0

            tensor = _normalize_patch(rgb, stats).unsqueeze(0).to(_device)
            pred = classification_learner.model(tensor)
            pred_class = torch.softmax(pred, dim=1).argmax(dim=1).item()

            if pred_class == 0:
                continue  # classifier disagrees this tile is tumor; exclude from vote

            vote_counts[pred_class] = vote_counts.get(pred_class, 0) + 1
            class_by_tile[(loc_x, loc_y)] = pred_class

    return vote_counts, class_by_tile


def _build_colored_sub_boxes(sub_boxes_by_tile: dict, class_by_tile: dict) -> list:
    """
    Flatten sub_boxes_by_tile into a single list of (x, y, w, h, color_rgb),
    coloring every sub-box within a tile according to that tile's
    classification result. Tiles with no classification result (the
    classifier disagreed and voted "Normal tissue", so they were excluded
    from class_by_tile) are skipped entirely — no box is drawn for them,
    consistent with excluding those tiles from the diagnosis itself.
    """
    colored_boxes = []
    for tile_key, boxes in sub_boxes_by_tile.items():
        predicted_class = class_by_tile.get(tile_key)
        if predicted_class is None:
            continue
        color_rgb = CLASSIFICATION_COLORS_RGB.get(predicted_class, (255, 0, 0))
        for box_x, box_y, box_w, box_h in boxes:
            colored_boxes.append((box_x, box_y, box_w, box_h, color_rgb))
    return colored_boxes


def generate_pdf_report(result: dict, patient_name: str, scan_id: int) -> bytes:
    """
    Build a PDF report containing the annotated slide thumbnail and
    diagnosis details. Returns the PDF as raw bytes (not written to disk) —
    the caller streams this directly to the browser and never persists it.
    """

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.6 * inch, bottomMargin=0.6 * inch)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Vetscanner — Histopathology Scan Report", styles["Title"]))
    story.append(Spacer(1, 12))

    meta_rows = [
        ["Patient", patient_name],
        ["Scan ID", str(scan_id)],
        ["Date", datetime.now().strftime("%Y-%m-%d %H:%M")],
        ["Tumor detected", "Positive" if result["tumor_detected"] else "Negative"],
    ]
    if result["tumor_detected"] and result["diagnosis"]:
        meta_rows.append(["Diagnosis", result["diagnosis"]])
        meta_rows.append(["Confidence", f"{result['confidence_score']:.0%}"])
    meta_rows.append(["Tumor-flagged tiles", str(result["tumor_tile_count"])])

    meta_table = Table(meta_rows, colWidths=[150, 320])
    meta_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.lightgrey),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # Embed the annotated thumbnail image, decoding the base64 data URI back to bytes
    thumbnail_data_uri = result["thumbnail"]
    base64_payload = thumbnail_data_uri.split(",", 1)[1]
    image_bytes = base64.b64decode(base64_payload)
    image_buffer = io.BytesIO(image_bytes)

    story.append(Paragraph("Slide thumbnail (tumor regions outlined by type, see legend below)", styles["Heading3"]))
    story.append(Spacer(1, 6))
    story.append(RLImage(image_buffer, width=4.5 * inch, height=4.5 * inch, kind="proportional"))
    story.append(Spacer(1, 20))

    story.append(Paragraph("Summary", styles["Heading3"]))
    story.append(Paragraph(result["message"], styles["Normal"]))

    if result.get("vote_breakdown"):
        story.append(Spacer(1, 16))
        story.append(Paragraph("Tile classification breakdown", styles["Heading3"]))

        # Reverse lookup from label text back to its class index so each
        # row can pull the matching color swatch
        label_to_class_index = {v: k for k, v in CLASSIFICATION_LABELS.items()}

        breakdown_rows = [["", "Class", "Tiles"]]
        for label, count in result["vote_breakdown"].items():
            breakdown_rows.append(["", label, str(count)])

        breakdown_table = Table(breakdown_rows, colWidths=[30, 270, 100])
        style_commands = [
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]

        # Color the first cell of each data row (the swatch column) to
        # match that tumor type's annotation box color on the thumbnail
        for row_idx, label in enumerate(result["vote_breakdown"].keys(), start=1):
            class_index = label_to_class_index.get(label)
            color_rgb = CLASSIFICATION_COLORS_RGB.get(class_index, (255, 0, 0))
            swatch_color = colors.Color(color_rgb[0] / 255, color_rgb[1] / 255, color_rgb[2] / 255)
            style_commands.append(("BACKGROUND", (0, row_idx), (0, row_idx), swatch_color))
            style_commands.append(("TOPPADDING", (0, row_idx), (0, row_idx), 10))
            style_commands.append(("BOTTOMPADDING", (0, row_idx), (0, row_idx), 10))

        breakdown_table.setStyle(TableStyle(style_commands))
        story.append(breakdown_table)

    story.append(Spacer(1, 24))
    story.append(Paragraph(
        "Generated by Vetscanner. Model: CATCH dataset pretrained segmentation + classification "
        "(Wilm et al., 2022, CC BY 4.0). This report is for research/educational use and does not "
        "substitute professional veterinary pathology review.",
        styles["Italic"]
    ))

    doc.build(story)
    return buffer.getvalue()


def process_slide(svs_path: str) -> dict:
    """
    Main entry point. Takes a path to a .svs file already saved to disk and
    returns a dict with the diagnosis, confidence, tumor tile count, and a
    base64 thumbnail with tumor regions annotated, colored by predicted
    subtype. Does not delete the file — caller is responsible for cleanup.
    """
    slide = openslide.open_slide(svs_path)

    try:
        tumor_tile_coords, sub_boxes_by_tile = _run_segmentation_grid(slide)
        tumor_tile_count = len(tumor_tile_coords)

        if tumor_tile_count < MIN_TUMOR_TILES_FOR_DIAGNOSIS:
            # No classification run in this branch, so there's no per-tile
            # class info to color boxes with — show the plain thumbnail
            # with no boxes drawn at all, since nothing was confidently
            # flagged as tumor in the first place.
            annotated_thumbnail_b64 = _generate_annotated_thumbnail_base64(slide, [])
            return {
                "tumor_detected": False,
                "diagnosis": None,
                "confidence_score": None,
                "tumor_tile_count": tumor_tile_count,
                "thumbnail": annotated_thumbnail_b64,
                "message": "No significant tumor regions detected on this slide.",
            }

        vote_counts, class_by_tile = _run_classification_on_tiles(slide, tumor_tile_coords)

        # Classification now runs before the thumbnail is drawn, so each
        # tile's sub-boxes can be colored by that tile's predicted class
        colored_sub_boxes = _build_colored_sub_boxes(sub_boxes_by_tile, class_by_tile)
        annotated_thumbnail_b64 = _generate_annotated_thumbnail_base64(slide, colored_sub_boxes)

        if not vote_counts:
            return {
                "tumor_detected": True,
                "diagnosis": None,
                "confidence_score": None,
                "tumor_tile_count": tumor_tile_count,
                "thumbnail": annotated_thumbnail_b64,
                "message": "Tumor regions found, but classification was inconclusive "
                           "(the classifier did not agree with any tumor tile).",
            }

        total_votes = sum(vote_counts.values())
        winning_class = max(vote_counts, key=vote_counts.get)
        confidence = vote_counts[winning_class] / total_votes

        diagnosis_label = CLASSIFICATION_LABELS.get(winning_class, "Unknown")

        return {
            "tumor_detected": True,
            "diagnosis": diagnosis_label,
            "confidence_score": round(confidence, 4),
            "tumor_tile_count": tumor_tile_count,
            "vote_breakdown": {
                CLASSIFICATION_LABELS.get(k, str(k)): v for k, v in vote_counts.items()
            },
            "thumbnail": annotated_thumbnail_b64,
            "message": f"Detected {diagnosis_label} with {confidence:.0%} confidence "
                       f"across {tumor_tile_count} tumor-flagged tiles.",
        }

    finally:
        slide.close()