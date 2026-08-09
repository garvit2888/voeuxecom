import React, { useState, useEffect } from 'react';

export const SplashScreen = () => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start smooth fade out at 1.4s
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 1400);

    // Completely unmount splash screen from DOM at 2.0s
    const timer2 = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#3B429F] flex flex-col items-center justify-center select-none transition-opacity duration-700 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center p-4">
          <img
            src="/images/voeux_logo.png"
            alt="VOEUX®"
            className="w-56 sm:w-72 md:w-80 h-auto object-contain drop-shadow-lg transition-transform duration-700 transform scale-100 hover:scale-105"
          />
        </div>
        
        {/* Subtle white pulsing loader dots */}
        <div className="flex items-center space-x-2 pt-2">
          <div className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
