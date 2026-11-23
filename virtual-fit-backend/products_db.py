"""
products_db.py
Product reference registry for VOEUX VIRTUAL FIT.
Maps exact product IDs from src/data/products.js to their verified front-facing
transparent reference photographs and physical dimensions.
"""

import os
from typing import Dict, Any, Optional

PRODUCTS_IMG_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "public", "images", "virtual-fit", "products")
)

VIRTUAL_FIT_PRODUCTS: Dict[str, Dict[str, Any]] = {
    "voeux-x80-dual-knob": {
        "product_id": "voeux-x80-dual-knob",
        "name": "VOEUX® X80 Diamond Premium 10.1\" Dual Knob Android Car Stereo (4GB+64GB)",
        "short_name": "VOEUX® X80 Dual Knob 10.1\"",
        "screen_size_inches": 10.1,
        "physical_width_mm": 252.0,
        "physical_height_mm": 146.0,
        "aspect_ratio": 1.726,
        "fascia_info": "Universal Double DIN 10.1-inch frame with dual rotary knobs",
        "reference_image_file": "x80_dual_knob_clean.png",
        "reference_image_url": "/images/virtual-fit/products/x80_dual_knob_clean.png",
        "has_protruding_knobs": True,
        "knob_overhang_ratio": 0.08,
    },
    "voeux-carbon-black-ts7-4-64": {
        "product_id": "voeux-carbon-black-ts7-4-64",
        "name": "VOEUX® Carbon Black Series 9\" QLED Android TS7 Stereo (4GB+64GB)",
        "short_name": "VOEUX® TS7 9\" QLED",
        "screen_size_inches": 9.0,
        "physical_width_mm": 229.0,
        "physical_height_mm": 131.0,
        "aspect_ratio": 1.748,
        "fascia_info": "Universal Double DIN 9-inch QLED frame",
        "reference_image_file": "ts7_9inch_clean.png",
        "reference_image_url": "/images/virtual-fit/products/ts7_9inch_clean.png",
        "has_protruding_knobs": False,
        "knob_overhang_ratio": 0.0,
    },
    "voeux-single-knob-piano-4-64": {
        "product_id": "voeux-single-knob-piano-4-64",
        "name": "VOEUX® Single Knob Piano Series Android Stereo (4GB+64GB)",
        "short_name": "VOEUX® Single Knob Piano",
        "screen_size_inches": 9.5,
        "physical_width_mm": 236.0,
        "physical_height_mm": 184.0,
        "aspect_ratio": 1.285,
        "fascia_info": "Universal Double DIN with central rotary knob and physical piano keys",
        "reference_image_file": "single_knob_piano_clean.png",
        "reference_image_url": "/images/virtual-fit/products/single_knob_piano_clean.png",
        "has_protruding_knobs": True,
        "knob_overhang_ratio": 0.06,
    },
}


def get_product_ref(product_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve exact product reference record by product ID."""
    prod = VIRTUAL_FIT_PRODUCTS.get(product_id)
    if not prod:
        return None
    full_path = os.path.join(PRODUCTS_IMG_DIR, prod["reference_image_file"])
    return {**prod, "reference_image_path": full_path}


def list_supported_products():
    return list(VIRTUAL_FIT_PRODUCTS.values())

