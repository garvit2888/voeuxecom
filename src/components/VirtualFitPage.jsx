import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import {
  detectCornersWithGeminiAI,
  detectCornersInBrowser,
  compositeInBrowser,
} from '../utils/virtualFitClientEngine';
import {
  ArrowLeft,
  Upload,
  Download,
  ShoppingCart,
  RotateCcw,
  Sliders,
  Check,
  Compass,
  Camera,
  CheckCircle2,
  X,
  Globe
} from 'lucide-react';
import { VIRTUAL_FIT_LANGUAGES, VIRTUAL_FIT_COPY } from '../data/virtualFitTranslations';

// Supported Virtual Fit product reference map
export const VIRTUAL_FIT_SUPPORTED_IDS = [
  'voeux-x80-dual-knob',
  'voeux-carbon-black-ts7-4-64',
  'voeux-single-knob-piano-4-64',
];

const VIRTUAL_FIT_PRODUCT_META = {
  'voeux-x80-dual-knob': {
    shortLabel: 'X80 Dual Knob 10.1"',
    fullLabel: 'VOEUX® X80 Dual Knob 10.1"',
    aspect: 1.78,
    minWidthRatio: 0.21,
  },
  'voeux-carbon-black-ts7-4-64': {
    shortLabel: 'TS7 9" QLED',
    fullLabel: 'VOEUX® Carbon Black TS7 9" QLED',
    aspect: 1.786,
    minWidthRatio: 0.19,
  },
  'voeux-single-knob-piano-4-64': {
    shortLabel: 'Single Knob Piano',
    fullLabel: 'VOEUX® Single Knob Piano Series',
    aspect: 1.31,
    minWidthRatio: 0.20,
  },
};

const getConfiguredApiBase = () => {
  if (import.meta.env.VITE_VIRTUAL_FIT_API_URL) {
    return import.meta.env.VITE_VIRTUAL_FIT_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalNetwork =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.endsWith('.local');
    if (isLocalNetwork) {
      return `${window.location.protocol}//${host}:8000`;
    }
  }
  // On public production without a paid ML server, use built-in zero-cost browser CV engine
  return null;
};

const API_BASE = getConfiguredApiBase();

const CORNER_LABELS = ['TL', 'TR', 'BR', 'BL'];

/**
 * Precision Automotive Technical Outline Dashboard SVG
 * Large, screen-filling outline-only technical drawing with thin white strokes,
 * slow travelling luminous pulse, and subtle prominence on the central infotainment bay.
 */
