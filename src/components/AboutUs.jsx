import React from 'react';
import { Heart } from 'lucide-react';

/**
 * About Us Section (Embedded on the Home Screen below Shop by Category)
 */
export const AboutUs = () => {
  return (
    <section id="about-us-section" className="container mx-auto px-4 py-8 max-w-5xl space-y-8 scroll-mt-20">
      
      {/* Official Story Card */}
      <div className="bg-[#3B429F] text-white p-8 sm:p-10 rounded-3xl space-y-4 shadow-xl border border-indigo-400/20 text-left">
        <div className="flex items-center justify-between border-b border-white/20 pb-3 flex-wrap gap-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">VOEUX – Built for Your Drive</h2>
          <span className="font-mono italic font-extrabold text-lg sm:text-xl text-yellow-300">voeux®</span>
        </div>
        
        <p className="text-sm sm:text-base leading-relaxed text-indigo-100 font-medium">
          Voeux was born from years of hands-on experience in car electronics. What started as an offline family business is now built for online drivers like you. We focus on reliability, clean design, and real performance — products we confidently install in our own cars.
        </p>

        <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 pt-2">
          <span>Thank you for choosing Voeux</span>
          <Heart className="w-4 h-4 fill-red-400 text-red-400 inline" />
        </p>
      </div>

      {/* Real Stats Grid */}
      <div className="bg-gray-900 text-white p-6 sm:p-8 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center shadow-lg border border-gray-800">
        <div className="p-2 sm:p-3">
          <span className="text-2xl sm:text-3xl font-black text-amber-300 block">2000+</span>
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-300 block mt-1">PRODUCTS DELIVERED</span>
        </div>

        <div className="p-2 sm:p-3">
          <span className="text-2xl sm:text-3xl font-black text-white block">1 YEAR</span>
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-300 block mt-1">WARRANTY*</span>
        </div>

        <div className="p-2 sm:p-3">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">24/7</span>
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-300 block mt-1">WHATSAPP SUPPORT AGENT</span>
        </div>

        <div className="p-2 sm:p-3">
          <span className="text-2xl sm:text-3xl font-black text-yellow-300 block">4.9 ★</span>
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-300 block mt-1">CUSTOMER RATING</span>
        </div>
      </div>

    </section>
  );
};
