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

MIN_TUMOR_TILES_FOR_DIAGNOSIS = 3  # below this, treat result as inconclusive


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


def _generate_annotated_thumbnail_base64(
    slide: "openslide.OpenSlide",
    tumor_tile_coords: list,
    max_size: int = 768,
) -> str:
    """
    Generate a base64-encoded JPEG thumbnail of the whole slide with red
    boxes drawn over every tile that was flagged as Tumor during segmentation.
    """
    thumbnail = slide.get_thumbnail((max_size, max_size)).convert("RGB")
    thumb_w, thumb_h = thumbnail.size
    slide_w, slide_h = slide.level_dimensions[0]

    # Scale factor from level-0 slide coordinates down to thumbnail coordinates
    scale_x = thumb_w / slide_w
    scale_y = thumb_h / slide_h

    thumb_array = np.array(thumbnail)

    # Each tumor coordinate is the level-0 top-left corner of a
    # SEGMENTATION_PATCH_SIZE tile. Convert to the equivalent box on the
    # thumbnail and draw a red rectangle.
    tile_size_on_thumb_x = max(2, int(SEGMENTATION_PATCH_SIZE * slide.level_downsamples[SEGMENTATION_LEVEL] * scale_x))
    tile_size_on_thumb_y = max(2, int(SEGMENTATION_PATCH_SIZE * slide.level_downsamples[SEGMENTATION_LEVEL] * scale_y))

    for loc_x, loc_y in tumor_tile_coords:
        tx = int(loc_x * scale_x)
        ty = int(loc_y * scale_y)
        x2 = min(thumb_w - 1, tx + tile_size_on_thumb_x)
        y2 = min(thumb_h - 1, ty + tile_size_on_thumb_y)
        cv2.rectangle(thumb_array, (tx, ty), (x2, y2), (255, 0, 0), thickness=2)

    annotated = PILImage.fromarray(thumb_array)
    buffer = io.BytesIO()
    annotated.save(buffer, format="JPEG", quality=88)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"


def _run_segmentation_grid(slide: "openslide.OpenSlide") -> list:
    """
    Walk the slide in a grid at SEGMENTATION_LEVEL, run the segmentation
    model on each tile, and return the level-0 (x, y) coordinates of every
    tile whose DOMINANT predicted pixel class is Tumor.

    This produces a per-pixel class map for each tile (not a single class
    for the whole tile) — the dominant class across all pixels in that map
    is what decides whether the tile counts as a tumor tile.
    """
    tumor_tile_coords = []

    level = SEGMENTATION_LEVEL
    patch_size = SEGMENTATION_PATCH_SIZE
    downsample = slide.level_downsamples[level]
    level_w, level_h = slide.level_dimensions[level]

    stats = segmentation_learner.data.stats

    with torch.no_grad():
        for y in range(0, level_h, patch_size):
            for x in range(0, level_w, patch_size):
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
                    tumor_tile_coords.append((loc_x, loc_y))

    return tumor_tile_coords


def _run_classification_on_tiles(slide: "openslide.OpenSlide", tumor_tile_coords: list) -> dict:
    """
    For each tumor-flagged tile location, crop a larger patch at
    CLASSIFICATION_LEVEL/CLASSIFICATION_PATCH_SIZE centered on it and run
    the classification model. Returns a vote count per tumor subtype class.

    Class 0 ("Normal tissue") votes are excluded — these only occur when
    the classifier disagrees with segmentation about a given tile, and
    letting them count risks an actual tumor slide being mislabeled as
    "Normal tissue" if enough tiles disagree (see process_slide's handling
    of an empty vote_counts result for what happens if ALL tiles disagree).
    """
    patch_size = CLASSIFICATION_PATCH_SIZE
    stats = classification_learner.data.stats
    vote_counts: dict = {}

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

    return vote_counts


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
        ["Tumor detected", "Yes" if result["tumor_detected"] else "No"],
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

    story.append(Paragraph("Slide thumbnail (tumor regions outlined in red)", styles["Heading3"]))
    story.append(Spacer(1, 6))
    story.append(RLImage(image_buffer, width=4.5 * inch, height=4.5 * inch, kind="proportional"))
    story.append(Spacer(1, 20))

    story.append(Paragraph("Summary", styles["Heading3"]))
    story.append(Paragraph(result["message"], styles["Normal"]))

    if result.get("vote_breakdown"):
        story.append(Spacer(1, 16))
        story.append(Paragraph("Tile classification breakdown", styles["Heading3"]))
        breakdown_rows = [["Class", "Tiles"]] + [
            [label, str(count)] for label, count in result["vote_breakdown"].items()
        ]
        breakdown_table = Table(breakdown_rows, colWidths=[300, 100])
        breakdown_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]))
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
    base64 thumbnail with tumor regions annotated in red. Does not delete
    the file — caller is responsible for cleanup.
    """
    slide = openslide.open_slide(svs_path)

    try:
        tumor_tile_coords = _run_segmentation_grid(slide)
        tumor_tile_count = len(tumor_tile_coords)

        # Thumbnail is generated after segmentation so tumor regions can be
        # drawn directly onto it
        annotated_thumbnail_b64 = _generate_annotated_thumbnail_base64(slide, tumor_tile_coords)

        if tumor_tile_count < MIN_TUMOR_TILES_FOR_DIAGNOSIS:
            return {
                "tumor_detected": False,
                "diagnosis": None,
                "confidence_score": None,
                "tumor_tile_count": tumor_tile_count,
                "thumbnail": annotated_thumbnail_b64,
                "message": "No significant tumor regions detected on this slide.",
            }

        vote_counts = _run_classification_on_tiles(slide, tumor_tile_coords)

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