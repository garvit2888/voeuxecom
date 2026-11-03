import React, { useState, useEffect } from 'react';
import { DIWALI_CONFIG, isDiwaliTimerActive } from '../utils/diwaliOffers';
import { Clock } from 'lucide-react';

/**
 * Diwali Countdown Timer Component
 * Positioned below "VOEUX DIWALI DHAMAKA SALE" and above "Explore Offers".
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
    <div className="flex flex-col items-center justify-center my-6 sm:my-8 relative z-10 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-3 text-center">
        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-xs sm:text-sm font-black tracking-widest text-amber-300 uppercase">
          OFFERS DROP IN
        </span>
      </div>

      {/* Countdown Timer Clocks */}
      <div className="flex justify-center items-center gap-2.5 sm:gap-4 text-2xl sm:text-4xl font-black font-mono">
        
        {/* Hours */}
        <div className="flex flex-col items-center bg-slate-900/90 rounded-2xl px-4 sm:px-6 py-2.5 shadow-2xl border border-amber-500/40 min-w-[70px] sm:min-w-[92px]">
          <span className="text-amber-200">{String(hours).padStart(2, '0')}</span>
          <span className="text-[9px] sm:text-[11px] uppercase font-bold tracking-widest mt-1 text-slate-400">Hours</span>
        </div>

        <span className="text-amber-400 font-bold animate-pulse text-xl sm:text-2xl">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center bg-slate-900/90 rounded-2xl px-4 sm:px-6 py-2.5 shadow-2xl border border-amber-500/40 min-w-[70px] sm:min-w-[92px]">
          <span className="text-amber-200">{String(minutes).padStart(2, '0')}</span>
          <span className="text-[9px] sm:text-[11px] uppercase font-bold tracking-widest mt-1 text-slate-400">Mins</span>
        </div>

        <span className="text-amber-400 font-bold animate-pulse text-xl sm:text-2xl">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center bg-slate-900/90 rounded-2xl px-4 sm:px-6 py-2.5 shadow-2xl border border-amber-500/40 min-w-[70px] sm:min-w-[92px]">
          <span className="text-amber-200">{String(seconds).padStart(2, '0')}</span>
          <span className="text-[9px] sm:text-[11px] uppercase font-bold tracking-widest mt-1 text-slate-400">Secs</span>
        </div>

      </div>

    </div>
  );
};
