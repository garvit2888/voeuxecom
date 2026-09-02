import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, ArrowUp } from 'lucide-react';

export const Footer = () => {
  const { setActivePage } = useShop();

  return (
    <footer className="bg-black text-white border-t border-slate-900 pt-12 pb-24 lg:pb-8 text-xs">
      <div className="container mx-auto px-4 space-y-10">
        
        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          
          {/* Brand Info & Logo */}
          <div className="space-y-3">
            <div className="flex items-center cursor-pointer" onClick={() => setActivePage('home')}>
              <img
                src="/images/voeux_logo.png"
                alt="VOEUX® Car Electronics"
                className="h-16 sm:h-20 w-auto rounded-xl shadow-lg border border-white/20 hover:opacity-95 transition"
              />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              Premium Indian Automotive Electronics. Engineering High-Performance Android Stereos, Soundbars & Car Amplifiers.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Products</h4>
            <ul className="space-y-2 text-slate-300">
              <li><button onClick={() => setActivePage('android-players')} className="hover:text-cyan-400 transition cursor-pointer">Android Car Players</button></li>
              <li><button onClick={() => setActivePage('car-speakers')} className="hover:text-cyan-400 transition cursor-pointer">Car Speakers</button></li>
              <li><button onClick={() => setActivePage('speakers-soundbars')} className="hover:text-cyan-400 transition cursor-pointer">Speakers & Soundbars</button></li>
              <li><button onClick={() => setActivePage('amplifiers')} className="hover:text-cyan-400 transition cursor-pointer">Car Amplifiers</button></li>
            </ul>
          </div>

          {/* Service Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Services & Information</h4>
            <ul className="space-y-2 text-slate-300">
              <li><button onClick={() => setActivePage('about-us')} className="hover:text-cyan-400 font-bold text-white transition cursor-pointer">About Us</button></li>
              <li><button onClick={() => setActivePage('join-us')} className="hover:text-cyan-400 font-bold text-white transition cursor-pointer">Official Distributor Program</button></li>
              <li><button onClick={() => setActivePage('warranty-policy')} className="hover:text-cyan-400 font-bold text-white transition cursor-pointer">Repairs & Warranty Policy</button></li>
              <li><button onClick={() => setActivePage('warranty')} className="hover:text-cyan-400 transition cursor-pointer">Warranty Register Portal</button></li>
              <li><button onClick={() => setActivePage('contact-us')} className="hover:text-cyan-400 transition cursor-pointer">Contact Support</button></li>
              <li><button onClick={() => setActivePage('terms')} className="hover:text-cyan-400 font-bold text-white transition cursor-pointer">Terms & Conditions</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex items-center justify-between text-slate-400 text-[11px]">
          <p>© 2026 VOEUX® Electronics. All Rights Reserved.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-cyan-400 font-bold flex items-center gap-1 hover:text-white transition cursor-pointer"
          >
            Back to Top <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
