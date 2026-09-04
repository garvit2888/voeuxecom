import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';

export const SplashScreen = () => {
  const { pageTransitionKey } = useShop();
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setShow(true);
    setFadeOut(false);

    // Start smooth fade out at 350ms
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 350);

    // Unmount splash screen at 500ms (0.5 seconds total)
    const timer2 = setTimeout(() => {
      setShow(false);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pageTransitionKey]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center select-none transition-opacity duration-150 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center -mt-16 sm:mt-0 p-4">
        <img
          src="/images/voeux_logo.png"
          alt="VOEUX®"
          className="w-32 sm:w-40 md:w-48 h-auto object-contain transition-transform duration-300 transform scale-100 animate-pulse"
        />
      </div>
    </div>
  );
};
