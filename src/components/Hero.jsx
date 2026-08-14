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
      tagline: '4GB RAM + 64GB ROM • Dual Metallic Knobs • Wireless CarPlay & Android Auto',
      badge: 'Flagship Launch 2026',
      image: '/images/voeux_x80_hero_bg.jpg',
      ctaText: 'Explore X80 Stereo',
      actionPage: 'android-players',
      featuredProduct: PRODUCTS[0]
    },
    {
      title: 'VOEUX® 160W 2-in-1 Separable Soundbar',
      subtitle: 'Convertible Dual Tower & Horizontal Soundbar',
      tagline: '160W RMS • 2.1 CH Subwoofer • Bluetooth 5.0 • 3D Sound & HDMI ARC',
      badge: 'Home & Auto Audio',
      image: '/images/voeux_soundbar_main.jpg',
      ctaText: 'Shop 160W Soundbar',
      actionPage: 'speakers-soundbars',
      featuredProduct: PRODUCTS[1]
    },
    {
      title: 'VOEUX® AMP Board 150W Mono Class AB Car Amplifier',
      subtitle: 'For Basstubes, Subwoofers & Speakers',
      tagline: '150W RMS • Mono Class AB Circuit • Bass Crossover Control • 25A Fuse Protection',
      badge: 'Audio Power Drop',
      image: '/images/voeux_amp_board.jpg',
      ctaText: 'Shop Car Amplifiers',
      actionPage: 'amplifiers',
      featuredProduct: PRODUCTS[2]
    },
    {
      title: 'VOEUX® CARBON BLACK Series 9" QLED Android TS7 Stereo',
      subtitle: '4GB RAM + 64GB ROM • 6th Gen 4-Core Processor',
      tagline: '9" QLED Touchscreen • 4GB RAM + 64GB ROM • Wireless CarPlay & Android Auto • AHD Camera',
      badge: 'New Drop 2026',
      image: '/images/voeux_carbon_black_ts7.jpg',
      ctaText: 'Explore Carbon Black TS7',
      actionPage: 'android-players',
      featuredProduct: PRODUCTS.find(p => p.id === 'voeux-carbon-black-ts7-4-64') || PRODUCTS[0]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="bg-slate-950 md:bg-white border-b border-gray-200">

      {/* ========== MOBILE & FOLD PHONE LAYOUT ========== */}
      <div className="md:hidden relative bg-slate-950 text-white pb-20">

        {/* Full-Width Image Banner (h-72 on small phones, sm:h-96 on Fold Ultra/tablets so product is never cut off) */}
        <div className="relative w-full h-72 sm:h-96 max-h-[420px] bg-slate-950 overflow-hidden flex items-center justify-center">
          {/* Top gradient fade */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none z-10" />

          <img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-contain sm:object-cover object-center transition-all duration-700"
          />

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-slate-950 pointer-events-none z-10" />
        </div>

        {/* Text Section below Image */}
        <div className="px-5 mt-6 space-y-4 text-left">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
            {slide.title}
          </h1>

          <p className="text-sm text-gray-300 font-medium leading-relaxed">
            {slide.tagline}
          </p>

          <div className="pt-2">
            <button
              onClick={() => setSelectedProductModal(slide.featuredProduct)}
              className="w-full bg-[#3B429F] active:bg-[#2B308B] text-white text-sm font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-900/60"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Slide Dots */}
          <div className="flex items-center justify-center space-x-2 pt-3 pb-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-7 bg-cyan-400' : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-10">
          <div className="relative w-full min-h-[560px] lg:min-h-[640px] bg-slate-950 text-white flex items-center p-12 lg:p-20 -mx-4 -mt-10 border-b border-slate-800 shadow-2xl overflow-hidden">

            {/* Background Image */}
            <div
              className="absolute inset-0 bg-no-repeat transition-all duration-700 opacity-95"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundPosition: 'right 2% center',
                backgroundSize: 'contain'
              }}
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent max-w-xl" />

            {/* Left Text Content */}
            <div className="relative z-10 max-w-xl space-y-4 text-left">
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {slide.title}
              </h1>
              <p className="text-base text-gray-300 font-medium leading-relaxed">
                {slide.tagline}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setSelectedProductModal(slide.featuredProduct)}
                  className="bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-900/40"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Dots Desktop */}
            <div className="absolute bottom-5 left-10 lg:left-12 z-20 flex items-center space-x-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Prev & Next Arrows Desktop */}
            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-indigo-500/30 transition shadow-md"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-indigo-500/30 transition shadow-md"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>
        </div>
      </div>

    </section>
  );
};
