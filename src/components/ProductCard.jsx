import React from 'react';
import { useShop } from '../context/ShopContext';
import { Star, ShoppingCart, Heart, Scale, Eye, Check, MessageSquare } from 'lucide-react';

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const {
    addToCart,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    setSelectedProductModal,
    selectedCar
  } = useShop();

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const isCompared = compareList.some(item => item.id === product.id);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="clean-card group relative flex flex-col justify-between overflow-hidden p-4 space-y-3">
      
      {/* Top Image Section - Fitted Uncropped Design */}
      <div className="relative aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center p-2" onClick={() => setSelectedProductModal(product)}>
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.badge && (
            <span className="bg-[#3B429F] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
              {product.badge}
            </span>
          )}
        </div>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Content Body */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3
            onClick={() => setSelectedProductModal(product)}
            className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#3B429F] cursor-pointer transition line-clamp-2 mt-0.5"
          >
            {product.name}
          </h3>
        </div>

        {/* Flipkart Buy Action & WhatsApp Query */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(product.flipkartUrl || 'https://www.flipkart.com/search?q=VOEUX+car+electronics', '_blank');
            }}
            className="w-full bg-[#2874F0] hover:bg-[#1C5CBD] text-white text-xs font-extrabold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="bg-yellow-400 text-[#2874F0] font-black text-[11px] px-1.5 py-0.5 rounded italic leading-none shadow-sm">f</span>
            <span>BUY NOW ON FLIPKART</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const waText = encodeURIComponent(`Hi VOEUX, I am interested to know more details about ${product.name}`);
              window.open(`https://wa.me/919999484530?text=${waText}`, '_blank');
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send Query on WhatsApp</span>
          </button>
        </div>
      </div>

    </div>
  );
};
