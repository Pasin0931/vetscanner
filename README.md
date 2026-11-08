# Vetscanner

AI histopathology scanner for canine skin tumors. Upload a whole slide image (`.svs`, `.tif`, `.tiff`, `.ndpi`) and get a PDF report with the tumor type and an annotated thumbnail.

## Tech stack

- **Frontend**: Next.js
- **Backend**: FastAPI (Python 3.9)
- **Database**: PostgreSQL
- **AI models**: U-Net (segmentation) + EfficientNet (classification) from [CanineCutaneousTumors](https://github.com/DeepMicroscopy/CanineCutaneousTumors)

## Run with Docker

1. Clone and get the model files (Git LFS):
   ```bash
   git clone https://github.com/Pasin0931/vetscanner.git
   cd vetscanner
   git lfs install
   git lfs pull
   ```
2. Copy `backend/.env.example` to `backend/.env` and fill in your keys.
3. Start everything:
   ```bash
   docker compose up -d --build
   ```
4. Open http://localhost:3000 (backend API: http://localhost:8000/docs).

Stop it with `docker compose down`.

## Run without Docker

The backend needs **Python 3.9** (fastai v1 doesn't work on newer versions).

**Backend**
```bash
cd backend
python3.9 -m venv venv
source venv/bin/activate          # Windows: .\venv\Scripts\Activate.ps1
pip install -r ../requirements.txt
python -m uvicorn main:app --reload
```
You also need PostgreSQL running and `DATABASE_URL` set in `backend/.env`.

**Frontend**
```bash
cd vetscanner
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

## How scanning works

1. Pick a patient and upload a slide.
2. Segmentation finds tumor regions.
3. Classification identifies the tumor type.
4. A PDF report is created, uploaded to Cloudinary, and downloaded in the browser.

## Credits

Models are pretrained on the [CATCH dataset](https://www.cancerimagingarchive.net/collection/catch/) (CC BY 4.0):

> Wilm, F., Fragoso, M., Marzahl, C., Bertram, C., Klopfleisch, R., Maier, A., Aubreville, M., & Breininger, K. (2022). CAnine CuTaneous Cancer Histology Dataset (Version 1) [Data set]. The Cancer Imaging Archive. DOI: 10.7937/TCIA.2M93-FX66

The model weights and original code have no explicit license, so confirm permission with the authors before any non-research use. For research and educational use only; not a replacement for a veterinary pathologist.
