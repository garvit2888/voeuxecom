import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const Hero = () => {
  const { setActivePage, setSelectedProductModal } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'VOEUX® Premium X80 Series Dual Knob 10.1" Stereo',
      subtitle: '4GB RAM + 64GB ROM • Dual Rotary Knobs',
      tagline: '4GB RAM + 64GB ROM • Dual Knobs • Wireless CarPlay & Android Auto',
      image: '/images/voeux_x80_hero_bg.jpg',
      ctaText: 'Explore X80 Stereo',
      actionPage: 'android-players',
      featuredProduct: PRODUCTS[0],
      mobilePadding: 'p-3'
    },
    {
      title: 'VOEUX® SVX-UND001 10" Underseat Powered Subwoofer',
      subtitle: 'Deep Bass • Ultra-Slim Underseat Design',
      tagline: '900W Peak Power • 120W RMS • Built-in Amplifier • Bass Remote Control',
      image: '/images/voeux_svx_und001_2.jpg',
      ctaText: 'Shop Underseat Subwoofer',
      actionPage: 'subwoofers',
      featuredProduct: PRODUCTS.find(p => p.id === 'voeux-svx-und001-underseat-subwoofer'),
      mobilePadding: 'p-5'
    },
    {
      title: 'VOEUX® 160W 2-in-1 Separable Soundbar',
      subtitle: 'Convertible Dual Tower & Horizontal Soundbar',
      tagline: '160W RMS • 2.1 CH Subwoofer • Bluetooth 5.0 • 3D Sound & HDMI ARC',
      image: '/images/voeux_soundbar_main.jpg',
      ctaText: 'Shop 160W Soundbar',
      actionPage: 'speakers-soundbars',
      featuredProduct: PRODUCTS[1],
      mobilePadding: 'p-3'
    },
    {
      title: 'VOEUX® AMP Board 150W Mono Class AB Car Amplifier',
      subtitle: 'For Basstubes, Subwoofers & Speakers',
      tagline: '150W RMS • Mono Class AB Circuit • Bass Crossover Control • 25A Fuse Protection',
      image: '/images/voeux_amp_board.jpg',
      ctaText: 'Shop Car Amplifiers',
      actionPage: 'amplifiers',
      featuredProduct: PRODUCTS[2],
      mobilePadding: 'p-5'
    },
    {
      title: 'VOEUX® CARBON BLACK Series 9" QLED Android TS7 Stereo',
      subtitle: '4GB RAM + 64GB ROM • 6th Gen 4-Core Processor',
      tagline: '9" QLED Touchscreen • 4GB RAM + 64GB ROM • Wireless CarPlay & Android Auto • AHD Camera',
      image: '/images/voeux_carbon_black_ts7.jpg',
      ctaText: 'Explore Carbon Black TS7',
      actionPage: 'android-players',
      featuredProduct: PRODUCTS.find(p => p.id === 'voeux-carbon-black-ts7-4-64') || PRODUCTS[0],
      mobilePadding: 'p-5'
    },
    {
      title: 'VOEUX® Complete Audio Video Upgrade Bundles',
      subtitle: 'Making premium audio more accessible',
      tagline: 'Premium Android Stereo + 4 High-Bass Speakers + Custom Frame • Unbeatable Value',
      image: '/images/bundle_x80.png',
      ctaText: 'Explore Combo Bundles',
      actionPage: 'bundles',
      featuredProduct: PRODUCTS.find(p => p.id === 'bundle-x80-4-speakers-frame'),
      mobilePadding: 'p-5'
    }
  ];

  // Preload ALL hero slide images immediately into RAM/cache for instant switching with zero delay
  useEffect(() => {
    slides.forEach(slide => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  const handleSlideClick = (slide) => {
    if (slide.actionPage === 'bundles') {
      setActivePage('bundles');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedProductModal(slide.featuredProduct);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="bg-black border-b border-gray-800">

      {/* ========== MOBILE LAYOUT ONLY ========== */}
      <div className="md:hidden relative min-h-screen bg-black text-white flex flex-col items-center justify-center pt-2 pb-24 px-4 overflow-x-hidden">

        {/* IMAGE STACK: Clean container without cutting shadow gradients */}
        <div
          onClick={() => handleSlideClick(slides[currentSlide])}
          className="relative w-full h-72 sm:h-96 overflow-hidden flex items-center justify-center cursor-pointer"
        >
          {slides.map((s, idx) => (
            <img
              key={idx}
              src={s.image}
              alt={s.title}
              loading="eager"
              fetchPriority="high"
              className={`absolute inset-0 w-full h-full object-contain object-center p-2 transition-all duration-500 ease-in-out ${
                idx === currentSlide
                  ? 'opacity-100 scale-100 z-1'
                  : 'opacity-0 scale-105 pointer-events-none z-0'
              }`}
            />
          ))}
        </div>

        {/* TEXT STACK: Directly below edge-to-edge image */}
        <div className="w-full mt-3 space-y-4 text-left min-h-[160px] relative px-1">
          {slides.map((s, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedProductModal(s.featuredProduct)}
              className={`transition-all duration-500 ease-in-out space-y-3.5 cursor-pointer ${
                idx === currentSlide
                  ? 'opacity-100 translate-y-0 relative z-10'
                  : 'opacity-0 translate-y-3 absolute inset-0 pointer-events-none z-0'
              }`}
            >
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
                {s.title}
              </h1>

              <p className="text-sm text-gray-300 font-medium leading-relaxed">
                {s.tagline}
              </p>
            </div>
          ))}

          {/* Slide Dots Mobile */}
          <div className="flex items-center justify-center space-x-2 pt-5 pb-1 relative z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-7 bg-white' : 'w-1.5 bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* ========== DESKTOP LAYOUT ONLY ========== */}
      <div
        onClick={() => handleSlideClick(slides[currentSlide])}
        className="hidden md:flex relative w-full min-h-[calc(100vh-76px)] bg-black text-white items-center overflow-hidden cursor-pointer group"
      >
        {/* Centered Content Container */}
        <div className="container mx-auto px-8 lg:px-16 xl:px-20 py-12 w-full flex items-center relative z-10">
          {/* STACKED TEXT CONTENT */}
          <div className="max-w-xl lg:max-w-2xl text-left w-full space-y-4">
            {slides.map((s, idx) => (
              <div
                key={idx}
                className={`transition-all duration-500 ease-in-out space-y-4 ${
                  idx === currentSlide
                    ? 'opacity-100 translate-y-0 relative z-10'
                    : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none z-0'
                }`}
              >
                <h1 className="text-3xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-tight">
                  {s.title}
                </h1>
                <p className="text-base lg:text-lg text-gray-300 font-medium leading-relaxed max-w-xl">
                  {s.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* INSTANT PRELOADED EAGER IMAGES (GPU RAM CACHED) */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] flex items-center justify-end pointer-events-none z-0 pr-8 lg:pr-16 xl:pr-24">
          {slides.map((s, idx) => (
            <img
              key={idx}
              src={s.image}
              alt={s.title}
              loading="eager"
              fetchPriority="high"
              className={`absolute right-4 max-h-[85vh] max-w-[90%] object-contain object-right transition-all duration-500 ease-in-out group-hover:scale-105 ${
                idx === currentSlide
                  ? 'opacity-95'
                  : 'opacity-0 pointer-events-none'
              }`}
            />
          ))}
          
          {/* Image Boundary Gradient Fades */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black pointer-events-none z-20" />
          <div className="absolute top-0 bottom-0 left-0 w-64 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-20" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black to-transparent pointer-events-none z-20" />
        </div>

        {/* Dark Gradient Overlay for text readability (extended) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent max-w-[65%] pointer-events-none z-[1]" />

        {/* Slide Dots Desktop */}
        <div className="absolute bottom-8 left-8 lg:left-16 xl:left-20 z-20 flex items-center space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-[#3B429F]' : 'w-2 bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Prev & Next Arrows Desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
          }}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-black/80 hover:bg-gray-900 text-white border border-gray-800 transition shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentSlide(prev => (prev + 1) % slides.length);
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-black/80 hover:bg-gray-900 text-white border border-gray-800 transition shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
