import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';

export const SplashScreen = () => {
  const { pageTransitionKey } = useShop();
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(false);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('voeux_intro_played');
    
    if (!hasPlayed) {
      setIsFirstLoad(true);
      setShow(true);
      setFadeOut(false);
      // For the first load, we wait for the video to end (handled by onEnded)
    } else {
      setIsFirstLoad(false);
      setShow(true);
      setFadeOut(false);

      // Normal splash screen timing for subsequent page transitions
      const timer1 = setTimeout(() => {
        setFadeOut(true);
      }, 450);

      const timer2 = setTimeout(() => {
        setShow(false);
      }, 900);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [pageTransitionKey]);

  const handleVideoEnd = () => {
    sessionStorage.setItem('voeux_intro_played', 'true');
    setFadeOut(true);
    setTimeout(() => {
      setShow(false);
      setIsFirstLoad(false);
    }, 500); // 500ms fade out transition
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none transition-opacity duration-500 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${isFirstLoad ? 'bg-black' : 'bg-white'}`}
    >
      {isFirstLoad ? (
        <video
          src="/voeux_intro.mov"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoEnd}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center justify-center -mt-16 sm:mt-0 p-4">
          <img
            src="/images/voeux_logo.png"
            alt="VOEUX®"
            className="w-32 sm:w-40 md:w-48 h-auto object-contain transition-transform duration-300 transform scale-100 animate-pulse"
          />
        </div>
      )}
    </div>
  );
};
