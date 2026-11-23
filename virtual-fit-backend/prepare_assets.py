"""
prepare_assets.py
Cleanly removes baked checkerboard or light backgrounds from VOEUX front-facing
product reference images into true RGBA transparent PNGs with tight bounding boxes.
Never redraws or alters the product itself.
"""

import os
from collections import deque
import cv2
import numpy as np


PRODUCTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "public", "images", "virtual-fit", "products")
)


def extract_transparent_product(input_path: str, output_path: str) -> None:
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {input_path}")

    h, w = img.shape[:2]

    # Check if image already has real alpha transparency on borders
    has_real_alpha = False
    if img.shape[2] == 4:
        alpha = img[:, :, 3]
        border_alpha = np.concatenate([alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1]])
        if np.mean(border_alpha < 50) > 0.5:
            has_real_alpha = True

    if has_real_alpha:
        rgba = img.copy()
    else:
        bgr = img[:, :, :3]
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        sat = hsv[:, :, 1]
        val = hsv[:, :, 2]

        # Exterior checkerboard / light neutral background mask:
        # Baked checkerboard is strictly neutral gray (~195-210) & white (255)
        bg_candidate = (sat < 14) & (val > 180)

        # Flood-fill ONLY from the outer image border so interior white UI icons/text are 100% preserved
        visited = np.zeros((h, w), dtype=np.uint8)
        bg_mask = np.zeros((h, w), dtype=np.uint8)
        queue = deque()

        for x in range(w):
            if bg_candidate[0, x]:
                visited[0, x] = 1
                queue.append((0, x))
            if bg_candidate[h - 1, x]:
                visited[h - 1, x] = 1
                queue.append((h - 1, x))
        for y in range(h):
            if bg_candidate[y, 0] and not visited[y, 0]:
                visited[y, 0] = 1
                queue.append((y, 0))
            if bg_candidate[y, w - 1] and not visited[y, w - 1]:
                visited[y, w - 1] = 1
                queue.append((y, w - 1))

        while queue:
            cy, cx = queue.popleft()
            bg_mask[cy, cx] = 255
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                    if bg_candidate[ny, nx]:
                        visited[ny, nx] = 1
                        queue.append((ny, nx))

        # Foreground mask is inverse of connected background
        fg_mask = 255 - bg_mask

        # Close any 2-3px bright specular gaps on metallic knob rims, then fill outer contour solid
        close_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, close_k, iterations=2)

        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            largest_cnt = max(contours, key=cv2.contourArea)
            solid_mask = np.zeros((h, w), dtype=np.uint8)
            cv2.drawContours(solid_mask, [largest_cnt], -1, 255, thickness=cv2.FILLED)
            fg_mask = solid_mask

        # Slight morphological cleanup (1px erode + 1px feather) to remove any checkerboard halo
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        fg_mask = cv2.erode(fg_mask, kernel, iterations=1)
        fg_mask = cv2.GaussianBlur(fg_mask, (3, 3), 0.7)

        rgba = cv2.cvtColor(bgr, cv2.COLOR_BGR2BGRA)
        rgba[:, :, 3] = fg_mask

    # Tight-crop to non-transparent bounding box with 4px padding
    alpha_ch = rgba[:, :, 3]
    ys, xs = np.where(alpha_ch > 15)
    if len(xs) > 0 and len(ys) > 0:
        pad = 4
        y1 = max(0, int(ys.min()) - pad)
        y2 = min(h, int(ys.max()) + pad)
        x1 = max(0, int(xs.min()) - pad)
        x2 = min(w, int(xs.max()) + pad)
        rgba = rgba[y1:y2, x1:x2]

    # Save optimized transparent PNG
    cv2.imwrite(output_path, rgba, [cv2.IMWRITE_PNG_COMPRESSION, 6])
    print(f"Saved clean transparent asset: {output_path} ({rgba.shape[1]}x{rgba.shape[0]})")


if __name__ == "__main__":
    targets = [
        (os.path.join(PRODUCTS_DIR, "x80_dual_knob_front.PNG"), os.path.join(PRODUCTS_DIR, "x80_dual_knob_clean.png")),
        (os.path.join(PRODUCTS_DIR, "ts7_9inch_front.PNG"), os.path.join(PRODUCTS_DIR, "ts7_9inch_clean.png")),
        (
            os.path.join(PRODUCTS_DIR, "single_knob_piano_front.PNG"),
            os.path.join(PRODUCTS_DIR, "single_knob_piano_clean.png"),
        ),
    ]
    for src_path, dst_path in targets:
        if os.path.exists(src_path):
            extract_transparent_product(src_path, dst_path)
        else:
            print(f"Skipping missing file: {src_path}")
