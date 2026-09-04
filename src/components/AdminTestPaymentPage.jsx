import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  ShieldCheck, Zap, Package, Mail, Database, CreditCard,
  ArrowRight, CheckCircle, AlertTriangle, Lock, RefreshCw,
  Eye, Truck, Bell
} from 'lucide-react';

// ── SECRET TEST PRODUCT (₹1 for payment flow testing) ──────────────────────
const TEST_PRODUCT = {
  id: 'TEST-PAYMENT-PRODUCT-001',
  name: 'VOEUX® Test Product — Payment Flow Validation',
  price: 1,
  image: '/images/voeux_logo.png',
  category: 'test',
  description: 'Internal test product. ₹1 charge for verifying the complete Razorpay payment → Order → Email → Firebase pipeline.',
  badge: '🔒 ADMIN TEST'
};

export const AdminTestPaymentPage = () => {
  const { addToCart, buyNowCheckout, user, setIsAuthModalOpen, addToast } = useShop();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(TEST_PRODUCT);
    setAdded(true);
    addToast('₹1 test product added to cart! Open cart → Checkout to test payment.', 'success');
    setTimeout(() => setAdded(false), 3000);
  };

  const handleBuyNow = () => {
    if (!user) {
      addToast('Please sign in first to test the full checkout flow.', 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    buyNowCheckout(TEST_PRODUCT);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#1a1f5e] to-slate-950 text-white">

      {/* ── Header ── */}
      <div className="border-b border-indigo-800/40 px-6 py-4 flex items-center gap-3 bg-slate-950/80 backdrop-blur">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">VOEUX® INTERNAL</p>
          <h1 className="text-sm font-black text-white tracking-tight">Admin Payment Flow Test</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          LIVE RAZORPAY — REAL ₹1 CHARGE
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* ── Test Product Card ── */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 backdrop-blur">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl p-3">
            <img src="/images/voeux_logo.png" alt="Test Product" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-900/60 px-2.5 py-1 rounded-full border border-indigo-700/40">
                🔒 ADMIN TEST
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/40 px-2.5 py-1 rounded-full border border-emerald-700/40">
                LIVE RAZORPAY
              </span>
            </div>
            <h2 className="text-lg font-black text-white leading-tight">{TEST_PRODUCT.name}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{TEST_PRODUCT.description}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">₹1</span>
              <span className="text-xs text-slate-500">one-time test charge</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-2 bg-[#3B429F] hover:bg-[#2B308B] text-white font-black text-xs px-6 py-3.5 rounded-xl transition shadow-lg cursor-pointer whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4" />
              Buy Now — Test Full Flow
            </button>
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-2 font-black text-xs px-6 py-3.5 rounded-xl transition border cursor-pointer whitespace-nowrap ${
                added
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {added ? <><CheckCircle className="w-4 h-4" /> Added!</> : <><Package className="w-4 h-4" /> Add to Cart</>}
            </button>
          </div>
        </div>

        {/* ── Workflow Explanation ── */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6">📋 Complete Order Flow — What Happens Step by Step</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {[
              {
                step: '01',
                icon: <CreditCard className="w-5 h-5" />,
                title: 'Razorpay Payment Gateway Opens',
                color: 'text-blue-400',
                bg: 'bg-blue-900/30 border-blue-700/40',
                desc: 'Clicking "Buy Now" opens the real Razorpay checkout modal. You\'ll see VOEUX® branding. Enter any test card (e.g. 4111 1111 1111 1111, Exp: any future date, CVV: any 3 digits) or use UPI. The ₹1 is a real charge.'
              },
              {
                step: '02',
                icon: <CheckCircle className="w-5 h-5" />,
                title: 'Payment Success → Order Created',
                color: 'text-emerald-400',
                bg: 'bg-emerald-900/30 border-emerald-700/40',
                desc: 'On successful payment, Razorpay returns a Payment ID (e.g. pay_XXXX). The system creates a VOEUX® Order ID (VX-XXXXXX), timestamps it, attaches your shipping address and payment ID.'
              },
              {
                step: '03',
                icon: <Database className="w-5 h-5" />,
                title: 'Order Saved to Firebase + LocalStorage',
                color: 'text-yellow-400',
                bg: 'bg-yellow-900/20 border-yellow-700/40',
                desc: 'The order is written to Firebase Realtime DB under /orders. It\'s also saved in your browser\'s localStorage under "voeux_orders" so it appears in your profile → My Orders page instantly.'
              },
              {
                step: '04',
                icon: <Mail className="w-5 h-5" />,
                title: 'Email to Customer (You)',
                color: 'text-pink-400',
                bg: 'bg-pink-900/20 border-pink-700/40',
                desc: 'Your Google Apps Script sends an Order Receipt email to the email address you used at checkout. It includes: Order ID, product name, total amount, payment ID, shipping address, and your referral voucher code.'
              },
              {
                step: '05',
                icon: <Bell className="w-5 h-5" />,
                title: 'Alert Email to VOEUX® Office',
                color: 'text-orange-400',
                bg: 'bg-orange-900/20 border-orange-700/40',
                desc: 'Simultaneously, an email is sent to voeuxoffice@gmail.com with "NEW ORDER RECEIVED #VX-XXXXX — ₹1" so you know to pack and ship. This is how you\'ll know a real order has been placed.'
              },
              {
                step: '06',
                icon: <Eye className="w-5 h-5" />,
                title: 'Order Visible in My Profile',
                color: 'text-purple-400',
                bg: 'bg-purple-900/20 border-purple-700/40',
                desc: 'The order appears immediately in Account → My Orders with status "ORDER PLACED", product name, total paid, and order ID. Exactly what your customers will see after buying.'
              },
              {
                step: '07',
                icon: <Truck className="w-5 h-5" />,
                title: 'Cart is Cleared + Abandoned Cart Reset',
                color: 'text-cyan-400',
                bg: 'bg-cyan-900/20 border-cyan-700/40',
                desc: 'After payment, the cart empties automatically. The abandoned cart recovery timer is also reset so no recovery email gets sent for this completed order.'
              },
              {
                step: '08',
                icon: <Zap className="w-5 h-5" />,
                title: 'Referral Voucher Generated',
                color: 'text-amber-400',
                bg: 'bg-amber-900/20 border-amber-700/40',
                desc: 'A unique referral voucher code (REF500-XXXXXX) is generated in the order. If the customer shares your store link and someone buys, you can honour this voucher for ₹500 off their next order.'
              }
            ].map(({ step, icon, title, color, bg, desc }) => (
              <div key={step} className={`rounded-2xl border p-5 space-y-3 ${bg} backdrop-blur`}>
                <div className="flex items-center gap-3">
                  <div className={`${color} font-black text-xs w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0`}>
                    {step}
                  </div>
                  <div className={`${color}`}>{icon}</div>
                  <h4 className="text-sm font-black text-white leading-tight">{title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-11">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How to Know an Order Was Placed ── */}
        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-emerald-300">How You'll Know When a Real Order is Placed</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 space-y-1.5 border border-white/10">
              <p className="text-xs font-black text-white">📧 Email Alert</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">An email arrives at <span className="text-emerald-400 font-bold">voeuxoffice@gmail.com</span> with subject "NEW ORDER RECEIVED #VX-XXXXX — ₹X,XXX"</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 space-y-1.5 border border-white/10">
              <p className="text-xs font-black text-white">🔥 Firebase RTDB</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">Log into <span className="text-emerald-400 font-bold">Firebase Console → Realtime DB → /orders</span> to see live orders with all details in real-time</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 space-y-1.5 border border-white/10">
              <p className="text-xs font-black text-white">💳 Razorpay Dashboard</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">Login to <span className="text-emerald-400 font-bold">dashboard.razorpay.com</span> → Transactions to see all payments with Payment IDs and amounts</p>
            </div>
          </div>
        </div>

        {/* ── Warning ── */}
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-black text-amber-300">This Page is Secret — Do Not Share the URL</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Access this page by navigating to <code className="text-amber-300 bg-amber-900/40 px-1.5 py-0.5 rounded text-[10px]">http://localhost:5173/</code> and then in your browser console running{' '}
              <code className="text-amber-300 bg-amber-900/40 px-1.5 py-0.5 rounded text-[10px]">window.__VOEUX_ADMIN = true</code>{' '}
              — or using the secret URL fragment. The ₹1 test is a real Razorpay transaction; refund it from your Razorpay dashboard after testing.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
