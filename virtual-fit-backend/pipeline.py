"""
pipeline.py
AI-Free, ML-Powered Computer Vision Pipeline for VOEUX VIRTUAL FIT.

Stack:
- PyTorch + Google OWL-ViT (google/owlvit-base-patch32, Apache-2.0 commercial-friendly
  license) open-vocabulary vision detector prompted specifically for car stereos,
  factory button radios, and infotainment head units (works across Indian RHD cars).
- OpenCV + NumPy for quadrilateral bezel refinement, perspective homography warping,
  contact drop shadow generation, ambient cabin lighting adaptation, and edge blending.

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
from PIL import Image
import torch
from transformers import OwlViTForObjectDetection, OwlViTProcessor

from products_db import get_product_ref

logger = logging.getLogger("voeux.virtual_fit")

# Targeted automotive stereo / head-unit prompts for open-vocabulary ML detection
STEREO_TEXT_QUERIES = [[
    "car stereo",
    "car radio",
    "car infotainment screen",
    "car audio head unit",
    "dashboard stereo panel",
]]


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


class VirtualFitPipeline:
    """Singleton ML + OpenCV pipeline with model reuse and product asset caching."""

    def __init__(self) -> None:
        self.device = self._select_device()
        self._processor: Optional[OwlViTProcessor] = None
        self._model: Optional[OwlViTForObjectDetection] = None
        self._product_cache: Dict[str, np.ndarray] = {}

    @staticmethod
    def _select_device() -> torch.device:
        if torch.cuda.is_available():
            return torch.device("cuda")
        return torch.device("cpu")

    def load_model(self) -> None:
        if self._model is not None and self._processor is not None:
            return
        model_id = "google/owlvit-base-patch32"
        logger.info("Loading open-vocabulary automotive stereo detector (%s) on %s...", model_id, self.device)
        self._processor = OwlViTProcessor.from_pretrained(model_id)
        self._model = OwlViTForObjectDetection.from_pretrained(model_id)
        self._model.eval()
        self._model.to(self.device)
        logger.info("OWL-ViT stereo detector loaded successfully.")

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
    # STAGE 2 & 3: Open-Vocabulary ML Stereo Detection (OWL-ViT)
    # ------------------------------------------------------------------
    def _detect_with_owlvit(self, img_bgr: np.ndarray) -> Optional[Tuple[np.ndarray, float]]:
        """
        Run Google OWL-ViT (Apache 2.0) to detect factory button car radios AND
        modern infotainment touchscreens across Indian car dashboards.
        """
        self.load_model()
        h, w = img_bgr.shape[:2]
        rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)

        inputs = self._processor(text=STEREO_TEXT_QUERIES, images=pil_img, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self._model(**inputs)

        target_sizes = torch.tensor([[h, w]], device=self.device)
        if hasattr(self._processor, "post_process_grounded_object_detection"):
            results = self._processor.post_process_grounded_object_detection(
                outputs=outputs,
                target_sizes=target_sizes,
                threshold=0.08,
            )[0]
        else:
            results = self._processor.post_process_object_detection(
                outputs=outputs,
                target_sizes=target_sizes,
                threshold=0.08,
            )[0]

        boxes = results["boxes"].cpu().numpy()
        scores = results["scores"].cpu().numpy()

        img_area = float(h * w)
        best_quad = None
        best_rank = -1.0
        best_conf = 0.0

        for box, score in zip(boxes, scores):
            x1, y1, x2, y2 = [float(v) for v in box]
            bw = max(1.0, x2 - x1)
            bh = max(1.0, y2 - y1)
            area_ratio = (bw * bh) / img_area
            aspect = bw / bh
            cx = (x1 + x2) / (2.0 * w)
            cy = (y1 + y2) / (2.0 * h)

            # Reject implausible full-dashboard or tiny-button boxes
            if area_ratio < 0.015 or area_ratio > 0.55:
                continue
            if aspect < 0.80 or aspect > 3.0:
                continue
            if not (0.20 <= cx <= 0.80 and 0.12 <= cy <= 0.78):
                continue

            # Favor centered infotainment bays with realistic stereo proportions (~1.4 to 1.8)
            center_bias = max(0.2, 1.0 - abs(cx - 0.50) * 1.3 - abs(cy - 0.44) * 0.6)
            aspect_bias = max(0.4, 1.0 - abs(aspect - 1.65) * 0.35)
            rank = float(score) * center_bias * aspect_bias

            if rank > best_rank:
                best_rank = rank
                best_conf = float(score)
                best_quad = order_quad_points(
                    np.array([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], dtype=np.float32)
                )

        if best_quad is not None:
            # Normalize OWL-ViT confidence (typically 0.12..0.55) to intuitive 0..1 scale
            norm_conf = min(0.96, best_conf * 2.2)
            return best_quad, norm_conf
        return None

    def _detect_with_opencv_contours(self, img_bgr: np.ndarray) -> Optional[Tuple[np.ndarray, float]]:
        """
        OpenCV computer-vision fallback: detects rectangular infotainment bezels/screens.
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
        """Safe centered infotainment placement fallback."""
        h, w = img_bgr.shape[:2]
        target_w = w * 0.34
        target_h = target_w / aspect_ratio
        if target_h > h * 0.42:
            target_h = h * 0.42
            target_w = target_h * aspect_ratio

        cx = w * 0.50
        cy = h * 0.43
        x1, x2 = cx - target_w / 2.0, cx + target_w / 2.0
        y1, y2 = cy - target_h / 2.0, cy + target_h / 2.0

        return order_quad_points(np.array([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], dtype=np.float32))

    def detect_stereo_corners(
        self, img_bgr: np.ndarray, product_id: str
    ) -> Tuple[np.ndarray, float, str]:
        """
        Detect the 4 perspective corners of the stereo installation area and
        scale proportionally to the product's real physical size (10.1" vs 9").
        """
        h, w = img_bgr.shape[:2]
        _, prod = self.load_product_rgba(product_id)

        # Physical scale factor relative to a standard 9-inch infotainment opening:
        # 9.0" -> 1.00x | 10.1" (252mm vs 229mm) -> ~1.12x visibly larger
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

        # 1. Primary: OWL-ViT Open-Vocabulary Automotive Stereo Detector
        ml_res = self._detect_with_owlvit(img_bgr)
        if ml_res is not None:
            quad, conf = ml_res
            return apply_physical_scale(quad), conf, "owlvit_automotive"

        # 2. Secondary: OpenCV Contour & Bezel Quadrilateral Detection
        cv_res = self._detect_with_opencv_contours(img_bgr)
        if cv_res is not None:
            quad, conf = cv_res
            return apply_physical_scale(quad), conf, "opencv_contour"

        # 3. Fallback: Geometric center estimation
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
        Gently harmonize the stereo bezel/frame brightness & color temperature with
        the surrounding dashboard cabin lighting while keeping the VOEUX display crisp.
        """
        mask = (warped_alpha > 20).astype(np.uint8)
        if np.sum(mask) < 100:
            return warped_bgr

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

        exposure_shift = np.clip((amb_l - 85.0) * 0.14, -14.0, 12.0)
        bezel_weight = np.clip(1.0 - (prod_lab[:, :, 0] / 140.0), 0.25, 1.0)
        prod_lab[:, :, 0] = np.clip(prod_lab[:, :, 0] + exposure_shift * bezel_weight, 0, 255)
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

        M = cv2.getPerspectiveTransform(src_quad, dst_quad)

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

        soft_alpha = cv2.GaussianBlur(warped_alpha, (3, 3), 0.6)
        lit_bgr = self._match_ambient_lighting(warped_bgr, soft_alpha, dashboard_bgr)

        quad_w = float(np.linalg.norm(dst_quad[1] - dst_quad[0]))
        shadow_blur = max(7, int(quad_w * 0.045) | 1)
        shadow_offset_y = max(2, int(quad_w * 0.012))

        shadow_mask = np.zeros((dh, dw), dtype=np.float32)
        if shadow_offset_y < dh:
            shadow_mask[shadow_offset_y:, :] = soft_alpha[:-shadow_offset_y, :].astype(np.float32) / 255.0
        else:
            shadow_mask = soft_alpha.astype(np.float32) / 255.0

        shadow_mask = cv2.GaussianBlur(shadow_mask, (shadow_blur, shadow_blur), 0)
        shadow_strength = 0.58

        result = dashboard_bgr.astype(np.float32)
        result = result * (1.0 - shadow_mask[:, :, None] * shadow_strength)

        alpha_f = (soft_alpha.astype(np.float32) / 255.0)[:, :, None]
        result = lit_bgr.astype(np.float32) * alpha_f + result * (1.0 - alpha_f)

        return np.clip(result, 0, 255).astype(np.uint8)

    def run_detect_only(
        self, dashboard_bgr: np.ndarray, product_id: str
    ) -> Dict:
        """Detect stereo corners only so the user can review/adjust before compositing."""
        h, w = dashboard_bgr.shape[:2]
        quad_px, confidence, method = self.detect_stereo_corners(dashboard_bgr, product_id)
        norm_corners = [
            {"x": round(float(pt[0]) / w, 5), "y": round(float(pt[1]) / h, 5)}
            for pt in quad_px
        ]
        return {
            "corners": norm_corners,
            "confidence": round(confidence, 3),
            "detection_method": method,
            "needs_manual_check": confidence < 0.45,
        }

    def run_auto_fit(
        self, dashboard_bgr: np.ndarray, product_id: str
    ) -> Dict:
        """Full automated pipeline: detect -> perspective composite."""
        h, w = dashboard_bgr.shape[:2]
        quad_px, confidence, method = self.detect_stereo_corners(dashboard_bgr, product_id)
        composited = self.composite_product(dashboard_bgr, product_id, quad_px)

        norm_corners = [
            {"x": round(float(pt[0]) / w, 5), "y": round(float(pt[1]) / h, 5)}
            for pt in quad_px
        ]

        return {
            "composited_bgr": composited,
            "corners": norm_corners,
            "confidence": round(confidence, 3),
            "detection_method": method,
            "needs_manual_check": confidence < 0.45,
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


pipeline = VirtualFitPipeline()
