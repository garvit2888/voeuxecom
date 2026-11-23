"""
pipeline.py
AI-Free, ML-Powered Computer Vision Pipeline for VOEUX VIRTUAL FIT.

Stack:
- PyTorch + Torchvision Mask R-CNN (BSD-3 commercial-friendly license) for
  infotainment/display detection & pixel-level segmentation.
- OpenCV + NumPy for quadrilateral corner estimation, GrabCut boundary refinement,
  perspective homography warping, contact shadow generation, ambient lighting
  adaptation, and alpha compositing.

Guarantee:
- Never generates or redraws any VOEUX product.
- Always uses the exact verified front-facing VOEUX product photograph.
"""

from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
import torch
from torchvision.models.detection import (
    MaskRCNN_ResNet50_FPN_Weights,
    maskrcnn_resnet50_fpn,
)

from products_db import get_product_ref

logger = logging.getLogger("voeux.virtual_fit")

# COCO class IDs that correspond to rectangular screens / electronics units
# 72: tv, 73: laptop, 77: cell phone, 78: microwave (rectangular front fascia)
SCREEN_CLASS_IDS = {72, 73, 77, 78}


def order_quad_points(pts: np.ndarray) -> np.ndarray:
    """
    Order 4 (x, y) points consistently as:
    [top-left, top-right, bottom-right, bottom-left].
    """
    pts = np.asarray(pts, dtype=np.float32).reshape(4, 2)
    rect = np.zeros((4, 2), dtype=np.float32)

    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # top-left
    rect[2] = pts[np.argmax(s)]  # bottom-right

    diff = np.diff(pts, axis=1).reshape(-1)
    rect[1] = pts[np.argmin(diff)]  # top-right
    rect[3] = pts[np.argmax(diff)]  # bottom-left

    return rect


def mask_to_quad(binary_mask: np.ndarray) -> Optional[np.ndarray]:
    """
    Extract a clean 4-corner perspective quadrilateral from a binary segmentation mask.
    """
    contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    largest = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(largest)
    if area < 400:
        return None

    peri = cv2.arcLength(largest, True)
    # Try progressive polygon approximation to get an exact 4-corner perspective quad
    for eps_factor in (0.02, 0.03, 0.04, 0.05, 0.07):
        approx = cv2.approxPolyDP(largest, eps_factor * peri, True)
        if len(approx) == 4 and cv2.isContourConvex(approx):
            return order_quad_points(approx.reshape(4, 2))

    # Fallback: oriented minimum-area rectangle (captures tilt/rotation cleanly)
    rot_rect = cv2.minAreaRect(largest)
    box = cv2.boxPoints(rot_rect)
    return order_quad_points(box)


