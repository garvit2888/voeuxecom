import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import {
  ShieldCheck,
  RotateCw,
  Truck,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  MessageSquare,
  ZoomIn,
  X,
  HelpCircle
} from 'lucide-react';

export const ProductDetailPage = () => {
  const {
    selectedProductModal,
    setActivePage,
    recentlyViewed,
    productsList
  } = useShop();

  const product = selectedProductModal;

  const [selectedImg, setSelectedImg] = useState(product?.image || '');
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Accordion state for Description, Key Features & Specifications
  const [openAccordions, setOpenAccordions] = useState({
    description: true,
    features: true,
    specs: false
  });

  // Accordion state for FAQs
  const [openFaqs, setOpenFaqs] = useState({});

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFaq = (idx) => {
    setOpenFaqs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">No product selected</h2>
        <button onClick={() => setActivePage('home')} className="btn-primary text-xs py-2.5 px-6">
          Return to Home
        </button>
      </div>
    );
  }



  const handleDrag360 = (e) => {
    if (!is360Mode) return;
    setRotationAngle(prev => (prev + e.movementX * 2) % 360);
  };

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="bg-white min-h-screen">
      
      {/* Clean Top Breadcrumbs Bar */}
      <div className="border-b border-gray-200 py-3.5 px-4 sm:px-8 bg-gray-50 text-xs">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-500 font-medium">
            <button onClick={() => setActivePage('home')} className="hover:text-[#3B429F] transition">Home</button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <button onClick={() => setActivePage(product.category)} className="hover:text-[#3B429F] capitalize transition">
              {product.category.replace('-', ' ')}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>

          <button
            onClick={() => setActivePage(product.category || 'home')}
            className="flex items-center gap-1.5 text-[#3B429F] hover:underline font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </button>
        </div>
      </div>

      {/* Main Full-Page Product Container */}
      <div className="container mx-auto px-4 py-8 sm:py-14 max-w-6xl space-y-16">
        
        {/* Top Product Section: Left Gallery & Right Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Image Showcase & 360 Spin Viewer */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Main Image Viewport - Borderless Pure Fitted Design */}
            <div
              onClick={() => !is360Mode && setIsZoomOpen(true)}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center group cursor-pointer"
            >
              
              {/* 360 Spin View Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIs360Mode(!is360Mode);
                }}
                className={`absolute top-4 left-4 z-10 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-2 transition ${
                  is360Mode ? 'bg-[#3B429F] text-white shadow-md' : 'bg-white/95 text-gray-800 border border-gray-200 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${is360Mode ? 'animate-spin' : ''}`} />
                <span>{is360Mode ? '360° Drag Active' : '360° Spin View'}</span>
              </button>

              {/* Zoom Pill Indicator */}
              {!is360Mode && (
                <div className="absolute bottom-3 right-3 z-10 bg-white/95 text-gray-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-gray-200 backdrop-blur-sm shadow-sm group-hover:scale-105 transition">
                  <ZoomIn className="w-3.5 h-3.5 text-[#3B429F]" />
                  <span>Click to Zoom</span>
                </div>
              )}

              {/* Badge Tag */}
              {product.badge && (
                <span className="absolute top-4 right-4 z-10 bg-[#3B429F] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-md tracking-wider shadow-sm">
                  {product.badge}
                </span>
              )}

              {is360Mode ? (
                <div
                  onMouseMove={handleDrag360}
                  className="w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none"
                >
                  <img
                    src={selectedImg}
                    alt={product.name}
                    style={{ transform: `rotateY(${rotationAngle}deg)` }}
                    className="w-full h-full object-contain"
                  />
                  <p className="absolute bottom-3 text-xs text-gray-800 bg-white/95 px-4 py-1 rounded-full border border-gray-200 shadow-sm font-semibold">
                    ← Drag left or right to rotate product 360° →
                  </p>
                </div>
              ) : (
                <img
                  src={selectedImg}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>

            {/* Thumbnail Carousel */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImg(img);
                    setIs360Mode(false);
                  }}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImg === img && !is360Mode ? 'border-[#3B429F] shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Minimalist Trust Features Row */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-semibold text-gray-700">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-[#3B429F]" />
                <span>1 Year Warranty*</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col items-center gap-1">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                <span>7 Days Replacement</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-[#3B429F]" />
                <span>Free Express Delivery</span>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Noise-Inspired Info & Pricing */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Title & Short Specs */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">OFFICIAL VOEUX® STORE</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                {product.shortSpecs.join(' • ')}
              </p>
            </div>

            {/* Noise Pricing & Offer Row */}
            <div className="space-y-2 py-4 border-y border-gray-200">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-base text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {discountPercent}% off
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">(MRP Inclusive of all taxes)</p>

              {/* Clean Offer Lines */}
              <div className="pt-2 text-xs space-y-1 font-medium text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>For WhatsApp Orders use code <strong className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">VOEUX10</strong> for extra discount on all Car Electronics</span>
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Extra 5% off on all Prepaid UPI</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  window.open(product.flipkartUrl || 'https://www.flipkart.com/search?q=VOEUX+car+electronics', '_blank');
                }}
                className="w-full bg-[#2874F0] hover:bg-[#1C5CBD] text-white text-xs sm:text-sm font-extrabold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="bg-yellow-400 text-[#2874F0] font-black text-xs px-2 py-0.5 rounded italic leading-none shadow-sm">f</span>
                <span>BUY NOW ON FLIPKART</span>
              </button>

              <button
                onClick={() => {
                  const waText = encodeURIComponent(`Hi VOEUX, I am interested to know more details about ${product.name}`);
                  window.open(`https://wa.me/919999484530?text=${waText}`, '_blank');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Query on WhatsApp</span>
              </button>
            </div>

            {/* Noise-Style Accordions (Description, Key Features, Specifications) */}
            <div className="pt-4 border-t border-gray-200 divide-y divide-gray-200">
              
              {/* Description Accordion */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex items-center justify-between font-bold text-sm text-gray-900 text-left cursor-pointer"
                >
                  <span>Description</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.description ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.description && (
                  <div className="pt-3 text-xs text-gray-600 leading-relaxed font-medium">
                    {product.description}
                  </div>
                )}
              </div>

              {/* Key Features Accordion */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('features')}
                  className="w-full flex items-center justify-between font-bold text-sm text-gray-900 text-left cursor-pointer"
                >
                  <span>Key Features</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.features ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.features && (
                  <ul className="pt-3 space-y-2 text-xs text-gray-700 font-medium">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3B429F] mt-1.5 shrink-0"></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Specifications Accordion */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('specs')}
                  className="w-full flex items-center justify-between font-bold text-sm text-gray-900 text-left cursor-pointer"
                >
                  <span>Specifications</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.specs ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.specs && (
                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.fullSpecs).map(([k, v]) => (
                      <div key={k} className="py-1.5 border-b border-gray-100 flex justify-between gap-3">
                        <span className="text-gray-500 font-medium">{k}</span>
                        <span className="font-semibold text-gray-900 text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* FAQs Dropdown Section */}
        <div className="border-t border-gray-200 pt-12 text-left space-y-6">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#3B429F] uppercase">Help & Support</span>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-0.5">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {[
              {
                q: 'How do I register for the 1-Year Official Warranty?',
                a: 'You can register your warranty in under 60 seconds! Click on "Register Warranty" in the main menu, enter your Certificate ID or Order ID, select your purchase date and email. We will generate your official Warranty Certificate and send it directly to your email.'
              },
              {
                q: 'Is this product compatible with my car model?',
                a: 'VOEUX Android Players and Car Amplifiers are designed with Double DIN universal fitment standards. They fit standard dashboard slots for Maruti, Hyundai, Tata, Kia, Mahindra, Honda, Toyota and other major car manufacturers across India.'
              },
              {
                q: 'What is included in the box?',
                a: 'Each product package includes the main VOEUX hardware unit, complete plug-and-play wiring harness, GPS Antenna (for Android players), AHD Rear View Night-Vision Camera, mounting accessories, and warranty documentation.'
              },
              {
                q: 'How do shipping, delivery and replacement work?',
                a: 'We offer Free Express Delivery across India via reliable logistics partners. All products are backed by a 7-Day Hassle-Free Replacement Guarantee and 1-Year Official Warranty.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between font-bold text-sm text-gray-900 text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#3B429F] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaqs[idx] ? 'rotate-180' : ''}`} />
                </button>
                {openFaqs[idx] && (
                  <p className="pt-2 pl-6 text-xs text-gray-600 font-medium leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed Products Section */}
        {recentlyViewed && recentlyViewed.filter(p => p && p.id !== product.id).length > 0 && (
          <div className="border-t border-gray-200 pt-12 text-left space-y-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#3B429F] uppercase">Browsing History</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-0.5">Recently Viewed Products</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.filter(p => p && p.id !== product.id).slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* High-Resolution Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200 select-none"
        >
          {/* Top Bar with Title & Close Button */}
          <div className="w-full flex items-center justify-between z-10 text-white pb-4 border-b border-gray-800">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{product.name}</h3>
              <p className="text-xs text-gray-400">High-Resolution Zoomed View</p>
            </div>

            <button
              onClick={() => setIsZoomOpen(false)}
              className="p-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 transition"
              aria-label="Close Zoom View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Main Zoomed Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center py-4"
          >
            <img
              src={selectedImg}
              alt={product.name}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />

            {/* Prev & Next Controls if Gallery has multiple items */}
            {product.gallery.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = product.gallery.indexOf(selectedImg);
                    const prevIdx = (currentIdx - 1 + product.gallery.length) % product.gallery.length;
                    setSelectedImg(product.gallery[prevIdx]);
                  }}
                  className="absolute left-2 sm:left-6 p-3 rounded-full bg-gray-900/90 hover:bg-gray-800 text-white border border-gray-700 transition flex items-center justify-center shadow-xl"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = product.gallery.indexOf(selectedImg);
                    const nextIdx = (currentIdx + 1) % product.gallery.length;
                    setSelectedImg(product.gallery[nextIdx]);
                  }}
                  className="absolute right-2 sm:right-6 p-3 rounded-full bg-gray-900/90 hover:bg-gray-800 text-white border border-gray-700 transition flex items-center justify-center shadow-xl"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Gallery Thumbnails */}
          {product.gallery.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-3 overflow-x-auto pt-4 max-w-full"
            >
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImg === img ? 'border-cyan-400 shadow-lg ring-2 ring-cyan-400/40' : 'border-gray-800 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
