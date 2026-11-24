/**
 * virtualFitClientEngine.js
 * Zero-cost, 100% browser-side Computer Vision, Automatic Camera-Distance &
 * Side-Angle (3D Perspective) Analyzer + Perspective Warping Compositor
 * for VOEUX® VIRTUAL FIT.
 *
 * Capabilities:
 * 1) Automatically detects camera distance / zoom level (continuous scale from
 *    tightly zoomed close-up console to wide full-cabin dashboard) — no manual zoom buttons.
 * 2) Automatically detects side-view shooting angle (driver-side / passenger-side / straight-on)
 *    using dashboard edge-orientation histograms + console horizontal asymmetry.
 * 3) Renders true 3D perspective-warped trapezoids of the EXACT verified transparent
 *    VOEUX product PNGs with realistic drop shadows & ambient cabin lighting harmonization.
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
 * Automatic Continuous Zoom / Distance & Side-Angle Analyzer:
 * - Estimates visible cabin width in mm continuously (390mm close-up .. 1160mm full cabin)
 *   from windshield sky visibility, steering-wheel presence, and actual dark console span.
 * - Detects side shooting angle (yaw & perspective taper) from dominant dashboard
 *   horizon edge orientations + horizontal console asymmetry.
 */
function analyzeDashboardGeometry(gray, sw, sh, fullW, fullH) {
  // 1. Bright windshield sky ratio in top 14%
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

  // 2. Measure actual horizontal span of contiguous dark console/stereo region in middle band
  const midY1 = Math.round(sh * 0.26);
  const midY2 = Math.round(sh * 0.66);
  const rowSpans = [];
  for (let y = midY1; y < midY2; y += 2) {
    let curRun = 0;
    let bestRowRun = 0;
    for (let x = Math.round(sw * 0.08); x < Math.round(sw * 0.92); x++) {
      if (gray[y * sw + x] < 92) {
        curRun++;
        if (curRun > bestRowRun) bestRowRun = curRun;
      } else {
        curRun = 0;
      }
    }
    if (bestRowRun > sw * 0.14) {
      rowSpans.push(bestRowRun / sw);
    }
  }
  rowSpans.sort((a, b) => a - b);
  // 75th percentile span is robust against thin cables/vents while capturing true stereo bay width
  const consoleSpanRatio =
    rowSpans.length > 0 ? rowSpans[Math.floor(rowSpans.length * 0.75)] : 0.25;

  // 3. Measure dark steering wheel / cabin side presence on left & right outer 26%
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
  const leftSideRatio = leftDark / Math.max(1, sideTotal);
  const rightSideRatio = rightDark / Math.max(1, sideTotal);
  const steeringSideDarkness = Math.max(leftSideRatio, rightSideRatio);

  // 4. Continuous visible cabin width estimation (mm)
  // Full cabin (Creta/Swift with clear sky + steering wheel + normal stereo span): ~1160mm
  // Zoomed close-up (no sky or large stereo span >= 0.45): ~400..520mm
  let visibleWidthMm;
  if (skyRatio >= 0.22 && steeringSideDarkness >= 0.24 && consoleSpanRatio < 0.36) {
    visibleWidthMm = 1160;
  } else {
    // Combine sky cue and actual console span smoothly
    const skyWidthEst = 440 + Math.min(1, skyRatio / 0.24) * 700; // 440..1140mm
    // If existing stereo bay spans `consoleSpanRatio` of the frame, assume stereo is ~245mm wide
    const spanWidthEst = Math.max(380, Math.min(1180, 245 / Math.max(0.20, consoleSpanRatio)));
    // On zoomed-in photos (low sky OR large console span), lean strongly toward the closer estimate
    visibleWidthMm = Math.min(skyWidthEst, spanWidthEst * 1.06);
  }

  // Portrait phone photos cover narrower horizontal cabin width
  const imgAspect = fullW / Math.max(1, fullH);
  if (imgAspect < 1.1) {
    visibleWidthMm *= 0.74;
  }
  visibleWidthMm = Math.max(360, Math.min(1200, visibleWidthMm));

  // 5. Automatic Side-Angle Detection (Dominant Dashboard Horizon Slope via Sobel Gradients)
  // For near-horizontal edges (|angle| < 22 deg), compute weighted average slope dy/dx.
  // Positive slope => lines tilt down-right (camera on left/passenger side -> left side closer)
  // Negative slope => lines tilt up-right (camera on right/driver side -> right side closer)
  let weightedSlopeSum = 0;
  let weightTotal = 0;
  const gY1 = Math.round(sh * 0.16);
  const gY2 = Math.round(sh * 0.65);
  const gX1 = Math.round(sw * 0.18);
  const gX2 = Math.round(sw * 0.82);

  for (let y = gY1; y < gY2; y += 2) {
    for (let x = gX1; x < gX2; x += 2) {
      const idx = y * sw + x;
      const gx =
        -gray[idx - sw - 1] + gray[idx - sw + 1]
        - 2 * gray[idx - 1] + 2 * gray[idx + 1]
        - gray[idx + sw - 1] + gray[idx + sw + 1];
      const gy =
        -gray[idx - sw - 1] - 2 * gray[idx - sw] - gray[idx - sw + 1]
        + gray[idx + sw - 1] + 2 * gray[idx + sw] + gray[idx + sw + 1];

      const mag = Math.hypot(gx, gy);
      if (mag < 45) continue;

      // Edge tangent direction is perpendicular to gradient: (-gy, gx)
      // Horizontal edge has |gy| >> |gx|, slope dy/dx = -gx / gy
      if (Math.abs(gy) > Math.abs(gx) * 2.4) {
        const slope = -gx / gy; // in range ~(-0.41, +0.41)
        weightedSlopeSum += slope * mag;
        weightTotal += mag;
      }
    }
  }

  let detectedSlope = weightTotal > 0 ? weightedSlopeSum / weightTotal : 0;
  // Deadzone for nearly straight-on shots so straight photos stay dead-level
  if (Math.abs(detectedSlope) < 0.032) {
    detectedSlope = 0;
  }
  // Clamp to realistic automotive side-view angle range
  detectedSlope = Math.max(-0.18, Math.min(0.18, detectedSlope));

  return {
    pxPerMm: fullW / visibleWidthMm,
    detectedSlope, // negative = right side closer (driver view); positive = left side closer (passenger view)
  };
}

