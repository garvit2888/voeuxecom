import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, ShoppingCart, Trash2, Plus, Minus, CheckCircle, ArrowRight } from 'lucide-react';

export const CartDrawer = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    addToast
  } = useShop();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'VOEUX10') {
      const discount = Math.round(cartTotal * 0.1);
      setDiscountAmount(discount);
      addToast('Coupon applied! 10% OFF', 'success');
    } else {
      addToast('Invalid coupon. Try VOEUX10', 'warning');
    }
  };

  const finalTotal = cartTotal - discountAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-white text-gray-900 h-full flex flex-col justify-between shadow-2xl border-l border-gray-200">
        
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-[#3B429F]" />
            <h2 className="text-base font-bold text-gray-900">Your Cart ({cart.length})</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-1 text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isCheckoutSuccess ? (
          <>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 text-xs font-medium">Your cart is empty.</p>
                  <button onClick={() => setIsCartOpen(false)} className="btn-primary text-xs py-2 px-4">
                    Shop Products
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="clean-card p-3 flex gap-3 items-center">
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-xs text-[#3B429F] font-extrabold">₹{item.product.price.toLocaleString('en-IN')}</p>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <button onClick={() => updateCartQuantity(item.product.id, -1)} className="p-1 bg-gray-100 rounded">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.product.id, 1)} className="p-1 bg-gray-100 rounded">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 text-xs">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (VOEUX10)"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded px-2.5 py-1 text-xs"
                  />
                  <button type="submit" className="btn-secondary text-xs py-1 px-3">Apply</button>
                </form>

                <div className="space-y-1 pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount:</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-[#3B429F]">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutSuccess(true)}
                  className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center space-y-4 my-auto">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">Order Placed!</h3>
            <p className="text-xs text-gray-600">Order ID: #VX-2026-9841</p>
            <button
              onClick={() => {
                setIsCheckoutSuccess(false);
                setIsCartOpen(false);
              }}
              className="btn-primary text-xs py-2 px-6"
            >
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
