import React from 'react';
import { useShop } from '../context/ShopContext';

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const { setSelectedProductModal } = useShop();

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div
      onClick={() => setSelectedProductModal(product)}
      className="clean-card group relative flex flex-col justify-between overflow-hidden p-2.5 sm:p-4 space-y-2 sm:space-y-3 cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 rounded-2xl bg-white text-left"
    >
      
      {/* Top Image Section */}
      <div className="relative aspect-square bg-slate-50/90 rounded-xl overflow-hidden flex items-center justify-center p-1 border border-gray-100/60">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Title & Pricing */}
      <div className="flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2.5">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#3B429F] transition line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price & Discount */}
        <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-lg font-black text-gray-900">
              &#8377;{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
              &#8377;{product.originalPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
