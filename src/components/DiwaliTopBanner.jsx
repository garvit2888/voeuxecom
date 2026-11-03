import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { DiyaIcon } from './DiyaIcon';
import { Sparkles, Tag, ArrowRight, Eye } from 'lucide-react';
import { isDiwaliSaleActive, DIWALI_CONFIG } from '../utils/diwaliOffers';

/**
 * Top Diwali Announcement Section
 * Positioned below the Navigation bar and on top of the Hero carousel.
 * Featuring traditional glowing diyas, festival branding, and discount highlights.
 */
export const DiwaliTopBanner = () => {
  const { setActivePage } = useShop();
  const [saleActive, setSaleActive] = useState(() => isDiwaliSaleActive());
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voeux_diwali_mode') || 'auto';
    }
    return 'auto';
  });

  useEffect(() => {
    const check = () => setSaleActive(isDiwaliSaleActive());
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const toggleTestMode = () => {
    const next = mode === 'active' ? 'countdown' : (mode === 'countdown' ? 'auto' : 'active');
    setMode(next);
    if (next === 'auto') {
      localStorage.removeItem('voeux_diwali_mode');
    } else {
      localStorage.setItem('voeux_diwali_mode', next);
    }
    window.location.reload();
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#0b0c1e] via-[#1a1843] to-[#0b0c1e] text-white border-b border-amber-500/40 shadow-xl">
      {/* Background Decorative Festive Sparks */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="container mx-auto px-4 py-4 sm:py-5 relative z-10">
        
        {/* Main Banner Header with Diyas */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
          
          {/* Left Diya */}
          <div className="hidden sm:flex items-center gap-2">
            <DiyaIcon className="w-8 h-8 sm:w-10 sm:h-10 transform -scale-x-100" />
          </div>

          {/* Central Title & Dates */}
          <div className="space-y-1.5 flex flex-col items-center">
            
            {/* Small Festive Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-sm">
              <span className="sm:hidden"><DiyaIcon className="w-4 h-4" /></span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>VOEUX® FESTIVE CELEBRATION</span>
              <span className="sm:hidden"><DiyaIcon className="w-4 h-4 transform -scale-x-100" /></span>
            </div>

            {/* Main Headline */}
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-sm leading-tight uppercase">
              VOEUX DIWALI DHAMAKA SALE
            </h2>
            <div className="text-xs sm:text-base font-extrabold text-amber-300 tracking-wider uppercase">
              VOEUX DIWALI SALE FROM 4TH NOVEMBER TO 8TH NOVEMBER
            </div>

            {/* Sub-tagline */}
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              {saleActive ? (
                <span className="text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  DHAMAKA OFFERS ARE NOW LIVE! Extra Festive Discounts Applied Storewide.
                </span>
              ) : (
                <span>
                  India's Biggest In-Car Audio & Stereo Dhamaka Drops at <strong className="text-amber-300">12:00 AM Midnight, 4th November</strong>!
                </span>
              )}
            </p>
          </div>

          {/* Right Diya */}
          <div className="hidden sm:flex items-center gap-2">
            <DiyaIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        </div>

        {/* Quick Offer Highlights Pills */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-[11px] sm:text-xs font-bold text-slate-200">
          <button
            type="button"
            onClick={() => setActivePage('android-players')}
            className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer text-amber-200"
          >
            <Tag className="w-3 h-3 text-amber-400" />
            <span>₹500 OFF Android Players</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('car-speakers')}
            className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer text-amber-200"
          >
            <Tag className="w-3 h-3 text-amber-400" />
            <span>₹500 OFF Car Speakers</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('speakers-soundbars')}
            className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer text-amber-200"
          >
            <Tag className="w-3 h-3 text-amber-400" />
            <span>₹250 OFF 160W Soundbar</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('subwoofers')}
            className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer text-amber-200"
          >
            <Tag className="w-3 h-3 text-amber-400" />
            <span>₹1,000 OFF Underseat Sub</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('bundles')}
            className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer text-amber-200"
          >
            <Tag className="w-3 h-3 text-amber-400" />
            <span>₹500 OFF All Combos</span>
          </button>
        </div>

        {/* Developer / Testing Switch for Branch Testing */}
        <div className="mt-2.5 flex items-center justify-center gap-3 text-[10px] text-slate-400">
          <span className="font-mono">Testing Branch Mode: <strong className="text-amber-300 font-bold uppercase">{mode}</strong></span>
          <button
            type="button"
            onClick={toggleTestMode}
            className="px-2.5 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold transition border border-white/20 cursor-pointer flex items-center gap-1"
            title="Switch between Realtime Clock, Forced Live Sale, and Forced Countdown mode"
          >
            <Eye className="w-3 h-3 text-amber-300" />
            <span>Toggle Test Mode ({mode === 'active' ? 'Sale Live' : (mode === 'countdown' ? 'Countdown' : 'Auto')})</span>
          </button>
        </div>

      </div>
    </section>
  );
};
