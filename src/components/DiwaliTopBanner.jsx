import React from 'react';
import { DiyaIcon } from './DiyaIcon';
import { DiwaliCountdownTimer } from './DiwaliCountdownTimer';
import { ChevronDown } from 'lucide-react';

/**
 * Top Diwali Announcement Section
 * Covers the whole screen across desktop, laptop, tablet, and mobile.
 * Pure black background with giant glowing Diyas, grand "VOEUX DIWALI DHAMAKA SALE",
 * and the countdown timer placed directly below the title and above "Explore Offers".
 */
export const DiwaliTopBanner = () => {
  const scrollToContent = () => {
    const heroEl = document.getElementById('hero-section');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-[100dvh] bg-black text-white flex flex-col justify-between items-center px-4 py-8 sm:py-12 overflow-hidden select-none">
      
      {/* Radiant Festive Warm Radial Lighting Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-orange-600/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[50vh] bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Spacer for balanced vertical centering */}
      <div className="w-full h-4 sm:h-8" />

      {/* Main Full-Screen Centerpiece */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center my-auto">
        
        {/* Diyas & Grand Title */}
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-12 lg:gap-16 text-center">
          
          {/* Left Diya (Large & Glowing with Flame Animation) */}
          <div className="shrink-0 flex items-center justify-center filter drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]">
            <DiyaIcon className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 transform -scale-x-100" />
          </div>

          {/* Grand Headline */}
          <div className="flex-1 max-w-4xl px-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-[0_4px_30px_rgba(245,158,11,0.55)] leading-[1.08]">
              VOEUX DIWALI DHAMAKA SALE
            </h1>
          </div>

          {/* Right Diya (Large & Glowing with Flame Animation) */}
          <div className="shrink-0 flex items-center justify-center filter drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]">
            <DiyaIcon className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44" />
          </div>

        </div>

        {/* DIWALI COUNTDOWN BELOW VOEUX DIWALI DHAMAKA SALE & ABOVE EXPLORE OFFERS */}
        <DiwaliCountdownTimer />

      </div>

      {/* Downward Scroll Indicator (EXPLORE OFFERS) */}
      <button
        type="button"
        onClick={scrollToContent}
        className="relative z-10 flex flex-col items-center gap-2 text-amber-300/80 hover:text-amber-200 transition-colors cursor-pointer group pb-4 animate-bounce"
        aria-label="Scroll down to explore products"
      >
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-300 transition-colors">
          Explore Offers
        </span>
        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
      </button>

    </section>
  );
};