/**
 * Construct a 4-corner perspective trapezoid [TL, TR, BR, BL] centered at (cxNorm, cyNorm)
 * with fixed physical width/height and automatic side-angle foreshortening.
 */
function buildPerspectiveCorners(cxNorm, cyNorm, boxW, boxH, fullW, fullH, slope) {
  // Subtle perspective horizontal compression when viewed from an angle
  const yawCompress = Math.max(0.86, 1.0 - Math.abs(slope) * 0.55);
  const effW = boxW * yawCompress;
  const halfW = effW / 2;
  const halfH = boxH / 2;

  // Near edge is taller (+taper), far edge is shorter (-taper)
  // If slope < 0 (driver/right side closer), right edge is taller & top slopes up-right
  // If slope > 0 (passenger/left side closer), left edge is taller & top slopes down-right
  const taperPx = Math.max(-boxH * 0.14, Math.min(boxH * 0.14, slope * boxH * 0.72));
  const tiltY = slope * halfW * 0.55;

  const leftHalfH = halfH + taperPx;
  const rightHalfH = halfH - taperPx;

  const maxHalfH = Math.max(leftHalfH, rightHalfH) + Math.abs(tiltY);
  const cxPx = Math.max(halfW + 4, Math.min(fullW - halfW - 4, cxNorm * fullW));
  const cyPx = Math.max(maxHalfH + 4, Math.min(fullH - maxHalfH - 4, cyNorm * fullH));

  const tl = { x: (cxPx - halfW) / fullW, y: (cyPx - leftHalfH - tiltY) / fullH };
  const tr = { x: (cxPx + halfW) / fullW, y: (cyPx - rightHalfH + tiltY) / fullH };
  const br = { x: (cxPx + halfW) / fullW, y: (cyPx + rightHalfH + tiltY) / fullH };
  const bl = { x: (cxPx - halfW) / fullW, y: (cyPx + leftHalfH - tiltY) / fullH };

  return [tl, tr, br, bl];
}