export const AutomotiveDashboardOutline = () => (
  <div className="relative w-[108%] -mx-[4%] sm:w-full sm:mx-auto max-w-[1160px] select-none pointer-events-none">
    <style>{`
      @keyframes voeuxDashTrace {
        0% { stroke-dashoffset: 1600; opacity: 0.15; }
        20% { opacity: 0.9; }
        80% { opacity: 0.9; }
        100% { stroke-dashoffset: -1600; opacity: 0.15; }
      }
      @keyframes voeuxInfotainmentPulse {
        0%, 100% { opacity: 0.45; filter: drop-shadow(0 0 6px rgba(59, 66, 159, 0.35)); }
        50% { opacity: 0.95; filter: drop-shadow(0 0 14px rgba(140, 150, 255, 0.55)); }
      }
      .vf-dash-pulse {
        stroke-dasharray: 220 1380;
        animation: voeuxDashTrace 9s linear infinite;
      }
      .vf-screen-glow {
        animation: voeuxInfotainmentPulse 4.5s ease-in-out infinite;
      }
    `}</style>

    <svg
      viewBox="0 0 920 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-label="Automotive dashboard technical outline illustration"
    >
      <defs>
        <linearGradient id="vfPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="75%" stopColor="#6B75E8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="vfCenterAmbient" cx="50%" cy="48%" r="42%">
          <stop offset="0%" stopColor="#3B429F" stopOpacity="0.18" />
          <stop offset="70%" stopColor="#3B429F" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle ambient depth behind central infotainment bay */}
      <ellipse cx="460" cy="158" rx="185" ry="95" fill="url(#vfCenterAmbient)" />

      {/* 1. Upper Windshield Cowling & Sculpted Dashboard Sweep */}
      <path
        d="M 42 152 C 98 92, 215 62, 345 58 L 575 58 C 705 62, 822 92, 878 152"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M 42 152 C 98 92, 215 62, 345 58 L 575 58 C 705 62, 822 92, 878 152"
        stroke="url(#vfPulseGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="vf-dash-pulse"
      />

      {/* Mid Dashboard Architectural Horizon Line */}
      <path
        d="M 28 214 C 110 198, 225 192, 340 194 M 580 194 C 695 192, 810 198, 892 214"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />

      {/* Lower Dashboard Contour & Center Tunnel */}
      <path
        d="M 55 256 C 145 258, 245 258, 348 254 L 368 318 M 865 256 C 775 258, 675 258, 572 254 L 552 318"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M 368 318 L 552 318"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="0.7"
      />

      {/* 2. Right-Hand Drive / Driver Instrument Cluster Binnacle (Right Side - Indian Spec) */}
      <path
        d="M 615 112 C 650 86, 745 86, 780 112 C 792 126, 796 154, 786 176 L 610 176 C 600 154, 604 126, 615 112 Z"
        stroke="rgba(255,255,255,0.26)"
        strokeWidth="0.8"
      />
      {/* Tachometer & Speedometer Minimalist Rings */}
      <circle cx="658" cy="144" r="24" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" />
      <circle cx="738" cy="144" r="24" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" />
      <path d="M 658 144 L 671 131" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
      <path d="M 738 144 L 749 128" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
      <rect x="688" y="132" width="20" height="24" rx="2" stroke="rgba(255,255,255,0.16)" strokeWidth="0.65" />

      {/* 3. Steering Wheel Outline (Driver Side - Right) */}
      <g>
        {/* Outer Rim */}
        <circle cx="698" cy="212" r="88" stroke="rgba(255,255,255,0.42)" strokeWidth="1.0" />
        <circle cx="698" cy="212" r="78" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" />
        {/* Travelling subtle glow on steering rim */}
        <circle
          cx="698"
          cy="212"
          r="88"
          stroke="url(#vfPulseGrad)"
          strokeWidth="1.1"
          className="vf-dash-pulse"
        />
        {/* Center Hub */}
        <path
          d="M 672 204 C 672 190, 724 190, 724 204 L 718 228 C 712 238, 684 238, 678 228 Z"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.85"
        />
        {/* Three Sculpted Spokes */}
        <path d="M 620 206 L 672 206 M 621 220 L 675 218" stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
        <path d="M 724 206 L 776 206 M 721 218 L 775 220" stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
        <path d="M 688 235 L 686 290 M 708 235 L 710 290" stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
      </g>

      {/* 4. Passenger Side Sculpted Trim & Glovebox Line (Left Side) */}
      <path
        d="M 78 158 L 280 158 C 292 158, 300 166, 300 176 L 300 228 C 300 238, 292 246, 280 246 L 96 246"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.7"
      />
      {/* Left Side AC Vent */}
      <rect x="86" y="130" width="52" height="22" rx="3" stroke="rgba(255,255,255,0.28)" strokeWidth="0.75" />
      <line x1="92" y1="137" x2="132" y2="137" stroke="rgba(255,255,255,0.18)" strokeWidth="0.65" />
      <line x1="92" y1="145" x2="132" y2="145" stroke="rgba(255,255,255,0.18)" strokeWidth="0.65" />

      {/* Far Right AC Vent */}
      <rect x="808" y="130" width="46" height="22" rx="3" stroke="rgba(255,255,255,0.24)" strokeWidth="0.75" />
      <line x1="814" y1="137" x2="848" y2="137" stroke="rgba(255,255,255,0.16)" strokeWidth="0.65" />
      <line x1="814" y1="145" x2="848" y2="145" stroke="rgba(255,255,255,0.16)" strokeWidth="0.65" />

      {/* Center AC Vents Flanking Infotainment */}
      <rect x="366" y="84" width="76" height="16" rx="2" stroke="rgba(255,255,255,0.28)" strokeWidth="0.75" />
      <line x1="372" y1="92" x2="436" y2="92" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <rect x="478" y="84" width="76" height="16" rx="2" stroke="rgba(255,255,255,0.28)" strokeWidth="0.75" />
      <line x1="484" y1="92" x2="548" y2="92" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      {/* Hazard Switch */}
      <rect x="451" y="84" width="18" height="16" rx="1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <path d="M 460 88 L 464.5 96 L 455.5 96 Z" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />

      {/* 5. CENTRAL INFOTAINMENT AREA — Subtly More Prominent */}
      <g className="vf-screen-glow">
        {/* Outer Fascia Frame */}
        <rect
          x="356"
          y="112"
          width="208"
          height="118"
          rx="7"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.25"
        />
        {/* Inner Display Glass Line */}
        <rect
          x="364"
          y="120"
          width="192"
          height="102"
          rx="4"
          stroke="rgba(120,132,255,0.55)"
          strokeWidth="0.75"
        />
        {/* Delicate Technical Corner Registration Marks */}
        <path d="M 347 124 L 347 104 L 367 104" stroke="#6B75E8" strokeWidth="0.9" strokeOpacity="0.8" />
        <path d="M 553 104 L 573 104 L 573 124" stroke="#6B75E8" strokeWidth="0.9" strokeOpacity="0.8" />
        <path d="M 347 218 L 347 238 L 367 238" stroke="#6B75E8" strokeWidth="0.9" strokeOpacity="0.8" />
        <path d="M 553 238 L 573 238 L 573 218" stroke="#6B75E8" strokeWidth="0.9" strokeOpacity="0.8" />

        {/* Subtle minimalist crosshair inside display */}
        <line x1="454" y1="171" x2="466" y2="171" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" />
        <line x1="460" y1="165" x2="460" y2="177" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" />
      </g>

      {/* Climate Control Dials Below Infotainment */}
      <circle cx="404" cy="256" r="11" stroke="rgba(255,255,255,0.22)" strokeWidth="0.7" />
      <circle cx="460" cy="256" r="9" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
      <circle cx="516" cy="256" r="11" stroke="rgba(255,255,255,0.22)" strokeWidth="0.7" />
    </svg>
  </div>
);

