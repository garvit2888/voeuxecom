import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Scale, ShoppingCart, Trash2 } from 'lucide-react';

export const CompareDrawer = () => {
  const { compareList, toggleCompare, isCompareOpen, setIsCompareOpen, addToCart } = useShop();

  if (!isCompareOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden border border-gray-200 text-gray-900 max-h-[90vh] flex flex-col shadow-2xl">
        
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#3B429F]" />
            <h2 className="text-base font-bold text-gray-900">Compare Products ({compareList.length}/4)</h2>
          </div>
          <button onClick={() => setIsCompareOpen(false)} className="p-1 text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          {compareList.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Scale className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-500 text-xs font-medium">No products selected for comparison.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 min-w-[650px]">
              {compareList.map(p => (
                <div key={p.id} className="clean-card p-3 space-y-2 flex flex-col justify-between text-xs">
                  <div className="space-y-2">
                    <button onClick={() => toggleCompare(p)} className="text-red-500 text-[10px] flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                    <img src={p.image} alt={p.name} className="w-full h-24 object-cover rounded bg-gray-100" />
                    <h4 className="font-bold text-gray-900 line-clamp-2">{p.name}</h4>
                    <p className="font-extrabold text-[#3B429F]">₹{p.price.toLocaleString('en-IN')}</p>
                  </div>

                  <button onClick={() => addToCart(p)} className="btn-primary text-xs py-1.5 flex items-center justify-center gap-1">
                    <ShoppingCart className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
