/**
 * api/virtual-fit-ai.js
 * Free-tier Vercel Serverless Function powered by Google Gemini Flash Vision.
 *
 * Dynamically discovers the latest available Gemini Flash model if needed,
 * analyzes the uploaded car dashboard photo, and returns:
 *  - Exact 4-corner 3D perspective trapezoid [TL, TR, BR, BL] calibrated to the
 *    real-world physical dimensions of the chosen VOEUX Android Player
 *    (9" = 229mm, 9.5" = 236mm, 10.1" = 252mm),
 *  - Automatic camera zoom/distance calibration (handles tight close-ups & wide cabin shots),
 *  - Automatic side-angle 3D perspective yaw & slope estimation,
 *  - Vehicle dashboard hint + engine status metadata.
 */

const PRODUCT_SPECS = {
  'voeux-x80-dual-knob': {
    physicalWidthMm: 252,
    screenLabel: '10.1-inch (252mm wide)',
    aspect: 1.78,
  },
  'voeux-carbon-black-ts7-4-64': {
    physicalWidthMm: 229,
    screenLabel: '9-inch (229mm wide)',
    aspect: 1.786,
  },
  'voeux-single-knob-piano-4-64': {
    physicalWidthMm: 236,
    screenLabel: '9.5-inch (236mm wide)',
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
  if (!Number.isFinite(cx) || cx < 0.08 || cx > 0.92) cx = 0.5;
  if (!Number.isFinite(cy) || cy < 0.08 || cy > 0.88) cy = 0.44;

  // 2. Real-world mm-to-px calibration
  let visibleWidthMm = Number(aiData?.visible_dashboard_width_mm);
  if (!Number.isFinite(visibleWidthMm) || visibleWidthMm < 240 || visibleWidthMm > 2000) {
    visibleWidthMm = w / h < 1.05 ? 620 : 980;
  }
  visibleWidthMm = clamp(visibleWidthMm, 320, 1350);

  let pxPerMm = w / visibleWidthMm;

  // If Gemini saw the steering wheel clearly, blend with steering-wheel physical ruler (370mm)
  const wheelNorm = Number(aiData?.steering_wheel_diameter_norm);
  if (Number.isFinite(wheelNorm) && wheelNorm >= 0.14 && wheelNorm <= 0.65) {
    const wheelPx = wheelNorm * w;
    const wheelPxPerMm = (wheelPx / REAL_STEERING_WHEEL_MM) * STEERING_TO_CONSOLE_DEPTH_FACTOR;
    pxPerMm = wheelPxPerMm * 0.60 + pxPerMm * 0.40;
  }

  // Blend with existing stereo / infotainment bay width when clearly detected
  const sb = aiData?.stereo_box;
  if (
    sb &&
    Number.isFinite(Number(sb.x1)) &&
    Number.isFinite(Number(sb.x2)) &&
    Number(sb.x2) > Number(sb.x1)
  ) {
    const oemBoxW = (Number(sb.x2) - Number(sb.x1)) * w;
    if (oemBoxW > w * 0.12 && oemBoxW < w * 0.84) {
      // Average OEM factory stereo fascia/screen is ~210mm wide
      const boxPxPerMm = oemBoxW / 210;
      pxPerMm = pxPerMm * 0.50 + boxPxPerMm * 0.50;
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
  let playerW = clamp(spec.physicalWidthMm * pxPerMm * foreshortenX, w * 0.17, w * 0.84);
  let playerH = (playerW / foreshortenX) / spec.aspect;

  if (playerH > h * 0.80) {
    playerH = h * 0.80;
    playerW = playerH * spec.aspect * foreshortenX;
  }

  const halfW = playerW / 2;
  const halfH = playerH / 2;

  // Perspective height taper: positive yaw (camera on right side) -> right edge closer/taller
  const taper = clamp((yawDeg / 45) * 0.17, -0.17, 0.17);
  const leftHalfH = halfH * (1 - taper);
  const rightHalfH = halfH * (1 + taper);

  // Vertical shear along dashboard horizon line
  const effectiveSlope = Math.abs(slope) > 0.015 ? slope : (yawDeg / 45) * 0.08;
  const shearY = halfW * effectiveSlope * 0.5;

  // Clamp center so all 4 corners remain cleanly inside the image
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

async function discoverFlashModels(apiKey) {
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    const list = (data.models || [])
      .filter(
        (m) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes('generateContent') &&
          typeof m.name === 'string' &&
          m.name.includes('gemini') &&
          m.name.includes('flash') &&
          !m.name.includes('image') &&
          !m.name.includes('tts') &&
          !m.name.includes('audio')
      )
      .map((m) => m.name.replace(/^models\//, ''));
    // Prefer newest version numbers first
    return list.sort().reverse();
  } catch {
    return [];
  }
}

async function callGeminiVision(apiKey, model, imageBase64, mimeType, productId) {
  const spec = PRODUCT_SPECS[productId] || PRODUCT_SPECS['voeux-x80-dual-knob'];
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = `You are an expert automotive interior spatial geometry analyzer for an aftermarket ${spec.screenLabel} Android car stereo virtual fitment tool.

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
- "stereo_box": tight normalized bounding box around the existing factory stereo/infotainment screen or Double-DIN stereo opening.
- "steering_wheel_diameter_norm": if the steering wheel is visible, its full outer rim diameter divided by the image width (e.g. 0.28). If not visible (close-up photo), return null.
- "visible_dashboard_width_mm": real-world horizontal width in millimeters visible across the full width of the photo at the center console depth:
  - Full wide car cabin photo (both doors/A-pillars visible): ~1150 to 1300
  - Standard dashboard photo (steering wheel + center console + part of passenger side): ~900 to 1120
  - Medium shot (center console + edge of steering wheel): ~650 to 850
  - Zoomed-in close-up of only the center console / AC vents / stereo: ~360 to 580
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
    throw new Error(`Gemini ${model} HTTP ${resp.status}: ${errText.slice(0, 220)}`);
  }

  const data = await resp.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error(`Gemini ${model} returned empty response`);
  }

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

    // Try fast current Flash aliases first; if deprecated/unavailable, dynamically discover available Flash models
    const candidateModels = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.8-flash'];
    let aiJson = null;
    let usedModel = null;
    const errors = [];

    for (const model of candidateModels) {
      try {
        aiJson = await callGeminiVision(apiKey, model, imageBase64, mimeType, productId);
        usedModel = model;
        break;
      } catch (err) {
        errors.push(err.message);
      }
    }

    if (!aiJson) {
      const discovered = await discoverFlashModels(apiKey);
      for (const model of discovered.slice(0, 3)) {
        if (candidateModels.includes(model)) continue;
        try {
          aiJson = await callGeminiVision(apiKey, model, imageBase64, mimeType, productId);
          usedModel = model;
          break;
        } catch (err) {
          errors.push(err.message);
        }
      }
    }

    if (!aiJson) {
      console.error('Gemini Vision failed:', errors.join(' | '));
      return res.status(200).json({
        success: false,
        fallback: true,
        reason: errors[0] || 'Gemini Vision unavailable',
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
