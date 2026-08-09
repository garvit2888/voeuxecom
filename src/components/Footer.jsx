import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, ArrowUp } from 'lucide-react';

export const Footer = () => {
  const { setActivePage } = useShop();

  return (
    <footer className="bg-[#2B308B] text-white border-t border-indigo-900/60 pt-12 pb-8 text-xs">
      <div className="container mx-auto px-4 space-y-10">
        
        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info & Logo */}
          <div className="space-y-3">
            <div className="flex items-center cursor-pointer" onClick={() => setActivePage('home')}>
              <img
                src="/images/voeux_logo.png"
                alt="VOEUX® Car Electronics"
                className="h-16 sm:h-20 w-auto rounded-xl shadow-lg border border-white/20 hover:opacity-95 transition"
              />
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Products</h4>
            <ul className="space-y-2 text-indigo-100">
              <li><button onClick={() => setActivePage('android-players')} className="hover:text-cyan-300 transition">Android Car Players</button></li>
              <li><button onClick={() => setActivePage('speakers-soundbars')} className="hover:text-cyan-300 transition">Speakers & Soundbars</button></li>
              <li><button onClick={() => setActivePage('amplifiers')} className="hover:text-cyan-300 transition">Car Amplifiers</button></li>
              <li><button onClick={() => setActivePage('whats-new')} className="hover:text-cyan-300 transition">What's New Drops</button></li>
            </ul>
          </div>

          {/* Service Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Services</h4>
            <ul className="space-y-2 text-indigo-100">
              <li><button onClick={() => setActivePage('warranty-policy')} className="hover:text-cyan-300 font-bold text-white transition">Repairs & Warranty Policy</button></li>
              <li><button onClick={() => setActivePage('warranty')} className="hover:text-cyan-300 transition">Warranty Register Portal</button></li>
              <li><button onClick={() => setActivePage('contact-us')} className="hover:text-cyan-300 transition">Contact Support</button></li>
              <li><button onClick={() => setActivePage('terms')} className="hover:text-cyan-300 font-bold text-white transition">Terms & Conditions</button></li>
            </ul>
          </div>

          {/* Guarantee Badge Box */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Guarantee</h4>
            <div className="p-3.5 bg-[#1F2368] rounded-xl border border-indigo-300/30 space-y-1 text-white shadow-md">
              <div className="flex items-center gap-1.5 font-extrabold text-white text-xs">
                <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0" /> 1 Year Warranty*
              </div>
              <p className="text-[10px] text-indigo-200">*Applicable on select products.</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/15 flex items-center justify-between text-indigo-200 text-[11px]">
          <p>© 2026 VOEUX® Electronics. All Rights Reserved.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-cyan-300 font-bold flex items-center gap-1 hover:text-white transition"
          >
            Back to Top <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
