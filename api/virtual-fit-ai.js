/**
 * api/virtual-fit-ai.js
 * Free-tier Vercel Serverless Function powered by Google Gemini Flash Vision.
 *
 * Analyzes an uploaded car dashboard photo and returns:
 *  - Exact 4-corner 3D perspective trapezoid [TL, TR, BR, BL] calibrated to the
 *    real-world physical dimensions of the chosen VOEUX Android Player
 *    (9" = 229mm, 9.5" = 236mm, 10.1" = 252mm),
 *  - Automatic camera zoom/distance calibration (handles tight close-ups & wide cabin shots),
 *  - Automatic side-angle 3D perspective yaw & slope estimation,
 *  - Optional vehicle dashboard hint.
 *
 * Never generates or modifies the VOEUX product hardware — only computes exact
 * spatial geometry so the browser composites the real transparent VOEUX PNG.
 */

const PRODUCT_SPECS = {
  'voeux-x80-dual-knob': {
    physicalWidthMm: 252,
    aspect: 1.78,
  },
  'voeux-carbon-black-ts7-4-64': {
    physicalWidthMm: 229,
    aspect: 1.786,
  },
  'voeux-single-knob-piano-4-64': {
    physicalWidthMm: 236,
    aspect: 1.31,
  },
};

const REAL_STEERING_WHEEL_MM = 370;
const STEERING_TO_CONSOLE_DEPTH_FACTOR = 0.87;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function buildCalibratedTrapezoid(aiData, productId, imgW, imgH) {
  const spec = PRODUCT_SPECS[productId] || PRODUCT_SPECS['voeux-x80-dual-knob'];
  const w = Math.max(100, Number(imgW) || 1280);
  const h = Math.max(100, Number(imgH) || 720);

  // 1. Center of stereo bay
  let cx = Number(aiData?.stereo_center?.x);
  let cy = Number(aiData?.stereo_center?.y);
  if (!Number.isFinite(cx) || cx < 0.1 || cx > 0.9) cx = 0.5;
  if (!Number.isFinite(cy) || cy < 0.1 || cy > 0.85) cy = 0.44;

  // 2. Real-world mm-to-px calibration
  let visibleWidthMm = Number(aiData?.visible_dashboard_width_mm);
  if (!Number.isFinite(visibleWidthMm) || visibleWidthMm < 250 || visibleWidthMm > 2000) {
    visibleWidthMm = w / h < 1.05 ? 620 : 980;
  }
  visibleWidthMm = clamp(visibleWidthMm, 340, 1350);

  let pxPerMm = w / visibleWidthMm;

  // If Gemini saw the steering wheel clearly, blend with steering-wheel physical ruler (370mm)
  const wheelNorm = Number(aiData?.steering_wheel_diameter_norm);
  if (Number.isFinite(wheelNorm) && wheelNorm >= 0.14 && wheelNorm <= 0.65) {
    const wheelPx = wheelNorm * w;
    const wheelPxPerMm = (wheelPx / REAL_STEERING_WHEEL_MM) * STEERING_TO_CONSOLE_DEPTH_FACTOR;
    pxPerMm = wheelPxPerMm * 0.62 + pxPerMm * 0.38;
  }

  // Also sanity-check against detected existing stereo box width if present:
  // Most OEM screens are 175mm-230mm wide, so a 9"-10.1" (229-252mm) unit shouldn't be tiny compared to it.
  const sb = aiData?.stereo_box;
  if (
    sb &&
    Number.isFinite(Number(sb.x1)) &&
    Number.isFinite(Number(sb.x2)) &&
    Number(sb.x2) > Number(sb.x1)
  ) {
    const oemBoxW = (Number(sb.x2) - Number(sb.x1)) * w;
    if (oemBoxW > w * 0.12 && oemBoxW < w * 0.82) {
      // OEM double-DIN / factory screens average ~205mm wide
      const boxPxPerMm = oemBoxW / 205;
      pxPerMm = pxPerMm * 0.58 + boxPxPerMm * 0.42;
    }
  }

  // 3. Side-view angle (yaw) & dashboard horizon slope
  const rawYaw = Number(aiData?.camera_yaw_deg);
  const yawDeg = Number.isFinite(rawYaw) ? clamp(rawYaw, -42, 42) : 0;
  const yawRad = (yawDeg * Math.PI) / 180;

  const rawSlope = Number(aiData?.dashboard_slope);
  const slope = Number.isFinite(rawSlope) ? clamp(rawSlope, -0.22, 0.22) : 0;

  // 4. Compute fixed physical player pixel dimensions (with slight cosine foreshortening for side angles)
  const foreshortenX = Math.max(0.76, Math.cos(yawRad * 0.85));
  let playerW = clamp(spec.physicalWidthMm * pxPerMm * foreshortenX, w * 0.17, w * 0.82);
  let playerH = (playerW / foreshortenX) / spec.aspect;

  if (playerH > h * 0.78) {
    playerH = h * 0.78;
    playerW = playerH * spec.aspect * foreshortenX;
  }

  const halfW = playerW / 2;
  const halfH = playerH / 2;

  // Perspective height taper: positive yaw (camera on right side) -> right edge closer/taller
  const taper = clamp((yawDeg / 45) * 0.16, -0.16, 0.16);
  const leftHalfH = halfH * (1 - taper);
  const rightHalfH = halfH * (1 + taper);

  // Subtle vertical shear along dashboard horizon line
  const effectiveSlope = Math.abs(slope) > 0.015 ? slope : (yawDeg / 45) * 0.08;
  const shearY = halfW * effectiveSlope * 0.5;

  // Clamp center so all 4 corners remain inside the image
  const maxHalfH = Math.max(leftHalfH, rightHalfH) + Math.abs(shearY);
  const cxPx = clamp(cx * w, halfW + 4, w - halfW - 4);
  const cyPx = clamp(cy * h, maxHalfH + 4, h - maxHalfH - 4);

  const corners = [
    { x: (cxPx - halfW) / w, y: (cyPx - leftHalfH - shearY) / h }, // TL
    { x: (cxPx + halfW) / w, y: (cyPx - rightHalfH + shearY) / h }, // TR
    { x: (cxPx + halfW) / w, y: (cyPx + rightHalfH + shearY) / h }, // BR
    { x: (cxPx - halfW) / w, y: (cyPx + leftHalfH - shearY) / h }, // BL
  ].map((pt) => ({
    x: Number(clamp(pt.x, 0.005, 0.995).toFixed(5)),
    y: Number(clamp(pt.y, 0.005, 0.995).toFixed(5)),
  }));

  return {
    corners,
    yawDeg: Math.round(yawDeg),
    visibleWidthMm: Math.round(visibleWidthMm),
  };
}

