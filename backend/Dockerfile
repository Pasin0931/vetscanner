# Backend: FastAPI on port 8000

# Installs system libraries needed by opencv
FROM python:3.9-slim-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app


# Installs CPU-only torch (gonna enforce with CUDA when on production)
RUN pip install --upgrade pip \
    && pip install torch==1.13.1+cpu torchvision==0.14.1+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu

# # CUDA (use later)
# RUN pip install --upgrade pip \
#     && pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 \
#     --extra-index-url https://download.pytorch.org/whl/cu117


# Installs backend's packages (fastai without its dependencies)
COPY requirements.txt /tmp/requirements.txt
RUN grep -v '^fastai' /tmp/requirements.txt > /tmp/requirements-nofastai.txt \
    && pip install -r /tmp/requirements-nofastai.txt \
    && pip install --no-deps fastai==1.0.61

# Copies backend code and runs it on port 8000
COPY backend/ ./

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
