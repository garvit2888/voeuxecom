import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingCart, Zap, ExternalLink } from 'lucide-react';

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const { setSelectedProductModal, addToCart, setIsCartOpen } = useShop();

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={() => setSelectedProductModal(product)}
      className="clean-card group relative flex flex-col justify-between overflow-hidden p-4 space-y-3 cursor-pointer transition-all duration-300"
    >
      
      {/* Top Image Section - Fitted Design */}
      <div className="relative aspect-[4/3] bg-slate-50/80 rounded-xl overflow-hidden flex items-center justify-center p-2">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Title & Pricing */}
      <div className="flex-1 flex flex-col justify-between space-y-2.5 text-left">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#3B429F] transition line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Price & Discount Display */}
        <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        </div>

        {/* Direct Action Buttons: Buy Now & Add to Cart */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
            <span>Buy Now</span>
          </button>
          
          <button
            onClick={handleAddToCart}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4 text-[#3B429F]" />
          </button>
        </div>

      </div>

    </div>
  );
};
