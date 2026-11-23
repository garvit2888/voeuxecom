"""
main.py
FastAPI Backend Server for VOEUX VIRTUAL FIT.

Endpoints:
- GET  /api/virtual-fit/health
- GET  /api/virtual-fit/products
- POST /api/virtual-fit/detect-and-fit
- POST /api/virtual-fit/refit

Privacy & Security:
- Validates image format, size (<= 15 MB), and dimensions.
- Processes customer photographs strictly in memory; never permanently stores uploads.
"""

from __future__ import annotations

import base64
import io
import json
import logging
import time
from contextlib import asynccontextmanager
from typing import List

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps

from pipeline import pipeline
from products_db import get_product_ref, list_supported_products

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voeux.virtual_fit.api")

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_WORKING_DIMENSION = 1600


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Preload ML model and product assets once at server startup
    try:
        pipeline.load_model()
        for prod in list_supported_products():
            try:
                pipeline.load_product_rgba(prod["product_id"])
            except Exception as exc:
                logger.warning("Could not preload product %s: %s", prod["product_id"], exc)
    except Exception as exc:
        logger.error("Model warm-up failed: %s", exc)
    yield


app = FastAPI(
    title="VOEUX VIRTUAL FIT API",
    description="AI-Free, ML-Powered Virtual Android Player Installation Experience",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "https://voeuxtechnologies.in",
        "https://www.voeuxtechnologies.in",
        "*",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


async def decode_and_validate_image(upload: UploadFile) -> np.ndarray:
    """Securely validate uploaded file, honor EXIF orientation, and return OpenCV BGR array."""
    content_type = (upload.content_type or "").lower()
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Please upload a JPG, PNG, or WEBP photograph.",
        )

    raw_bytes = await upload.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 15 MB size limit.")

    try:
        pil_img = Image.open(io.BytesIO(raw_bytes))
        pil_img = ImageOps.exif_transpose(pil_img)  # Fix phone camera EXIF rotation
        pil_img = pil_img.convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.")

    w, h = pil_img.size
    if w < 240 or h < 180:
        raise HTTPException(
            status_code=400,
            detail="Image resolution is too low. Please upload a clearer dashboard photograph.",
        )

    # Optimize oversized mobile images while keeping high crispness for preview & download
    if max(w, h) > MAX_WORKING_DIMENSION:
        scale = MAX_WORKING_DIMENSION / float(max(w, h))
        pil_img = pil_img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

    rgb_np = np.array(pil_img)
    bgr_np = cv2.cvtColor(rgb_np, cv2.COLOR_RGB2BGR)
    return bgr_np


def encode_bgr_to_data_url(img_bgr: np.ndarray, quality: int = 92) -> str:
    ok, buf = cv2.imencode(".jpg", img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not ok:
        raise RuntimeError("Failed to encode output JPEG")
    b64 = base64.b64encode(buf.tobytes()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"


@app.get("/api/virtual-fit/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": pipeline._model is not None,
        "device": str(pipeline.device),
        "supported_products": [p["product_id"] for p in list_supported_products()],
    }


@app.get("/api/virtual-fit/products")
async def get_products():
    return {"products": list_supported_products()}


@app.post("/api/virtual-fit/detect-and-fit")
async def detect_and_fit(
    image: UploadFile = File(...),
    product_id: str = Form(...),
):
    """
    Run automated ML stereo detection, segmentation, perspective estimation,
    and exact VOEUX product placement.
    """
    prod = get_product_ref(product_id)
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' is not configured for Virtual Fit.")

    t0 = time.perf_counter()
    dashboard_bgr = await decode_and_validate_image(image)

    result = await run_in_threadpool(pipeline.run_auto_fit, dashboard_bgr, product_id)
    original_data_url = await run_in_threadpool(encode_bgr_to_data_url, dashboard_bgr, 90)
    result_data_url = await run_in_threadpool(encode_bgr_to_data_url, result["composited_bgr"], 93)

    elapsed_ms = int((time.perf_counter() - t0) * 1000)
    h, w = dashboard_bgr.shape[:2]

    return {
        "success": True,
        "product_id": product_id,
        "product_name": prod["name"],
        "original_image": original_data_url,
        "result_image": result_data_url,
        "corners": result["corners"],
        "confidence": result["confidence"],
        "detection_method": result["detection_method"],
        "needs_manual_check": result["needs_manual_check"],
        "dimensions": {"width": w, "height": h},
        "processing_ms": elapsed_ms,
    }


@app.post("/api/virtual-fit/refit")
async def refit_manual_corners(
    image: UploadFile = File(...),
    product_id: str = Form(...),
    corners: str = Form(...),
):
    """
    Re-render the exact VOEUX product using customer-adjusted 4 perspective corners.
    `corners` must be a JSON array of 4 objects: [{"x": 0..1, "y": 0..1}, ...]
    in order [topLeft, topRight, bottomRight, bottomLeft].
    """
    prod = get_product_ref(product_id)
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' is not configured for Virtual Fit.")

    try:
        parsed_corners: List[dict] = json.loads(corners)
        if not isinstance(parsed_corners, list) or len(parsed_corners) != 4:
            raise ValueError("Expected 4 corner points")
        for pt in parsed_corners:
            if not (0.0 <= float(pt["x"]) <= 1.0 and 0.0 <= float(pt["y"]) <= 1.0):
                raise ValueError("Corner coordinates must be normalized between 0 and 1")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid corners payload: {exc}")

    t0 = time.perf_counter()
    dashboard_bgr = await decode_and_validate_image(image)
    composited_bgr = await run_in_threadpool(
        pipeline.run_manual_refit, dashboard_bgr, product_id, parsed_corners
    )
    result_data_url = await run_in_threadpool(encode_bgr_to_data_url, composited_bgr, 93)
    elapsed_ms = int((time.perf_counter() - t0) * 1000)

    return {
        "success": True,
        "product_id": product_id,
        "result_image": result_data_url,
        "corners": parsed_corners,
        "processing_ms": elapsed_ms,
    }

