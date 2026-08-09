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
      image: '/images/voeux_separable_soundbar.png',
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
    <section className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 md:py-10">

        {/* ========== MOBILE LAYOUT (Clean Vertical Stack - Image 100% Clear on Top, Text Below) ========== */}
        <div className="md:hidden bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 p-4 space-y-4 text-left">
          
          {/* Top Product Image Box - Crystal Clear Background */}
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-center h-60 sm:h-72 w-full overflow-hidden shadow-inner">
            <img
              src={slide.image}
              alt={slide.title}
              className={`max-h-full max-w-full rounded-lg transition-all duration-500 ${currentSlide === 0 ? 'w-full h-full object-cover object-[center_75%]' : 'object-contain'}`}
            />
          </div>

          {/* Bottom Compact Text & CTA Section */}
          <div className="space-y-2 text-white">
            <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase bg-indigo-950/90 border border-indigo-500/40 px-2.5 py-0.5 rounded-full inline-block">
              FEATURED CATEGORY • {slide.badge}
            </span>

            <h2 className="text-base font-black tracking-tight leading-snug">
              {slide.title}
            </h2>

            <p className="text-xs text-gray-300 font-medium leading-relaxed">
              {slide.tagline}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setSelectedProductModal(slide.featuredProduct)}
                className="flex-1 bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-extrabold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-md"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActivePage(slide.actionPage)}
                className="bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold py-2.5 px-3 rounded-lg border border-slate-700 transition"
              >
                View Category
              </button>
            </div>
          </div>

          {/* Slide Dots Indicator for Mobile */}
          <div className="flex items-center justify-center space-x-1.5 pt-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>


        {/* ========== DESKTOP LAYOUT (Full-bleed Hero Banner with Side Arrows) ========== */}
        <div className="hidden md:flex relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[500px] items-center p-10 lg:p-12 border border-slate-800 shadow-2xl">
          
          {/* Zoomed Background Image */}
          <div
            className="absolute inset-0 bg-no-repeat transition-all duration-700 opacity-95"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundPosition: currentSlide === 0 ? 'right 2% center' : 'right 15% center',
              backgroundSize: currentSlide === 0 ? 'contain' : 'cover'
            }}
          ></div>

          {/* Smooth Dark Gradient Overlay for Clean Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent max-w-xl"></div>

          {/* Left Text Content */}
          <div className="relative z-10 max-w-xl space-y-4 text-left">
            <span className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase bg-indigo-950/80 border border-indigo-500/40 px-3.5 py-1 rounded-full inline-block">
              FEATURED CATEGORY • {slide.badge}
            </span>

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

              <button
                onClick={() => setActivePage(slide.actionPage)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-3 rounded-xl border border-white/20 transition"
              >
                View All in Category
              </button>
            </div>
          </div>

          {/* Slide Indicator Navigation */}
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

          {/* Prev & Next Arrows for Desktop */}
          <button
            onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-indigo-500/30 transition flex items-center justify-center shadow-md"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-indigo-500/30 transition flex items-center justify-center shadow-md"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>

      </div>
    </section>
  );
};
