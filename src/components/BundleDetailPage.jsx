import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  ArrowLeft, ShoppingCart, MessageSquare, ShieldCheck, RefreshCw, Truck, 
  ChevronDown, Package, Radio, Volume2, Layers, CheckCircle2, ChevronRight, 
  Sparkles, Check, Info, Sliders, ExternalLink 
} from 'lucide-react';

export const BundleDetailPage = ({ bundle }) => {
  const { setActivePage, addToCart, setIsCartOpen, productsList, user, setIsAuthModalOpen, buyNowCheckout, addToast } = useShop();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [speakerVariant, setSpeakerVariant] = useState('all-6'); // 'all-6', 'all-6.5', 'mix'
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('2026');
  const specsRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [bundle]);

  if (!bundle) return null;

  const playerProduct = productsList.find(p => p.id === bundle.bundleConfig.player) || {};
  const speaker6 = productsList.find(p => p.id === 'voeux-svx001-6inch-speakers') || {};
  const speaker65 = productsList.find(p => p.id === 'voeux-svx005-6-5inch-speakers') || {};

  // Calculate pricing based on speaker variant
  const playerMrp = playerProduct.originalPrice || 0;
  const speaker6Mrp = speaker6.originalPrice || 6999;
  const speaker65Mrp = speaker65.originalPrice || 8500;

  let finalPrice = bundle.price;
  let finalMrp = bundle.originalPrice;

  if (bundle.id === 'bundle-ts7-4-speakers-frame') {
    if (speakerVariant === 'all-6') {
      finalPrice = 10999;
      finalMrp = playerMrp + (speaker6Mrp * 2);
    } else if (speakerVariant === 'all-6.5') {
      finalPrice = 12199;
      finalMrp = playerMrp + (speaker65Mrp * 2);
    } else if (speakerVariant === 'mix') {
      finalPrice = 11599;
      finalMrp = playerMrp + speaker6Mrp + speaker65Mrp;
    }
  } else if (bundle.id === 'bundle-single-knob-4-speakers-frame') {
    if (speakerVariant === 'all-6') {
      finalPrice = 13999;
      finalMrp = playerMrp + (speaker6Mrp * 2);
    } else if (speakerVariant === 'all-6.5') {
      finalPrice = 16399;
      finalMrp = playerMrp + (speaker65Mrp * 2);
    } else if (speakerVariant === 'mix') {
      finalPrice = 15199;
      finalMrp = playerMrp + speaker6Mrp + speaker65Mrp;
    }
  } else {
    // X80 bundle (keeping user's exact requested MRPs)
    if (speakerVariant === 'all-6') {
      finalPrice = 13999;
      finalMrp = 54997;
    } else if (speakerVariant === 'all-6.5') {
      finalPrice = 16399;
      finalMrp = 57999;
    } else if (speakerVariant === 'mix') {
      finalPrice = 15199;
      finalMrp = 56498;
    }
  }

  const handleAddToCart = () => {
    if (!carMake.trim() || !carModel.trim()) {
      addToast('Please enter your car Make and Model for the custom fitting frame.', 'error');
      return;
    }
    const cartItem = {
      ...bundle,
      price: finalPrice,
      originalPrice: finalMrp,
      selectedVariant: speakerVariant,
      carMake,
      carModel,
      carYear,
      noCouponAllowed: true
    };
    addToCart(cartItem, 1);
    setIsCartOpen(true);
  };

  const handleBuyNowCheckout = () => {
    if (!carMake.trim() || !carModel.trim()) {
      addToast('Please enter your car Make and Model for the custom fitting frame.', 'error');
      return;
    }
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const cartItem = {
      ...bundle,
      price: finalPrice,
      originalPrice: finalMrp,
      selectedVariant: speakerVariant,
      carMake,
      carModel,
      carYear,
      noCouponAllowed: true
    };
    buyNowCheckout(cartItem);
  };

  const getPriceForVariant = (variant) => {
    if (bundle.id === 'bundle-ts7-4-speakers-frame') {
      if (variant === 'all-6') return 10999;
      if (variant === 'all-6.5') return 12199;
      return 11599;
    } else if (bundle.id === 'bundle-single-knob-4-speakers-frame') {
      if (variant === 'all-6') return 13999;
      if (variant === 'all-6.5') return 16399;
      return 15199;
    } else {
      if (variant === 'all-6') return 13999;
      if (variant === 'all-6.5') return 16399;
      return 15199;
    }
  };

  const bundleItems = [
    {
      id: 'overview',
      shortTitle: 'Bundle Overview',
      tag: 'Summary',
      title: 'Complete Audio Package Overview',
      subtitle: "What's in the box, specs & warranty highlights",
      icon: Package,
      image: bundle.image
    },
    {
      id: 'player',
      shortTitle: 'Android Stereo',
      tag: 'Head Unit',
      title: playerProduct?.name || 'Voeux Android Car Stereo',
      subtitle: 'IPS Touchscreen, DSP & CarPlay / Android Auto',
      icon: Radio,
      image: playerProduct?.image
    },
    {
      id: 'speakers',
      shortTitle: 'Car Speakers',
      tag: speakerVariant === 'all-6' ? '4x 6" High-Bass' : speakerVariant === 'all-6.5' ? '4x 6.5" High-Bass' : '2x 6" + 2x 6.5"',
      title: speakerVariant === 'all-6' ? speaker6?.name : speakerVariant === 'all-6.5' ? speaker65?.name : 'Mixed High-Bass Speakers',
      subtitle: '380W High-Bass 2-Way Coaxial Speakers',
      icon: Volume2,
      image: speaker6?.image || speaker65?.image
    },
    {
      id: 'frame',
      shortTitle: 'Fitting Frame',
      tag: 'OEM Fit',
      title: 'Custom Fitting Frame',
      subtitle: carMake && carModel ? `Customized for ${carMake} ${carModel} (${carYear})` : 'Vehicle-specific ABS fascia frame',
      icon: Layers,
      image: null
    }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (specsRef.current) {
      specsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        
        {/* Back Button */}
        <button 
          onClick={() => setActivePage('bundles')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#3B429F] transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bundles
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-6 space-y-6">
            <div className="aspect-square w-full bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center p-4 relative group">
              <span className="absolute top-4 left-4 bg-[#3B429F] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow-lg flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Bundle Offer
              </span>
              <img 
                src={bundle.image} 
                alt={bundle.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {bundle.name}
            </h1>
            
            <div className="space-y-2 py-4 border-y border-gray-200">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#3B429F]">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-base text-gray-400 line-through">
                  ₹{finalMrp.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">(MRP Inclusive of all taxes)</p>
            </div>

            {/* Speaker Variant Selector */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-900">Select Speaker Variant</label>
              <div className="grid grid-cols-1 gap-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${speakerVariant === 'all-6' ? 'bg-indigo-50 border-[#3B429F]' : 'bg-white border-gray-200'}`}>
                  <input type="radio" name="speaker" value="all-6" checked={speakerVariant === 'all-6'} onChange={(e) => setSpeakerVariant(e.target.value)} className="text-[#3B429F]" />
                  <span className="text-sm font-semibold text-gray-800">4x 6-Inch Speakers (₹{getPriceForVariant('all-6').toLocaleString('en-IN')})</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${speakerVariant === 'all-6.5' ? 'bg-indigo-50 border-[#3B429F]' : 'bg-white border-gray-200'}`}>
                  <input type="radio" name="speaker" value="all-6.5" checked={speakerVariant === 'all-6.5'} onChange={(e) => setSpeakerVariant(e.target.value)} className="text-[#3B429F]" />
                  <span className="text-sm font-semibold text-gray-800">4x 6.5-Inch Speakers (₹{getPriceForVariant('all-6.5').toLocaleString('en-IN')})</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${speakerVariant === 'mix' ? 'bg-indigo-50 border-[#3B429F]' : 'bg-white border-gray-200'}`}>
                  <input type="radio" name="speaker" value="mix" checked={speakerVariant === 'mix'} onChange={(e) => setSpeakerVariant(e.target.value)} className="text-[#3B429F]" />
                  <span className="text-sm font-semibold text-gray-800">2x 6-Inch + 2x 6.5-Inch Speakers (₹{getPriceForVariant('mix').toLocaleString('en-IN')})</span>
                </label>
              </div>
            </div>

            {/* Frame Car Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
              <p className="text-sm font-bold text-gray-900">Custom Fitting Frame Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Make / Brand</label>
                  <input type="text" value={carMake} onChange={(e) => setCarMake(e.target.value)} placeholder="e.g. Hyundai" className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Model</label>
                  <input type="text" value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder="e.g. Creta" className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Year</label>
                  <select value={carYear} onChange={(e) => setCarYear(e.target.value)} className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white">
                    {Array.from({length: 27}, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <div className="flex gap-2">
                <button
                  onClick={handleBuyNowCheckout}
                  className="flex-1 bg-[#3B429F] hover:bg-[#2B308B] active:bg-[#20246B] text-white text-xs sm:text-sm font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-indigo-900/20 cursor-pointer text-center"
                >
                  Buy Now
                </button>

                <button
                  onClick={handleAddToCart}
                  className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B429F]" />
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>
              </div>

              <button
                onClick={() => {
                  const waText = encodeURIComponent(`hi i have a query regarding the voeux bundle offer`);
                  window.open(`https://wa.me/919999484530?text=${waText}`, '_blank');
                }}
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tabs / Bundle Breakdown Section */}
        <div ref={specsRef} className="mt-14 border-t border-gray-200 pt-8 scroll-mt-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-[#3B429F]">
                  <Package className="w-5 h-5" />
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Bundle Overview & Inclusions
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Tap any product card below to view full specifications, photos & features
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B429F] bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-[#3B429F]" />
              Tap item to inspect
            </span>
          </div>

          {/* Interactive Item Cards (Mobile & Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {bundleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  type="button"
                  className={`text-left rounded-2xl p-4 transition-all relative flex flex-col justify-between cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-50/90 to-white border-[#3B429F] shadow-md shadow-indigo-900/10 ring-2 ring-[#3B429F]/20'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 active:scale-[0.98]'
                  }`}
                >
                  {/* Top Bar: Tag & State */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                      isActive ? 'bg-[#3B429F] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.tag}
                    </span>

                    {isActive ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#3B429F] bg-indigo-100/70 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Viewing Specs
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-gray-400">
                        Tap for specs
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </span>
                    )}
                  </div>

                  {/* Middle: Thumbnail/Icon & Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                      ) : (
                        <Icon className="w-7 h-7 text-[#3B429F]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium mt-1 line-clamp-1">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Bottom indicator strip */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className={`font-semibold ${isActive ? 'text-[#3B429F]' : 'text-gray-500'}`}>
                      {item.shortTitle}
                    </span>
                    <span className={`text-[10px] font-bold ${isActive ? 'text-[#3B429F]' : 'text-gray-400'}`}>
                      {isActive ? 'Details below ↓' : 'Click to inspect'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Horizontal Pill Switcher for Fast Tab Toggling */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-200 mb-6">
            {bundleItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  type="button"
                  className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive 
                      ? 'bg-[#3B429F] text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.shortTitle}</span>
                </button>
              );
            })}
          </div>

          <div className="py-4">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description & Key Value Proposition */}
                <div className="bg-gradient-to-br from-indigo-50/50 via-white to-gray-50 p-6 rounded-2xl border border-indigo-100/60">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3B429F] bg-white border border-indigo-100 px-3 py-1 rounded-full">
                    Package Summary
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-3 mb-2">
                    Everything You Need for a Complete Audio & Display Upgrade
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {bundle.description}
                  </p>
                </div>

                {/* What's in the Box Interactive Explorer Cards */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    What's Included in the Box
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Item 1: Android Player */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <img src={playerProduct?.image || bundle.image} alt="Stereo" className="w-12 h-12 object-contain bg-gray-50 rounded-lg p-1 border border-gray-100" />
                          <div>
                            <span className="text-[10px] font-extrabold text-[#3B429F] uppercase">1x Head Unit</span>
                            <h5 className="text-xs font-bold text-gray-900 line-clamp-1">{playerProduct?.name || 'Android Stereo'}</h5>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">Touchscreen display, AHD rear camera & full plug-and-play harness included.</p>
                      </div>
                      <button 
                        onClick={() => handleSelectTab('player')} 
                        className="text-xs font-bold text-[#3B429F] hover:text-[#2B308B] flex items-center justify-between pt-2 border-t border-gray-100 cursor-pointer w-full text-left"
                      >
                        <span>View Stereo Specs</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Item 2: Speakers */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <img src={speaker6?.image || speaker65?.image} alt="Speakers" className="w-12 h-12 object-contain bg-gray-50 rounded-lg p-1 border border-gray-100" />
                          <div>
                            <span className="text-[10px] font-extrabold text-[#3B429F] uppercase">4x Car Speakers</span>
                            <h5 className="text-xs font-bold text-gray-900 line-clamp-1">
                              {speakerVariant === 'all-6' ? '4x 6" Speakers' : speakerVariant === 'all-6.5' ? '4x 6.5" Speakers' : '2x 6" + 2x 6.5" Speakers'}
                            </h5>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">380W High Bass 2-Way Coaxial speakers with heavy magnets.</p>
                      </div>
                      <button 
                        onClick={() => handleSelectTab('speakers')} 
                        className="text-xs font-bold text-[#3B429F] hover:text-[#2B308B] flex items-center justify-between pt-2 border-t border-gray-100 cursor-pointer w-full text-left"
                      >
                        <span>View Speaker Specs</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Item 3: Frame */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-indigo-50 text-[#3B429F] rounded-lg flex items-center justify-center border border-indigo-100 shrink-0">
                            <Layers className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold text-[#3B429F] uppercase">1x Dashboard Frame</span>
                            <h5 className="text-xs font-bold text-gray-900 line-clamp-1">Custom Fit OEM Frame</h5>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">
                          {carMake && carModel ? `Configured for ${carMake} ${carModel}` : 'Molded ABS plastic frame tailored to your vehicle.'}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleSelectTab('frame')} 
                        className="text-xs font-bold text-[#3B429F] hover:text-[#2B308B] flex items-center justify-between pt-2 border-t border-gray-100 cursor-pointer w-full text-left"
                      >
                        <span>View Fitment Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bundle Features Checklist */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                    Key Highlights & Features
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 font-medium">
                    {bundle.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-100">
                        <CheckCircle2 className="w-4 h-4 text-[#3B429F] mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Peace of Mind Guarantee Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <ShieldCheck className="w-6 h-6 text-[#3B429F] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">1-Year Warranty</p>
                      <p className="text-[11px] text-gray-500">Pan-India warranty coverage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <RefreshCw className="w-6 h-6 text-[#3B429F] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Plug & Play Install</p>
                      <p className="text-[11px] text-gray-500">Coupler fitment, no wire splicing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <Truck className="w-6 h-6 text-[#3B429F] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Safe Express Shipping</p>
                      <p className="text-[11px] text-gray-500">Insured express courier</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'player' && playerProduct && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-gradient-to-br from-indigo-50/60 to-white p-6 rounded-2xl border border-indigo-100">
                  <img 
                    src={playerProduct.image} 
                    alt={playerProduct.name} 
                    className="w-36 sm:w-44 h-36 sm:h-44 object-contain rounded-2xl bg-white border border-gray-200 p-3" 
                  />
                  <div className="text-center sm:text-left flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#3B429F] bg-white border border-indigo-100 px-3 py-1 rounded-full">
                      Included Android Stereo
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-gray-900 mt-2">{playerProduct.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed font-medium">{playerProduct.description}</p>
                    
                    {playerProduct.features && playerProduct.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4 justify-center sm:justify-start">
                        {playerProduct.features.slice(0, 4).map((feat, idx) => (
                          <span key={idx} className="text-[11px] font-semibold bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-lg">
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(playerProduct.fullSpecs || {}).map(([k, v]) => (
                      <div key={k} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">{k}</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'speakers' && (
              <div className="space-y-6">
                <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-[#3B429F]" />
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Currently Selected: <span className="text-[#3B429F]">{speakerVariant === 'all-6' ? '4x 6-Inch Speakers' : speakerVariant === 'all-6.5' ? '4x 6.5-Inch Speakers' : '2x 6-Inch + 2x 6.5-Inch Speakers'}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500">
                    You can switch variant in the options above
                  </span>
                </div>

                {speakerVariant === 'mix' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 6-Inch Column */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center mb-4">
                          <img src={speaker6.image} alt={speaker6.name} className="max-h-48 object-contain" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-[#3B429F] tracking-wider">Front Doors (2 Units)</span>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">2x {speaker6.name}</h3>
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{speaker6.description}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-4 pt-4 border-t border-gray-100">
                        {Object.entries(speaker6.fullSpecs || {}).map(([k, v]) => (
                          <div key={k} className="p-2.5 bg-gray-50 rounded-lg flex justify-between items-center text-xs">
                            <span className="text-[10px] uppercase font-bold text-gray-400">{k}</span>
                            <span className="font-bold text-gray-900 text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 6.5-Inch Column */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center mb-4">
                          <img src={speaker65.image} alt={speaker65.name} className="max-h-48 object-contain" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-[#3B429F] tracking-wider">Rear Doors / Parcel Tray (2 Units)</span>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">2x {speaker65.name}</h3>
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{speaker65.description}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-4 pt-4 border-t border-gray-100">
                        {Object.entries(speaker65.fullSpecs || {}).map(([k, v]) => (
                          <div key={k} className="p-2.5 bg-gray-50 rounded-lg flex justify-between items-center text-xs">
                            <span className="text-[10px] uppercase font-bold text-gray-400">{k}</span>
                            <span className="font-bold text-gray-900 text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {speakerVariant === 'all-6' ? (
                      <>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-gradient-to-br from-indigo-50/60 to-white p-6 rounded-2xl border border-indigo-100">
                          <img src={speaker6.image} alt={speaker6.name} className="w-36 sm:w-44 h-36 sm:h-44 object-contain rounded-2xl bg-white border border-gray-200 p-3" />
                          <div className="text-center sm:text-left flex-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#3B429F] bg-white border border-indigo-100 px-3 py-1 rounded-full">
                              Set of 4 Speakers Included
                            </span>
                            <h3 className="text-lg sm:text-2xl font-black text-gray-900 mt-2">4x {speaker6.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed font-medium">{speaker6.description}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Speaker Specifications</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(speaker6.fullSpecs || {}).map(([k, v]) => (
                              <div key={k} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">{k}</span>
                                <span className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-gradient-to-br from-indigo-50/60 to-white p-6 rounded-2xl border border-indigo-100">
                          <img src={speaker65.image} alt={speaker65.name} className="w-36 sm:w-44 h-36 sm:h-44 object-contain rounded-2xl bg-white border border-gray-200 p-3" />
                          <div className="text-center sm:text-left flex-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#3B429F] bg-white border border-indigo-100 px-3 py-1 rounded-full">
                              Set of 4 Speakers Included
                            </span>
                            <h3 className="text-lg sm:text-2xl font-black text-gray-900 mt-2">4x {speaker65.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed font-medium">{speaker65.description}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Speaker Specifications</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(speaker65.fullSpecs || {}).map(([k, v]) => (
                              <div key={k} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">{k}</span>
                                <span className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'frame' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50/60 to-white p-6 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="p-2 rounded-xl bg-white text-[#3B429F] border border-indigo-100">
                      <Layers className="w-6 h-6" />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#3B429F]">Vehicle Fitment</span>
                      <h3 className="text-lg sm:text-xl font-black text-gray-900">Custom Dashboard Fitting Frame</h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed font-medium mt-2">
                    This bundle includes a precision, custom-molded ABS plastic fascia frame specifically chosen for your vehicle make and model. It guarantees a flawless factory-fit finish with zero gaps or dashboard rattling.
                  </p>

                  <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-400">Selected Vehicle</span>
                        <p className="text-sm font-extrabold text-gray-900">
                          {carMake && carModel ? `${carMake} ${carModel} (${carYear})` : 'Vehicle Not Specified Yet'}
                        </p>
                      </div>
                      {(!carMake || !carModel) ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                          Please enter your Make & Model above
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Frame Matched
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-900 mb-1">OEM Factory Styling</h5>
                    <p className="text-xs text-gray-500">Molded to duplicate the car dashboard contours and color texture.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-900 mb-1">High-Grade ABS</h5>
                    <p className="text-xs text-gray-500">Heat-resistant, UV-stabilized plastic built to withstand Indian summers.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-900 mb-1">Zero Dashboard Cutting</h5>
                    <p className="text-xs text-gray-500">Mounts directly using factory screw points and clips.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
