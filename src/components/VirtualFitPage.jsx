import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import {
  ArrowLeft,
  Upload,
  Download,
  ShoppingCart,
  RotateCcw,
  Sliders,
  Check,
  Compass,
  Camera
} from 'lucide-react';

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

const API_BASE =
  import.meta.env.VITE_VIRTUAL_FIT_API_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://localhost:8000');

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
      }
    } catch (err) {
      // Fallback: let user still click Continue or show helpful error then
      console.warn('Preview corner pre-detection skipped:', err);
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
      // If corners were already detected & optionally adjusted by the user on the preview stage,
      // composite directly with those exact 4 corners for instant razor-accurate placement!
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
        if (!resp.ok || !data.success) {
          throw new Error(data.detail || 'Could not composite dashboard photograph.');
        }

        setResultImage(data.result_image);
        setNeedsManualCheck(false);
        setSliderPos(50);
        setStage('result');
        return;
      }

      // Otherwise run full auto-detect + composite
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('product_id', activeProduct.id);

      const resp = await fetch(`${API_BASE}/api/virtual-fit/detect-and-fit`, {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.detail || 'Could not process dashboard photograph.');
      }

      setOriginalImage(data.original_image);
      setResultImage(data.result_image);
      setCorners(data.corners);
      setConfidence(data.confidence);
      setNeedsManualCheck(Boolean(data.needs_manual_check));
      setSliderPos(50);
      setStage('result');
    } catch (err) {
      console.error('Virtual Fit pipeline error:', err);
      setErrorMessage(
        err.message === 'Failed to fetch'
          ? 'The VOEUX Virtual Fit ML server is not running. Please start the local Python backend on port 8000 and try again.'
          : err.message || 'Unable to process this photograph. Please try a clearer front-facing dashboard photo.'
      );
      setStage('preview');
    }
  };

  const applyManualCorners = async () => {
    if (!selectedFile || !activeProduct || !corners) return;
    setIsRefitting(true);
    setErrorMessage('');

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
      if (!resp.ok || !data.success) {
        throw new Error(data.detail || 'Could not update placement.');
      }

      setResultImage(data.result_image);
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
        const rect = adjustContainerRef.current.getBoundingClientRect();
        const prodMeta =
          VIRTUAL_FIT_PRODUCT_META[activeProduct.id] ||
          VIRTUAL_FIT_PRODUCT_META['voeux-x80-dual-knob'];
        const productAspect = prodMeta.aspect;
        // Never allow shrinking unrealistically small below real physical proportions
        const minWidthPx = rect.width * prodMeta.minWidthRatio;
        const maxWidthPx = rect.width * 0.85;

        if (activeCornerIdx === 'move' && dragStartRef.current) {
          const dxNorm = (clientX - dragStartRef.current.clientX) / rect.width;
          const dyNorm = (clientY - dragStartRef.current.clientY) / rect.height;
          const startCorners = dragStartRef.current.corners;
          const minX = Math.min(...startCorners.map((c) => c.x));
          const maxX = Math.max(...startCorners.map((c) => c.x));
          const minY = Math.min(...startCorners.map((c) => c.y));
          const maxY = Math.max(...startCorners.map((c) => c.y));

          const clampedDx = Math.max(0.01 - minX, Math.min(0.99 - maxX, dxNorm));
          const clampedDy = Math.max(0.01 - minY, Math.min(0.99 - maxY, dyNorm));

          setCorners(
            startCorners.map((pt) => ({
              x: pt.x + clampedDx,
              y: pt.y + clampedDy,
            }))
          );
          return;
        }

        // Symmetrical aspect-ratio-locked corner resize (dragging up/down or left/right
        // always keeps the exact real VOEUX product proportions, never stretched or squished)
        setCorners((prev) => {
          if (!prev || prev.length !== 4) return prev;
          const oppIdx = (activeCornerIdx + 2) % 4;
          const anchorPxX = prev[oppIdx].x * rect.width;
          const anchorPxY = prev[oppIdx].y * rect.height;

          const curPxX = Math.max(0, Math.min(rect.width, clientX - rect.left));
          const curPxY = Math.max(0, Math.min(rect.height, clientY - rect.top));

          const dxPx = curPxX - anchorPxX;
          const dyPx = curPxY - anchorPxY;

          // Use whichever axis moved further so vertical OR horizontal dragging scales smoothly
          let targetW = Math.max(Math.abs(dxPx), Math.abs(dyPx) * productAspect);
          targetW = Math.max(minWidthPx, Math.min(maxWidthPx, targetW));
          let targetH = targetW / productAspect;

          if (targetH > rect.height * 0.85) {
            targetH = rect.height * 0.85;
            targetW = targetH * productAspect;
          }

          // Determine box bounds anchored at the opposite corner
          const isLeft = activeCornerIdx === 0 || activeCornerIdx === 3;
          const isTop = activeCornerIdx === 0 || activeCornerIdx === 1;

          let x1 = isLeft ? anchorPxX - targetW : anchorPxX;
          let x2 = isLeft ? anchorPxX : anchorPxX + targetW;
          let y1 = isTop ? anchorPxY - targetH : anchorPxY;
          let y2 = isTop ? anchorPxY : anchorPxY + targetH;

          // Keep strictly inside dashboard bounds without breaking symmetry
          if (x1 < 4) {
            x2 += 4 - x1;
            x1 = 4;
          }
          if (x2 > rect.width - 4) {
            x1 -= x2 - (rect.width - 4);
            x2 = rect.width - 4;
          }
          if (y1 < 4) {
            y2 += 4 - y1;
            y1 = 4;
          }
          if (y2 > rect.height - 4) {
            y1 -= y2 - (rect.height - 4);
            y2 = rect.height - 4;
          }

          return [
            { x: x1 / rect.width, y: y1 / rect.height },
            { x: x2 / rect.width, y: y1 / rect.height },
            { x: x2 / rect.width, y: y2 / rect.height },
            { x: x1 / rect.width, y: y2 / rect.height },
          ];
        });
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
  }, [activeCornerIdx, activeProduct.id]);

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

      {/* Minimalist Top Bar */}
      <header className="w-full px-6 sm:px-12 py-6 flex items-center justify-between border-b border-white/10">
        <button
          type="button"
          onClick={() => setActivePage('android-players')}
          className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <img
            src="/images/voeux_logo.png"
            alt="VOEUX®"
            className="h-5 sm:h-6 w-auto object-contain opacity-95"
          />
          <span className="h-3.5 w-[1px] bg-white/25" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-white/75 font-light">
            VIRTUAL FIT
          </span>
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white/55 hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B429F]" />
            <span className="truncate max-w-[200px]">
              {(VIRTUAL_FIT_PRODUCT_META[activeProduct.id] || VIRTUAL_FIT_PRODUCT_META['voeux-x80-dual-knob']).shortLabel}
            </span>
          </div>
        </div>
      </header>

      {/* Editorial Tutorial Overlay (Shown Every Time Virtual Fit Opens) */}
      {showTutorial && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90dvh] overflow-y-auto border border-white/20 bg-black px-6 sm:px-10 py-7 sm:py-11 text-left">
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src="/images/voeux_logo.png"
                  alt="VOEUX®"
                  className="h-4 w-auto object-contain opacity-90"
                />
                <span className="h-3 w-[1px] bg-white/25" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#7c85ff]">
                  QUICK GUIDE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTutorial(false)}
                className="text-[10px] uppercase tracking-[0.22em] text-white/50 hover:text-white cursor-pointer"
              >
                Skip
              </button>
            </div>

            <h2 className="mt-6 text-2xl sm:text-3xl font-light uppercase tracking-[0.14em] text-white">
              HOW VIRTUAL FIT WORKS
            </h2>
            <p className="mt-2 text-xs sm:text-sm font-clean text-white/55 leading-relaxed">
              Visualize the exact{' '}
              <span className="text-white/90">
                {(VIRTUAL_FIT_PRODUCT_META[activeProduct.id] || VIRTUAL_FIT_PRODUCT_META['voeux-x80-dual-knob']).fullLabel}
              </span>{' '}
              installed inside your vehicle in three simple steps.
            </p>

            <div className="mt-7 space-y-5">
              <div className="flex items-start gap-4">
                <span className="text-xs tracking-[0.22em] text-[#7c85ff] font-medium pt-0.5">01</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white">
                    Upload a Clear Dashboard Photo
                  </p>
                  <p className="mt-1 text-xs font-clean text-white/55 leading-relaxed">
                    Take a straight-on, well-lit photograph of your car&apos;s center dashboard — or try our sample dashboard if you don&apos;t have a photo handy right now.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-white/10" />

              <div className="flex items-start gap-4">
                <span className="text-xs tracking-[0.22em] text-[#7c85ff] font-medium pt-0.5">02</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white">
                    Automatic Stereo Detection &amp; True-Scale Fit
                  </p>
                  <p className="mt-1 text-xs font-clean text-white/55 leading-relaxed">
                    Our vision engine automatically locates your stereo opening and fits the real VOEUX unit to scale (10.1&quot; vs 9&quot;) with realistic perspective and lighting.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-white/10" />

              <div className="flex items-start gap-4">
                <span className="text-xs tracking-[0.22em] text-[#7c85ff] font-medium pt-0.5">03</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white">
                    Compare, Adjust Corners &amp; Download
                  </p>
                  <p className="mt-1 text-xs font-clean text-white/55 leading-relaxed">
                    Slide Before &amp; After to compare, tap <strong className="text-white/90 font-medium">ADJUST FIT</strong> anytime to drag the 4 corners for exact placement, then download your preview or add directly to cart.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                type="button"
                onClick={() => setShowTutorial(false)}
                className="w-full sm:flex-1 py-3.5 px-6 border border-white bg-white text-black hover:bg-[#3B429F] hover:border-[#3B429F] hover:text-white text-[11px] uppercase tracking-[0.26em] font-medium transition-all cursor-pointer"
              >
                GOT IT, LET&apos;S BEGIN
              </button>
              <button
                type="button"
                onClick={handleUseSampleDashboard}
                disabled={loadingSample}
                className="w-full sm:w-auto py-3.5 px-6 border border-white/35 hover:border-[#3B429F] text-white/85 hover:text-white text-[11px] uppercase tracking-[0.2em] font-light transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingSample ? 'LOADING...' : 'TRY SAMPLE DASHBOARD'}
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
            <h1 className="text-2xl sm:text-5xl md:text-[54px] font-light tracking-[0.14em] sm:tracking-[0.16em] text-white uppercase leading-tight px-2">
              YOUR DASHBOARD. YOUR VOEUX.
            </h1>

            <p className="mt-3 sm:mt-4 text-xs sm:text-base font-clean font-light text-white/65 tracking-wide max-w-xl leading-relaxed px-2">
              See how your favourite VOEUX Android Player could look inside your car.
            </p>

            {/* Carried-Forward Selected Product Indicator */}
            <div className="mt-4 sm:mt-5 inline-flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/50">
              <span className="w-4 sm:w-6 h-[1px] bg-[#3B429F]" />
              <span>
                Selected:{' '}
                <strong className="text-white/90 font-normal">
                  {(VIRTUAL_FIT_PRODUCT_META[activeProduct.id] || VIRTUAL_FIT_PRODUCT_META['voeux-x80-dual-knob']).fullLabel}
                </strong>
              </span>
              <span className="w-4 sm:w-6 h-[1px] bg-[#3B429F]" />
            </div>

            {/* Minimalist Upload & Sample Dashboard Buttons (Full-width stacked on mobile) */}
            <div className="mt-7 sm:mt-9 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 px-2 sm:px-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto group relative px-8 sm:px-10 py-4 border border-white/80 hover:border-[#3B429F] text-white text-xs sm:text-[13px] uppercase tracking-[0.24em] sm:tracking-[0.26em] font-light transition-all duration-300 hover:bg-[#3B429F]/15 cursor-pointer inline-flex items-center justify-center gap-3"
              >
                <Upload className="w-4 h-4 text-white/80 group-hover:text-[#7c85ff] transition-colors" />
                <span>UPLOAD YOUR DASHBOARD</span>
              </button>

              <button
                type="button"
                onClick={handleUseSampleDashboard}
                disabled={loadingSample}
                className="w-full sm:w-auto px-8 py-4 border border-white/25 hover:border-white/75 text-white/75 hover:text-white text-xs uppercase tracking-[0.22em] font-light transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {loadingSample ? 'LOADING SAMPLE...' : 'TRY SAMPLE DASHBOARD'}
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:hidden px-8 py-3.5 border border-white/30 text-white/80 text-[11px] uppercase tracking-[0.22em] font-light inline-flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>USE CAMERA</span>
              </button>
            </div>

            <p className="mt-4 text-xs font-clean text-white/45 tracking-wide">
              Upload a clear photograph of your car&apos;s dashboard to get started.
            </p>

            {isDragOver && (
              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#7c85ff]">
                Drop your dashboard photograph anywhere
              </p>
            )}

            {errorMessage && (
              <p className="mt-5 text-xs font-clean text-red-400 tracking-wide">
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {/* ================= STAGE 2: PHOTO PREVIEW + ADJUST FIT + CONTINUE ================= */}
        {stage === 'preview' && previewUrl && (
          <div className="w-full max-w-4xl flex flex-col items-center text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#7c85ff] mb-2">
              {isDetectingPreview
                ? 'DETECTING STEREO BAY...'
                : 'ADJUST FIT AREA & CONTINUE'}
            </p>
            <p className="text-xs sm:text-sm font-clean text-white/60 mb-5 max-w-xl">
              {isDetectingPreview
                ? 'Our automotive vision model is locating your stereo opening automatically...'
                : 'Drag the 4 corner points (TL, TR, BR, BL) if you want to refine where your VOEUX player sits, or click CONTINUE to visualize immediately.'}
            </p>

            <div
              ref={adjustContainerRef}
              className="relative w-full border border-white/20 bg-black overflow-hidden select-none touch-none"
            >
              <img
                src={originalImage || previewUrl}
                alt="Uploaded car dashboard preview"
                className="w-full h-auto block pointer-events-none"
              />

              {/* Scanning line while OWL-ViT detects corners */}
              {isDetectingPreview && (
                <div
                  className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#7c85ff] to-transparent pointer-events-none"
                  style={{ animation: 'vfScanLine 1.8s ease-in-out infinite' }}
                />
              )}

              {/* Interactive Symmetrical 4-Corner Placement Frame */}
              {!isDetectingPreview && corners && corners.length === 4 && (
                <>
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full"
                  >
                    <polygon
                      points={corners.map((c) => `${c.x * 100},${c.y * 100}`).join(' ')}
                      fill="rgba(59, 66, 159, 0.24)"
                      stroke="#FFFFFF"
                      strokeWidth="0.35"
                      className="cursor-move"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        dragStartRef.current = {
                          clientX: e.clientX,
                          clientY: e.clientY,
                          corners: corners.map((c) => ({ ...c })),
                        };
                        setActiveCornerIdx('move');
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        if (!e.touches[0]) return;
                        dragStartRef.current = {
                          clientX: e.touches[0].clientX,
                          clientY: e.touches[0].clientY,
                          corners: corners.map((c) => ({ ...c })),
                        };
                        setActiveCornerIdx('move');
                      }}
                    />
                  </svg>

                  {corners.map((pt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setActiveCornerIdx(idx);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setActiveCornerIdx(idx);
                      }}
                      style={{
                        left: `${pt.x * 100}%`,
                        top: `${pt.y * 100}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-[#3B429F]/90 text-white text-[10px] sm:text-[9px] font-bold tracking-wider flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
                      aria-label={`Adjust corner ${CORNER_LABELS[idx]}`}
                    >
                      {CORNER_LABELS[idx]}
                    </button>
                  ))}
                </>
              )}
            </div>

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
                className="px-12 py-4 border border-white bg-white text-black hover:bg-[#3B429F] hover:border-[#3B429F] hover:text-white text-xs sm:text-[13px] uppercase tracking-[0.28em] font-medium transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {isDetectingPreview ? 'DETECTING...' : 'CONTINUE'}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-7 py-4 border border-white/30 hover:border-white/70 text-white/75 hover:text-white text-xs uppercase tracking-[0.22em] font-light transition-all duration-300 cursor-pointer"
              >
                CHANGE PHOTO
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

            <p className="text-lg sm:text-xl font-light uppercase tracking-[0.28em] text-white">
              FITTING YOUR VOEUX
            </p>
            <p className="mt-3 text-xs font-clean text-white/50 tracking-wide">
              Detecting stereo boundaries, estimating perspective, and placing your exact VOEUX unit...
            </p>
          </div>
        )}

        {/* ================= STAGE 4: FINAL RESULTS + COMPARISON + MANUAL CORRECTION ================= */}
        {stage === 'result' && resultImage && originalImage && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {/* Top Result Header */}
            <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#7c85ff] mb-1">
                  VOEUX VIRTUAL FIT PREVIEW
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
                    className="px-5 py-2.5 border border-white/35 hover:border-[#3B429F] text-white/85 hover:text-white text-[11px] uppercase tracking-[0.22em] transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>ADJUST FIT</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={applyManualCorners}
                      disabled={isRefitting}
                      className="px-5 py-2.5 border border-[#3B429F] bg-[#3B429F] hover:bg-[#4c54ba] text-white text-[11px] uppercase tracking-[0.22em] transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRefitting ? 'UPDATING...' : 'APPLY ADJUSTMENT'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAdjusting(false)}
                      className="px-4 py-2.5 border border-white/25 text-white/65 hover:text-white text-[11px] uppercase tracking-[0.2em] cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </>
                )}
              </div>
            </div>

            {needsManualCheck && !isAdjusting && (
              <div className="w-full mb-4 px-4 py-2.5 border-l-2 border-[#3B429F] bg-white/[0.03] text-xs font-clean text-white/75 flex items-center justify-between gap-4">
                <span>
                  Automatic stereo detection had low contrast on this dashboard. Click{' '}
                  <strong className="text-white">ADJUST FIT</strong> to fine-tune the 4 corners for exact placement.
                </span>
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
                <span className="absolute top-3.5 left-4 px-2.5 py-1 bg-black/70 border border-white/15 text-[10px] uppercase tracking-[0.22em] text-white/80 pointer-events-none">
                  BEFORE
                </span>
                <span className="absolute top-3.5 right-4 px-2.5 py-1 bg-black/70 border border-[#3B429F]/70 text-[10px] uppercase tracking-[0.22em] text-white pointer-events-none">
                  WITH VOEUX
                </span>
              </div>
            ) : (
              /* === MANUAL 4-CORNER PERSPECTIVE ADJUSTMENT === */
              <div className="w-full flex flex-col items-center">
                <p className="w-full text-left text-xs font-clean text-white/60 mb-3">
                  Drag the 4 corner points (TL, TR, BR, BL) to align exactly with your dashboard&apos;s stereo frame, then click <strong className="text-white">APPLY ADJUSTMENT</strong>.
                </p>
                <div
                  ref={adjustContainerRef}
                  className="relative w-full border border-white/25 overflow-hidden select-none bg-black touch-none"
                >
                  <img
                    src={originalImage}
                    alt="Adjust 4 corners on your dashboard"
                    className="w-full h-auto block pointer-events-none"
                  />

                  {/* SVG Quad Outline Overlay */}
                  {corners && corners.length === 4 && (
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <polygon
                        points={corners.map((c) => `${c.x * 100},${c.y * 100}`).join(' ')}
                        fill="rgba(59, 66, 159, 0.22)"
                        stroke="#FFFFFF"
                        strokeWidth="0.35"
                      />
                    </svg>
                  )}

                  {/* 4 Draggable Corner Handles */}
                  {corners &&
                    corners.map((pt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActiveCornerIdx(idx);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setActiveCornerIdx(idx);
                        }}
                        style={{
                          left: `${pt.x * 100}%`,
                          top: `${pt.y * 100}%`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-[#3B429F]/90 text-white text-[10px] sm:text-[9px] font-bold tracking-wider flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
                        aria-label={`Drag corner ${CORNER_LABELS[idx]}`}
                      >
                        {CORNER_LABELS[idx]}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* === ACTION BUTTONS === */}
            <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-4 px-5 border border-white bg-white text-black hover:bg-[#3B429F] hover:border-[#3B429F] hover:text-white text-[11px] uppercase tracking-[0.22em] font-medium transition-all cursor-pointer inline-flex items-center justify-center gap-2.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>ADD TO CART</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPreview}
                className="py-4 px-5 border border-white/60 hover:border-white text-white text-[11px] uppercase tracking-[0.22em] font-light transition-all cursor-pointer inline-flex items-center justify-center gap-2.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD PREVIEW</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePage('android-players')}
                className="py-4 px-5 border border-white/25 hover:border-white/70 text-white/80 hover:text-white text-[11px] uppercase tracking-[0.2em] font-light transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>EXPLORE OTHER PLAYERS</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-4 px-5 border border-white/25 hover:border-white/70 text-white/75 hover:text-white text-[11px] uppercase tracking-[0.22em] font-light transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>TRY AGAIN</span>
              </button>
            </div>

            {/* Subtle Model Switcher (X80 <-> 9" TS7) so customer can also compare both */}
            <div className="mt-7 flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-white/45">
              <span>Compare unit:</span>
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
          Visual preview only. Physical installation compatibility and fascia fitment must be verified separately. Uploaded photographs are processed securely and never stored permanently.
        </p>
      </footer>
    </div>
  );
};

