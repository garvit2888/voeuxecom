FROM python:3.11-slim

WORKDIR /app

# Minimal OS deps for OpenCV headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch first (saves >1.5 GB vs CUDA wheel)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir \
      fastapi \
      uvicorn \
      python-multipart \
      opencv-python-headless \
      numpy \
      pillow \
      transformers

# Set Hugging Face cache inside writable /app/hf_cache
ENV HF_HOME=/app/hf_cache
RUN mkdir -p /app/hf_cache && chmod -R 777 /app/hf_cache

# Pre-download OWL-ViT model weights during build so runtime startup is instant
RUN python -c "from transformers import OwlViTProcessor, OwlViTForObjectDetection; OwlViTProcessor.from_pretrained('google/owlvit-base-patch32'); OwlViTForObjectDetection.from_pretrained('google/owlvit-base-patch32')"

# Copy backend code and verified product PNGs
COPY main.py pipeline.py products_db.py ./
COPY products ./products

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