/**
 * Automatic Browser Computer Vision Analyzer:
 * 1) Automatically estimates continuous zoom/distance -> locks exact physical size.
 * 2) Automatically detects side-view angle -> builds true perspective trapezoid.
 * 3) Locates best initial center point (cx, cy) on the center console.
 */
export async function detectCornersInBrowser(file, productId) {
  const meta = PRODUCT_ASSETS[productId] || PRODUCT_ASSETS['voeux-x80-dual-knob'];
  const dashImg = await fileToImage(file);
  const { canvas: fullCanvas, width: w, height: h, dataUrl: originalDataUrl } =
    renderNormalizedDashboard(dashImg);

  const sw = 280;
  const sh = Math.max(140, Math.round((h / w) * sw));
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

  const { pxPerMm, detectedSlope } = analyzeDashboardGeometry(gray, sw, sh, w, h);

  let boxW = meta.physicalWidthMm * pxPerMm;
  boxW = Math.max(w * 0.18, Math.min(w * 0.78, boxW));
  let boxH = boxW / meta.aspect;
  if (boxH > h * 0.76) {
    boxH = h * 0.76;
    boxW = boxH * meta.aspect;
  }

  // Locate best center point (cx, cy) of the center console stereo bay
  const winW = Math.max(24, Math.round(sw * (boxW / w)));
  const winH = Math.max(16, Math.round(sh * (boxH / h)));

  let bestCx = 0.5;
  let bestCy = 0.44;
  let bestScore = -1e9;

  const minX = Math.round(sw * 0.14);
  const maxX = Math.max(minX, Math.round(sw * 0.86 - winW));
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
          if (g < 88) darkCount++;
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

      const centerPrior = 1.0 - Math.abs(cxNorm - 0.5) * 1.35 - Math.abs(cyNorm - 0.44) * 0.8;
      const score = avgEdge * 0.55 + darkRatio * 28.0 + centerPrior * 18.0;
      if (score > bestScore) {
        bestScore = score;
        bestCx = cxNorm;
        bestCy = cyNorm;
      }
    }
  }

  // Refine side-angle subtly using console horizontal offset when shot from an angle
  let finalSlope = detectedSlope;
  if (Math.abs(bestCx - 0.5) > 0.08 && Math.abs(finalSlope) < 0.02) {
    // Console off-center hints at an angled side view
    finalSlope = Math.max(-0.10, Math.min(0.10, (bestCx - 0.5) * 0.35));
  }

  const corners = buildPerspectiveCorners(bestCx, bestCy, boxW, boxH, w, h, finalSlope);

  return {
    success: true,
    original_image: originalDataUrl,
    corners,
    confidence: 0.82,
    detection_method: 'browser_cv_perspective',
    dimensions: { width: w, height: h },
    needs_manual_check: false,
  };
}

/**
 * Draw an image warped onto an arbitrary 4-corner perspective trapezoid [TL, TR, BR, BL]
 * using high-precision vertical strip interpolation (fast, crisp, works on all browsers).
 */
function drawPerspectiveTrapezoid(ctx, img, tl, tr, br, bl, slices = 72) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;

  for (let i = 0; i < slices; i++) {
    const t0 = i / slices;
    const t1 = (i + 1) / slices;

    const sx = t0 * sw;
    const sWidth = Math.max(1, (t1 - t0) * sw);

    const x0Top = tl.x + (tr.x - tl.x) * t0;
    const y0Top = tl.y + (tr.y - tl.y) * t0;
    const x1Top = tl.x + (tr.x - tl.x) * t1;

    const y0Bot = bl.y + (br.y - bl.y) * t0;
    const y1Bot = bl.y + (br.y - bl.y) * t1;

    const dstX = x0Top;
    const dstW = Math.max(1, x1Top - x0Top + 0.75); // +0.75px overlap prevents subpixel seams
    const dstY = y0Top;
    const dstH = Math.max(1, (y0Bot + y1Bot) / 2 - y0Top);

    ctx.drawImage(img, sx, 0, sWidth, sh, dstX, dstY, dstW, dstH);
  }
}

