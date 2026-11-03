import React from 'react';

/**
 * Beautiful glowing traditional Diya SVG with animated flickering flame.
 */
export const DiyaIcon = ({ className = 'w-6 h-6', showGlow = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {showGlow && (
        <span className="absolute -top-1 w-4 h-4 bg-amber-400/50 rounded-full blur-sm animate-pulse pointer-events-none" />
      )}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]"
      >
        {/* Animated Flame */}
        <g className="origin-bottom animate-[flameFlicker_1.5s_ease-in-out_infinite_alternate]">
          {/* Outer Flame Glow */}
          <path
            d="M24 4C24 4 19 12 19 18C19 21.3 21.2 24 24 24C26.8 24 29 21.3 29 18C29 12 24 4 24 4Z"
            fill="url(#outerFlameGrad)"
          />
          {/* Inner Flame Core */}
          <path
            d="M24 10C24 10 21 14 21 18C21 19.8 22.3 21.5 24 21.5C25.7 21.5 27 19.8 27 18C27 14 24 10 24 10Z"
            fill="url(#innerFlameGrad)"
          />
          {/* White Hot Center */}
          <circle cx="24" cy="18" r="1.5" fill="#FFFFFF" />
        </g>

        {/* Traditional Brass / Clay Diya Base */}
        <path
          d="M8 26C9.5 35 15.5 38 24 38C32.5 38 38.5 35 40 26C37 28.5 31 30 24 30C17 30 11 28.5 8 26Z"
          fill="url(#diyaBodyGrad)"
        />

        {/* Diya Rim Highlight */}
        <ellipse cx="24" cy="26" rx="16" ry="4" fill="url(#diyaRimGrad)" />
        <ellipse cx="24" cy="26" rx="14" ry="2.5" fill="#78350F" />

        {/* Diya Base Stand */}
        <path
          d="M19 37L17 42C17 43 19 44 24 44C29 44 31 43 31 42L29 37C27 37.8 25.5 38 24 38C22.5 38 21 37.8 19 37Z"
          fill="#92400E"
        />

        {/* Decorative Golden Dots */}
        <circle cx="16" cy="33" r="1" fill="#FDE047" />
        <circle cx="20" cy="34.5" r="1.2" fill="#FDE047" />
        <circle cx="24" cy="35" r="1.3" fill="#FDE047" />
        <circle cx="28" cy="34.5" r="1.2" fill="#FDE047" />
        <circle cx="32" cy="33" r="1" fill="#FDE047" />

        {/* Gradients */}
        <defs>
          <linearGradient id="outerFlameGrad" x1="24" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="innerFlameGrad" x1="24" y1="10" x2="24" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="diyaBodyGrad" x1="8" y1="26" x2="40" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="diyaRimGrad" x1="8" y1="26" x2="40" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
