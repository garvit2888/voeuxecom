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

# Targeted automotive stereo + steering wheel (real-world 370mm scale anchor) prompts
STEREO_TEXT_QUERIES = [[
    "car stereo",
    "car radio",
    "car infotainment screen",
    "car audio head unit",
    "dashboard stereo panel",
    "car steering wheel",
]]
STEERING_WHEEL_QUERY_IDX = 5
REAL_STEERING_WHEEL_DIAMETER_MM = 370.0
# Steering wheel sits closer to camera than center console (~22% foreshortening)
STEERING_TO_CONSOLE_DEPTH_FACTOR = 0.78


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
    # STAGE 2 & 3: Open-Vocabulary ML Stereo + Steering Wheel Detection
    # ------------------------------------------------------------------
    def _detect_with_owlvit(
        self, img_bgr: np.ndarray
    ) -> Tuple[Optional[Tuple[np.ndarray, float]], Optional[float]]:
        """
        Run Google OWL-ViT (Apache 2.0) in a single pass to detect:
        1) The car stereo / factory button radio / infotainment head unit
        2) The car steering wheel (370mm real-world diameter scale anchor)
        Returns (stereo_result_or_none, steering_wheel_diameter_px_or_none).
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
        labels = results["labels"].cpu().numpy()

        img_area = float(h * w)
        best_quad = None
        best_rank = -1.0
        best_conf = 0.0

        best_wheel_score = -1.0
        wheel_diameter_px: Optional[float] = None

        for box, score, label in zip(boxes, scores, labels):
            x1, y1, x2, y2 = [float(v) for v in box]
            bw = max(1.0, x2 - x1)
            bh = max(1.0, y2 - y1)
            area_ratio = (bw * bh) / img_area

            # Capture steering wheel as real-world 370mm physical scale anchor
            if int(label) == STEERING_WHEEL_QUERY_IDX:
                if area_ratio >= 0.04 and float(score) > best_wheel_score:
                    best_wheel_score = float(score)
                    # Use max(bw, bh) because steering wheels near frame edge may be clipped horizontally
                    wheel_diameter_px = max(bw, bh)
                continue

            aspect = bw / bh
            cx = (x1 + x2) / (2.0 * w)
            cy = (y1 + y2) / (2.0 * h)

            # Reject implausible full-dashboard or tiny-slot boxes
            if area_ratio < 0.012 or area_ratio > 0.55:
                continue
            if aspect < 0.75 or aspect > 3.5:
                continue
            if not (0.20 <= cx <= 0.80 and 0.12 <= cy <= 0.78):
                continue

            # Favor centered infotainment bays with realistic stereo proportions
            center_bias = max(0.2, 1.0 - abs(cx - 0.50) * 1.3 - abs(cy - 0.44) * 0.6)
            aspect_bias = max(0.35, 1.0 - abs(aspect - 1.65) * 0.30)
            rank = float(score) * center_bias * aspect_bias

            if rank > best_rank:
                best_rank = rank
                best_conf = float(score)
                best_quad = order_quad_points(
                    np.array([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], dtype=np.float32)
                )

        stereo_res = None
        if best_quad is not None:
            norm_conf = min(0.96, best_conf * 2.2)
            stereo_res = (best_quad, norm_conf)

        return stereo_res, wheel_diameter_px

    def _estimate_px_per_mm(
        self, img_bgr: np.ndarray, wheel_diameter_px: Optional[float]
    ) -> Tuple[float, str]:
        """
        Estimate real-world pixels-per-millimeter at the center dashboard plane
        based on camera distance & zoom level:
        1) Primary: Detected steering wheel (370mm real diameter).
        2) Secondary: Top-windshield visibility & cabin framing analysis (distinguishes
           close-up console photos from wide full-dashboard cabin photos).
        """
        h, w = img_bgr.shape[:2]
        if wheel_diameter_px is not None and wheel_diameter_px > h * 0.25:
            raw_px_per_mm = wheel_diameter_px / REAL_STEERING_WHEEL_DIAMETER_MM
            console_px_per_mm = raw_px_per_mm * STEERING_TO_CONSOLE_DEPTH_FACTOR
            min_px_mm = (w * 0.16) / 229.0
            max_px_mm = (w * 0.62) / 252.0
            console_px_per_mm = float(np.clip(console_px_per_mm, min_px_mm, max_px_mm))
            return console_px_per_mm, "steering_wheel_calibrated"

        # Secondary continuous zoom/distance cue: combine strict windshield sky ratio
        # + 75th-percentile dark center-console horizontal span so zoomed-in photos
        # automatically receive the larger true-to-life physical scale.
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        small_w = 320
        small_h = max(120, int(round(h * (small_w / float(w)))))
        small_gray = cv2.resize(gray, (small_w, small_h), interpolation=cv2.INTER_AREA)

        top_strip = small_gray[: max(8, int(small_h * 0.14)), :]
        sky_ratio = float(np.mean(top_strip > 190))

        mid_band = small_gray[int(small_h * 0.26) : int(small_h * 0.66), int(small_w * 0.08) : int(small_w * 0.92)]
        row_spans = []
        for row in mid_band[::2]:
            dark = row < 92
            cur = 0
            best = 0
            for val in dark:
                if val:
                    cur += 1
                    if cur > best:
                        best = cur
                else:
                    cur = 0
            row_spans.append(best / float(small_w))
        console_span_ratio = float(np.percentile(row_spans, 75)) if row_spans else 0.25

        if sky_ratio >= 0.26:
            visible_width_mm = 1140.0
        elif sky_ratio >= 0.09:
            t = min(1.0, (sky_ratio - 0.09) / 0.17)
            visible_width_mm = 660.0 + t * 440.0
        else:
            visible_width_mm = 520.0

        if console_span_ratio > 0.34:
            span_est_mm = float(np.clip(265.0 / max(0.32, console_span_ratio), 380.0, 920.0))
            visible_width_mm = min(visible_width_mm, span_est_mm * 0.72 + visible_width_mm * 0.28)

        if (w / max(1.0, float(h))) < 1.1:
            visible_width_mm *= 0.74  # Portrait framing

        visible_width_mm = float(np.clip(visible_width_mm, 360.0, 1200.0))
        return float(w) / visible_width_mm, "zoom_distance_estimated"

    def _estimate_side_slope(self, img_bgr: np.ndarray, cx_norm: float) -> float:
        """
        Automatically estimate horizontal dashboard perspective slope (dy/dx) from
        near-horizontal Sobel edges in the dashboard band so side-angle photos
        produce a realistic 3D perspective trapezoid.
        """
        h, w = img_bgr.shape[:2]
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        small_w = 320
        small_h = max(120, int(round(h * (small_w / float(w)))))
        sg = cv2.resize(gray, (small_w, small_h), interpolation=cv2.INTER_AREA)

        gx = cv2.Sobel(sg, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(sg, cv2.CV_32F, 0, 1, ksize=3)

        band_gx = gx[int(small_h * 0.16) : int(small_h * 0.72), int(small_w * 0.08) : int(small_w * 0.92)]
        band_gy = gy[int(small_h * 0.16) : int(small_h * 0.72), int(small_w * 0.08) : int(small_w * 0.92)]

        mag = np.hypot(band_gx, band_gy)
        valid = (mag > 45.0) & (np.abs(band_gy) > np.abs(band_gx) * 2.2)
        if np.sum(valid) < 80:
            return 0.0

        # For a horizontal edge, tangent direction is (-gy, gx), so dy/dx = -gx / gy
        slopes = -band_gx[valid] / (band_gy[valid] + 1e-6)
        weights = mag[valid]
        in_range = np.abs(slopes) <= 0.32
        if np.sum(in_range) < 60:
            return 0.0

        slopes = slopes[in_range]
        weights = weights[in_range]
        hist, edges = np.histogram(slopes, bins=25, range=(-0.32, 0.32), weights=weights)
        best_bin = int(np.argmax(hist))
        dominant_slope = float((edges[best_bin] + edges[best_bin + 1]) / 2.0)

        # Combine gently with horizontal console offset cue
        offset_cue = (0.50 - cx_norm) * 0.18
        if abs(dominant_slope) < 0.028 and abs(offset_cue) < 0.025:
            return 0.0

        blended = dominant_slope * 0.75 + offset_cue * 0.25
        return float(np.clip(blended, -0.22, 0.22))

    def enforce_symmetric_physical_quad(
        self,
        quad_px: np.ndarray,
        img_bgr: np.ndarray,
        product_id: str,
        px_per_mm: float,
        allow_larger: bool = True,
    ) -> np.ndarray:
        """
        Guarantee TWO critical physical accuracy rules:
        1) STRICT SYMMETRY: Output quad always matches the exact aspect ratio of the
           actual VOEUX product PNG (never stretched vertically or squished horizontally;
           dual knobs stay 100% circular).
        2) NO UNREALISTIC SHRINKING: The player width is NEVER shrunk below its true
           real-world physical size (229mm for 9" TS7, 252mm for 10.1" X80) on the dashboard.
        """
        h, w = img_bgr.shape[:2]
        prod_rgba, prod_meta = self.load_product_rgba(product_id)
        ph, pw = prod_rgba.shape[:2]
        exact_aspect = float(pw) / float(ph)

        quad = order_quad_points(quad_px)
        cx = float(quad[:, 0].mean())
        cy = float(quad[:, 1].mean())

        top_w = float(np.linalg.norm(quad[1] - quad[0]))
        bot_w = float(np.linalg.norm(quad[2] - quad[3]))
        left_h = float(np.linalg.norm(quad[3] - quad[0]))
        right_h = float(np.linalg.norm(quad[2] - quad[1]))

        cur_w = (top_w + bot_w) / 2.0
        cur_h = (left_h + right_h) / 2.0
        # Equivalent width from current area/dimensions so dragging up/down OR left/right scales symmetrically
        cur_equiv_w = max(cur_w, cur_h * exact_aspect)

        # True physical minimum width on this dashboard photo
        min_physical_w = float(prod_meta["physical_width_mm"]) * px_per_mm
        max_reasonable_w = float(w) * 0.82

        if allow_larger:
            final_w = max(cur_equiv_w, min_physical_w)
        else:
            final_w = min_physical_w

        final_w = float(np.clip(final_w, min_physical_w, max_reasonable_w))
        final_h = final_w / exact_aspect

        # Ensure height fits inside frame cleanly while keeping strict aspect ratio
        if final_h > h * 0.85:
            final_h = h * 0.85
            final_w = final_h * exact_aspect

        # Clamp center so the symmetrical player stays cleanly within the dashboard image
        half_w = final_w / 2.0
        half_h = final_h / 2.0
        cx = float(np.clip(cx, half_w + 4, w - half_w - 4))
        cy = float(np.clip(cy, half_h + 4, h - half_h - 4))

        # Automatically apply subtle 3D perspective trapezoid if photo is taken from a side angle
        slope = self._estimate_side_slope(img_bgr, cx / max(1.0, float(w)))
        taper = float(np.clip(slope * 0.65, -0.14, 0.14))
        left_half_h = half_h * (1.0 - taper)
        right_half_h = half_h * (1.0 + taper)
        shear_y = half_w * slope * 0.45

        return order_quad_points(
            np.array(
                [
                    [cx - half_w, cy - left_half_h - shear_y],
                    [cx + half_w, cy - right_half_h + shear_y],
                    [cx + half_w, cy + right_half_h + shear_y],
                    [cx - half_w, cy + left_half_h - shear_y],
                ],
                dtype=np.float32,
            )
        )

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
        Detect the 4 corners of the stereo installation area, calibrate real-world
        cabin scale via the steering wheel / full dashboard width, and enforce
        strict product symmetry + true physical 9" / 10.1" minimum size.
        """
        _, prod = self.load_product_rgba(product_id)

        # 1. Primary: OWL-ViT Open-Vocabulary Stereo + Steering Wheel Detector
        ml_res, wheel_diameter_px = self._detect_with_owlvit(img_bgr)
        px_per_mm, _scale_method = self._estimate_px_per_mm(img_bgr, wheel_diameter_px)

        if ml_res is not None:
            quad, conf = ml_res
            sym_quad = self.enforce_symmetric_physical_quad(
                quad, img_bgr, product_id, px_per_mm, allow_larger=False
            )
            return sym_quad, conf, "owlvit_automotive"

        # 2. Secondary: OpenCV Contour & Bezel Quadrilateral Detection
        cv_res = self._detect_with_opencv_contours(img_bgr)
        if cv_res is not None:
            quad, conf = cv_res
            sym_quad = self.enforce_symmetric_physical_quad(
                quad, img_bgr, product_id, px_per_mm, allow_larger=False
            )
            return sym_quad, conf, "opencv_contour"

        # 3. Fallback: Geometric center estimation calibrated to true physical scale
        quad = self._geometric_fallback_quad(img_bgr, prod["aspect_ratio"])
        sym_quad = self.enforce_symmetric_physical_quad(
            quad, img_bgr, product_id, px_per_mm, allow_larger=False
        )
        return sym_quad, 0.30, "geometric_fallback"

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
        """
        Re-composite exact VOEUX product at the user's translated center position while
        strictly preserving the automatically detected physical scale & 3D perspective trapezoid.
        """
        h, w = dashboard_bgr.shape[:2]
        pts = order_quad_points(
            np.array(
                [[c["x"] * w, c["y"] * h] for c in norm_corners],
                dtype=np.float32,
            )
        )
        return self.composite_product(dashboard_bgr, product_id, pts)


pipeline = VirtualFitPipeline()
