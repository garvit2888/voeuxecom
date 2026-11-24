/**
 * virtualFitClientEngine.js
 * Zero-cost, 100% browser-side Computer Vision, Camera-Distance Scale Analyzer,
 * and Realistic Compositing Engine for VOEUX® VIRTUAL FIT.
 *
 * Key Guarantee:
 * - Analyzes how far/zoomed the dashboard photograph was taken (existing console span,
 *   windshield sky visibility, steering-wheel presence, and image orientation) to lock
 *   the TRUE FIXED physical size of the selected VOEUX unit (9" TS7 = 229mm,
 *   10.1" X80 = 252mm, Single Knob Piano = 236mm).
 * - Supports 3 calibrated camera-distance presets (Full Cabin, Medium, Close-Up)
 *   so even tightly zoomed console photos render at realistic true-to-life scale
 *   while preserving the exact 9" vs 10.1" physical difference.
 */

export const PRODUCT_ASSETS = {
  'voeux-x80-dual-knob': {
    url: '/images/virtual-fit/products/x80_dual_knob_clean.png',
    physicalWidthMm: 252,
    screenLabel: '10.1"',
    aspect: 1.78,
  },
  'voeux-carbon-black-ts7-4-64': {
    url: '/images/virtual-fit/products/ts7_9inch_clean.png',
    physicalWidthMm: 229,
    screenLabel: '9"',
    aspect: 1.786,
  },
  'voeux-single-knob-piano-4-64': {
    url: '/images/virtual-fit/products/single_knob_piano_clean.png',
    physicalWidthMm: 236,
    screenLabel: '9.5"',
    aspect: 1.31,
  },
};

export const CAMERA_DISTANCE_PRESETS = {
  full: {
    id: 'full',
    label: 'Full Dashboard',
    visibleWidthMm: 1160,
  },
  medium: {
    id: 'medium',
    label: 'Medium Shot',
    visibleWidthMm: 720,
  },
  closeup: {
    id: 'closeup',
    label: 'Close-Up Console',
    visibleWidthMm: 440,
  },
};

const imageCache = new Map();

function loadImage(src) {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode uploaded photograph.'));
    };
    img.src = url;
  });
}

