import React from 'react';
import { useShop } from '../context/ShopContext';
import { DiwaliPriceDisplay } from './DiwaliPriceDisplay';
import { getDiwaliPricing, isDiwaliSaleActive } from '../utils/diwaliOffers';
import { Sparkles } from 'lucide-react';

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const { setSelectedProductModal } = useShop();
  const diwaliInfo = getDiwaliPricing(product);

  return (
    <div
      onClick={() => setSelectedProductModal(product)}
      className="group flex flex-col space-y-3 cursor-pointer text-left relative"
    >
      {/* Top Image Section */}
      <div className="relative aspect-square rounded-3xl overflow-hidden flex items-center justify-center bg-gray-50/50 p-3">
        {/* Festive Diwali Badge on Card if Active */}
        {diwaliInfo.hasDiwaliDiscount && (
          <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
            <span>Diwali Offer</span>
          </div>
        )}

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Product Title & Pricing */}
      <div className="flex flex-col space-y-1.5 px-1">
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-[#3B429F] transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price & Cut Animation Display */}
        <div className="pt-0.5">
          <DiwaliPriceDisplay product={product} size="sm" showBadge={true} />
        </div>
      </div>
    </div>
  );
};

