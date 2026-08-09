import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Star,
  ShoppingCart,
  ShieldCheck,
  RotateCw,
  Truck,
  RefreshCw,
  Tag,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ThumbsUp,
  CheckCircle,
  ArrowLeft,
  MessageSquare,
  ZoomIn,
  X
} from 'lucide-react';

export const ProductDetailPage = () => {
  const {
    selectedProductModal,
    setActivePage,
    addToCart,
    setIsCartOpen
  } = useShop();

  const product = selectedProductModal;

  const [selectedImg, setSelectedImg] = useState(product?.image || '');
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');
  const [isZoomOpen, setIsZoomOpen] = useState(false);

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
            
            {/* Main Image Viewport - Seamless Fitted Design */}
            <div
              onClick={() => !is360Mode && setIsZoomOpen(true)}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center group shadow-md cursor-pointer"
            >
              
              {/* 360 Spin View Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIs360Mode(!is360Mode);
                }}
                className={`absolute top-4 left-4 z-10 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-2 transition ${
                  is360Mode ? 'bg-[#3B429F] text-white shadow-md' : 'bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 shadow-sm'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${is360Mode ? 'animate-spin' : ''}`} />
                <span>{is360Mode ? '360° Drag Active' : '360° Spin View'}</span>
              </button>

              {/* Zoom Pill Indicator */}
              {!is360Mode && (
                <div className="absolute bottom-3 right-3 z-10 bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-700 backdrop-blur-sm shadow-sm group-hover:scale-105 transition">
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
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
                    className="w-full h-full object-cover"
                  />
                  <p className="absolute bottom-3 text-xs text-white bg-slate-900/95 px-4 py-1 rounded-full border border-slate-700 shadow-sm font-semibold">
                    ← Drag left or right to rotate product 360° →
                  </p>
                </div>
              ) : (
                <img
                  src={selectedImg}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

          {/* Right Column: Title, Noise Pricing, Offers & Buy Action */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Category & Title */}
            <div className="space-y-2">
              <span className="badge-minimal">OFFICIAL VOEUX® FLAGSHIP</span>
              
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>



            {/* Exclusive Offers Box */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-1.5 text-xs text-gray-800">
              <div className="font-bold text-gray-900">Exclusive Offers</div>
              <div className="space-y-1 text-xs font-medium text-gray-700">
                <p>For WhatsApp Orders use code <strong className="text-gray-900 bg-gray-200 px-2 py-0.5 rounded font-mono">VOEUX10</strong> for extra discount on all Car Electronics</p>
                <p>Extra 5% off on all Prepaid UPI</p>
              </div>
            </div>

            {/* Short Specs Quick Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {product.shortSpecs.map((spec, i) => (
                <span key={i} className="bg-gray-100 text-gray-800 font-semibold px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3B429F]" /> {spec}
                </span>
              ))}
            </div>

            {/* Flipkart Buy Action & WhatsApp Query */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => {
                  window.open(product.flipkartUrl || 'https://www.flipkart.com/search?q=VOEUX+car+electronics', '_blank');
                }}
                className="w-full bg-[#2874F0] hover:bg-[#1C5CBD] text-white text-sm sm:text-base font-extrabold py-4 rounded-xl transition flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20"
              >
                <span className="bg-yellow-400 text-[#2874F0] font-black text-xs px-2 py-0.5 rounded italic leading-none shadow-sm">f</span>
                <span>BUY NOW ON FLIPKART</span>
              </button>

              <button
                onClick={() => {
                  const waText = encodeURIComponent(`Hi VOEUX, I am interested to know more details about ${product.name}`);
                  window.open(`https://wa.me/919999484530?text=${waText}`, '_blank');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Query on WhatsApp</span>
              </button>
            </div>

          </div>

        </div>

        {/* Detailed Full-Width Tabs Section */}
        <div className="border-t border-gray-200 pt-10 space-y-8 text-xs text-left">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 gap-8 font-bold text-sm">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 border-b-2 transition ${activeTab === 'specs' ? 'border-[#3B429F] text-[#3B429F]' : 'border-transparent text-gray-500'}`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-3 border-b-2 transition ${activeTab === 'features' ? 'border-[#3B429F] text-[#3B429F]' : 'border-transparent text-gray-500'}`}
            >
              Key Features
            </button>
          </div>

          {/* Tab Content Panels */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(product.fullSpecs).map(([k, v]) => (
                <div key={k} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center gap-4">
                  <span className="font-bold text-gray-500 uppercase text-xs">{k}</span>
                  <span className="font-semibold text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'features' && (
            <ul className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-xs">
              {product.features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-gray-800 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{f}</span>
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