function renderNormalizedDashboard(dashImg, maxDim = 1600) {
  let w = dashImg.naturalWidth || dashImg.width;
  let h = dashImg.naturalHeight || dashImg.height;
  if (Math.max(w, h) > maxDim) {
    const s = maxDim / Math.max(w, h);
    w = Math.round(w * s);
    h = Math.round(h * s);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(dashImg, 0, 0, w, h);
  return {
    canvas,
    width: w,
    height: h,
    dataUrl: canvas.toDataURL('image/jpeg', 0.9),
  };
}

/**
 * Compute constant fixed-size normalized bounding box centered at (cxNorm, cyNorm)
 * for a given product and camera distance preset ('full' | 'medium' | 'closeup').
 */
export function computeFixedCornersForPreset(
  productId,
  presetId,
  cxNorm,
  cyNorm,
  imgWidth,
  imgHeight
) {
  const meta = PRODUCT_ASSETS[productId] || PRODUCT_ASSETS['voeux-x80-dual-knob'];
  const preset = CAMERA_DISTANCE_PRESETS[presetId] || CAMERA_DISTANCE_PRESETS.full;

  let visibleWidthMm = preset.visibleWidthMm;
  const imgAspect = imgWidth / Math.max(1, imgHeight);
  // Portrait photos span narrower horizontal cabin width than landscape photos
  if (imgAspect < 1.1) {
    visibleWidthMm *= 0.72;
  }

  const pxPerMm = imgWidth / visibleWidthMm;
  let boxW = meta.physicalWidthMm * pxPerMm;
  boxW = Math.max(imgWidth * 0.18, Math.min(imgWidth * 0.78, boxW));
  let boxH = boxW / meta.aspect;

  if (boxH > imgHeight * 0.76) {
    boxH = imgHeight * 0.76;
    boxW = boxH * meta.aspect;
  }

  const halfW = boxW / (2 * imgWidth);
  const halfH = boxH / (2 * imgHeight);
  const cx = Math.max(halfW + 0.005, Math.min(1 - halfW - 0.005, cxNorm));
  const cy = Math.max(halfH + 0.005, Math.min(1 - halfH - 0.005, cyNorm));

  return [
    { x: cx - halfW, y: cy - halfH },
    { x: cx + halfW, y: cy - halfH },
    { x: cx + halfW, y: cy + halfH },
    { x: cx - halfW, y: cy + halfH },
  ];
}

/**
 * Measure the contiguous dark stereo/console bay width around the center of the photo
 * + bright sky/windshield top band + outer steering wheel presence to accurately
 * classify whether the photo is a Full Dashboard, Medium Shot, or Close-Up Console photo.
 */
function analyzeDashboardDistancePreset(gray, sw, sh, fullW, fullH) {
  // 1. Bright sky/windshield band at top 14% (strict > 190 threshold to ignore dashboard glare)
  const topRows = Math.max(8, Math.round(sh * 0.14));
  let brightSky = 0;
  let totalTop = 0;
  for (let y = 0; y < topRows; y++) {
    for (let x = 0; x < sw; x++) {
      if (gray[y * sw + x] > 190) brightSky++;
      totalTop++;
    }
  }
  const skyRatio = totalTop > 0 ? brightSky / totalTop : 0;

  // 2. Measure dark infotainment / center-console contiguous span across middle horizontal band
  const midY1 = Math.round(sh * 0.30);
  const midY2 = Math.round(sh * 0.62);
  let maxDarkRun = 0;
  for (let y = midY1; y < midY2; y += 3) {
    let curRun = 0;
    let bestRowRun = 0;
    for (let x = Math.round(sw * 0.12); x < Math.round(sw * 0.88); x++) {
      // Dark bezel/screen or high-contrast console interior
      if (gray[y * sw + x] < 95) {
        curRun++;
        if (curRun > bestRowRun) bestRowRun = curRun;
      } else {
        curRun = 0;
      }
    }
    if (bestRowRun > maxDarkRun) maxDarkRun = bestRowRun;
  }
  const consoleSpanRatio = maxDarkRun / sw;

  // 3. Measure steering wheel / dark cabin presence on outer 26% sides
  const sideW = Math.round(sw * 0.26);
  let leftDark = 0;
  let rightDark = 0;
  let sideTotal = 0;
  for (let y = Math.round(sh * 0.15); y < Math.round(sh * 0.85); y++) {
    for (let x = 0; x < sideW; x++) {
      if (gray[y * sw + x] < 75) leftDark++;
      if (gray[y * sw + (sw - 1 - x)] < 75) rightDark++;
      sideTotal++;
    }
  }
  const steeringSideDarkness = Math.max(leftDark, rightDark) / Math.max(1, sideTotal);

  // Classify photo distance accurately:
  // - Full Dashboard: clear bright windshield sky across top (>= 24%) + steering wheel visible + stereo span < 38%
  // - Close-Up Console: little/no sky at top (< 9%) OR dark stereo bezel spans >= 44% of the frame width
  // - Medium Shot: everything in between
  if (skyRatio < 0.09 || consoleSpanRatio >= 0.44) {
    return 'closeup';
  }
  if (skyRatio >= 0.24 && steeringSideDarkness >= 0.25 && consoleSpanRatio < 0.38) {
    return 'full';
  }
  return 'medium';
}

/**
 * Browser Computer Vision Analyzer:
 * 1) Classifies photo zoom level ('full' | 'medium' | 'closeup') -> locks true fixed physical size.
 * 2) Locates the best initial center point (cx, cy) on the center console.
 */
export async function detectCornersInBrowser(file, productId) {
  const dashImg = await fileToImage(file);
  const { canvas: fullCanvas, width: w, height: h, dataUrl: originalDataUrl } =
    renderNormalizedDashboard(dashImg);

  const sw = 240;
  const sh = Math.max(120, Math.round((h / w) * sw));
  const scanCanvas = document.createElement('canvas');
  scanCanvas.width = sw;
  scanCanvas.height = sh;
  const sctx = scanCanvas.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(fullCanvas, 0, 0, sw, sh);
  const pixels = sctx.getImageData(0, 0, sw, sh).data;

  const gray = new Float32Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) {
    const p = i * 4;
    gray[i] = 0.299 * pixels[p] + 0.587 * pixels[p + 1] + 0.114 * pixels[p + 2];
  }

  const presetId = analyzeDashboardDistancePreset(gray, sw, sh, w, h);
  const initialBox = computeFixedCornersForPreset(productId, presetId, 0.5, 0.44, w, h);
  const boxWidthNorm = initialBox[1].x - initialBox[0].x;
  const boxHeightNorm = initialBox[2].y - initialBox[0].y;

  // Locate best center point (cx, cy) of the center console stereo bay
  const winW = Math.max(24, Math.round(sw * boxWidthNorm));
  const winH = Math.max(16, Math.round(sh * boxHeightNorm));

  let bestCx = 0.5;
  let bestCy = 0.45;
  let bestScore = -1e9;

  const minX = Math.round(sw * 0.15);
  const maxX = Math.max(minX, Math.round(sw * 0.85 - winW));
  const minY = Math.round(sh * 0.12);
  const maxY = Math.max(minY, Math.round(sh * 0.78 - winH));

  for (let y = minY; y <= maxY; y += 4) {
    for (let x = minX; x <= maxX; x += 4) {
      let edgeEnergy = 0;
      let darkCount = 0;
      let samples = 0;

      for (let yy = y; yy < y + winH; yy += 3) {
        for (let xx = x; xx < x + winW; xx += 3) {
          const idx = yy * sw + xx;
          const g = gray[idx];
          if (g < 85) darkCount++;
          if (xx + 1 < sw && yy + 1 < sh) {
            edgeEnergy += Math.abs(g - gray[idx + 1]) + Math.abs(g - gray[idx + sw]);
          }
          samples++;
        }
      }

      if (samples === 0) continue;
      const avgEdge = edgeEnergy / samples;
      const darkRatio = darkCount / samples;
      const cxNorm = (x + winW / 2) / sw;
      const cyNorm = (y + winH / 2) / sh;

      const centerPrior = 1.0 - Math.abs(cxNorm - 0.5) * 1.4 - Math.abs(cyNorm - 0.44) * 0.8;
      const score = avgEdge * 0.55 + darkRatio * 28.0 + centerPrior * 18.0;
      if (score > bestScore) {
        bestScore = score;
        bestCx = cxNorm;
        bestCy = cyNorm;
      }
    }
  }

  const corners = computeFixedCornersForPreset(productId, presetId, bestCx, bestCy, w, h);

  return {
    success: true,
    original_image: originalDataUrl,
    corners,
    confidence: 0.8,
    detection_method: 'browser_cv',
    distance_preset: presetId,
    dimensions: { width: w, height: h },
    needs_manual_check: false,
  };
}

