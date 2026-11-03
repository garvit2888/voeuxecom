import React, { useState, useEffect } from 'react';
import { DIWALI_CONFIG, isDiwaliSaleActive, isDiwaliTimerActive } from '../utils/diwaliOffers';
import { DiyaIcon } from './DiyaIcon';
import { Sparkles, Clock, Zap } from 'lucide-react';

/**
 * Diwali Countdown Timer Component
 * Positioned in the exact same location as the previous countdown timer (below Hero).
 * Counts down until 4th Nov 12:00 AM IST, then disappears automatically.
 */
export const DiwaliCountdownTimer = () => {
  const targetDate = DIWALI_CONFIG.startDate;
  const [timeLeft, setTimeLeft] = useState(() => targetDate - Date.now());
  const [isTimerActive, setIsTimerActive] = useState(() => isDiwaliTimerActive());

  useEffect(() => {
    const update = () => {
      const remaining = targetDate - Date.now();
      setTimeLeft(remaining);
      setIsTimerActive(isDiwaliTimerActive());
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // If sale has started (timer <= 0 or timer inactive), hide the timer completely!
  if (!isTimerActive || timeLeft <= 0) {
    return null;
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="w-full bg-gradient-to-b from-black via-slate-950 to-black text-white py-8 px-4 flex flex-col items-center justify-center border-y border-amber-500/30 shadow-2xl relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Header with Diya Icons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 text-center">
        <DiyaIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        <span className="text-xs sm:text-sm font-black tracking-widest text-amber-300 uppercase flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-400" />
          VOEUX® DIWALI DHAMAKA OFFERS DROP IN
        </span>
        <DiyaIcon className="w-6 h-6 sm:w-7 sm:h-7 transform -scale-x-100" />
      </div>

      {/* Countdown Timer Clocks */}
      <div className="flex justify-center items-center gap-2.5 sm:gap-4 text-2xl sm:text-4xl font-black font-mono">
        
        {/* Hours */}
        <div className="flex flex-col items-center bg-slate-900/90 rounded-2xl px-4 sm:px-6 py-2.5 shadow-xl border border-amber-500/30 min-w-[70px] sm:min-w-[90px]">
          <span className="text-amber-200">{String(hours).padStart(2, '0')}</span>
          <span className="text-[9px] sm:text-[11px] uppercase font-bold tracking-widest mt-1 text-slate-400">Hours</span>
        </div>

        <span className="text-amber-400 font-bold animate-pulse text-xl sm:text-2xl">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center bg-slate-900/90 rounded-2xl px-4 sm:px-6 py-2.5 shadow-xl border border-amber-500/30 min-w-[70px] sm:min-w-[90px]">
          <span className="text-amber-200">{String(minutes).padStart(2, '0')}</span>
          <span className="text-[9px] sm:text-[11px] uppercase font-bold tracking-widest mt-1 text-slate-400">Mins</span>
        </div>

        <span className="text-amber-400 font-bold animate-pulse text-xl sm:text-2xl">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center bg-slate-900/90 rounded-2xl px-4 sm:px-6 py-2.5 shadow-xl border border-amber-500/30 min-w-[70px] sm:min-w-[90px]">
          <span className="text-amber-200">{String(seconds).padStart(2, '0')}</span>
          <span className="text-[9px] sm:text-[11px] uppercase font-bold tracking-widest mt-1 text-slate-400">Secs</span>
        </div>

      </div>

      {/* Explanatory Festive Notice */}
      <p className="text-xs sm:text-sm font-semibold mt-5 max-w-2xl text-center text-slate-300 px-3 leading-relaxed">
        Diwali Dhamaka discounts officially launch tonight at <strong className="text-amber-300">12:00 AM (4th November)</strong>.
        Get ready for <span className="text-yellow-300 font-bold">₹500 OFF Android Players & Speakers</span>, <span className="text-yellow-300 font-bold">₹250 OFF Soundbars</span>, and <span className="text-yellow-300 font-bold">₹1,000 OFF Underseat Subwoofers</span>!
      </p>

    </div>
  );
};
