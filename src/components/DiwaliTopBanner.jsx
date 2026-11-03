import React from 'react';
import { DiyaIcon } from './DiyaIcon';
import { DiwaliCountdownTimer } from './DiwaliCountdownTimer';
import { ChevronDown } from 'lucide-react';

/**
 * Top Diwali Announcement Section
 * Fully responsive across Mobile, Tablet, Laptop, and Desktop.
 * Covers the whole screen (min-h-[100dvh]) with sleek black background,
 * glowing traditional Diyas flanking the headline, and the countdown timer
 * positioned directly below the headline and above "Explore Offers".
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
    <section className="relative w-full min-h-[100dvh] bg-black text-white flex flex-col justify-between items-center px-3 sm:px-6 py-6 sm:py-10 overflow-hidden select-none">
      
      {/* Radiant Festive Warm Radial Lighting Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-orange-600/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] sm:w-[70vw] h-[50vh] bg-amber-400/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

      {/* Top Spacer for balanced vertical centering */}
      <div className="w-full h-2 sm:h-6" />

      {/* Main Full-Screen Centerpiece */}
      <div className="container mx-auto px-2 sm:px-4 relative z-10 flex flex-col items-center justify-center my-auto w-full">
        
        {/* Diyas & Grand Title (Flanked horizontally across all screen sizes) */}
        <div className="w-full max-w-6xl flex items-center justify-center gap-2 sm:gap-6 md:gap-10 lg:gap-14 text-center">
          
          {/* Left Diya */}
          <div className="shrink-0 flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(245,158,11,0.65)]">
            <DiyaIcon className="w-12 h-12 sm:w-20 sm:h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-44 xl:h-44 transform -scale-x-100" />
          </div>

          {/* Grand Headline */}
          <div className="flex-1 px-1 sm:px-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-[0_4px_30px_rgba(245,158,11,0.55)] leading-[1.1] sm:leading-[1.08]">
              VOEUX DIWALI DHAMAKA SALE
            </h1>
          </div>

          {/* Right Diya */}
          <div className="shrink-0 flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(245,158,11,0.65)]">
            <DiyaIcon className="w-12 h-12 sm:w-20 sm:h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-44 xl:h-44" />
          </div>

        </div>

        {/* DIWALI COUNTDOWN BELOW VOEUX DIWALI DHAMAKA SALE & ABOVE EXPLORE OFFERS */}
        <DiwaliCountdownTimer />

      </div>

      {/* Downward Scroll Indicator (EXPLORE OFFERS) */}
      <button
        type="button"
        onClick={scrollToContent}
        className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2 text-amber-300/80 hover:text-amber-200 transition-colors cursor-pointer group pb-2 sm:pb-4 animate-bounce"
        aria-label="Scroll down to explore products"
      >
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-300 transition-colors">
          Explore Offers
        </span>
        <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
      </button>

    </section>
  );
};
