import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, ShoppingCart } from 'lucide-react';

export const WishlistDrawer = () => {
  const { wishlist, toggleWishlist, isWishlistOpen, setIsWishlistOpen, addToCart } = useShop();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-white text-gray-900 h-full flex flex-col justify-between shadow-2xl border-l border-gray-200">
        
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <h2 className="text-base font-bold text-gray-900">Wishlist ({wishlist.length})</h2>
          </div>
          <button onClick={() => setIsWishlistOpen(false)} className="p-1 text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Heart className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500 text-xs font-medium">Your wishlist is empty.</p>
            </div>
          ) : (
            wishlist.map(product => (
              <div key={product.id} className="clean-card p-3 flex gap-3 items-center">
                <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                  <p className="text-xs text-[#3B429F] font-extrabold">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => {
                    addToCart(product);
                    toggleWishlist(product);
                  }}
                  className="btn-primary text-[10px] py-1 px-2.5 flex items-center gap-1"
                >
                  <ShoppingCart className="w-3 h-3" /> Add
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
