import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, ArrowUp } from 'lucide-react';

const MarketplaceLogo = ({ candidates, href, alt, title, imgClassName = '', containerClassName = '' }) => {
  const [index, setIndex] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const handleError = () => {
    if (index + 1 < candidates.length) {
      setIndex(prev => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  if (hasFailedAll) {
    return null;
  }

  if (!hasLoaded) {
    return (
      <img
        src={candidates[index]}
        alt={alt}
        onLoad={() => setHasLoaded(true)}
        onError={handleError}
        className="hidden"
      />
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 cursor-pointer block select-none flex items-center justify-center ${containerClassName}`}
    >
      <img
        src={candidates[index]}
        alt={alt}
        className={`w-full h-full object-cover block rounded-full transform ${imgClassName}`}
      />
    </a>
  );
};

export const Footer = () => {
  const { setActivePage } = useShop();

  return (
    <footer className="bg-black text-white border-t border-slate-900 pt-12 pb-24 lg:pb-8 text-xs">
      <div className="container mx-auto px-4 space-y-10">
        
        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          
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
              <li><button onClick={() => setActivePage('subwoofers')} className="hover:text-cyan-400 transition cursor-pointer">Subwoofers</button></li>
            </ul>
          </div>

          {/* Service Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Services & Information</h4>
            <ul className="space-y-2 text-slate-300">
              <li><button onClick={() => setActivePage('about-us')} className="hover:text-cyan-400 transition cursor-pointer">About Us</button></li>
              <li><button onClick={() => setActivePage('join-us')} className="hover:text-cyan-400 transition cursor-pointer">Official Distributor Program</button></li>
              <li><button onClick={() => setActivePage('warranty-policy')} className="hover:text-cyan-400 transition cursor-pointer">Repairs & Warranty Policy</button></li>
              <li><button onClick={() => setActivePage('warranty')} className="hover:text-cyan-400 transition cursor-pointer">Warranty Register Portal</button></li>
              <li><button onClick={() => setActivePage('contact-us')} className="hover:text-cyan-400 transition cursor-pointer">Contact Support</button></li>
              <li><button onClick={() => setActivePage('terms')} className="hover:text-cyan-400 transition cursor-pointer">Terms & Conditions</button></li>
            </ul>
          </div>

          {/* Marketplace Circular Store Logos */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Find Us On</h4>
            <div className="flex items-center gap-4 pt-1">
              <MarketplaceLogo
                candidates={[
                  '/images/amazon_logo.png',
                  '/images/amazon_logo.jpg',
                  '/images/amazon_logo.jpeg'
                ]}
                href="https://www.amazon.in/s?k=Voeux&ref=bl_dp_s_web_0"
                alt="Amazon"
                title="VOEUX on Amazon"
                containerClassName="bg-white"
                imgClassName="scale-[1.10]"
              />
              <MarketplaceLogo
                candidates={[
                  '/images/flipkart_logo.png',
                  '/images/flipkart_logo.jpg',
                  '/images/flipkart_logo.jpeg'
                ]}
                href="https://www.flipkart.com/search?q=voeux&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off"
                alt="Flipkart"
                title="VOEUX on Flipkart"
                containerClassName="bg-[#2874F0]"
                imgClassName="scale-[1.38]"
              />
            </div>
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
