import React, { useState, useEffect } from 'react';
import { getDiwaliPricing, isDiwaliSaleActive } from '../utils/diwaliOffers';
import { Sparkles, Flame } from 'lucide-react';

/**
 * DiwaliPriceDisplay Component
 * Displays MRP, Original Regular Price with an animated strike cut line,
 * and the Diwali Special Price in bold festive red.
 */
export const DiwaliPriceDisplay = ({
  product,
  overridePrice = null,
  overrideMrp = null,
  overrideDiscount = null,
  size = 'md', // 'sm' | 'md' | 'lg'
  showBadge = true
}) => {
  const [isCutAnimated, setIsCutAnimated] = useState(false);
  const [saleActive, setSaleActive] = useState(() => isDiwaliSaleActive());

  useEffect(() => {
    setSaleActive(isDiwaliSaleActive());
    // Trigger the strike cut animation shortly after render / page load
    setIsCutAnimated(false);
    const timer = setTimeout(() => {
      setIsCutAnimated(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [product?.id, overridePrice]);

  // Compute pricing
  const defaultPricing = getDiwaliPricing(product, saleActive);
  const regularPrice = overridePrice !== null ? overridePrice : defaultPricing.regularPrice;
  const mrp = overrideMrp !== null ? overrideMrp : defaultPricing.mrp;
  const discount = overrideDiscount !== null ? overrideDiscount : defaultPricing.discount;
  const hasDiwaliDiscount = saleActive && discount > 0;
  const diwaliPrice = hasDiwaliDiscount ? Math.max(0, regularPrice - discount) : regularPrice;

  // Text sizes based on prop
  const sizeClasses = {
    sm: {
      mrp: 'text-[10px] text-gray-400',
      regular: 'text-xs sm:text-sm font-bold text-gray-600',
      diwali: 'text-base sm:text-xl font-black text-red-600',
      badge: 'text-[9px] px-1.5 py-0.5'
    },
    md: {
      mrp: 'text-xs text-gray-400',
      regular: 'text-sm sm:text-base font-bold text-gray-600',
      diwali: 'text-xl sm:text-2xl font-black text-red-600',
      badge: 'text-[10px] px-2 py-0.5'
    },
    lg: {
      mrp: 'text-xs sm:text-sm text-gray-400',
      regular: 'text-base sm:text-lg font-bold text-gray-600',
      diwali: 'text-2xl sm:text-4xl font-black text-red-600',
      badge: 'text-xs px-2.5 py-1'
    }
  }[size] || sizeClasses.md;

  // If Diwali sale is not active or this item has no Diwali discount, show normal price
  if (!hasDiwaliDiscount) {
    return (
      <div className="flex flex-col space-y-0.5">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={sizeClasses.diwali.replace('text-red-600', 'text-gray-900')}>
            ₹{regularPrice.toLocaleString('en-IN')}
          </span>
          {mrp > regularPrice && (
            <span className={`${sizeClasses.mrp} line-through`}>
              MRP ₹{mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1 text-left">
      
      {/* 1. Above: Original Price with Animated Strike Cut & MRP */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        
        {/* Animated Strikethrough Regular Price */}
        <div className="relative inline-block font-semibold">
          <span className="text-gray-500 text-[11px] uppercase mr-1 font-bold">Orig. Price:</span>
          <span className={`${sizeClasses.regular} relative inline-block transition-colors duration-500 ${isCutAnimated ? 'text-gray-400' : 'text-gray-700'}`}>
            ₹{regularPrice.toLocaleString('en-IN')}
            
            {/* Animated Red Strike Cut Line */}
            <span
              className="absolute left-0 top-1/2 h-[2.5px] bg-red-600 rounded-full transition-all duration-700 ease-out pointer-events-none"
              style={{
                width: isCutAnimated ? '100%' : '0%',
                boxShadow: isCutAnimated ? '0 0 6px rgba(220, 38, 38, 0.6)' : 'none'
              }}
            />
          </span>
        </div>

        {/* MRP as was before */}
        {mrp > regularPrice && (
          <span className={`${sizeClasses.mrp} line-through font-medium`}>
            MRP: ₹{mrp.toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {/* 2. Below: Diwali Special Price in bold festive red with pop animation */}
      <div className="flex items-baseline gap-2.5 flex-wrap">
        <div
          className={`flex items-baseline gap-1.5 transition-all duration-500 ease-out ${
            isCutAnimated ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-80 translate-y-0.5'
          }`}
        >
          <span className="text-[11px] sm:text-xs font-bold text-red-600 uppercase tracking-wide">
            Diwali Special:
          </span>
          <span className={`${sizeClasses.diwali} tracking-tight drop-shadow-sm`}>
            ₹{diwaliPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Festive Badge */}
        {showBadge && (
          <span className={`inline-flex items-center gap-1 rounded-full bg-red-600 text-white font-extrabold uppercase tracking-wider shadow-sm animate-pulse ${sizeClasses.badge}`}>
            <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
            <span>₹{discount.toLocaleString('en-IN')} OFF</span>
          </span>
        )}
      </div>

    </div>
  );
};
