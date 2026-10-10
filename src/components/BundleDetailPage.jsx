import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowLeft, ShoppingCart, MessageSquare, ShieldCheck, RefreshCw, Truck, ChevronDown, Package } from 'lucide-react';

export const BundleDetailPage = ({ bundle }) => {
  const { setActivePage, addToCart, setIsCartOpen, productsList, user, setIsAuthModalOpen } = useShop();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [speakerVariant, setSpeakerVariant] = useState('all-6'); // 'all-6', 'all-6.5', 'mix'
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('2026');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [bundle]);

  if (!bundle) return null;

  const playerProduct = productsList.find(p => p.id === bundle.bundleConfig.player) || {};
  const speaker6 = productsList.find(p => p.id === 'voeux-svx001-6inch-speakers') || {};
  const speaker65 = productsList.find(p => p.id === 'voeux-svx005-6-5inch-speakers') || {};

  // Calculate pricing based on speaker variant
  let finalPrice = bundle.price;
  let finalMrp = bundle.originalPrice;

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

  const handleBuyNow = () => {
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
    addToCart(cartItem, 1);
    setIsCartOpen(true);
  };

  const tabs = [
    { id: 'overview', label: 'Bundle Overview' },
    { id: 'player', label: playerProduct?.name || 'Android Player' },
    { id: 'speakers', label: speakerVariant === 'all-6' ? speaker6?.name : speakerVariant === 'all-6.5' ? speaker65?.name : 'Mixed Speakers (6" & 6.5")' },
    { id: 'frame', label: 'Custom Fitting Frame' }
  ];

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
            <p className="text-xs text-center text-red-500 font-bold uppercase tracking-widest">* Coupon codes are not applicable on this bundle</p>
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
                  <span className="text-sm font-semibold text-gray-800">4x 6-Inch Speakers (₹13,999)</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${speakerVariant === 'all-6.5' ? 'bg-indigo-50 border-[#3B429F]' : 'bg-white border-gray-200'}`}>
                  <input type="radio" name="speaker" value="all-6.5" checked={speakerVariant === 'all-6.5'} onChange={(e) => setSpeakerVariant(e.target.value)} className="text-[#3B429F]" />
                  <span className="text-sm font-semibold text-gray-800">4x 6.5-Inch Speakers (₹16,399)</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${speakerVariant === 'mix' ? 'bg-indigo-50 border-[#3B429F]' : 'bg-white border-gray-200'}`}>
                  <input type="radio" name="speaker" value="mix" checked={speakerVariant === 'mix'} onChange={(e) => setSpeakerVariant(e.target.value)} className="text-[#3B429F]" />
                  <span className="text-sm font-semibold text-gray-800">2x 6-Inch + 2x 6.5-Inch Speakers (₹15,199)</span>
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
              <button onClick={handleBuyNow} className="w-full bg-[#3B429F] hover:bg-[#2B308B] text-white text-sm font-extrabold py-3.5 rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add Bundle to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tabs Section */}
        <div className="mt-16 border-t border-gray-200 pt-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === tab.id ? 'border-[#3B429F] text-[#3B429F]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{bundle.description}</p>
                <ul className="space-y-2 text-sm text-gray-700 font-medium">
                  {bundle.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3B429F] mt-1.5 shrink-0"></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'player' && playerProduct && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <img src={playerProduct.image} alt={playerProduct.name} className="w-full sm:w-32 h-auto sm:h-32 object-contain rounded-xl bg-white border border-gray-200 p-2" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{playerProduct.name}</h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{playerProduct.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(playerProduct.fullSpecs || {}).map(([k, v]) => (
                    <div key={k} className="py-2 border-b border-gray-100">
                      <span className="block text-[10px] uppercase font-bold text-gray-400">{k}</span>
                      <span className="block text-sm font-semibold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'speakers' && (
              <div className="space-y-8">
                {speakerVariant === 'mix' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 6-Inch Column */}
                    <div className="space-y-6">
                      <div className="flex flex-col items-start gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 h-full">
                        <img src={speaker6.image} alt={speaker6.name} className="w-full max-w-[200px] mx-auto h-auto object-contain rounded-xl bg-white border border-gray-200 p-2" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 text-center">2x {speaker6.name}</h3>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{speaker6.description}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 w-full mt-4">
                          {Object.entries(speaker6.fullSpecs || {}).map(([k, v]) => (
                            <div key={k} className="py-2 border-b border-gray-100">
                              <span className="block text-[10px] uppercase font-bold text-gray-400">{k}</span>
                              <span className="block text-sm font-semibold text-gray-900">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* 6.5-Inch Column */}
                    <div className="space-y-6">
                      <div className="flex flex-col items-start gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 h-full">
                        <img src={speaker65.image} alt={speaker65.name} className="w-full max-w-[200px] mx-auto h-auto object-contain rounded-xl bg-white border border-gray-200 p-2" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 text-center">2x {speaker65.name}</h3>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{speaker65.description}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 w-full mt-4">
                          {Object.entries(speaker65.fullSpecs || {}).map(([k, v]) => (
                            <div key={k} className="py-2 border-b border-gray-100">
                              <span className="block text-[10px] uppercase font-bold text-gray-400">{k}</span>
                              <span className="block text-sm font-semibold text-gray-900">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {speakerVariant === 'all-6' ? (
                      <>
                        <div className="flex flex-col sm:flex-row items-start gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <img src={speaker6.image} alt={speaker6.name} className="w-full sm:w-32 h-auto sm:h-32 object-contain rounded-xl bg-white border border-gray-200 p-2" />
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">4x {speaker6.name}</h3>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{speaker6.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(speaker6.fullSpecs || {}).map(([k, v]) => (
                            <div key={k} className="py-2 border-b border-gray-100">
                              <span className="block text-[10px] uppercase font-bold text-gray-400">{k}</span>
                              <span className="block text-sm font-semibold text-gray-900">{v}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row items-start gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <img src={speaker65.image} alt={speaker65.name} className="w-full sm:w-32 h-auto sm:h-32 object-contain rounded-xl bg-white border border-gray-200 p-2" />
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">4x {speaker65.name}</h3>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{speaker65.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(speaker65.fullSpecs || {}).map(([k, v]) => (
                            <div key={k} className="py-2 border-b border-gray-100">
                              <span className="block text-[10px] uppercase font-bold text-gray-400">{k}</span>
                              <span className="block text-sm font-semibold text-gray-900">{v}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'frame' && (
              <div className="space-y-4 max-w-2xl">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-black text-gray-900 mb-2">Custom Dashboard Fitting Frame</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This bundle includes a custom-molded ABS plastic fitting frame specifically designed for your vehicle's make and model. This ensures the Android player sits flush against your dashboard just like a factory-installed system, leaving no gaps or loose edges. 
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