/**
 * Browser Canvas Perspective Compositor:
 * Warps and composites the EXACT verified transparent VOEUX PNG onto the 4-corner
 * perspective trapezoid centered on the user's circular dot, with angled drop shadow
 * and ambient cabin brightness harmonization.
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

  const [tl, tr, br, bl] = normCorners.map((c) => ({ x: c.x * w, y: c.y * h }));
  const minX = Math.min(tl.x, bl.x);
  const maxX = Math.max(tr.x, br.x);
  const minY = Math.min(tl.y, tr.y);
  const maxY = Math.max(bl.y, br.y);
  const boxW = maxX - minX;
  const boxH = maxY - minY;

  // Sample ambient cabin brightness around the console
  let ambientBrightness = 1.0;
  try {
    const sampleX = Math.max(0, Math.round(minX - 18));
    const sampleY = Math.max(0, Math.round(minY - 18));
    const sampleW = Math.min(w - sampleX, Math.round(boxW + 36));
    const sampleH = Math.min(h - sampleY, Math.round(boxH + 36));
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

  // Render perspective-warped product onto an offscreen layer first so drop shadow
  // applies cleanly to the unified silhouette (zero slice shadow seams!)
  const layer = document.createElement('canvas');
  layer.width = w;
  layer.height = h;
  const lctx = layer.getContext('2d');
  drawPerspectiveTrapezoid(lctx, prodImg, tl, tr, br, bl, 80);

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
  ctx.shadowBlur = Math.max(12, Math.round(boxW * 0.045));
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.max(4, Math.round(boxW * 0.014));
  ctx.filter = `brightness(${ambientBrightness.toFixed(3)}) contrast(1.02)`;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();

  const resultDataUrl = canvas.toDataURL('image/jpeg', 0.93);

  return {
    success: true,
    original_image: originalDataUrl,
    result_image: resultDataUrl,
    corners: normCorners,
  };
}

/**
 * Gemini Flash Vision Spatial AI Detector (via Vercel Serverless Function `/api/virtual-fit-ai`).
 * Returns calibrated 4-corner 3D perspective trapezoid + car hint, or null if unavailable
 * so the caller can seamlessly fall back to local CV detection.
 */
export async function detectCornersWithGeminiAI(file, productId) {
  const dashImg = await fileToImage(file);
  const { width: fullW, height: fullH, dataUrl: originalDataUrl } =
    renderNormalizedDashboard(dashImg, 1600);

  // Create a lightweight <= 960px JPEG for ultra-fast Gemini Vision API upload (~80-120 KB)
  const aiMaxDim = 960;
  let aiW = fullW;
  let aiH = fullH;
  if (Math.max(aiW, aiH) > aiMaxDim) {
    const s = aiMaxDim / Math.max(aiW, aiH);
    aiW = Math.round(aiW * s);
    aiH = Math.round(aiH * s);
  }
  const aiCanvas = document.createElement('canvas');
  aiCanvas.width = aiW;
  aiCanvas.height = aiH;
  aiCanvas.getContext('2d').drawImage(dashImg, 0, 0, aiW, aiH);
  const aiDataUrl = aiCanvas.toDataURL('image/jpeg', 0.82);
  const imageBase64 = aiDataUrl.split(',')[1];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 14000);

  try {
    const resp = await fetch('/api/virtual-fit-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        imageBase64,
        mimeType: 'image/jpeg',
        imageWidth: fullW,
        imageHeight: fullH,
        productId,
      }),
    });

    clearTimeout(timeoutId);
    if (!resp.ok) return null;

    const data = await resp.json();
    if (!data || !data.success || !Array.isArray(data.corners) || data.corners.length !== 4) {
      return null;
    }

    return {
      success: true,
      original_image: originalDataUrl,
      corners: data.corners,
      confidence: data.confidence ?? 0.9,
      needs_manual_check: Boolean(data.needs_manual_check),
      engine: data.engine || 'gemini-flash',
      car_hint: data.car_hint || null,
      camera_yaw_deg: data.camera_yaw_deg ?? 0,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}
