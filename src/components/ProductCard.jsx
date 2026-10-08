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
      className="group flex flex-col space-y-4 cursor-pointer text-left"
    >
      
      {/* Top Image Section */}
      <div className="relative aspect-square rounded-3xl overflow-hidden flex items-center justify-center bg-gray-50/50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Product Title & Pricing */}
      <div className="flex flex-col space-y-1.5 px-1">
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-[#3B429F] transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price & Discount */}
        <div className="flex items-baseline gap-2 flex-wrap pt-1">
          <span className="text-lg sm:text-2xl font-black text-gray-900">
            &#8377;{product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-xs sm:text-sm text-gray-400 line-through">
            &#8377;{product.originalPrice.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

    </div>
  );
};
