import React from 'react';
import { useShop } from '../context/ShopContext';
import {
  MessageSquare,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export const JoinUsPage = () => {
  const { setActivePage } = useShop();

  const whatsappMessage = encodeURIComponent("hi i am interested to know more about voeux official distributor program");
  const whatsappUrl = `https://api.whatsapp.com/send?phone=919999484530&text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans text-left">
      
      {/* ==================== HERO HEADER SECTION ==================== */}
      <section className="relative bg-gradient-to-b from-slate-950 via-[#191C42] to-slate-950 text-white py-20 px-6 sm:px-12 overflow-hidden">
        {/* Subtle Ambient Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[#3B429F]/20 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10 text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            VOEUX® Official Distributor Program
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
            Expand your automotive retail & distribution business by partnering with VOEUX® — India's premier distributor of smart car stereos, soundbars, amplifiers, and car audio systems.
          </p>

          <div className="pt-4 flex flex-col items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm tracking-wide transition flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/40 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Inquire Now on WhatsApp</span>
            </a>

            <p className="text-slate-300 text-xs sm:text-sm font-medium pt-1">
              For inquiries, contact business team at <a href="mailto:voeuxexperience@gmail.com" className="text-cyan-300 font-bold hover:underline">voeuxexperience@gmail.com</a>
            </p>
          </div>
        </div>
      </section>

      {/* ==================== ABOUT VOEUX BRAND SECTION ==================== */}
      <section className="py-16 px-6 sm:px-12 max-w-5xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-gray-100 pb-10">
          <span className="text-xs font-extrabold text-[#3B429F] uppercase tracking-widest block">WHO WE ARE</span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            About VOEUX® Automotive Electronics
          </h2>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-normal">
            VOEUX is an automotive electronics brand focused on smart car infotainment and audio products. Our product range includes Android car stereos, car displays, amplifiers, speakers, soundbars and other automotive accessories. We are focused on growing VOEUX as a strong consumer electronics brand through e-commerce, product development and customer-focused solutions.
          </p>
        </div>

        {/* ==================== PAN-INDIA EXPANSION VISION ==================== */}
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-[#3B429F] uppercase tracking-widest block">EXPANSION STRATEGY</span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Expanding Distribution Channels All Over India
            </h3>
          </div>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            We are actively appointing authorized state distributors, city dealers, regional wholesalers, car accessory showroom partners, and automotive installation centers across North, South, East, and West India. As consumer demand for smart Android touchscreen players and high-fidelity car soundbars surges, VOEUX® provides distributors with complete brand backing, protected margins, and rapid stock supply.
          </p>
        </div>

        {/* ==================== DISTRIBUTOR PROGRAM ADVANTAGES ==================== */}
        <div className="pt-8 space-y-8 border-t border-gray-100">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-[#3B429F] uppercase tracking-widest block">WHY PARTNER WITH US</span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Distributor Program Advantages
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-2">
              <h4 className="font-extrabold text-gray-900 text-base sm:text-lg">Protected High Margins</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Enjoy lucrative wholesale pricing structures, tiered bulk quantity discounts, and market price protection to ensure maximum profitability for your dealership.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-gray-900 text-base sm:text-lg">Official Warranty Support</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                All VOEUX® products carry a 1-Year Official Warranty. We handle customer service, replacements, and spare parts directly so your shop remains hassle-free.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-gray-900 text-base sm:text-lg">Priority Logistics & Stock</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Authorized partners get priority order dispatch, express nationwide courier shipping, and guaranteed stock reservation during peak festival and product launch seasons.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-gray-900 text-base sm:text-lg">Brand Marketing Support</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Receive official store standees, promotional banners, product catalog brochures, digital marketing collateral, and customer referral leads in your territory.
              </p>
            </div>
          </div>
        </div>

        {/* ==================== WHO CAN APPLY ==================== */}
        <div className="pt-8 space-y-6 border-t border-gray-100">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">
            Who Can Apply For VOEUX® Distributorship?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-gray-200/80 space-y-1.5">
              <h4 className="font-extrabold text-gray-900 text-sm">Car Accessory Retailers</h4>
              <p className="text-gray-600">Established car decor shops & auto electronics stores.</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200/80 space-y-1.5">
              <h4 className="font-extrabold text-gray-900 text-sm">Regional Wholesalers</h4>
              <p className="text-gray-600">Stockists supplying to local car accessory markets.</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200/80 space-y-1.5">
              <h4 className="font-extrabold text-gray-900 text-sm">Audio Installers</h4>
              <p className="text-gray-600">Professional car audio setup & wiring technicians.</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200/80 space-y-1.5">
              <h4 className="font-extrabold text-gray-900 text-sm">E-commerce Sellers</h4>
              <p className="text-gray-600">Online auto parts sellers & digital marketplace partners.</p>
            </div>
          </div>
        </div>

        {/* ==================== FINAL CALL TO ACTION ==================== */}
        <div className="py-12 px-8 rounded-3xl bg-slate-950 text-white space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Ready To Grow With VOEUX®?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              Click below to send an instant inquiry to our distributor onboard manager via WhatsApp.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm tracking-wide transition flex items-center justify-center gap-2.5 shadow-xl cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              <span>INQUIRE NOW ON WHATSAPP</span>
            </a>

            <a
              href="tel:+919999484530"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm tracking-wide transition border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call +91 9999484530</span>
            </a>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#3B429F]" /> voeuxexperience@gmail.com</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#3B429F]" /> Head Office: New Delhi, India</span>
          </div>
        </div>

      </section>

    </div>
  );
};