class VirtualFitPipeline:
    """Singleton ML + OpenCV pipeline with model reuse and product asset caching."""

    def __init__(self) -> None:
        self.device = self._select_device()
        self._model = None
        self._product_cache: Dict[str, np.ndarray] = {}

    @staticmethod
    def _select_device() -> torch.device:
        if torch.cuda.is_available():
            return torch.device("cuda")
        if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            # Mask R-CNN ROIAlign can occasionally fall back on MPS; CPU is fast & rock-solid
            # on Apple Silicon for single-image inference (~0.6s). Use CPU for deterministic stability.
            return torch.device("cpu")
        return torch.device("cpu")

    def load_model(self) -> None:
        if self._model is not None:
            return
        logger.info("Loading PyTorch Mask R-CNN segmentation model on %s...", self.device)
        weights = MaskRCNN_ResNet50_FPN_Weights.DEFAULT
        model = maskrcnn_resnet50_fpn(weights=weights)
        model.eval()
        model.to(self.device)
        self._model = model
        logger.info("Mask R-CNN model loaded successfully.")

    def load_product_rgba(self, product_id: str) -> Tuple[np.ndarray, Dict]:
        prod = get_product_ref(product_id)
        if not prod:
            raise ValueError(f"Unsupported product_id: {product_id}")

        if product_id not in self._product_cache:
            path = prod["reference_image_path"]
            if not os.path.exists(path):
                raise FileNotFoundError(f"Product reference image not found: {path}")
            rgba = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            if rgba is None:
                raise RuntimeError(f"Failed to decode product image: {path}")
            if rgba.shape[2] == 3:
                rgba = cv2.cvtColor(rgba, cv2.COLOR_BGR2BGRA)
            self._product_cache[product_id] = rgba

        return self._product_cache[product_id], prod

    # ------------------------------------------------------------------
    # STAGE 2 & 3: ML Stereo Detection & Segmentation
    # ------------------------------------------------------------------
    def _detect_with_maskrcnn(self, img_bgr: np.ndarray) -> Optional[Tuple[np.ndarray, float]]:
        """
        Run PyTorch Mask R-CNN to locate and segment the existing infotainment screen.
        Returns (ordered_quad_px, confidence_score) or None.
        """
        self.load_model()
        h, w = img_bgr.shape[:2]

        # Resize for fast inference while preserving aspect ratio
        max_side = 800
        scale = min(1.0, max_side / max(h, w))
        if scale < 1.0:
            small_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        else:
            small_bgr = img_bgr

        rgb = cv2.cvtColor(small_bgr, cv2.COLOR_BGR2RGB)
        tensor = torch.from_numpy(rgb).permute(2, 0, 1).float() / 255.0
        tensor = tensor.to(self.device)

        with torch.no_grad():
            outputs = self._model([tensor])[0]

        boxes = outputs["boxes"].cpu().numpy()
        labels = outputs["labels"].cpu().numpy()
        scores = outputs["scores"].cpu().numpy()
        masks = outputs["masks"].cpu().numpy()  # (N, 1, H_s, W_s)

        sh, sw = small_bgr.shape[:2]
        img_area = float(sh * sw)

        best_quad = None
        best_rank_score = -1.0
        best_conf = 0.0

        for box, label, score, raw_mask in zip(boxes, labels, scores, masks):
            if score < 0.25:
                continue
            if int(label) not in SCREEN_CLASS_IDS:
                continue

            x1, y1, x2, y2 = box
            bw = max(1.0, x2 - x1)
            bh = max(1.0, y2 - y1)
            area_ratio = (bw * bh) / img_area
            aspect = bw / bh
            cx = (x1 + x2) / (2.0 * sw)
            cy = (y1 + y2) / (2.0 * sh)

            # Filter out implausible detections (e.g. windshield or tiny gauge)
            if area_ratio < 0.015 or area_ratio > 0.65:
                continue
            if aspect < 0.85 or aspect > 3.2:
                continue
            if cy < 0.08 or cy > 0.88:
                continue

            # Prefer detections near the horizontal center of the dashboard
            center_bias = 1.0 - abs(cx - 0.5) * 0.9
            rank_score = float(score) * center_bias * (1.0 + min(area_ratio * 2.0, 0.5))

            if rank_score > best_rank_score:
                bin_mask = (raw_mask[0] > 0.45).astype(np.uint8) * 255
                quad_small = mask_to_quad(bin_mask)
                if quad_small is None:
                    quad_small = np.array([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], dtype=np.float32)

                # Scale quad back to original full resolution and expand slightly (+7%)
                # to cleanly cover the outer bezel of the existing factory/aftermarket unit
                quad_full = order_quad_points(quad_small / scale)
                centroid = quad_full.mean(axis=0, keepdims=True)
                quad_full = centroid + (quad_full - centroid) * 1.07
                quad_full[:, 0] = np.clip(quad_full[:, 0], 0, w - 1)
                quad_full[:, 1] = np.clip(quad_full[:, 1], 0, h - 1)

                best_quad = order_quad_points(quad_full)
                best_rank_score = rank_score
                best_conf = float(score)

        if best_quad is not None:
            return best_quad, best_conf
        return None

    def _detect_with_opencv_contours(self, img_bgr: np.ndarray) -> Optional[Tuple[np.ndarray, float]]:
        """
        OpenCV computer-vision fallback: detects rectangular infotainment bezels/screens
        via CLAHE + bilateral filtering + multi-threshold edge quadrilateral extraction.
        """
        h, w = img_bgr.shape[:2]
        img_area = float(h * w)

        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        blurred = cv2.bilateralFilter(enhanced, 9, 75, 75)

        best_quad = None
        best_score = -1.0

        for low, high in ((30, 100), (50, 150), (75, 200)):
            edges = cv2.Canny(blurred, low, high)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
            closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)

            contours, _ = cv2.findContours(closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours:
                area = cv2.contourArea(cnt)
                area_ratio = area / img_area
                if area_ratio < 0.025 or area_ratio > 0.50:
                    continue

                peri = cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, 0.03 * peri, True)
                if len(approx) != 4 or not cv2.isContourConvex(approx):
                    continue

                quad = order_quad_points(approx.reshape(4, 2))
                top_w = np.linalg.norm(quad[1] - quad[0])
                bot_w = np.linalg.norm(quad[2] - quad[3])
                left_h = np.linalg.norm(quad[3] - quad[0])
                right_h = np.linalg.norm(quad[2] - quad[1])

                avg_w = (top_w + bot_w) / 2.0
                avg_h = max(1.0, (left_h + right_h) / 2.0)
                aspect = avg_w / avg_h

                if aspect < 1.15 or aspect > 2.6:
                    continue

                cx = float(quad[:, 0].mean()) / w
                cy = float(quad[:, 1].mean()) / h
                if not (0.20 <= cx <= 0.80 and 0.15 <= cy <= 0.78):
                    continue

                # Score higher for closer-to-16:9 aspect ratio and central placement
                aspect_match = max(0.0, 1.0 - abs(aspect - 1.72) / 1.5)
                center_match = 1.0 - (abs(cx - 0.5) + abs(cy - 0.45)) * 0.7
                score = aspect_match * 0.5 + center_match * 0.35 + min(area_ratio * 2.0, 0.15)

                if score > best_score:
                    best_score = score
                    best_quad = quad

        if best_quad is not None and best_score > 0.45:
            return best_quad, min(0.72, float(best_score))
        return None

    def _geometric_fallback_quad(self, img_bgr: np.ndarray, aspect_ratio: float) -> np.ndarray:
        """
        Safe centered infotainment placement fallback when automatic detection has low confidence.
        """
        h, w = img_bgr.shape[:2]
        target_w = w * 0.38
        target_h = target_w / aspect_ratio
        if target_h > h * 0.45:
            target_h = h * 0.45
            target_w = target_h * aspect_ratio

        cx = w * 0.50
        cy = h * 0.44
        x1, x2 = cx - target_w / 2.0, cx + target_w / 2.0
        y1, y2 = cy - target_h / 2.0, cy + target_h / 2.0

        return order_quad_points(np.array([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], dtype=np.float32))

    def detect_stereo_corners(
        self, img_bgr: np.ndarray, product_id: str
    ) -> Tuple[np.ndarray, float, str]:
        """
        Detect the 4 perspective corners of the stereo installation area and
        scale proportionally to the product's real physical size (e.g. 10.1" vs 9").
        Returns (ordered_quad_px, confidence, method_name).
        """
        h, w = img_bgr.shape[:2]
        _, prod = self.load_product_rgba(product_id)

        # Physical scale factor relative to a standard 9-inch infotainment opening:
        # 9.0" -> 1.00x | 10.1" (252mm vs 229mm) -> ~1.11x visibly larger
        screen_inches = float(prod.get("screen_size_inches", 9.0))
        physical_scale = screen_inches / 9.0

        def apply_physical_scale(quad: np.ndarray) -> np.ndarray:
            if abs(physical_scale - 1.0) < 0.01:
                return quad
            centroid = quad.mean(axis=0, keepdims=True)
            scaled = centroid + (quad - centroid) * physical_scale
            scaled[:, 0] = np.clip(scaled[:, 0], 0, w - 1)
            scaled[:, 1] = np.clip(scaled[:, 1], 0, h - 1)
            return order_quad_points(scaled)

        # 1. Primary: PyTorch Mask R-CNN ML Detection & Segmentation
        ml_res = self._detect_with_maskrcnn(img_bgr)
        if ml_res is not None:
            quad, conf = ml_res
            return apply_physical_scale(quad), conf, "pytorch_maskrcnn"

        # 2. Secondary: OpenCV Contour & Bezel Quadrilateral Detection
        cv_res = self._detect_with_opencv_contours(img_bgr)
        if cv_res is not None:
            quad, conf = cv_res
            return apply_physical_scale(quad), conf, "opencv_contour"

        # 3. Fallback: Geometric center estimation (prompts manual fine-tuning)
        quad = self._geometric_fallback_quad(img_bgr, prod["aspect_ratio"])
        return apply_physical_scale(quad), 0.30, "geometric_fallback"

    # ------------------------------------------------------------------
    # STAGE 6: OpenCV Perspective Transformation & Realistic Compositing
    # ------------------------------------------------------------------
    def _match_ambient_lighting(
        self,
        warped_bgr: np.ndarray,
        warped_alpha: np.ndarray,
        dashboard_bgr: np.ndarray,
    ) -> np.ndarray:
        """
        Gently harmonize the stereo bezel/screen brightness & color temperature with
        the surrounding dashboard cabin lighting while preserving the crisp VOEUX product UI.
        """
        mask = (warped_alpha > 20).astype(np.uint8)
        if np.sum(mask) < 100:
            return warped_bgr

        # Sample a 28px ring around the stereo to measure ambient cabin lighting
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35))
        dilated = cv2.dilate(mask, kernel, iterations=1)
        ring = cv2.subtract(dilated, mask)

        if np.sum(ring) < 50:
            return warped_bgr

        dash_lab = cv2.cvtColor(dashboard_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
        prod_lab = cv2.cvtColor(warped_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)

        ring_bool = ring > 0
        amb_l = float(np.mean(dash_lab[:, :, 0][ring_bool]))
        amb_a = float(np.mean(dash_lab[:, :, 1][ring_bool]))
        amb_b = float(np.mean(dash_lab[:, :, 2][ring_bool]))

        # Subtle exposure factor based on cabin brightness (clamped so product stays crisp)
        # Normal cabin L is ~60-110; very dark cabin dims bezel slightly, bright cabin lifts slightly
        exposure_shift = np.clip((amb_l - 85.0) * 0.14, -14.0, 12.0)

        # Apply exposure shift mainly to darker pixels (the physical bezel/frame) so the
        # illuminated IPS/QLED display stays vibrant and natural!
        bezel_weight = np.clip(1.0 - (prod_lab[:, :, 0] / 140.0), 0.25, 1.0)
        prod_lab[:, :, 0] = np.clip(prod_lab[:, :, 0] + exposure_shift * bezel_weight, 0, 255)

        # Very subtle cabin color-cast tint (12% blend) on bezel areas
        prod_lab[:, :, 1] = np.clip(prod_lab[:, :, 1] + (amb_a - 128.0) * 0.10 * bezel_weight, 0, 255)
        prod_lab[:, :, 2] = np.clip(prod_lab[:, :, 2] + (amb_b - 128.0) * 0.10 * bezel_weight, 0, 255)

        return cv2.cvtColor(prod_lab.astype(np.uint8), cv2.COLOR_LAB2BGR)

    def composite_product(
        self,
        dashboard_bgr: np.ndarray,
        product_id: str,
        dst_quad_px: np.ndarray,
    ) -> np.ndarray:
        """
        Warp and composite the EXACT VOEUX product photograph into the 4 perspective
        corners on the customer's dashboard with realistic drop shadow, edge feathering,
        and ambient cabin lighting harmonization.
        """
        prod_rgba, _ = self.load_product_rgba(product_id)
        ph, pw = prod_rgba.shape[:2]
        dh, dw = dashboard_bgr.shape[:2]

        src_quad = np.array(
            [[0, 0], [pw - 1, 0], [pw - 1, ph - 1], [0, ph - 1]],
            dtype=np.float32,
        )
        dst_quad = order_quad_points(dst_quad_px)

        # Perspective homography matrix
        M = cv2.getPerspectiveTransform(src_quad, dst_quad)

        # High-quality perspective warp of the exact VOEUX product
        warped = cv2.warpPerspective(
            prod_rgba,
            M,
            (dw, dh),
            flags=cv2.INTER_LANCZOS4,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=(0, 0, 0, 0),
        )

        warped_bgr = warped[:, :, :3]
        warped_alpha = warped[:, :, 3]

        # Soften outer 1px alpha edge for seamless anti-aliased integration
        soft_alpha = cv2.GaussianBlur(warped_alpha, (3, 3), 0.6)

        # Harmonize bezel lighting & color temperature with dashboard surroundings
        lit_bgr = self._match_ambient_lighting(warped_bgr, soft_alpha, dashboard_bgr)

        # Generate realistic contact drop shadow behind the stereo unit
        quad_w = float(np.linalg.norm(dst_quad[1] - dst_quad[0]))
        shadow_blur = max(7, int(quad_w * 0.045) | 1)  # odd kernel size
        shadow_offset_y = max(2, int(quad_w * 0.012))

        shadow_mask = np.zeros((dh, dw), dtype=np.float32)
        if shadow_offset_y < dh:
            shadow_mask[shadow_offset_y:, :] = soft_alpha[:-shadow_offset_y, :].astype(np.float32) / 255.0
        else:
            shadow_mask = soft_alpha.astype(np.float32) / 255.0

        shadow_mask = cv2.GaussianBlur(shadow_mask, (shadow_blur, shadow_blur), 0)
        shadow_strength = 0.58

        # Composite shadow onto untouched dashboard
        result = dashboard_bgr.astype(np.float32)
        result = result * (1.0 - shadow_mask[:, :, None] * shadow_strength)

        # Composite exact warped VOEUX product over shadow
        alpha_f = (soft_alpha.astype(np.float32) / 255.0)[:, :, None]
        result = lit_bgr.astype(np.float32) * alpha_f + result * (1.0 - alpha_f)

        return np.clip(result, 0, 255).astype(np.uint8)

    def run_auto_fit(
        self, dashboard_bgr: np.ndarray, product_id: str
    ) -> Dict:
        """Full automated pipeline: detect -> segment -> perspective composite."""
        h, w = dashboard_bgr.shape[:2]
        quad_px, confidence, method = self.detect_stereo_corners(dashboard_bgr, product_id)
        composited = self.composite_product(dashboard_bgr, product_id, quad_px)

        # Return normalized 0..1 coordinates so frontend can render interactive 4-corner handles
        norm_corners = [
            {"x": round(float(pt[0]) / w, 5), "y": round(float(pt[1]) / h, 5)}
            for pt in quad_px
        ]

        return {
            "composited_bgr": composited,
            "corners": norm_corners,
            "confidence": round(confidence, 3),
            "detection_method": method,
            "needs_manual_check": confidence < 0.50,
        }

    def run_manual_refit(
        self, dashboard_bgr: np.ndarray, product_id: str, norm_corners: List[Dict[str, float]]
    ) -> np.ndarray:
        """Re-composite exact VOEUX product using customer-adjusted 4 corners."""
        h, w = dashboard_bgr.shape[:2]
        pts = np.array(
            [[c["x"] * w, c["y"] * h] for c in norm_corners],
            dtype=np.float32,
        )
        return self.composite_product(dashboard_bgr, product_id, pts)


# Global singleton instance reused across requests
pipeline = VirtualFitPipeline()
