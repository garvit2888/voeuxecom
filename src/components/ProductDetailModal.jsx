import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { CAR_MODELS } from '../data/products';
import {
  X,
  ShieldCheck,
  CheckCircle,
  RotateCw,
  Truck,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MessageSquare,
  ZoomIn,
  HelpCircle
} from 'lucide-react';

export const ProductDetailModal = () => {
  const {
    selectedProductModal,
    setSelectedProductModal
  } = useShop();

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const [selectedImg, setSelectedImg] = useState(product.image);
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [checkMake, setCheckMake] = useState('Hyundai');
  const [checkModel, setCheckModel] = useState('Creta');
  const [checkYear, setCheckYear] = useState('2022');
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const [openAccordions, setOpenAccordions] = useState({
    description: true,
    features: true,
    specs: false
  });

  const [openFaqs, setOpenFaqs] = useState({});

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFaq = (idx) => {
    setOpenFaqs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };
  const availableModels = CAR_MODELS.find(c => c.make === checkMake)?.models || [];

  const handleDrag360 = (e) => {
    if (!is360Mode) return;
    setRotationAngle(prev => (prev + e.movementX * 2) % 360);
  };

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 text-gray-900 max-h-[92vh] flex flex-col">
        
        {/* Top Noise-style Header Bar */}
        <div className="p-3.5 sm:px-6 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-1.5 text-gray-300 text-[11px] truncate">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-gray-500" />
            <span className="capitalize">{product.category.replace('-', ' ')}</span>
            <ChevronRight className="w-3 h-3 text-gray-500" />
            <span className="text-white font-bold truncate">{product.name}</span>
          </div>

          <button
            onClick={() => setSelectedProductModal(null)}
            className="p-1.5 rounded-full bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 transition shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content Container */}
        <div className="overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Gallery, 360 Spin & Trust Badges */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Image Box - Borderless Pure Fitted Design */}
            <div
              onClick={() => !is360Mode && setIsZoomOpen(true)}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center group cursor-pointer"
            >
              
              {/* 360 Spin Viewer Toggle Pill */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIs360Mode(!is360Mode);
                }}
                className={`absolute top-3 left-3 z-10 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition shadow-sm ${
                  is360Mode ? 'bg-[#3B429F] text-white shadow-indigo-900/40' : 'bg-white/95 text-gray-800 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${is360Mode ? 'animate-spin' : ''}`} />
                <span>{is360Mode ? '360° Drag Mode Active' : '360° Interactive Spin'}</span>
              </button>

              {/* Zoom Pill Indicator */}
              {!is360Mode && (
                <div className="absolute bottom-2 right-2 z-10 bg-white/95 text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-gray-200 backdrop-blur-sm shadow-sm group-hover:scale-105 transition">
                  <ZoomIn className="w-3 h-3 text-[#3B429F]" />
                  <span>Click to Zoom</span>
                </div>
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
                  <p className="absolute bottom-2 text-[10px] text-gray-800 bg-white/95 px-3 py-1 rounded-full border border-gray-200 shadow-sm font-semibold">
                    ← Drag left or right to rotate →
                  </p>
                </div>
              ) : (
                <img src={selectedImg} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
              )}
            </div>

            {/* Thumbnail Carousel Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImg(img);
                    setIs360Mode(false);
                  }}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImg === img && !is360Mode ? 'border-[#3B429F] shadow-md ring-2 ring-indigo-200' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Clean Product Info & Pricing */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Title & Short Specs */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3B429F]">
                OFFICIAL VOEUX® PRODUCT
              </span>
              
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                {product.name}
              </h1>

              <p className="text-xs text-gray-600 font-medium pt-0.5">
                {product.shortSpecs.join(' • ')}
              </p>
            </div>

            {/* Price Row */}
            <div className="space-y-1.5 py-3 border-y border-gray-200">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {discountPercent}% off
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium">(MRP Inclusive of all taxes)</p>

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

            {/* Primary Action Buttons */}
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Query on WhatsApp</span>
              </button>
            </div>

            {/* Trust Features Grid (Positioned BELOW Action Buttons) */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-[11px] font-semibold text-gray-700">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-[#3B429F]" />
                <span>1 Year Warranty*</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col items-center gap-1">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                <span>7 Days Replacement</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-[#3B429F]" />
                <span>Free Express Delivery</span>
              </div>
            </div>

            {/* Noise Accordions */}
            <div className="pt-2 border-t border-gray-200 divide-y divide-gray-200">
              
              {/* Description */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex items-center justify-between font-bold text-xs text-gray-900 text-left cursor-pointer"
                >
                  <span>Description</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.description ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.description && (
                  <div className="pt-2 text-xs text-gray-600 leading-relaxed font-medium">
                    {product.description}
                  </div>
                )}
              </div>

              {/* Key Features */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('features')}
                  className="w-full flex items-center justify-between font-bold text-xs text-gray-900 text-left cursor-pointer"
                >
                  <span>Key Features</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.features ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.features && (
                  <ul className="pt-2 space-y-1.5 text-xs text-gray-700 font-medium">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3B429F] mt-1.5 shrink-0"></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Specifications */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('specs')}
                  className="w-full flex items-center justify-between font-bold text-xs text-gray-900 text-left cursor-pointer"
                >
                  <span>Specifications</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.specs ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.specs && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.fullSpecs).map(([k, v]) => (
                      <div key={k} className="py-1 border-b border-gray-100 flex justify-between gap-3">
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

        {/* FAQs Dropdown Section in Modal */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6 space-y-4 text-xs text-left">
          <h3 className="font-extrabold text-sm text-gray-900">Frequently Asked Questions</h3>

          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {(product.category === 'speakers-soundbars' ? [
              {
                q: 'How do I register for the 1-Year Warranty?',
                a: 'Click "Register Warranty" in the menu, enter your Order ID, purchase date and email to receive your official Warranty Certificate.'
              },
              {
                q: 'How do I connect the Soundbar to my TV or phone?',
                a: 'Supports Bluetooth 5.0 wireless, HDMI ARC (for TV remote control), Optical Audio, AUX, and USB media playback.'
              },
              {
                q: 'Can I use this as twin vertical tower speakers?',
                a: 'Yes! Features a 2-in-1 separable design for horizontal soundbar or dual vertical tower speaker setup.'
              },
              {
                q: 'What is included in the box?',
                a: 'Includes VOEUX 160W Convertible Soundbar unit, Subwoofer, Remote Control, 2 Tower Bases, and cables.'
              }
            ] : [
              {
                q: 'How do I register for the 1-Year Warranty?',
                a: 'Click "Register Warranty" in the menu, enter your Order ID, purchase date and email to receive your official Warranty Certificate.'
              },
              {
                q: 'Is this product compatible with my car model?',
                a: 'Designed with Double DIN universal fitment standards for Maruti, Hyundai, Tata, Kia, Mahindra, Honda, Toyota and other major cars.'
              },
              {
                q: 'What is included in the box?',
                a: 'Includes VOEUX hardware unit, plug-and-play harness, GPS Antenna, AHD Rear View Camera, and warranty documents.'
              }
            ]).map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between font-bold text-xs text-gray-900 text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-[#3B429F] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openFaqs[idx] ? 'rotate-180' : ''}`} />
                </button>
                {openFaqs[idx] && (
                  <p className="pt-2 pl-5 text-[11px] text-gray-600 font-medium leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* High-Resolution Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200 select-none"
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
