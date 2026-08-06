import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Zap, Cpu, Volume2 } from 'lucide-react';

export const Hero = () => {
  const { setActivePage, setSelectedProductModal } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'VOEUX® Premium X80 Series Dual Knob 10.1" Stereo',
      subtitle: '4GB RAM + 64GB ROM • Dual Rotary Knobs',
      tagline: '4GB RAM + 64GB ROM • Dual Metallic Knobs • Wireless CarPlay & Android Auto',
      badge: 'Flagship Launch 2026',
      image: '/images/voeux_x80_stereo.jpg',
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
      image: '/images/voeux_amp_board.png',
      ctaText: 'Shop Car Amplifiers',
      actionPage: 'speakers-soundbars',
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
      {/* Banner Display Container */}
      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-12">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[380px] md:min-h-[500px] flex items-center p-5 sm:p-8 md:p-12">
          
          {/* Full-bleed Zoomed Background Image positioned for product visibility */}
          <div
            className="absolute inset-0 bg-no-repeat transition-all duration-700 opacity-50 md:opacity-90"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundPosition: 'right 20% center',
              backgroundSize: 'cover'
            }}
          ></div>

          {/* Smooth Dark Gradient Overlay for Clean Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/70 md:bg-gradient-to-r md:from-slate-950 md:via-slate-950/85 md:to-transparent"></div>

          {/* Left Text Content */}
          <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4 text-left">
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-indigo-400 uppercase bg-indigo-950/90 border border-indigo-500/40 px-2.5 py-1 rounded-full inline-block">
              FEATURED CATEGORY • {slide.badge}
            </span>

            <h1 className="text-xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {slide.title}
            </h1>

            <p className="text-xs sm:text-base text-gray-300 font-medium leading-relaxed line-clamp-3 sm:line-clamp-none">
              {slide.tagline}
            </p>

            <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedProductModal(slide.featuredProduct)}
                className="w-full sm:w-auto bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-900/40"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage(slide.actionPage)}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 sm:py-3 rounded-xl border border-white/20 transition text-center"
              >
                View All in Category
              </button>
            </div>
          </div>

          {/* Slide Indicator Navigation */}
          <div className="absolute bottom-3 left-5 sm:left-12 z-20 flex items-center space-x-2">
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

          {/* Prev & Next Arrows (Hidden on Mobile to prevent data blocking, visible on Desktop) */}
          <button
            onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white border border-indigo-500/30 transition items-center justify-center"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white border border-indigo-500/30 transition items-center justify-center"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>
      </div>


    </section>
  );
};
