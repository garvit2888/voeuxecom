import React, { useState, useEffect } from 'react';
import { DiyaIcon } from './DiyaIcon';
import { DiwaliCountdownTimer } from './DiwaliCountdownTimer';
import { ChevronDown, Sparkles } from 'lucide-react';
import { isDiwaliSaleActive } from '../utils/diwaliOffers';

/**
 * Top Diwali Announcement Section
 * Covers full viewport height across mobile, tablet, laptop, and desktop.
 * - Headline moved higher up towards the top on mobile.
 * - Countdown Timer & glowing Diyas in the center.
 * - "Explore Offers" text and animation placed safely above the mobile navigation bar.
 */
export const DiwaliTopBanner = () => {
  const [saleActive, setSaleActive] = useState(() => isDiwaliSaleActive());

  useEffect(() => {
    const check = () => setSaleActive(isDiwaliSaleActive());
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    const heroEl = document.getElementById('hero-section');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-[100dvh] bg-black text-white flex flex-col justify-between items-center px-4 sm:px-6 pt-3 sm:pt-8 pb-2 overflow-hidden select-none">
      
      {/* Radiant Festive Warm Radial Lighting Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-orange-600/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[75vw] h-[55vh] bg-amber-400/10 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none" />

      {/* Main Center Container */}
      <div className="container mx-auto px-2 sm:px-4 relative z-10 flex-1 flex flex-col items-center justify-center gap-6 sm:gap-12 md:gap-16 my-auto w-full max-w-5xl">
        
        {/* TOP: Grand Headline (Moved higher up on mobile) */}
        <div className="w-full text-center px-2 pt-1 sm:pt-0 -mt-3 sm:mt-0">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-[0_4px_35px_rgba(245,158,11,0.6)] leading-[1.06] select-none">
            VOEUX DIWALI DHAMAKA SALE
          </h1>
        </div>

        {/* MIDDLE: Enlarged Countdown with Glowing Diyas on the sides */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-6 md:gap-10">
          
          {/* Left Diya (Large & Radiant) */}
          <div className="shrink-0 flex items-center justify-center filter drop-shadow-[0_0_25px_rgba(245,158,11,0.7)]">
            <DiyaIcon className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 transform -scale-x-100" />
          </div>

          {/* Center Area: Countdown Timer (before Nov 4) */}
          {!saleActive && (
            <div className="flex-1 max-w-md sm:max-w-lg flex flex-col items-center justify-center">
              <DiwaliCountdownTimer />
            </div>
          )}

          {/* Right Diya (Large & Radiant) */}
          <div className="shrink-0 flex items-center justify-center filter drop-shadow-[0_0_25px_rgba(245,158,11,0.7)]">
            <DiyaIcon className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36" />
          </div>

        </div>

      </div>

      {/* Downward Scroll Indicator (EXPLORE OFFERS) - Moved above mobile bottom navigation bar */}
      <div className="relative z-10 pb-24 sm:pb-4 pt-2">
        <button
          type="button"
          onClick={scrollToContent}
          className="flex flex-col items-center gap-1.5 sm:gap-2 text-amber-300/90 hover:text-amber-200 transition-colors cursor-pointer group animate-bounce"
          aria-label="Scroll down to explore products"
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-300 transition-colors">
            Explore Offers
          </span>
          <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
        </button>
      </div>

    </section>
  );
};
