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
    <section className="bg-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
      <div className="container mx-auto px-4 py-6 md:py-10 lg:py-14">
        
        {/* Main Responsive Layout Container - Seamless on Samsung Galaxy Fold, Tablets & Desktop */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-12 min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[520px] relative z-10">
          
          {/* Left / Text Content Column */}
          <div className="w-full md:w-1/2 lg:w-7/12 text-left space-y-3.5 sm:space-y-4 md:space-y-5 order-2 md:order-1 px-1 sm:px-3">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-cyan-300 text-xs font-black tracking-widest uppercase">
              <span>{slide.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {slide.title}
            </h1>

            {/* Tagline */}
            <p className="text-xs sm:text-sm md:text-base text-gray-300 font-medium leading-relaxed max-w-xl">
              {slide.tagline}
            </p>

            {/* CTA Button */}
            <div className="pt-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setSelectedProductModal(slide.featuredProduct)}
                className="bg-[#3B429F] hover:bg-[#2B308B] active:bg-[#20246B] text-white text-xs sm:text-sm font-extrabold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-950/80 cursor-pointer"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right / Product Image Column (Un-cropped, Un-zoomed, Zero Overlap) */}
          <div className="w-full md:w-1/2 lg:w-5/12 flex items-center justify-center order-1 md:order-2 p-2 sm:p-4">
            <div className="relative w-full flex items-center justify-center">
              {/* Soft ambient glow */}
              <div className="absolute inset-0 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <img
                key={slide.image}
                src={slide.image}
                alt={slide.title}
                className="w-full h-auto max-h-[260px] sm:max-h-[320px] md:max-h-[400px] lg:max-h-[460px] object-contain transition-all duration-700 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              />
            </div>
          </div>

        </div>

        {/* Carousel Controls Footer: Slide Dots & Arrow Navigation */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-900/80 mt-4 sm:mt-6">
          
          {/* Slide Indicators / Dots */}
          <div className="flex items-center space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Previous / Next Slide Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 transition cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 transition cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
