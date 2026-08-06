import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, UPCOMING_PRODUCTS, BLOG_POSTS } from '../data/products';
import { ProductCard } from './ProductCard';
import { Sparkles, Clock, Flame, Tag, ArrowRight, Bell } from 'lucide-react';

export const WhatsNewPage = () => {
  const { setSelectedProductModal } = useShop();
  const [activeTab, setActiveTab] = useState('new-arrivals');

  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        return { hours: Math.max(0, prev.hours - 1), minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'new-arrivals':
        return PRODUCTS.filter(p => p.isNew);
      case 'trending':
        return PRODUCTS.filter(p => p.isTrending);
      case 'best-sellers':
        return PRODUCTS.filter(p => p.isBestseller);
      case 'special-offers':
        return PRODUCTS.filter(p => p.originalPrice > p.price);
      default:
        return PRODUCTS;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="badge-minimal">VOEUX® Innovation</span>
        <h1 className="text-3xl font-extrabold text-gray-900">What's New in VOEUX</h1>
        <p className="text-xs text-gray-500">Discover our latest launches, upcoming drops, and limited offers.</p>
      </div>



      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-gray-200 pb-4">
        {[
          { id: 'new-arrivals', label: 'New Arrivals' },
          { id: 'trending', label: 'Trending' },
          { id: 'best-sellers', label: 'Best Sellers' },
          { id: 'coming-soon', label: 'Coming Soon' },
          { id: 'special-offers', label: 'Special Offers' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-[#3B429F] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'coming-soon' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {UPCOMING_PRODUCTS.map(up => (
            <div key={up.id} className="clean-card p-6 flex flex-col md:flex-row gap-4 items-center">
              <img src={up.teaserImage} alt={up.name} className="w-full md:w-40 h-40 object-cover rounded-xl bg-gray-100" />
              <div className="space-y-2 flex-1">
                <span className="bg-indigo-50 text-[#3B429F] text-[10px] font-bold px-2 py-0.5 rounded uppercase">{up.tag}</span>
                <h3 className="text-sm font-bold text-gray-900">{up.name}</h3>
                <p className="text-xs text-gray-500">Expected: {up.priceEstimate}</p>
                <button
                  onClick={() => alert(`Subscribed to launch alert for ${up.name}`)}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" /> Pre-order / Notify Me
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {getFilteredProducts().map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

    </div>
  );
};
