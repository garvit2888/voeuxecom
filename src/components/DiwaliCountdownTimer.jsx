import React, { useState, useEffect } from 'react';
import { DIWALI_CONFIG, isDiwaliTimerActive } from '../utils/diwaliOffers';
import { Clock } from 'lucide-react';

/**
 * Enlarged Diwali Countdown Timer
 * Displays bold clock boxes with Hours : Mins : Secs.
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

  if (!isTimerActive || timeLeft <= 0) {
    return null;
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      
      {/* Header */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-center">
        <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
        <span className="text-[11px] sm:text-sm md:text-base font-black tracking-widest text-amber-300 uppercase">
          OFFERS DROP IN
        </span>
      </div>

      {/* Countdown Timer Clocks (Enlarged) */}
      <div className="flex justify-center items-center gap-1.5 sm:gap-3 md:gap-4 text-2xl sm:text-4xl md:text-5xl font-black font-mono">
        
        {/* Hours */}
        <div className="flex flex-col items-center bg-slate-900/95 rounded-xl sm:rounded-2xl px-2.5 sm:px-5 md:px-7 py-2 sm:py-3.5 shadow-2xl border border-amber-500/50 min-w-[64px] sm:min-w-[88px] md:min-w-[110px]">
          <span className="text-amber-200">{String(hours).padStart(2, '0')}</span>
          <span className="text-[8px] sm:text-[11px] md:text-xs uppercase font-bold tracking-widest mt-0.5 sm:mt-1 text-slate-400">Hours</span>
        </div>

        <span className="text-amber-400 font-bold animate-pulse text-lg sm:text-2xl md:text-3xl">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center bg-slate-900/95 rounded-xl sm:rounded-2xl px-2.5 sm:px-5 md:px-7 py-2 sm:py-3.5 shadow-2xl border border-amber-500/50 min-w-[64px] sm:min-w-[88px] md:min-w-[110px]">
          <span className="text-amber-200">{String(minutes).padStart(2, '0')}</span>
          <span className="text-[8px] sm:text-[11px] md:text-xs uppercase font-bold tracking-widest mt-0.5 sm:mt-1 text-slate-400">Mins</span>
        </div>

        <span className="text-amber-400 font-bold animate-pulse text-lg sm:text-2xl md:text-3xl">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center bg-slate-900/95 rounded-xl sm:rounded-2xl px-2.5 sm:px-5 md:px-7 py-2 sm:py-3.5 shadow-2xl border border-amber-500/50 min-w-[64px] sm:min-w-[88px] md:min-w-[110px]">
          <span className="text-amber-200">{String(seconds).padStart(2, '0')}</span>
          <span className="text-[8px] sm:text-[11px] md:text-xs uppercase font-bold tracking-widest mt-0.5 sm:mt-1 text-slate-400">Secs</span>
        </div>

      </div>

    </div>
  );
};
