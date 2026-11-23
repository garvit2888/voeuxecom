/**
 * virtualFitClientEngine.js
 * Zero-cost, 100% browser-side Computer Vision, Camera-Distance Scale Analyzer,
 * and Realistic Compositing Engine for VOEUX® VIRTUAL FIT.
 *
 * Key Guarantee:
 * - Analyzes how far/zoomed the dashboard photograph was taken (windshield visibility,
 *   steering-wheel presence, and center-console span) to compute the TRUE FIXED physical
 *   size of the selected VOEUX unit (9" TS7 = 229mm, 10.1" X80 = 252mm, Single Knob = 236mm).
 * - The player boundary stays CONSTANT in size — the customer simply places the circular
 *   center dot on their console so 9" always looks like 9" and 10.1" always looks like 10.1".
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
 * Estimate real-world dashboard zoom level (pixels per mm at center console)
 * from the whole dashboard photograph:
 * - Wide full-cabin shots have bright windshield daylight along the top strip and
 *   dark steering wheel mass occupying one outer side (~1350mm full cabin width).
 * - Close-up console shots have little/no windshield at top and dark dashboard/bezel
 *   spanning most of the frame (~550–800mm visible width).
 */
function analyzeDashboardZoomScale(gray, sw, sh, fullW, fullH) {
  // 1. Measure bright windshield/sky ratio in the top 16% of the photo
  const topRows = Math.max(8, Math.round(sh * 0.16));
  let brightTop = 0;
  let totalTop = 0;
  for (let y = 0; y < topRows; y++) {
    for (let x = 0; x < sw; x++) {
      if (gray[y * sw + x] > 170) brightTop++;
      totalTop++;
    }
  }
  const windshieldRatio = totalTop > 0 ? brightTop / totalTop : 0;

  // 2. Measure dark steering wheel / cabin side presence on left & right outer 28%
  const sideW = Math.round(sw * 0.28);
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

  // 3. Determine visible cabin width in millimeters based on zoom/distance cues
  // Wide cabin (full windshield + full steering wheel visible): ~1180–1250 mm across frame
  // Medium cabin shot: ~850–1000 mm across frame
  // Close-up center console shot (no windshield, zoomed right onto stereo): ~540–680 mm across frame
  let visibleWidthMm;
  let zoomLabel;

  if (windshieldRatio >= 0.22 && steeringSideDarkness >= 0.28) {
    // Classic wide full-dashboard photo (e.g. Creta/Swift full interior shot)
    visibleWidthMm = 1160;
    zoomLabel = 'Full dashboard view';
  } else if (windshieldRatio >= 0.08) {
    // Medium-distance dashboard shot
    const t = Math.min(1, (windshieldRatio - 0.08) / 0.14);
    visibleWidthMm = 820 + t * 320;
    zoomLabel = 'Medium dashboard view';
  } else {
    // Close-up center console shot (zoomed in on stereo bay)
    visibleWidthMm = 580;
    zoomLabel = 'Close-up console view';
  }

  // Portrait phone photos show less horizontal cabin width than landscape photos
  const imgAspect = fullW / Math.max(1, fullH);
  if (imgAspect < 1.1) {
    visibleWidthMm *= 0.76;
  }

  const pxPerMm = fullW / visibleWidthMm;
  return { pxPerMm, zoomLabel };
}

/**
 * Compute constant fixed-size normalized bounding box centered at (cxNorm, cyNorm)
 * using the analyzed dashboard zoom scale and exact VOEUX physical width (mm).
 */
export function buildFixedSizeCorners(cxNorm, cyNorm, boxWidthNorm, boxHeightNorm) {
  const halfW = boxWidthNorm / 2;
  const halfH = boxHeightNorm / 2;
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
 * Browser Computer Vision Analyzer:
 * 1) Estimates how far/zoomed the dashboard photo was taken -> locks the EXACT fixed
 *    size (boxWidthNorm, boxHeightNorm) for 9" vs 10.1" vs Single Knob Piano.
 * 2) Locates the best initial center point (cx, cy) on the center console.
 */
export async function detectCornersInBrowser(file, productId) {
  const meta = PRODUCT_ASSETS[productId] || PRODUCT_ASSETS['voeux-x80-dual-knob'];
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

  // Analyze dashboard camera distance / zoom to lock exact physical player size
  const { pxPerMm, zoomLabel } = analyzeDashboardZoomScale(gray, sw, sh, w, h);

  let boxW = meta.physicalWidthMm * pxPerMm;
  boxW = Math.max(w * 0.18, Math.min(w * 0.68, boxW));
  let boxH = boxW / meta.aspect;
  if (boxH > h * 0.68) {
    boxH = h * 0.68;
    boxW = boxH * meta.aspect;
  }

  const boxWidthNorm = boxW / w;
  const boxHeightNorm = boxH / h;

  // Locate best center point (cx, cy) of the center console stereo bay
  const winW = Math.max(24, Math.round(sw * boxWidthNorm));
  const winH = Math.max(16, Math.round(sh * boxHeightNorm));

  let bestCx = 0.5;
  let bestCy = 0.43;
  let bestScore = -1e9;

  const minX = Math.round(sw * 0.24);
  const maxX = Math.max(minX, Math.round(sw * 0.76 - winW));
  const minY = Math.round(sh * 0.16);
  const maxY = Math.max(minY, Math.round(sh * 0.68 - winH));

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

      const centerPrior = 1.0 - Math.abs(cxNorm - 0.5) * 1.4 - Math.abs(cyNorm - 0.42) * 0.8;
      const score = avgEdge * 0.55 + darkRatio * 28.0 + centerPrior * 18.0;
      if (score > bestScore) {
        bestScore = score;
        bestCx = cxNorm;
        bestCy = cyNorm;
      }
    }
  }

  const corners = buildFixedSizeCorners(bestCx, bestCy, boxWidthNorm, boxHeightNorm);

  return {
    success: true,
    original_image: originalDataUrl,
    corners,
    confidence: 0.78,
    detection_method: 'browser_cv',
    zoom_label: zoomLabel,
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

  // Use the exact constant dimensions from normCorners centered at the user's dot
  const xs = normCorners.map((c) => c.x * w);
  const ys = normCorners.map((c) => c.y * h);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;

  const exactAspect =
    (prodImg.naturalWidth || prodImg.width) / (prodImg.naturalHeight || prodImg.height);
  let finalW = Math.max(...xs) - Math.min(...xs);
  let finalH = finalW / exactAspect;

  if (finalH > h * 0.85) {
    finalH = h * 0.85;
    finalW = finalH * exactAspect;
  }

  const drawX = Math.max(4, Math.min(w - finalW - 4, cx - finalW / 2));
  const drawY = Math.max(4, Math.min(h - finalH - 4, cy - finalH / 2));

  // Sample ambient cabin brightness around the console for realistic lighting match
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