export const VirtualFitPage = () => {
  const {
    virtualFitProduct,
    setVirtualFitProduct,
    setActivePage,
    addToCart,
    setIsCartOpen,
    addToast,
    productsList,
  } = useShop();

  // Resolve active product carried forward from product page
  const activeProduct =
    virtualFitProduct && VIRTUAL_FIT_SUPPORTED_IDS.includes(virtualFitProduct.id)
      ? virtualFitProduct
      : (productsList || PRODUCTS).find((p) => p.id === 'voeux-x80-dual-knob') || PRODUCTS[0];

  const [stage, setStage] = useState('upload'); // 'upload' | 'preview' | 'processing' | 'result'
  const [showTutorial, setShowTutorial] = useState(true); // Always shown on open to guide customers
  const [showPhotoGuide, setShowPhotoGuide] = useState(false); // Shown before taking/uploading a dashboard photo
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('voeux_vf_lang');
      if (saved && VIRTUAL_FIT_COPY[saved]) return saved;
    } catch (e) {}
    return 'en';
  });
  const handleLanguageChange = (code) => {
    setLang(code);
    try {
      localStorage.setItem('voeux_vf_lang', code);
    } catch (e) {}
  };
  const t = VIRTUAL_FIT_COPY[lang] || VIRTUAL_FIT_COPY.en;

  const [loadingSample, setLoadingSample] = useState(false);
  const [isDetectingPreview, setIsDetectingPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ML pipeline outputs
  const [originalImage, setOriginalImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [corners, setCorners] = useState(null); // [{x, y}, ...] normalized 0..1
  const [confidence, setConfidence] = useState(null);
  const [aiCarHint, setAiCarHint] = useState(null);
  const [detectionEngine, setDetectionEngine] = useState(null); // e.g. 'gemini-flash-latest' | 'owlvit' | 'browser-cv'
  const [detectedYawDeg, setDetectedYawDeg] = useState(0);
  const [needsManualCheck, setNeedsManualCheck] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Interactive Comparison Slider (0..100%)
  const [sliderPos, setSliderPos] = useState(50);
  const isSlidingRef = useRef(false);
  const compareContainerRef = useRef(null);

  // Interactive Manual Symmetrical Placement & 4-Corner Correction
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isRefitting, setIsRefitting] = useState(false);
  const [activeCornerIdx, setActiveCornerIdx] = useState(null); // 0..3 or 'move'
  const dragStartRef = useRef(null);
  const adjustContainerRef = useRef(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Clean up object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const detectCornersForPreview = useCallback(async (file, productId) => {
    setIsDetectingPreview(true);
    setErrorMessage('');
    setAiCarHint(null);
    setDetectionEngine(null);
    setDetectedYawDeg(0);
    try {
      // 1. Primary: Gemini Flash Vision AI via free Vercel Serverless Function (/api/virtual-fit-ai)
      const aiData = await detectCornersWithGeminiAI(file, productId);
      if (aiData && aiData.success && aiData.corners) {
        setOriginalImage(aiData.original_image);
        setCorners(aiData.corners);
        setConfidence(aiData.confidence);
        setNeedsManualCheck(Boolean(aiData.needs_manual_check));
        setDetectionEngine(aiData.engine || 'gemini-ai');
        setDetectedYawDeg(Number(aiData.camera_yaw_deg) || 0);
        if (aiData.car_hint) setAiCarHint(aiData.car_hint);
        return;
      }

      // 2. Secondary (local dev): Python OWL-ViT backend if running
      if (API_BASE) {
        try {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('product_id', productId);

          const resp = await fetch(`${API_BASE}/api/virtual-fit/detect-corners`, {
            method: 'POST',
            body: formData,
          });
          const data = await resp.json();
          if (resp.ok && data.success) {
            setOriginalImage(data.original_image);
            setCorners(data.corners);
            setConfidence(data.confidence);
            setNeedsManualCheck(Boolean(data.needs_manual_check));
            setDetectionEngine('local-owlvit');
            return;
          }
        } catch (backendErr) {
          console.info('Python backend unavailable, using built-in browser CV engine.');
        }
      }

      // 3. Final instant fallback: built-in zero-cost browser CV detector
      const localData = await detectCornersInBrowser(file, productId);
      setOriginalImage(localData.original_image);
      setCorners(localData.corners);
      setConfidence(localData.confidence);
      setNeedsManualCheck(Boolean(localData.needs_manual_check));
      setDetectionEngine('browser-cv');
    } catch (err) {
      setErrorMessage(err.message || 'Unable to read this photograph. Please try a clearer image.');
    } finally {
      setIsDetectingPreview(false);
    }
  }, []);

  const handleFileSelected = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 15 MB. Please upload a smaller photograph.');
      return;
    }
    setErrorMessage('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setOriginalImage(null);
    setCorners(null);
    setStage('preview');
    detectCornersForPreview(file, activeProduct.id);
  }, [previewUrl, activeProduct.id, detectCornersForPreview]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleUseSampleDashboard = async () => {
    setLoadingSample(true);
    setErrorMessage('');
    try {
      const resp = await fetch('/images/virtual-fit/sample_dashboard.jpg');
      if (!resp.ok) throw new Error('Could not load sample dashboard.');
      const blob = await resp.blob();
      const sampleFile = new File([blob], 'sample_dashboard.jpg', { type: 'image/jpeg' });
      setShowTutorial(false);
      handleFileSelected(sampleFile);
    } catch (err) {
      setErrorMessage('Could not load sample dashboard. Please upload your own photo.');
    } finally {
      setLoadingSample(false);
    }
  };

  const runVirtualFitPipeline = async () => {
    if (!selectedFile || !activeProduct) return;
    setErrorMessage('');
    setStage('processing');
    setIsAdjusting(false);

    try {
      // 1. Try Python ML backend if configured (local Mac/LAN or cloud ML host)
      if (API_BASE) {
        try {
          if (corners && corners.length === 4 && originalImage) {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('product_id', activeProduct.id);
            formData.append('corners', JSON.stringify(corners));

            const resp = await fetch(`${API_BASE}/api/virtual-fit/refit`, {
              method: 'POST',
              body: formData,
            });
            const data = await resp.json();
            if (resp.ok && data.success) {
              setResultImage(data.result_image);
              setNeedsManualCheck(false);
              setSliderPos(50);
              setStage('result');
              return;
            }
          } else {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('product_id', activeProduct.id);

            const resp = await fetch(`${API_BASE}/api/virtual-fit/detect-and-fit`, {
              method: 'POST',
              body: formData,
            });
            const data = await resp.json();
            if (resp.ok && data.success) {
              setOriginalImage(data.original_image);
              setResultImage(data.result_image);
              setCorners(data.corners);
              setConfidence(data.confidence);
              setNeedsManualCheck(Boolean(data.needs_manual_check));
              setSliderPos(50);
              setStage('result');
              return;
            }
          }
        } catch (backendErr) {
          console.info('Python backend unavailable, using built-in browser CV engine.');
        }
      }

      // 2. Built-in zero-cost browser Canvas compositing engine (using Gemini AI or local CV corners)
      let activeCorners = corners;
      if (!activeCorners || activeCorners.length !== 4) {
        const aiDetected = await detectCornersWithGeminiAI(selectedFile, activeProduct.id);
        const detected = aiDetected || (await detectCornersInBrowser(selectedFile, activeProduct.id));
        activeCorners = detected.corners;
        setOriginalImage(detected.original_image);
        setCorners(detected.corners);
        if (detected.car_hint) setAiCarHint(detected.car_hint);
      }

      const comp = await compositeInBrowser(selectedFile, activeProduct.id, activeCorners);
      setOriginalImage(comp.original_image);
      setResultImage(comp.result_image);
      setCorners(comp.corners);
      setNeedsManualCheck(false);
      setSliderPos(50);
      setStage('result');
    } catch (err) {
      console.error('Virtual Fit pipeline error:', err);
      setErrorMessage(
        err.message || 'Unable to process this photograph. Please try a clearer front-facing dashboard photo.'
      );
      setStage('preview');
    }
  };

  const applyManualCorners = async () => {
    if (!selectedFile || !activeProduct || !corners) return;
    setIsRefitting(true);
    setErrorMessage('');

    try {
      if (API_BASE) {
        try {
          const formData = new FormData();
          formData.append('image', selectedFile);
          formData.append('product_id', activeProduct.id);
          formData.append('corners', JSON.stringify(corners));

          const resp = await fetch(`${API_BASE}/api/virtual-fit/refit`, {
            method: 'POST',
            body: formData,
          });
          const data = await resp.json();
          if (resp.ok && data.success) {
            setResultImage(data.result_image);
            setNeedsManualCheck(false);
            setIsAdjusting(false);
            setSliderPos(50);
            return;
          }
        } catch (backendErr) {
          console.info('Python backend unavailable for refit, using built-in browser engine.');
        }
      }

      const comp = await compositeInBrowser(selectedFile, activeProduct.id, corners);
      setResultImage(comp.result_image);
      setCorners(comp.corners);
      setNeedsManualCheck(false);
      setIsAdjusting(false);
      setSliderPos(50);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to apply manual adjustment.');
    } finally {
      setIsRefitting(false);
    }
  };

  // Before/After Slider Pointer Handling
  const updateSliderFromClientX = (clientX) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pct)));
  };

  // Move the constant-size perspective player boundary rigidly so its circular center dot sits at (clientX, clientY)
  // while preserving the exact automatically detected 3D side-angle trapezoid shape & physical scale.
  const moveFixedBoxToClientPos = useCallback((clientX, clientY) => {
    if (!adjustContainerRef.current) return;
    const rect = adjustContainerRef.current.getBoundingClientRect();
    const targetCx = (clientX - rect.left) / rect.width;
    const targetCy = (clientY - rect.top) / rect.height;

    setCorners((prev) => {
      if (!prev || prev.length !== 4) return prev;
      const curCx = (prev[0].x + prev[1].x + prev[2].x + prev[3].x) / 4;
      const curCy = (prev[0].y + prev[1].y + prev[2].y + prev[3].y) / 4;
      const minX = Math.min(...prev.map((c) => c.x));
      const maxX = Math.max(...prev.map((c) => c.x));
      const minY = Math.min(...prev.map((c) => c.y));
      const maxY = Math.max(...prev.map((c) => c.y));

      let dx = targetCx - curCx;
      let dy = targetCy - curCy;

      // Clamp translation so all 4 perspective corners stay cleanly inside [0.005, 0.995]
      if (minX + dx < 0.005) dx = 0.005 - minX;
      if (maxX + dx > 0.995) dx = 0.995 - maxX;
      if (minY + dy < 0.005) dy = 0.005 - minY;
      if (maxY + dy > 0.995) dy = 0.995 - maxY;

      return prev.map((c) => ({
        x: c.x + dx,
        y: c.y + dy,
      }));
    });
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (isSlidingRef.current) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updateSliderFromClientX(clientX);
      }
      if (activeCornerIdx !== null && adjustContainerRef.current) {
        if (e.cancelable) e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        moveFixedBoxToClientPos(clientX, clientY);
      }
    };
    const onUp = () => {
      isSlidingRef.current = false;
      setActiveCornerIdx(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [activeCornerIdx, moveFixedBoxToClientPos]);

  const handleDownloadPreview = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `VOEUX-Virtual-Fit-${activeProduct.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToCart = () => {
    if (!activeProduct) return;
    addToCart(activeProduct);
    setIsCartOpen(true);
    addToast(`${activeProduct.name} added to your cart.`, 'success');
  };

  const handleReset = () => {
    setStage('upload');
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOriginalImage(null);
    setResultImage(null);
    setCorners(null);
    setAiCarHint(null);
    setIsAdjusting(false);
    setErrorMessage('');
  };

  return (
    <div
      className="min-h-screen w-full bg-black text-white flex flex-col justify-between selection:bg-[#3B429F] selection:text-white"
      onDragOver={(e) => {
        e.preventDefault();
        if (stage === 'upload' || stage === 'preview') setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />

      {/* Minimalist Top Bar with 4-Language Switcher */}
      <header className="w-full px-4 sm:px-10 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <button
          type="button"
          onClick={() => setActivePage('android-players')}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src="/images/voeux_logo.png"
            alt="VOEUX®"
            className="h-4 sm:h-6 w-auto object-contain opacity-95"
          />
          <span className="h-3.5 w-[1px] bg-white/25" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-white/75 font-light">
            VIRTUAL FIT
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Language Switcher: English / Hindi / Telugu / Marathi */}
          <div className="inline-flex items-center border border-white/20 bg-white/[0.03]" role="group" aria-label="Select Language">
            <Globe className="w-3 h-3 text-white/45 ml-2 mr-1 hidden sm:block" />
            {VIRTUAL_FIT_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLanguageChange(l.code)}
                className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] tracking-wide transition-colors cursor-pointer ${
                  lang === l.code
                    ? 'bg-[#3B429F] text-white font-medium'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="hidden md:inline-block text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-white/55 hover:text-white transition-colors cursor-pointer"
          >
            {t.howItWorks}
          </button>
        </div>
      </header>

      {/* Editorial Tutorial Overlay (Shown Every Time Virtual Fit Opens) */}
      {showTutorial && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90dvh] overflow-y-auto border border-white/20 bg-black px-6 sm:px-10 py-7 sm:py-10 text-left">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/voeux_logo.png"
                  alt="VOEUX®"
                  className="h-4 w-auto object-contain opacity-90"
                />
                <span className="h-3 w-[1px] bg-white/25" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#7c85ff]">
                  {t.quickGuide}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTutorial(false)}
                className="text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white cursor-pointer"
              >
                {t.skip}
              </button>
            </div>

            {/* Instant Language Bar inside Tutorial */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {VIRTUAL_FIT_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleLanguageChange(l.code)}
                  className={`px-3 py-1 border text-[11px] transition-colors cursor-pointer ${
                    lang === l.code
                      ? 'border-[#3B429F] bg-[#3B429F] text-white'
                      : 'border-white/20 text-white/65 hover:text-white hover:border-white/50'
                  }`}
                >
                  {l.nativeLabel}
                </button>
              ))}
            </div>

            <h2 className="mt-5 text-xl sm:text-3xl font-light uppercase tracking-[0.1em] text-white">
              {t.tutTitle}
            </h2>
            <p className="mt-2 text-xs sm:text-sm font-clean text-white/55 leading-relaxed">
              {t.tutSubtitlePrefix}{' '}
              <span className="text-white/90">
                {(VIRTUAL_FIT_PRODUCT_META[activeProduct.id] || VIRTUAL_FIT_PRODUCT_META['voeux-x80-dual-knob']).fullLabel}
              </span>{' '}
              {t.tutSubtitleSuffix}
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-xs tracking-[0.22em] text-[#7c85ff] font-medium pt-0.5">01</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-white">
                    {t.step1Title}
                  </p>
                  <p className="mt-1 text-xs font-clean text-white/55 leading-relaxed">
                    {t.step1Desc}
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-white/10" />

              <div className="flex items-start gap-4">
                <span className="text-xs tracking-[0.22em] text-[#7c85ff] font-medium pt-0.5">02</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-white">
                    {t.step2Title}
                  </p>
                  <p className="mt-1 text-xs font-clean text-white/55 leading-relaxed">
                    {t.step2Desc}
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-white/10" />

              <div className="flex items-start gap-4">
                <span className="text-xs tracking-[0.22em] text-[#7c85ff] font-medium pt-0.5">03</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-white">
                    {t.step3Title}
                  </p>
                  <p className="mt-1 text-xs font-clean text-white/55 leading-relaxed">
                    {t.step3Desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                type="button"
                onClick={() => setShowTutorial(false)}
                className="w-full sm:flex-1 py-3.5 px-6 border border-white bg-white text-black hover:bg-[#3B429F] hover:border-[#3B429F] hover:text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-all cursor-pointer"
              >
                {t.gotItBtn}
              </button>
              <button
                type="button"
                onClick={handleUseSampleDashboard}
                disabled={loadingSample}
                className="w-full sm:w-auto py-3.5 px-6 border border-white/35 hover:border-[#3B429F] text-white/85 hover:text-white text-[11px] uppercase tracking-[0.16em] font-light transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingSample ? t.loadingSample : t.trySampleBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Clicking Instructions Modal (Shown Before Clicking / Uploading Dashboard Photo) */}
      {showPhotoGuide && (
        <div className="fixed inset-0 z-[115] bg-black/92 backdrop-blur-md flex items-center justify-center px-4 py-5 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[92dvh] overflow-y-auto border border-white/25 bg-black px-5 sm:px-8 py-6 sm:py-8 text-left relative">
            <button
              type="button"
              onClick={() => setShowPhotoGuide(false)}
              aria-label="Close photo guide"
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <p className="text-[10px] uppercase tracking-[0.26em] text-[#7c85ff]">
              {t.photoGuideTag}
            </p>
            <h2 className="mt-1.5 text-lg sm:text-2xl font-light uppercase tracking-[0.1em] text-white pr-8">
              {t.photoGuideTitle}
            </h2>

            {/* Language Switcher inside Photo Guide */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {VIRTUAL_FIT_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleLanguageChange(l.code)}
                  className={`px-2.5 py-1 border text-[10px] transition-colors cursor-pointer ${
                    lang === l.code
                      ? 'border-[#3B429F] bg-[#3B429F] text-white'
                      : 'border-white/20 text-white/60 hover:text-white'
                  }`}
                >
                  {l.nativeLabel}
                </button>
              ))}
            </div>

            {/* Sample Dashboard Reference Image */}
            <div className="mt-4 relative border border-white/20 overflow-hidden bg-black">
              <img
                src="/images/virtual-fit/sample_dashboard.jpg"
                alt="Ideal front-view car dashboard photo with steering wheel visible"
                className="w-full h-44 sm:h-60 object-cover block"
              />
              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/80 border border-emerald-400/60 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.photoGuideIdealBadge}</span>
              </span>
            </div>

            {/* 3 Crystal-Clear Shooting Rules */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 border border-white/15 bg-white/[0.03]">
                <p className="text-[11px] font-medium text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t.rule1Title}</span>
                </p>
                <p className="mt-1.5 text-[11px] font-clean text-white/60 leading-relaxed">
                  {t.rule1Desc}
                </p>
              </div>
              <div className="p-3.5 border border-white/15 bg-white/[0.03]">
                <p className="text-[11px] font-medium text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t.rule2Title}</span>
                </p>
                <p className="mt-1.5 text-[11px] font-clean text-white/60 leading-relaxed">
                  {t.rule2Desc}
                </p>
              </div>
              <div className="p-3.5 border border-white/15 bg-white/[0.03]">
                <p className="text-[11px] font-medium text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t.rule3Title}</span>
                </p>
                <p className="mt-1.5 text-[11px] font-clean text-white/60 leading-relaxed">
                  {t.rule3Desc}
                </p>
              </div>
            </div>

            {/* Action Buttons: Gallery, Camera, or Sample */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoGuide(false);
                  fileInputRef.current?.click();
                }}
                className="w-full sm:flex-1 py-3.5 px-5 border border-white bg-white text-black hover:bg-[#3B429F] hover:border-[#3B429F] hover:text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t.chooseFromGallery}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPhotoGuide(false);
                  cameraInputRef.current?.click();
                }}
                className="w-full sm:flex-1 py-3.5 px-5 border border-white/60 hover:border-[#3B429F] hover:bg-[#3B429F]/20 text-white text-[11px] uppercase tracking-[0.2em] font-light transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.openCamera}</span>
              </button>
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoGuide(false);
                  handleUseSampleDashboard();
                }}
                className="text-[11px] uppercase tracking-[0.18em] text-white/50 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                {t.trySampleBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Immersive Stage */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-10 flex flex-col items-center justify-center overflow-x-hidden">
        {/* ================= STAGE 1: IMMERSIVE UPLOAD ================= */}
        {stage === 'upload' && (
          <div
            className={`w-full flex flex-col items-center text-center transition-opacity duration-500 ${
              isDragOver ? 'opacity-80' : 'opacity-100'
            }`}
          >
            {/* Central Precision Dashboard Line Illustration — Large & Screen-Filling */}
            <div className="w-full mb-5 sm:mb-7">
              <AutomotiveDashboardOutline />
            </div>

            {/* Editorial Typography */}
            <h1 className="text-2xl sm:text-5xl md:text-[54px] font-light tracking-[0.1em] sm:tracking-[0.14em] text-white uppercase leading-tight px-2">
              {t.heroTitle}
            </h1>

            <p className="mt-3 sm:mt-4 text-xs sm:text-base font-clean font-light text-white/65 tracking-wide max-w-xl leading-relaxed px-2">
              {t.heroSubtitle}
            </p>

            {/* Carried-Forward Selected Product Indicator */}
            <div className="mt-4 sm:mt-5 inline-flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-white/50">
              <span className="w-4 sm:w-6 h-[1px] bg-[#3B429F]" />
              <span>
                {t.selectedLabel}{' '}
                <strong className="text-white/90 font-normal">
                  {(VIRTUAL_FIT_PRODUCT_META[activeProduct.id] || VIRTUAL_FIT_PRODUCT_META['voeux-x80-dual-knob']).fullLabel}
                </strong>
              </span>
              <span className="w-4 sm:w-6 h-[1px] bg-[#3B429F]" />
            </div>

            {/* Minimalist Upload & Sample Dashboard Buttons (Opens Photo Guide with Sample Reference first) */}
            <div className="mt-7 sm:mt-9 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 px-2 sm:px-0">
              <button
                type="button"
                onClick={() => setShowPhotoGuide(true)}
                className="w-full sm:w-auto group relative px-8 sm:px-10 py-4 border border-white/80 hover:border-[#3B429F] text-white text-xs sm:text-[13px] uppercase tracking-[0.2em] font-light transition-all duration-300 hover:bg-[#3B429F]/15 cursor-pointer inline-flex items-center justify-center gap-3"
              >
                <Upload className="w-4 h-4 text-white/80 group-hover:text-[#7c85ff] transition-colors" />
                <span>{t.uploadBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleUseSampleDashboard}
                disabled={loadingSample}
                className="w-full sm:w-auto px-8 py-4 border border-white/25 hover:border-white/75 text-white/75 hover:text-white text-xs uppercase tracking-[0.18em] font-light transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {loadingSample ? t.loadingSample : t.trySampleBtn}
              </button>

              <button
                type="button"
                onClick={() => setShowPhotoGuide(true)}
                className="w-full sm:hidden px-8 py-3.5 border border-white/30 text-white/80 text-[11px] uppercase tracking-[0.18em] font-light inline-flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.useCameraBtn}</span>
              </button>
            </div>

            <p className="mt-4 text-xs font-clean text-white/45 tracking-wide max-w-lg px-2">
              {t.uploadHelper}
            </p>

            {isDragOver && (
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[#7c85ff]">
                {t.dropHint}
              </p>
            )}

            {errorMessage && (
              <p className="mt-5 text-xs font-clean text-red-400 tracking-wide">
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {/* ================= STAGE 2: PHOTO PREVIEW + PLACE CENTER DOT + CONTINUE ================= */}
        {stage === 'preview' && previewUrl && (
          <div className="w-full max-w-4xl flex flex-col items-center text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c85ff] mb-2">
              {isDetectingPreview ? t.analyzingTag : t.placeDotTag}
            </p>
            <p className="text-xs sm:text-sm font-clean text-white/60 mb-5 max-w-xl">
              {isDetectingPreview ? t.analyzingDesc : t.placeDotDesc}
            </p>

            <div
              ref={adjustContainerRef}
              onMouseDown={(e) => {
                if (isDetectingPreview || !corners) return;
                setActiveCornerIdx('move');
                moveFixedBoxToClientPos(e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                if (isDetectingPreview || !corners || !e.touches[0]) return;
                setActiveCornerIdx('move');
                moveFixedBoxToClientPos(e.touches[0].clientX, e.touches[0].clientY);
              }}
              className="relative w-full border border-white/20 bg-black overflow-hidden select-none touch-none cursor-crosshair"
            >
              <img
                src={originalImage || previewUrl}
                alt="Uploaded car dashboard preview"
                className="w-full h-auto block pointer-events-none"
              />

              {/* Scanning line while detecting dashboard scale & stereo center */}
              {isDetectingPreview && (
                <div
                  className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#7c85ff] to-transparent pointer-events-none"
                  style={{ animation: 'vfScanLine 1.8s ease-in-out infinite' }}
                />
              )}

              {/* Constant-Size Perspective Boundary (SVG Trapezoid) + Circular Center Dot */}
              {!isDetectingPreview && corners && corners.length === 4 && (() => {
                const cx = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
                const cy = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;
                const minY = Math.min(...corners.map((c) => c.y));
                const polyPoints = corners
                  .map((c) => `${(c.x * 100).toFixed(2)},${(c.y * 100).toFixed(2)}`)
                  .join(' ');
                const prodMeta =
                  VIRTUAL_FIT_PRODUCT_META[activeProduct.id] ||
                  VIRTUAL_FIT_PRODUCT_META['voeux-x80-dual-knob'];

                return (
                  <>
                    {/* Fixed Constant-Size 3D Perspective Trapezoid Boundary */}
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <polygon
                        points={polyPoints}
                        fill="rgba(59, 66, 159, 0.22)"
                        stroke="rgba(255, 255, 255, 0.92)"
                        strokeWidth="0.45"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>

                    {/* Auto Scale & Angle Label */}
                    <span
                      style={{
                        left: `${cx * 100}%`,
                        top: `${Math.max(0.03, minY) * 100}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-7 whitespace-nowrap px-2 py-0.5 bg-black/80 border border-white/25 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/90 pointer-events-none"
                    >
                      {prodMeta.shortLabel} · {aiCarHint ? `AI · ${aiCarHint}` : 'AUTO SCALE & ANGLE'}
                    </span>

                    {/* Central Circular Target Dot */}
                    <div
                      style={{
                        left: `${cx * 100}%`,
                        top: `${cy * 100}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
                    >
                      <span className="absolute w-11 h-11 rounded-full border border-white/45 animate-ping opacity-40" />
                      <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 border-white bg-[#3B429F] shadow-[0_0_16px_rgba(124,133,255,0.95)] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Live AI Engine Verification Badge */}
            {!isDetectingPreview && detectionEngine && (
              <div className="mt-4 inline-flex items-center gap-2.5 px-3.5 py-1.5 border border-white/15 bg-white/[0.04] text-[10px] uppercase tracking-[0.2em]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    detectionEngine.includes('gemini')
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                      : 'bg-amber-400'
                  }`}
                />
                <span className={detectionEngine.includes('gemini') ? 'text-emerald-300' : 'text-white/60'}>
                  {detectionEngine.includes('gemini')
                    ? `AI VISION ACTIVE (${detectionEngine})${aiCarHint ? ` · ${aiCarHint}` : ''}${
                        Math.abs(detectedYawDeg) >= 4 ? ` · ANGLE ${detectedYawDeg > 0 ? '+' : ''}${detectedYawDeg}°` : ''
                      }`
                    : 'LOCAL CV FALLBACK (AI OFFLINE)'}
                </span>
              </div>
            )}

            {errorMessage && (
              <p className="mt-5 text-xs sm:text-sm font-clean text-red-400 max-w-xl leading-relaxed">
                {errorMessage}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              <button
                type="button"
                onClick={runVirtualFitPipeline}
                disabled={isDetectingPreview}
                className="px-12 py-4 border border-white bg-white text-black hover:bg-[#3B429F] hover:border-[#3B429F] hover:text-white text-xs sm:text-[13px] uppercase tracking-[0.22em] font-medium transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {isDetectingPreview ? t.detectingBtn : t.continueBtn}
              </button>

              <button
                type="button"
                onClick={() => setShowPhotoGuide(true)}
                className="px-7 py-4 border border-white/30 hover:border-white/70 text-white/75 hover:text-white text-xs uppercase tracking-[0.18em] font-light transition-all duration-300 cursor-pointer"
              >
                {t.changePhotoBtn}
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: ML PROCESSING ================= */}
        {stage === 'processing' && (
          <div className="w-full max-w-2xl flex flex-col items-center text-center py-12">
            <div className="relative w-full max-w-md border border-white/15 overflow-hidden mb-10">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Analyzing dashboard"
                  className="w-full max-h-[40vh] object-contain opacity-35"
                />
              )}
              <div
                className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#7c85ff] to-transparent"
                style={{
                  animation: 'vfScanLine 2.2s ease-in-out infinite',
                }}
              />
              <style>{`
                @keyframes vfScanLine {
                  0% { top: 8%; opacity: 0.2; }
                  50% { top: 92%; opacity: 1; }
                  100% { top: 8%; opacity: 0.2; }
                }
              `}</style>
            </div>

            <p className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-white">
              {t.fittingTitle}
            </p>
            <p className="mt-3 text-xs font-clean text-white/50 tracking-wide">
              {t.fittingDesc}
            </p>
          </div>
        )}

        {/* ================= STAGE 4: FINAL RESULTS + COMPARISON + MANUAL CORRECTION ================= */}
        {stage === 'result' && resultImage && originalImage && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {/* Top Result Header */}
            <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.26em] text-[#7c85ff] mb-1">
                  {t.previewTag}
                </p>
                <h2 className="text-xl sm:text-2xl font-light uppercase tracking-[0.12em] text-white">
                  {(VIRTUAL_FIT_PRODUCT_META[activeProduct.id] || VIRTUAL_FIT_PRODUCT_META['voeux-x80-dual-knob']).fullLabel}
                </h2>
              </div>

              {/* Manual Adjustment Toggle */}
              <div className="flex items-center gap-3">
                {!isAdjusting ? (
                  <button
                    type="button"
                    onClick={() => setIsAdjusting(true)}
                    className="px-5 py-2.5 border border-white/35 hover:border-[#3B429F] text-white/85 hover:text-white text-[11px] uppercase tracking-[0.18em] transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{t.adjustFitBtn}</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={applyManualCorners}
                      disabled={isRefitting}
                      className="px-5 py-2.5 border border-[#3B429F] bg-[#3B429F] hover:bg-[#4c54ba] text-white text-[11px] uppercase tracking-[0.18em] transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRefitting ? t.updatingBtn : t.applyAdjustmentBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAdjusting(false)}
                      className="px-4 py-2.5 border border-white/25 text-white/65 hover:text-white text-[11px] uppercase tracking-[0.18em] cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </>
                )}
              </div>
            </div>

            {needsManualCheck && !isAdjusting && (
              <div className="w-full mb-4 px-4 py-2.5 border-l-2 border-[#3B429F] bg-white/[0.03] text-xs font-clean text-white/75 flex items-center justify-between gap-4">
                <span>{t.lowContrastNotice}</span>
              </div>
            )}

            {errorMessage && (
              <p className="w-full mb-4 text-xs font-clean text-red-400">{errorMessage}</p>
            )}

            {/* === INTERACTIVE BEFORE / AFTER SLIDER === */}
            {!isAdjusting ? (
              <div
                ref={compareContainerRef}
                onMouseDown={(e) => {
                  isSlidingRef.current = true;
                  updateSliderFromClientX(e.clientX);
                }}
                onTouchStart={(e) => {
                  isSlidingRef.current = true;
                  if (e.touches[0]) updateSliderFromClientX(e.touches[0].clientX);
                }}
                className="relative w-full border border-white/15 overflow-hidden select-none cursor-ew-resize bg-black"
              >
                {/* After (VOEUX Fitted) full base layer */}
                <img
                  src={resultImage}
                  alt="Dashboard with VOEUX Android player installed"
                  className="w-full h-auto max-h-[62vh] object-contain block mx-auto pointer-events-none"
                />

                {/* Before (Original Dashboard) clipped on left */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={originalImage}
                    alt="Original car dashboard"
                    className="w-full h-full object-contain block mx-auto"
                  />
                </div>

                {/* Vertical Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-[1.5px] bg-white/90 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full border border-white bg-black/80 flex items-center justify-center">
                    <span className="text-[10px] tracking-tighter text-white font-light">‹ ›</span>
                  </div>
                </div>

                {/* Minimalist Before / After Labels */}
                <span className="absolute top-3.5 left-4 px-2.5 py-1 bg-black/70 border border-white/15 text-[10px] uppercase tracking-[0.18em] text-white/80 pointer-events-none">
                  {t.beforeLabel}
                </span>
                <span className="absolute top-3.5 right-4 px-2.5 py-1 bg-black/70 border border-[#3B429F]/70 text-[10px] uppercase tracking-[0.18em] text-white pointer-events-none">
                  {t.withVoeuxLabel}
                </span>
              </div>
            ) : (
              /* === FIXED-SIZE CENTER DOT REPOSITIONING === */
              <div className="w-full flex flex-col items-center">
                <p className="w-full text-left text-xs font-clean text-white/60 mb-3">
                  {t.adjustHint}
                </p>
                <div
                  ref={adjustContainerRef}
                  onMouseDown={(e) => {
                    if (!corners) return;
                    setActiveCornerIdx('move');
                    moveFixedBoxToClientPos(e.clientX, e.clientY);
                  }}
                  onTouchStart={(e) => {
                    if (!corners || !e.touches[0]) return;
                    setActiveCornerIdx('move');
                    moveFixedBoxToClientPos(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  className="relative w-full border border-white/25 overflow-hidden select-none bg-black touch-none cursor-crosshair"
                >
                  <img
                    src={originalImage}
                    alt="Place circular dot on your dashboard console center"
                    className="w-full h-auto block pointer-events-none"
                  />

                  {corners && corners.length === 4 && (() => {
                    const cx = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
                    const cy = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;
                    const minY = Math.min(...corners.map((c) => c.y));
                    const polyPoints = corners
                      .map((c) => `${(c.x * 100).toFixed(2)},${(c.y * 100).toFixed(2)}`)
                      .join(' ');
                    const prodMeta =
                      VIRTUAL_FIT_PRODUCT_META[activeProduct.id] ||
                      VIRTUAL_FIT_PRODUCT_META['voeux-x80-dual-knob'];

                    return (
                      <>
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="absolute inset-0 w-full h-full pointer-events-none"
                        >
                          <polygon
                            points={polyPoints}
                            fill="rgba(59, 66, 159, 0.22)"
                            stroke="rgba(255, 255, 255, 0.92)"
                            strokeWidth="0.45"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>

                        <span
                          style={{
                            left: `${cx * 100}%`,
                            top: `${Math.max(0.03, minY) * 100}%`,
                          }}
                          className="absolute -translate-x-1/2 -translate-y-7 whitespace-nowrap px-2 py-0.5 bg-black/80 border border-white/25 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/90 pointer-events-none"
                        >
                          {prodMeta.shortLabel} · {aiCarHint ? `AI · ${aiCarHint}` : 'AUTO SCALE & ANGLE'}
                        </span>

                        <div
                          style={{
                            left: `${cx * 100}%`,
                            top: `${cy * 100}%`,
                          }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
                        >
                          <span className="absolute w-11 h-11 rounded-full border border-white/45 animate-ping opacity-40" />
                          <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 border-white bg-[#3B429F] shadow-[0_0_16px_rgba(124,133,255,0.95)] flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* === ACTION BUTTONS === */}
            <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-4 px-5 border border-white bg-white text-black hover:bg-[#3B429F] hover:border-[#3B429F] hover:text-white text-[11px] uppercase tracking-[0.18em] font-medium transition-all cursor-pointer inline-flex items-center justify-center gap-2.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{t.addToCartBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPreview}
                className="py-4 px-5 border border-white/60 hover:border-white text-white text-[11px] uppercase tracking-[0.18em] font-light transition-all cursor-pointer inline-flex items-center justify-center gap-2.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePage('android-players')}
                className="py-4 px-5 border border-white/25 hover:border-white/70 text-white/80 hover:text-white text-[11px] uppercase tracking-[0.16em] font-light transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t.exploreOtherBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-4 px-5 border border-white/25 hover:border-white/70 text-white/75 hover:text-white text-[11px] uppercase tracking-[0.18em] font-light transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.tryAgainBtn}</span>
              </button>
            </div>

            {/* Subtle Model Switcher (X80 <-> 9" TS7) so customer can also compare both */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.16em] text-white/45">
              <span>{t.compareUnitLabel}</span>
              {VIRTUAL_FIT_SUPPORTED_IDS.map((pid) => {
                const prod = (productsList || PRODUCTS).find((p) => p.id === pid);
                if (!prod) return null;
                const isCurrent = prod.id === activeProduct.id;
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => {
                      if (isCurrent) return;
                      setVirtualFitProduct(prod);
                      if (selectedFile) {
                        setStage('preview');
                        detectCornersForPreview(selectedFile, prod.id);
                      }
                    }}
                    className={`pb-0.5 border-b transition-colors cursor-pointer ${
                      isCurrent
                        ? 'border-[#3B429F] text-white'
                        : 'border-transparent text-white/45 hover:text-white/80'
                    }`}
                  >
                    {(VIRTUAL_FIT_PRODUCT_META[pid] || {}).shortLabel || prod.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Understated Footer Disclaimer */}
      <footer className="w-full px-6 py-5 border-t border-white/10 text-center">
        <p className="text-[11px] font-clean text-white/40 tracking-wide">
          {t.disclaimer}
        </p>
      </footer>
    </div>
  );
};

