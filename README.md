# Vetscanner

AI-powered histopathology scanning for canine cutaneous tumors. Upload a whole slide image (`.svs`), and Vetscanner runs a two-stage pipeline — segmentation to locate tumor regions, then classification to identify the tumor subtype — and generates a downloadable PDF report with an annotated thumbnail.

## Tech stack

- **Frontend**: Next.js
- **Backend**: FastAPI
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **AI models**: Pretrained U-Net (ResNet-18 backbone) for segmentation, EfficientNet for classification — from the [CATCH dataset](https://www.cancerimagingarchive.net/collection/catch/) authors' [CanineCutaneousTumors](https://github.com/DeepMicroscopy/CanineCutaneousTumors) repo

## Important: Python version requirement

The pretrained models were exported using **fastai v1**, which only installs cleanly on **Python 3.9** (or similar older versions). It does **not** work on Python 3.10+ or the very latest Python releases — `fastai==1.0.61` will either fail to install (missing dependencies like `pynvx` on macOS) or fail to import.

**The backend must run inside a Python 3.9 virtual environment.** Using your system's default Python (e.g. 3.14) will not work.

---

## Setup

### 1. Clone the repository

```bash
git clone --recurse-submodules https://github.com/Pasin0931/vetscanner.git
cd vetscanner
```

If you already cloned without `--recurse-submodules`, run:

```bash
git submodule update --init --recursive
```

This pulls in the [`CanineCutaneousTumors`](https://github.com/DeepMicroscopy/CanineCutaneousTumors) submodule, which is referenced for attribution and as a source for supporting Python files used by the model pipeline.

### 2. Set up the backend (Python 3.9 required)

```bash
cd backend
```

Check what Python versions are available on your machine:

```bash
python3.9 --version
# or, on macOS, check for the Command Line Tools Python:
/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3 --version
```

Create the virtual environment using a 3.9 interpreter specifically:

```bash
/usr/bin/python3 -m venv venv   # adjust this path to point at a real 3.9 interpreter on your system
source venv/bin/activate
```

Verify you're in the right environment:

```bash
python3 --version   # should print 3.9.x
which python3        # should point inside backend/venv/
```

### 3. Install backend dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

If `requirements.txt` is incomplete or you hit `ModuleNotFoundError` errors on startup, install the missing package and try again — common ones encountered during setup include:

```bash
pip install "fastai==1.0.61" --no-deps
pip install "torch==1.13.1" "torchvision==0.14.1"
pip install pyyaml beautifulsoup4 matplotlib numexpr packaging pandas scipy nvidia-ml-py3 fastprogress bottleneck
pip install openslide-bin openslide-python opencv-python shapely reportlab
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv python-multipart bcrypt authlib starlette httpx itsdangerous scikit-learn efficientnet_pytorch
```

> **Note:** `fastai==1.0.61` lists `pynvx` as a dependency on macOS — this package is abandoned and unavailable on PyPI. Always install fastai with `--no-deps` and add its other dependencies manually as shown above.

### 4. Download the pretrained models

The model weights (`.pkl` files) are tracked via **Git LFS**. If you don't have `git-lfs` installed:

```bash
# macOS
brew install git-lfs

# then, from the repo root
git lfs install
git lfs pull
```

This should populate `backend/model/` with:
- `UNet_resnet18_512_2_sdata.pkl` (~165 MB)
- `efficientnet_1024_0_sdata.pkl` (~16 MB)

Verify they downloaded correctly (not just LFS pointer stubs):

```bash
ls -lh backend/model/
```

Both files should show their real sizes (MB), not a few hundred bytes. If they're tiny, `git lfs pull` didn't fetch the real content — re-run `git lfs install` and `git lfs pull` from the repo root.

### 5. Set up environment variables

Create a `.env` file inside `backend/`

### 6. Run the backend

```bash
cd backend
source venv/bin/activate   # if not already active
python3 -m uvicorn main:app --reload
```

or

```bash
cd backend
source venv/bin/activate   # if not already active
python -m uvicorn main:app --reload
```

### 7. Set up the frontend

```bash
cd vetscanner
npm install
```

Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run it:
```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## How scanning works

1. Select a patient and upload a `.svs` (or `.tiff`/`.tif`/`.ndpi`) whole slide image on the Scan page.
2. The backend tiles the slide and runs the segmentation model to locate tumor regions.
3. Tumor-flagged regions are cropped and run through the classification model to determine the tumor subtype.
4. The backend saves the diagnosis, confidence score, and an annotated thumbnail (tumor regions outlined in red) to the database.
5. A PDF report is generated on the fly — embedding the annotated thumbnail and diagnosis — and downloads automatically in the browser. The PDF itself is never saved to disk or the database; only the underlying scan data is persisted.

## Known limitations

- Processing is synchronous — large slides can take several minutes per scan, during which the request blocks.
- The segmentation and classification models can occasionally disagree on a given tile; tiles where the classifier predicts "Normal tissue" on a segmentation-flagged tumor region are excluded from the final diagnosis vote rather than allowed to skew the result.
- These models were pretrained on the [CATCH dataset](https://www.cancerimagingarchive.net/collection/catch/) (CC BY 4.0) by Wilm et al. — citation required for any use of the dataset:

  > Wilm, F., Fragoso, M., Marzahl, C., Bertram, C., Klopfleisch, R., Maier, A., Aubreville, M., & Breininger, K. (2022). CAnine CuTaneous Cancer Histology Dataset (Version 1) [Data set]. The Cancer Imaging Archive. DOI: 10.7937/TCIA.2M93-FX66

- The pretrained model weights and original repository code (referenced via the `CanineCutaneousTumors` git submodule) have no explicit license — usage permission should be confirmed directly with the original authors before any commercial or competition use beyond research/educational purposes.