import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { CAR_MODELS } from '../data/products';
import {
  X,
  Star,
  ShoppingCart,
  ShieldCheck,
  CheckCircle,
  RotateCw,
  Truck,
  RefreshCw,
  Tag,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ZoomIn
} from 'lucide-react';

export const ProductDetailModal = () => {
  const {
    selectedProductModal,
    setSelectedProductModal,
    addToCart,
    setIsCartOpen
  } = useShop();

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const [selectedImg, setSelectedImg] = useState(product.image);
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [checkMake, setCheckMake] = useState('Hyundai');
  const [checkModel, setCheckModel] = useState('Creta');
  const [checkYear, setCheckYear] = useState('2022');
  const [activeTab, setActiveTab] = useState('specs');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
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
            
            {/* Image Box - Seamless Fitted Design */}
            <div
              onClick={() => !is360Mode && setIsZoomOpen(true)}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center group shadow-md cursor-pointer"
            >
              
              {/* 360 Spin Viewer Toggle Pill */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIs360Mode(!is360Mode);
                }}
                className={`absolute top-3 left-3 z-10 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition shadow-sm ${
                  is360Mode ? 'bg-[#3B429F] text-white shadow-indigo-900/40' : 'bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${is360Mode ? 'animate-spin' : ''}`} />
                <span>{is360Mode ? '360° Drag Mode Active' : '360° Interactive Spin'}</span>
              </button>

              {/* Zoom Pill Indicator */}
              {!is360Mode && (
                <div className="absolute bottom-2 right-2 z-10 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-700 backdrop-blur-sm shadow-sm group-hover:scale-105 transition">
                  <ZoomIn className="w-3 h-3 text-cyan-400" />
                  <span>Click to Zoom</span>
                </div>
              )}

              {/* Badge Tag */}
              {product.badge && (
                <span className="absolute top-3 right-3 z-10 bg-slate-900 text-yellow-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider border border-yellow-400/30">
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
                    className="w-full h-full object-cover"
                  />
                  <p className="absolute bottom-2 text-[10px] text-white bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700 shadow-sm font-semibold">
                    ← Drag left or right to rotate →
                  </p>
                </div>
              ) : (
                <img src={selectedImg} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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

            {/* Noise-Style Trust Features Grid */}
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

          </div>

          {/* Right Column: Noise Product Info, Pricing & Buy Section */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Title & Reviews */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3B429F] bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                OFFICIAL VOEUX® PRODUCT
              </span>
              
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <div className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded flex items-center gap-1">
                  <span>{product.rating}</span>
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {product.reviewsCount} Verified Buyer Reviews
                </span>
              </div>
            </div>

            {/* Noise Price Box */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1 shadow-md">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="bg-emerald-500 text-black text-xs font-extrabold px-2 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Inclusive of all taxes • Instant Dispatch</p>
            </div>



            {/* Exclusive Offers Box */}
            <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl space-y-1 text-xs text-gray-800">
              <div className="font-bold text-gray-900">Exclusive Offers</div>
              <div className="space-y-0.5 text-[11px] font-medium text-gray-700">
                <p>For WhatsApp Orders use code <strong className="text-gray-900 bg-gray-200 px-1.5 py-0.5 rounded font-mono">VOEUX10</strong> for extra discount on all Car Electronics</p>
                <p>Extra 5% off on all Prepaid UPI</p>
              </div>
            </div>

            {/* Specs Quick Pills */}
            <div className="flex flex-wrap gap-2 text-[11px]">
              {product.shortSpecs.map((spec, i) => (
                <span key={i} className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#3B429F]" /> {spec}
                </span>
              ))}
            </div>

            {/* Vehicle Compatibility Checker */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <p className="font-bold text-gray-900">Check Vehicle Fitment:</p>
              <div className="grid grid-cols-3 gap-2">
                <select value={checkMake} onChange={e => setCheckMake(e.target.value)} className="bg-white border rounded-lg p-2 text-xs font-semibold">
                  {CAR_MODELS.map(c => <option key={c.make} value={c.make}>{c.make}</option>)}
                </select>
                <select value={checkModel} onChange={e => setCheckModel(e.target.value)} className="bg-white border rounded-lg p-2 text-xs font-semibold">
                  {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="text" value={checkYear} onChange={e => setCheckYear(e.target.value)} className="bg-white border rounded-lg p-2 text-xs font-semibold" />
              </div>
              <div className="text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 font-bold text-[11px]">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Guaranteed Fitment for {checkMake} {checkModel} ({checkYear})</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  window.open(product.flipkartUrl || 'https://www.flipkart.com/search?q=VOEUX+car+electronics', '_blank');
                }}
                className="w-full bg-[#2874F0] hover:bg-[#1C5CBD] text-white text-xs sm:text-sm font-extrabold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
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

          </div>

        </div>

        {/* Detailed Noise Tabs Section Below */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-8 space-y-6 text-xs text-left">
          
          {/* Tab Navigation Buttons */}
          <div className="flex border-b border-gray-200 gap-6 font-bold">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2.5 border-b-2 transition ${activeTab === 'specs' ? 'border-[#3B429F] text-[#3B429F]' : 'border-transparent text-gray-500'}`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-2.5 border-b-2 transition ${activeTab === 'features' ? 'border-[#3B429F] text-[#3B429F]' : 'border-transparent text-gray-500'}`}
            >
              Key Features
            </button>
          </div>

          {/* Tab Content Panels */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(product.fullSpecs).map(([k, v]) => (
                <div key={k} className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between gap-4">
                  <span className="font-bold text-gray-500 uppercase text-[10px]">{k}</span>
                  <span className="font-semibold text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'features' && (
            <ul className="space-y-2 bg-white p-5 rounded-2xl border border-gray-200">
              {product.features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

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
