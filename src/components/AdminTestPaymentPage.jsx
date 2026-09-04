import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  ShieldCheck, Zap, Package, Mail, Database, CreditCard,
  ArrowRight, CheckCircle, AlertTriangle, Lock, RefreshCw,
  Eye, Truck, Bell, Search, Filter, Copy, ExternalLink,
  ChevronDown, ChevronUp, FileSpreadsheet, Phone, MapPin, Calendar, Clock, DollarSign
} from 'lucide-react';

// ── SECRET TEST PRODUCT (₹1 for payment flow testing) ──────────────────────
const TEST_PRODUCT = {
  id: 'TEST-PAYMENT-PRODUCT-001',
  name: 'VOEUX® Test Product — Payment Flow Validation',
  price: 1,
  image: '/images/voeux_logo.png',
  category: 'test',
  description: 'Internal test product. ₹1 charge for verifying the complete Razorpay payment → Order → Email → Sheet pipeline.',
  badge: '🔒 ADMIN TEST'
};

export const AdminTestPaymentPage = () => {
  const { addToCart, buyNowCheckout, user, setIsAuthModalOpen, addToast, orders: localOrders } = useShop();
  const [added, setAdded] = useState(false);
  const [firebaseOrders, setFirebaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, cod, today
  const [showTestProduct, setShowTestProduct] = useState(false);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Fetch Live Orders from Firebase RTDB
  const fetchOrdersFromFirebase = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://voeux-warehouse-default-rtdb.firebaseio.com/orders.json');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const list = Object.keys(data).map(key => ({
            firebaseKey: key,
            ...data[key]
          }));
          // Sort newest first
          list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setFirebaseOrders(list);
        } else {
          setFirebaseOrders([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders from Firebase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersFromFirebase();
  }, []);

  // Combine Firebase orders & local orders (deduplicated by order id)
  const allCombinedOrders = React.useMemo(() => {
    const map = new Map();
    // Add local orders first
    (localOrders || []).forEach(ord => {
      if (ord && ord.id) map.set(ord.id, ord);
    });
    // Add firebase orders (overwrites or supplements)
    firebaseOrders.forEach(ord => {
      if (ord && ord.id) map.set(ord.id, ord);
    });
    const combined = Array.from(map.values());
    combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return combined;
  }, [localOrders, firebaseOrders]);

  // Filtered orders based on search and status
  const filteredOrders = React.useMemo(() => {
    return allCombinedOrders.filter(ord => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q || (
        (ord.id && ord.id.toLowerCase().includes(q)) ||
        (ord.userName && ord.userName.toLowerCase().includes(q)) ||
        (ord.userEmail && ord.userEmail.toLowerCase().includes(q)) ||
        (ord.userPhone && ord.userPhone.toLowerCase().includes(q)) ||
        (ord.paymentId && ord.paymentId.toLowerCase().includes(q)) ||
        (ord.shippingAddress && (
          (ord.shippingAddress.fullName && ord.shippingAddress.fullName.toLowerCase().includes(q)) ||
          (ord.shippingAddress.city && ord.shippingAddress.city.toLowerCase().includes(q)) ||
          (ord.shippingAddress.pincode && ord.shippingAddress.pincode.toLowerCase().includes(q))
        )) ||
        (ord.items && ord.items.some(it => (it.name || (it.product && it.product.name) || '').toLowerCase().includes(q)))
      );

      if (!matchSearch) return false;

      if (filterStatus === 'paid') {
        return ord.paymentMethod === 'Razorpay' || (ord.paymentId && ord.paymentId !== 'N/A');
      }
      if (filterStatus === 'cod') {
        return ord.paymentMethod === 'COD' || ord.paymentMethod === 'Cash on Delivery';
      }
      if (filterStatus === 'today') {
        const orderDate = new Date(ord.createdAt || Date.now()).toDateString();
        const todayStr = new Date().toDateString();
        return orderDate === todayStr;
      }
      return true;
    });
  }, [allCombinedOrders, searchTerm, filterStatus]);

  // Metrics
  const totalRevenue = React.useMemo(() => {
    return allCombinedOrders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);
  }, [allCombinedOrders]);

  const paidCount = React.useMemo(() => {
    return allCombinedOrders.filter(ord => ord.paymentMethod === 'Razorpay' || (ord.paymentId && ord.paymentId !== 'N/A')).length;
  }, [allCombinedOrders]);

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

  const copyOrderDetails = (order) => {
    const itemsStr = (order.items || []).map(it => {
      const pName = it.name || (it.product && it.product.name) || 'Product';
      const qty = it.quantity || 1;
      const price = it.price || (it.product && it.product.price) || 0;
      return `- ${pName} x${qty} (₹${price})`;
    }).join('\n');

    const addr = order.shippingAddress;
    const addrStr = addr ? `${addr.fullName || ''}\n${addr.street || ''}, ${addr.city || ''} - ${addr.pincode || ''}\nPhone: ${addr.phone || addr.mobile || order.userPhone || 'N/A'}` : 'N/A';

    const text = `====================================
VOEUX® ORDER DETAILS #${order.id || 'VX-ORDER'}
====================================
Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}
Customer: ${addr?.fullName || order.userName || 'Customer'}
Email: ${order.userEmail || addr?.email || 'N/A'}
Phone: ${order.userPhone || addr?.phone || addr?.mobile || 'N/A'}

ITEMS:
${itemsStr}

TOTAL PAID: ₹${order.totalAmount || 0}
PAYMENT METHOD: ${order.paymentMethod || 'Razorpay'}
PAYMENT ID: ${order.paymentId || 'N/A'}

SHIPPING ADDRESS:
${addrStr}
====================================`;

    navigator.clipboard.writeText(text);
    addToast(`Order #${order.id} details copied to clipboard!`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* ── Top Admin Bar ── */}
      <div className="border-b border-indigo-950 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                VOEUX® ADMIN DASHBOARD
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE SYNC
              </span>
            </div>
            <h1 className="text-base font-black text-white tracking-tight">All Customer Orders & Transactions</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://voeuxtechnologies.in"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            voeuxtechnologies.in
          </a>

          <button
            onClick={() => setShowTestProduct(!showTestProduct)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-900/60 text-indigo-300 hover:bg-indigo-900 hover:text-white px-3.5 py-2 rounded-xl border border-indigo-700/50 transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-indigo-400" />
            {showTestProduct ? 'Hide ₹1 Test Product' : '₹1 Test Payment Mode'}
          </button>

          <button
            onClick={fetchOrdersFromFirebase}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#3B429F] hover:bg-[#2B308B] text-white px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Orders
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Metric Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gross Revenue</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">₹{totalRevenue.toLocaleString('en-IN')}</span>
              <span className="text-xs text-emerald-400 font-bold">Total Sales</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Combined orders from website</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders Placed</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{allCombinedOrders.length}</span>
              <span className="text-xs text-indigo-400 font-bold">Orders</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Saved in Firebase RTDB & Google Sheet</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Online (Razorpay)</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{paidCount}</span>
              <span className="text-xs text-cyan-400 font-bold">Verified Payments</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Instant online payments completed</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Google Sheet Status</p>
            <div className="mt-2 flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
              <span className="text-sm font-black text-emerald-400">AUTO-SAVING</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Every new order appends to Google Sheet</p>
          </div>
        </div>

        {/* ── Collapsible ₹1 Test Payment Card ── */}
        {showTestProduct && (
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 p-2 shadow-xl">
                  <img src="/images/voeux_logo.png" alt="Test Product" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-indigo-300 bg-indigo-900/80 px-2 py-0.5 rounded border border-indigo-700">
                      🔒 ADMIN TEST PRODUCT
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700">
                      LIVE RAZORPAY ₹1
                    </span>
                  </div>
                  <h2 className="text-base font-black text-white">{TEST_PRODUCT.name}</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">{TEST_PRODUCT.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3B429F] hover:bg-[#2B308B] text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-lg cursor-pointer whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4" />
                  Buy Now ₹1
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 font-black text-xs px-6 py-3 rounded-xl transition border cursor-pointer whitespace-nowrap ${
                    added
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {added ? <><CheckCircle className="w-4 h-4" /> Added!</> : <><Package className="w-4 h-4" /> Add to Cart</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Search & Filter Controls ── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Phone, Email, City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: `All Orders (${allCombinedOrders.length})` },
              { id: 'paid', label: `Paid Online (${paidCount})` },
              { id: 'cod', label: `COD (${allCombinedOrders.length - paidCount})` },
              { id: 'today', label: `Today's Orders` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#3B429F] border-[#3B429F] text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* ── Orders Table / List ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" />
              Showing {filteredOrders.length} Orders
            </h3>
            <span className="text-[11px] text-slate-500">Click any order to view full details</span>
          </div>

          {loading ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-300">Fetching latest orders from Firebase & Google Sheet sync...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base font-black text-white">No Orders Found</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchTerm
                  ? `No orders matching "${searchTerm}". Try clearing search or changing filters.`
                  : 'No customer orders have been placed yet. Place a test order using the button above!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const isExpanded = expandedOrderId === order.id;
                const items = order.items || [];
                const addr = order.shippingAddress || {};
                const isPaid = order.paymentMethod === 'Razorpay' || (order.paymentId && order.paymentId !== 'N/A');

                return (
                  <div
                    key={order.id || order.firebaseKey}
                    className={`bg-slate-900/90 border rounded-2xl transition overflow-hidden ${
                      isExpanded ? 'border-indigo-600/80 shadow-2xl shadow-indigo-950/50' : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Order Summary Row Header */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition select-none"
                    >
                      {/* Left info */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-white bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
                            #{order.id || 'VX-ORDER'}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            isPaid
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                              : 'bg-amber-950 text-amber-400 border-amber-800/60'
                          }`}>
                            {isPaid ? 'PAID ONLINE (RAZORPAY)' : (order.paymentMethod || 'COD')}
                          </span>
                          {order.status && (
                            <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                              {order.status}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                          <span className="font-bold text-white flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                            {addr.fullName || order.userName || 'Customer'}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {order.userEmail || addr.email || 'N/A'}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {order.userPhone || addr.phone || addr.mobile || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Right info */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-slate-800/80 pt-3 lg:pt-0">
                        <div className="text-left lg:text-right">
                          <p className="text-lg font-black text-white">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 lg:justify-end">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyOrderDetails(order);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                            title="Copy details for WhatsApp/Courier"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-slate-800 p-5 bg-slate-950/60 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Customer & Delivery Address */}
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              Customer & Delivery Address
                            </h4>
                            <div className="space-y-1 text-xs text-slate-300">
                              <p className="font-bold text-white">{addr.fullName || order.userName || 'N/A'}</p>
                              <p>{addr.street || 'Address not specified'}</p>
                              <p>{addr.city ? `${addr.city} - ${addr.pincode || ''}` : ''}</p>
                              {addr.state && <p>{addr.state}</p>}
                              <p className="pt-2 text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-indigo-400" />
                                Phone: <span className="text-white font-bold">{order.userPhone || addr.phone || addr.mobile || 'N/A'}</span>
                              </p>
                              <p className="text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-indigo-400" />
                                Email: <span className="text-white font-bold">{order.userEmail || addr.email || 'N/A'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Payment & Voucher Breakdown */}
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5" />
                              Payment & Voucher Details
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                                <span className="text-slate-400">Payment Status:</span>
                                <span className="font-black text-emerald-400">{isPaid ? 'PAID CONFIRMED' : 'PENDING / COD'}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                                <span className="text-slate-400">Payment ID:</span>
                                <span className="font-mono text-white text-[11px]">{order.paymentId || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                                <span className="text-slate-400">Payment Method:</span>
                                <span className="text-white font-bold">{order.paymentMethod || 'Razorpay LIVE'}</span>
                              </div>

                              {order.referral && order.referral.rewardVoucherCode && (
                                <div className="mt-2 bg-indigo-950/80 border border-indigo-800/60 rounded-lg p-2.5 space-y-1">
                                  <p className="text-[10px] font-black uppercase text-indigo-300">🎁 REFERRAL VOUCHER GENERATED FOR CUSTOMER</p>
                                  <p className="font-mono text-xs text-white font-bold">{order.referral.rewardVoucherCode}</p>
                                  <p className="text-[10px] text-slate-400">Entitles customer to ₹500 off on next purchase</p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Items Breakdown Table */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-indigo-400" />
                            Items Purchased ({items.length})
                          </h4>
                          <div className="divide-y divide-slate-800">
                            {items.map((it, idx) => {
                              const pName = it.name || (it.product && it.product.name) || 'VOEUX Product';
                              const qty = it.quantity || 1;
                              const price = it.price || (it.product && it.product.price) || 0;
                              const img = it.image || (it.product && it.product.image) || '/images/voeux_logo.png';

                              return (
                                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg p-1 shrink-0">
                                      <img src={img} alt={pName} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-white">{pName}</p>
                                      <p className="text-[11px] text-slate-400">Qty: {qty} × ₹{price.toLocaleString('en-IN')}</p>
                                    </div>
                                  </div>
                                  <p className="text-sm font-black text-white">₹{(qty * price).toLocaleString('en-IN')}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            onClick={() => copyOrderDetails(order)}
                            className="flex items-center gap-2 bg-[#3B429F] hover:bg-[#2B308B] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-lg"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Formatted Order Details (for Shipping)
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Google Sheet Integration Guide ── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Google Sheet Automatic Order Sync</h3>
              <p className="text-xs text-slate-400">Every order placed on <span className="text-emerald-400 font-bold">voeuxtechnologies.in</span> automatically writes a row to your Google Sheet!</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-300">Columns Recorded in Your Google Sheet ("Orders" Tab):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs text-slate-400 font-mono">
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">1. Date & Time</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">2. Order ID</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">3. Customer Name</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">4. Customer Email</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">5. Customer Phone</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">6. Items Purchased</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">7. Total Amount (₹)</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">8. Payment ID</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">9. Payment Method</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">10. Shipping Address</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">11. Order Status</span>
            </div>
          </div>
        </div>

        {/* ── Collapsible Order Workflow & Explanation Guide ── */}
        <div className="border border-slate-800 rounded-3xl overflow-hidden bg-slate-900/60">
          <button
            onClick={() => setShowWorkflowGuide(!showWorkflowGuide)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-black text-white">How Order Processing Works Behind the Scenes</h3>
                <p className="text-xs text-slate-400">Step-by-step workflow of what happens when a customer purchases on VOEUX®</p>
              </div>
            </div>
            {showWorkflowGuide ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showWorkflowGuide && (
            <div className="p-6 border-t border-slate-800 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    step: '01',
                    icon: <CreditCard className="w-5 h-5" />,
                    title: 'Razorpay Payment Gateway Opens',
                    color: 'text-blue-400',
                    bg: 'bg-blue-950/40 border-blue-800/40',
                    desc: 'Customer clicks Checkout → Razorpay modal opens with VOEUX® branding. Payment is collected in live mode via UPI, Cards, Netbanking, or Wallets.'
                  },
                  {
                    step: '02',
                    icon: <CheckCircle className="w-5 h-5" />,
                    title: 'Payment Success → Order ID Generated',
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-950/40 border-emerald-800/40',
                    desc: 'Razorpay returns payment ID (e.g. pay_XXXX). Order ID (VX-XXXXXX) is generated with shipping address, timestamp, and item list.'
                  },
                  {
                    step: '03',
                    icon: <Database className="w-5 h-5" />,
                    title: 'Firebase RTDB Sync',
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-950/30 border-yellow-800/40',
                    desc: 'Order is posted immediately to Firebase Realtime DB under /orders.json, making it instantly visible on this Admin Orders page.'
                  },
                  {
                    step: '04',
                    icon: <FileSpreadsheet className="w-5 h-5" />,
                    title: 'Google Sheet Auto-Appended',
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-950/40 border-emerald-800/40',
                    desc: 'Google Apps Script receives the order payload and appends a structured row to your Google Sheet with full customer & payment details.'
                  },
                  {
                    step: '05',
                    icon: <Mail className="w-5 h-5" />,
                    title: 'Email Receipt to Customer',
                    color: 'text-pink-400',
                    bg: 'bg-pink-950/30 border-pink-800/40',
                    desc: 'An automated receipt is emailed to the customer with itemized details, shipping address, and a ₹500 referral voucher code.'
                  },
                  {
                    step: '06',
                    icon: <Bell className="w-5 h-5" />,
                    title: 'Office Alert to voeuxoffice@gmail.com',
                    color: 'text-orange-400',
                    bg: 'bg-orange-950/30 border-orange-800/40',
                    desc: 'An instant alert email is delivered to voeuxoffice@gmail.com with subject "NEW ORDER RECEIVED #VX-XXXXX — ₹X,XXX" for dispatch.'
                  }
                ].map(({ step, icon, title, color, bg, desc }) => (
                  <div key={step} className={`rounded-2xl border p-4 space-y-2 ${bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`${color} font-black text-xs w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0`}>
                        {step}
                      </div>
                      <div className={`${color}`}>{icon}</div>
                      <h4 className="text-xs font-black text-white leading-tight">{title}</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-10">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
