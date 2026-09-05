import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, ShoppingCart, Trash2, Plus, Minus, CheckCircle, ArrowRight, MapPin, CreditCard, ShieldCheck, User, Truck, ChevronRight, AlertCircle } from 'lucide-react';

export const CartDrawer = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    addToast,
    user,
    setIsAuthModalOpen,
    placeOrder,
    verifyAndApplyVoucher,
    cartStep,
    setCartStep,
    voeuxCashBalance,
    isVoeuxCashApplied,
    toggleVoeuxCash
  } = useShop();

  const [step, setStep] = useState(cartStep || 'cart');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState('');
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);

  const voeuxCashDiscountAmount = (isVoeuxCashApplied && voeuxCashBalance >= 150) ? Math.min(voeuxCashBalance, Math.max(0, cartTotal - discountAmount)) : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount - voeuxCashDiscountAmount);

  const [addressData, setAddressData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
    state: 'Delhi'
  });

  // Sync address from logged-in user when checkout step activates
  React.useEffect(() => {
    if (step === 'checkout' && user) {
      setAddressData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        street: prev.street || user.address || '',
        city: prev.city || user.city || '',
        pincode: prev.pincode || user.pincode || '',
      }));
    }
  }, [step, user]);

  // Sync step when cartStep changes (e.g. Buy Now triggers checkout jump)
  // Must be ABOVE the early return to satisfy React hooks rules
  React.useEffect(() => {
    if (isCartOpen) {
      setStep(cartStep || 'cart');
      setPaymentCancelled(false);
    }
  }, [cartStep, isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');

    if (!couponCode.trim()) {
      const emptyMsg = 'Please enter a coupon or referral code.';
      setCouponError(emptyMsg);
      addToast(emptyMsg, 'warning');
      return;
    }

    setVerifyingCoupon(true);
    try {
      const res = await verifyAndApplyVoucher(couponCode);
      if (res && res.valid) {
        setDiscountAmount(res.discountAmount);
        setAppliedVoucherCode(res.code);
        setCouponError('');
        addToast(`Code "${res.code}" applied! Saved ₹${res.discountAmount}`, 'success');
      }
    } catch (err) {
      const errMsg = err.message || 'Invalid coupon code';
      setCouponError(errMsg);
      setDiscountAmount(0);
      setAppliedVoucherCode('');
      addToast(errMsg, 'error');
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const handleAddressChange = (e) => {
    setAddressData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Dynamic Razorpay Script Loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();

    if (!addressData.fullName || !addressData.email || !addressData.phone || !addressData.street || !addressData.city || !addressData.pincode) {
      addToast('Please complete all shipping address fields', 'warning');
      return;
    }

    setLoading(true);
    setPaymentCancelled(false);

    const isLoaded = await loadRazorpayScript();

    if (!isLoaded || !window.Razorpay) {
      setLoading(false);
      addToast('Unable to load payment gateway. Please check your connection and try again.', 'error');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TXq1ludSll63Cn',
      amount: finalTotal * 100,
      currency: 'INR',
      name: 'VOEUX®',
      description: `Order — ${cart.length} item(s)`,
      image: window.location.origin + '/images/voeux_logo.png',
      prefill: {
        name: addressData.fullName,
        email: addressData.email,
        contact: addressData.phone
      },
      theme: { color: '#3B429F' },
      handler: async function (response) {
        const placed = await placeOrder({
          totalAmount: finalTotal,
          shippingAddress: addressData,
          paymentMethod: 'RAZORPAY_ONLINE',
          paymentId: response.razorpay_payment_id || 'PAY_' + Date.now(),
          appliedVoucherCode,
          discountAmount,
          voeuxCashRedeemed: voeuxCashDiscountAmount
        });
        setLastPlacedOrder(placed);
        setStep('success');
        setLoading(false);
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          setPaymentCancelled(true);
          addToast('Payment was cancelled. You can try again when ready.', 'info');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setLoading(false);
      addToast('Payment gateway error: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-white text-gray-900 h-full flex flex-col justify-between shadow-2xl border-l border-gray-100 text-left">
        
        {/* Shopify-Style Header & Checkout Breadcrumbs */}
        <div className="px-6 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              {step === 'cart' ? 'Your Shopping Bag' : step === 'checkout' ? 'Express Checkout' : 'Order Confirmed'}
            </h2>
            <button
              onClick={() => { setIsCartOpen(false); setStep('cart'); setCartStep('cart'); }}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shopify Free Express Delivery Bar */}
          {step === 'cart' && cart.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Free Express Delivery Unlocked!</span>
                </span>
                <span className="font-bold">100%</span>
              </div>
              <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-full" />
              </div>
            </div>
          )}
        </div>

        {/* STEP 1: SHOPIFY SHOPPING BAG */}
        {step === 'cart' && (
          <>
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Your shopping bag is empty</h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-3 px-6 rounded-xl transition shadow-md cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 py-3 border-b border-gray-100 last:border-b-0 items-start">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-contain bg-gray-50 rounded-xl p-1.5 border border-gray-100 shrink-0" />
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{item.product.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-600 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="px-2 py-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-2.5 text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            className="px-2 py-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-extrabold text-[#3B429F]">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Shopify Cart Summary & Checkout CTA */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-gray-100 space-y-4">
                
                {/* Promo Code Box */}
                <div className="space-y-2">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter referral code / coupon"
                      value={couponCode}
                      onChange={e => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError('');
                      }}
                      className={`flex-1 bg-gray-50 border rounded-xl px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none transition uppercase font-semibold ${
                        couponError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#3B429F]'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={verifyingCoupon}
                      className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      {verifyingCoupon ? 'Verifying...' : 'Apply'}
                    </button>
                  </form>

                  {/* Coupon Error Banner */}
                  {couponError && (
                    <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {/* Applied Coupon Success Banner */}
                  {appliedVoucherCode && !couponError && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Code <strong>{appliedVoucherCode}</strong> applied (-₹{discountAmount})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedVoucherCode('');
                          setDiscountAmount(0);
                          setCouponCode('');
                          setCouponError('');
                          addToast('Coupon code removed', 'info');
                        }}
                        className="text-emerald-700 hover:text-emerald-900 underline text-[11px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* VOEUX Cash Redemption Section */}
                {user && (
                  <div className="p-3 bg-[#3B429F]/5 border border-[#3B429F]/20 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">VOEUX Cash Balance</span>
                        <span className="bg-[#3B429F] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          {voeuxCashBalance} Pts (₹{voeuxCashBalance})
                        </span>
                      </div>
                      {voeuxCashBalance >= 150 ? (
                        <button
                          type="button"
                          onClick={toggleVoeuxCash}
                          className={`text-[11px] font-extrabold px-3 py-1 rounded-lg transition cursor-pointer ${
                            isVoeuxCashApplied ? 'bg-emerald-600 text-white' : 'bg-[#3B429F] text-white hover:bg-[#2B308B]'
                          }`}
                        >
                          {isVoeuxCashApplied ? 'Redeemed' : 'Redeem'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
                          Min 150 pts required
                        </span>
                      )}
                    </div>
                    {voeuxCashBalance < 150 && (
                      <p className="text-[10px] text-slate-500 font-medium">
                        Earn 5% points on every order! Minimum 150 points required to redeem at checkout.
                      </p>
                    )}
                  </div>
                )}

                {/* Subtotal Calculation */}
                <div className="space-y-2 text-xs pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span>Voucher Discount ({appliedVoucherCode || 'VOEUX10'})</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {voeuxCashDiscountAmount > 0 && (
                    <div className="flex justify-between text-[#3B429F] font-bold bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                      <span>VOEUX Cash Redeemed ({voeuxCashDiscountAmount} Pts)</span>
                      <span>-₹{voeuxCashDiscountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                    <span>Estimated Total</span>
                    <span className="text-[#3B429F]">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      setIsAuthModalOpen(true);
                      return;
                    }
                    setStep('checkout');
                  }}
                  className="w-full bg-[#3B429F] hover:bg-[#2B308B] active:bg-[#20246B] text-white text-xs sm:text-sm font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-gray-400 text-center font-medium">Taxes and shipping calculated at checkout</p>
              </div>
            )}
          </>
        )}

        {/* STEP 2: SHOPIFY EXPRESS CHECKOUT FORM */}
        {step === 'checkout' && (
          <form onSubmit={handleCompleteOrder} className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Account Quick Banner */}
              {!user ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">Have a VOEUX account?</span>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-[#3B429F] font-bold hover:underline"
                  >
                    Log In
                  </button>
                </div>
              ) : (
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 flex items-center gap-3 text-xs text-indigo-950 font-medium">
                  <User className="w-4 h-4 text-[#3B429F] shrink-0" />
                  <span>Checking out as <strong>{user.name}</strong> ({user.email})</span>
                </div>
              )}

              {/* Shipping Address Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3B429F]" />
                  <span>Shipping Address</span>
                </h3>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={addressData.fullName}
                    onChange={handleAddressChange}
                    placeholder="Enter your full name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={addressData.email}
                      onChange={handleAddressChange}
                      placeholder="name@example.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={addressData.phone}
                      onChange={handleAddressChange}
                      placeholder="10-digit mobile number"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={addressData.street}
                    onChange={handleAddressChange}
                    placeholder="House no, Flat, Street, Landmark"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={addressData.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={addressData.pincode}
                      onChange={handleAddressChange}
                      placeholder="6-digit Pincode"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <CreditCard className="w-5 h-5 text-[#3B429F] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Razorpay Secure Payment</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">UPI · Credit/Debit Cards · Net Banking · Wallets</p>
                  </div>
                </div>

                {paymentCancelled && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
                    <span>&#9888;</span>
                    <span>Payment was cancelled. Click "Pay Now" below to try again.</span>
                  </div>
                )}
              </div>

            </div>

            {/* Sticky Checkout CTA Footer */}
            <div className="p-6 bg-white border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-baseline text-sm font-black text-gray-900">
                <span>Total Amount Due</span>
                <span className="text-lg text-[#3B429F]">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep('cart'); setPaymentCancelled(false); }}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#3B429F] hover:bg-[#2B308B] active:bg-[#20246B] text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-900/20 cursor-pointer text-center disabled:opacity-70"
                >
                  {loading ? 'Opening Payment...' : paymentCancelled ? 'Try Payment Again' : 'Pay Now with Razorpay'}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted & Guaranteed Genuine VOEUX® Order</span>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: SHOPIFY ORDER CONFIRMATION */}
        {step === 'success' && lastPlacedOrder && (
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Order Confirmed!</h3>
              <p className="text-xs text-[#3B429F] font-bold">Order Number: #{lastPlacedOrder.id}</p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
              We have received your order. A receipt and confirmation email have been sent to <strong>{lastPlacedOrder.shippingAddress?.email}</strong>.
            </p>

            {lastPlacedOrder.referral?.rewardVoucherCode && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-left text-xs space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 block">🎁 REFERRAL REWARD UNLOCKED</span>
                <p className="text-gray-900 font-bold">₹500 OFF Discount Voucher Code:</p>
                <div className="bg-white border border-purple-300 rounded-xl p-2.5 flex items-center justify-between font-mono font-bold text-sm text-purple-900">
                  <span>{lastPlacedOrder.referral.rewardVoucherCode}</span>
                  <span className="text-[10px] bg-purple-600 text-white font-sans px-2 py-0.5 rounded-full uppercase">Emailed</span>
                </div>
                <p className="text-[11px] text-purple-700 font-medium">This ₹500 discount code has been sent to your email!</p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500 font-medium">Recipient:</span>
                <span className="font-bold text-gray-900">{lastPlacedOrder.shippingAddress?.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500 font-medium">Delivery Address:</span>
                <span className="font-semibold text-gray-900 text-right">{lastPlacedOrder.shippingAddress?.city} - {lastPlacedOrder.shippingAddress?.pincode}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500 font-medium">Payment Mode:</span>
                <span className="font-bold text-emerald-700">{lastPlacedOrder.paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStep('cart');
                setIsCartOpen(false);
              }}
              className="w-full bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-3.5 rounded-xl transition shadow-md cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