async function callGeminiVision(apiKey, model, imageBase64, mimeType) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = `You are an expert automotive interior spatial geometry analyzer for an aftermarket 9-inch / 10.1-inch Android car stereo virtual fitment tool.

Inspect this car dashboard photograph carefully and return ONLY a valid JSON object with these exact fields:
{
  "stereo_center": { "x": number, "y": number },
  "stereo_box": { "x1": number, "y1": number, "x2": number, "y2": number },
  "steering_wheel_diameter_norm": number or null,
  "visible_dashboard_width_mm": number,
  "camera_yaw_deg": number,
  "dashboard_slope": number,
  "car_hint": string,
  "confidence": number
}

Field rules:
- All x, y coordinates are normalized 0.0 to 1.0 (0,0 is top-left of image; 1,1 is bottom-right).
- "stereo_center": exact center of the car's center infotainment screen or stereo head-unit bay (between the center AC vents / above climate controls).
- "stereo_box": tight normalized bounding box around the existing factory stereo/infotainment unit or stereo opening.
- "steering_wheel_diameter_norm": if the steering wheel is visible, its full outer rim diameter divided by the image width (e.g. 0.28). If not visible (close-up photo), return null.
- "visible_dashboard_width_mm": real-world horizontal width in millimeters visible across the full width of the photo at the center console depth:
  - Full wide car cabin photo (both doors/A-pillars visible): ~1150 to 1300
  - Standard dashboard photo (steering wheel + center console + part of passenger side): ~900 to 1120
  - Medium shot (center console + edge of steering wheel): ~650 to 850
  - Zoomed-in close-up of only the center console / AC vents / stereo: ~380 to 600
- "camera_yaw_deg": horizontal viewing angle of the center console from -42 to +42 degrees.
  - 0 = straight-on front view.
  - Positive (+10 to +38) = photo taken from the right side looking toward the left (right edge of console appears closer/taller than left edge).
  - Negative (-10 to -38) = photo taken from the left side looking toward the right (left edge of console appears closer/taller than right edge).
- "dashboard_slope": vertical slope (dy/dx, from -0.22 to +0.22) of the horizontal dashboard trim line across the stereo bay (positive = slopes downward to the right, negative = slopes upward to the right).
- "car_hint": short 2-3 word label of the car interior if recognizable (e.g. "Hyundai Creta", "Maruti Swift", "Car Dashboard").
- "confidence": 0.0 to 1.0.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType || 'image/jpeg',
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Gemini ${model} HTTP ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data = await resp.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error(`Gemini ${model} returned empty response`);
  }

  // Strip accidental markdown code fences if any
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      success: false,
      fallback: true,
      reason: 'GEMINI_API_KEY not configured on server',
    });
  }

  try {
    const { imageBase64, mimeType, imageWidth, imageHeight, productId } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing imageBase64 payload' });
    }

    // Try Gemini 2.5 Flash first (best spatial vision accuracy on free tier),
    // with automatic fallback to Gemini 2.0 Flash if needed.
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    let aiJson = null;
    let usedModel = null;
    let lastError = null;

    for (const model of models) {
      try {
        aiJson = await callGeminiVision(apiKey, model, imageBase64, mimeType);
        usedModel = model;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!aiJson) {
      console.error('Gemini Vision failed:', lastError?.message);
      return res.status(200).json({
        success: false,
        fallback: true,
        reason: lastError?.message || 'Gemini Vision unavailable',
      });
    }

    const calibrated = buildCalibratedTrapezoid(aiJson, productId, imageWidth, imageHeight);
    const confidence = clamp(Number(aiJson.confidence) || 0.88, 0.4, 0.99);

    return res.status(200).json({
      success: true,
      engine: usedModel,
      corners: calibrated.corners,
      confidence: Number(confidence.toFixed(3)),
      camera_yaw_deg: calibrated.yawDeg,
      visible_dashboard_width_mm: calibrated.visibleWidthMm,
      car_hint: typeof aiJson.car_hint === 'string' ? aiJson.car_hint.slice(0, 40) : null,
      needs_manual_check: confidence < 0.5,
    });
  } catch (err) {
    console.error('virtual-fit-ai error:', err);
    return res.status(200).json({
      success: false,
      fallback: true,
      reason: err.message || 'Unexpected AI error',
    });
  }
}