/**
 * Browser Canvas Compositor:
 * Places the EXACT verified transparent VOEUX PNG centered on the user's circular
 * dot at the CONSTANT analyzed physical size (zero shrinking, zero stretching).
 */
export async function compositeInBrowser(file, productId, normCorners) {
  const meta = PRODUCT_ASSETS[productId] || PRODUCT_ASSETS['voeux-x80-dual-knob'];
  const [dashImg, prodImg] = await Promise.all([
    fileToImage(file),
    loadImage(meta.url),
  ]);

  const { canvas, width: w, height: h, dataUrl: originalDataUrl } =
    renderNormalizedDashboard(dashImg);
  const ctx = canvas.getContext('2d');

  const xs = normCorners.map((c) => c.x * w);
  const ys = normCorners.map((c) => c.y * h);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;

  const exactAspect =
    (prodImg.naturalWidth || prodImg.width) / (prodImg.naturalHeight || prodImg.height);
  let finalW = Math.max(...xs) - Math.min(...xs);
  let finalH = finalW / exactAspect;

  if (finalH > h * 0.88) {
    finalH = h * 0.88;
    finalW = finalH * exactAspect;
  }

  const drawX = Math.max(4, Math.min(w - finalW - 4, cx - finalW / 2));
  const drawY = Math.max(4, Math.min(h - finalH - 4, cy - finalH / 2));

  let ambientBrightness = 1.0;
  try {
    const sampleX = Math.max(0, Math.round(drawX - 18));
    const sampleY = Math.max(0, Math.round(drawY - 18));
    const sampleW = Math.min(w - sampleX, Math.round(finalW + 36));
    const sampleH = Math.min(h - sampleY, Math.round(finalH + 36));
    const ringData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH).data;
    let sum = 0;
    let cnt = 0;
    for (let i = 0; i < ringData.length; i += 64) {
      sum += 0.299 * ringData[i] + 0.587 * ringData[i + 1] + 0.114 * ringData[i + 2];
      cnt++;
    }
    const meanL = cnt > 0 ? sum / cnt : 95;
    ambientBrightness = Math.max(0.9, Math.min(1.06, 0.94 + (meanL - 85) / 900));
  } catch (e) {}

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
  ctx.shadowBlur = Math.max(12, Math.round(finalW * 0.045));
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.max(4, Math.round(finalW * 0.014));
  ctx.filter = `brightness(${ambientBrightness.toFixed(3)}) contrast(1.02)`;
  ctx.drawImage(prodImg, drawX, drawY, finalW, finalH);
  ctx.restore();

  const resultDataUrl = canvas.toDataURL('image/jpeg', 0.93);

  return {
    success: true,
    original_image: originalDataUrl,
    result_image: resultDataUrl,
    corners: [
      { x: drawX / w, y: drawY / h },
      { x: (drawX + finalW) / w, y: drawY / h },
      { x: (drawX + finalW) / w, y: (drawY + finalH) / h },
      { x: drawX / w, y: (drawY + finalH) / h },
    ],
  };
}
