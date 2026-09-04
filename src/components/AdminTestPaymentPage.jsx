import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Package, Mail, Database, CreditCard,
  CheckCircle, RefreshCw, Search, Copy, ExternalLink,
  ChevronDown, ChevronUp, FileSpreadsheet, Phone, MapPin, Calendar, Clock,
  ArrowUpRight, ShoppingBag, TrendingUp, DollarSign, BarChart2, Filter, Layers
} from 'lucide-react';

// ── SECRET TEST PRODUCT (₹1 for live payment testing) ──────────────────────
const TEST_PRODUCT = {
  id: 'TEST-PAYMENT-PRODUCT-001',
  name: 'VOEUX® Test Product — Payment Flow Validation',
  price: 1,
  image: '/images/voeux_logo.png',
  category: 'test',
  description: 'Internal test product. ₹1 charge for verifying live Razorpay payment, orders logging & email notifications.',
  badge: 'ADMIN TEST'
};

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/';

export const AdminTestPaymentPage = () => {
  const { addToCart, buyNowCheckout, user, setIsAuthModalOpen, addToast, orders: localOrders } = useShop();
  const [added, setAdded] = useState(false);
  const [firebaseOrders, setFirebaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, cod, today
  const [showTestProduct, setShowTestProduct] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [chartRange, setChartRange] = useState('7d'); // 7d, 30d, all
  const [hoveredPoint, setHoveredPoint] = useState(null);

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
  const allCombinedOrders = useMemo(() => {
    const map = new Map();
    (localOrders || []).forEach(ord => {
      if (ord && ord.id) map.set(ord.id, ord);
    });
    firebaseOrders.forEach(ord => {
      if (ord && ord.id) map.set(ord.id, ord);
    });
    const combined = Array.from(map.values());
    combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return combined;
  }, [localOrders, firebaseOrders]);

  // Filtered orders based on search and status
  const filteredOrders = useMemo(() => {
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
        return ord.paymentMethod === 'Razorpay' || ord.paymentMethod === 'RAZORPAY_ONLINE' || (ord.paymentId && ord.paymentId !== 'N/A');
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
  const totalRevenue = useMemo(() => {
    return allCombinedOrders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);
  }, [allCombinedOrders]);

  const paidCount = useMemo(() => {
    return allCombinedOrders.filter(ord => ord.paymentMethod === 'Razorpay' || ord.paymentMethod === 'RAZORPAY_ONLINE' || (ord.paymentId && ord.paymentId !== 'N/A')).length;
  }, [allCombinedOrders]);

  const averageOrderValue = useMemo(() => {
    if (!allCombinedOrders.length) return 0;
    return Math.round(totalRevenue / allCombinedOrders.length);
  }, [totalRevenue, allCombinedOrders]);

  // Chart Data Processing (Group revenue by date)
  const chartData = useMemo(() => {
    const daysCount = chartRange === '7d' ? 7 : chartRange === '30d' ? 30 : 60;
    const dateMap = new Map();

    // Fill last N days with 0 default
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap.set(dateKey, { date: dateKey, revenue: 0, ordersCount: 0 });
    }

    // Populate with real orders data
    allCombinedOrders.forEach(ord => {
      const d = new Date(ord.createdAt || Date.now());
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dateMap.has(dateKey)) {
        const curr = dateMap.get(dateKey);
        curr.revenue += Number(ord.totalAmount) || 0;
        curr.ordersCount += 1;
      }
    });

    return Array.from(dateMap.values());
  }, [allCombinedOrders, chartRange]);

  // Compute SVG Path points for the Vibecoded Analytics Chart
  const svgChartPath = useMemo(() => {
    if (!chartData || chartData.length < 2) return { linePath: '', areaPath: '', points: [] };

    const width = 800;
    const height = 180;
    const padding = 20;

    const maxRev = Math.max(...chartData.map(d => d.revenue), 100);
    const stepX = (width - padding * 2) / (chartData.length - 1);

    const points = chartData.map((d, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (d.revenue / maxRev) * (height - padding * 2);
      return { x, y, data: d };
    });

    // Generate smooth bezier curve path
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      linePath += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const areaPath = `${linePath} L ${lastX} ${height} L ${firstX} ${height} Z`;

    return { linePath, areaPath, points };
  }, [chartData]);

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
      return `• ${pName} x${qty} (₹${price})`;
    }).join('\n');

    const addr = order.shippingAddress;
    const addrStr = addr ? `${addr.fullName || ''}\n${addr.street || ''}, ${addr.city || ''} - ${addr.pincode || ''}\nPhone: ${addr.phone || addr.mobile || order.userPhone || 'N/A'}` : 'N/A';

    const text = `VOEUX® ORDER RECEIPT #${order.id || 'VX-ORDER'}
Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}
Customer: ${addr?.fullName || order.userName || 'Customer'}
Email: ${order.userEmail || addr?.email || 'N/A'}
Phone: ${order.userPhone || addr?.phone || addr?.mobile || 'N/A'}

ITEMS PURCHASED:
${itemsStr}

TOTAL PAID: ₹${order.totalAmount || 0}
PAYMENT METHOD: ${order.paymentMethod || 'Razorpay'}
PAYMENT ID: ${order.paymentId || 'N/A'}

SHIPPING ADDRESS:
${addrStr}`;

    navigator.clipboard.writeText(text);
    addToast(`Order #${order.id} details copied to clipboard!`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#3B429F] selection:text-white">

      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3B429F] text-white flex items-center justify-center shadow-md shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">Orders & Sales Analytics</h1>
              <p className="text-xs text-slate-500 font-medium">VOEUX Store Dashboard</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Google Sheets Link Button */}
            <a
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Open Google Sheet</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Test Payment Mode Toggle */}
            <button
              onClick={() => setShowTestProduct(!showTestProduct)}
              className="flex items-center gap-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-slate-700 px-4 py-2.5 rounded-xl border border-gray-200 transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-[#3B429F]" />
              <span>{showTestProduct ? 'Close ₹1 Test' : '₹1 Test Payment'}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchOrdersFromFirebase}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold bg-[#3B429F] hover:bg-[#2B308B] text-white px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* ── Metric Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">TOTAL GROSS SALES</span>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">All live orders cumulative value</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">TOTAL ORDERS</span>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{allCombinedOrders.length}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Orders placed across all channels</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">PAID ONLINE (RAZORPAY)</span>
            <div className="mt-3">
              <p className="text-3xl font-black text-emerald-600 tracking-tight">{paidCount}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Instant online payment verified</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">CASH ON DELIVERY</span>
            <div className="mt-3">
              <p className="text-3xl font-black text-amber-600 tracking-tight">{allCombinedOrders.length - paidCount}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Pending collection on delivery</p>
            </div>
          </div>

        </div>

        {/* ── HEAVILY VIBECODED SALES ANALYTICS GRAPH ── */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#3B429F]" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Revenue & Orders Trend</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Real-time daily sales performance and order velocity</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                {[
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: 'all', label: 'All Time' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setChartRange(tab.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      chartRange === tab.id
                        ? 'bg-white text-[#3B429F] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar inside Graph */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 rounded-2xl p-4 border border-gray-200/60">
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Avg Order Value (AOV)</p>
              <p className="text-lg font-black text-slate-900">₹{averageOrderValue.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Total Tracked Revenue</p>
              <p className="text-lg font-black text-[#3B429F]">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] font-bold uppercase text-slate-400">Active Sales Velocity</p>
              <p className="text-lg font-black text-emerald-600">{(allCombinedOrders.length / Math.max(chartData.length, 1)).toFixed(1)} orders/day</p>
            </div>
          </div>

          {/* SVG Smooth Curved Area Chart */}
          <div className="relative pt-4 overflow-hidden">
            <svg viewBox="0 0 800 180" className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="vibecodeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B429F" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3B429F" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background horizontal gridlines */}
              <line x1="20" y1="20" x2="780" y2="20" stroke="#F1F5F9" strokeWidth="1.5" />
              <line x1="20" y1="70" x2="780" y2="70" stroke="#F1F5F9" strokeWidth="1.5" />
              <line x1="20" y1="120" x2="780" y2="120" stroke="#F1F5F9" strokeWidth="1.5" />
              <line x1="20" y1="160" x2="780" y2="160" stroke="#E2E8F0" strokeWidth="1.5" />

              {/* Area Gradient Fill */}
              {svgChartPath.areaPath && (
                <path d={svgChartPath.areaPath} fill="url(#vibecodeGradient)" />
              )}

              {/* Bezier Stroke Curve */}
              {svgChartPath.linePath && (
                <path
                  d={svgChartPath.linePath}
                  fill="none"
                  stroke="#3B429F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Interactive Points */}
              {svgChartPath.points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint === idx ? "6" : "4"}
                    fill="#3B429F"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* Date Axis Label */}
                  <text
                    x={pt.x}
                    y="176"
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-semibold"
                  >
                    {pt.data.date}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint !== null && svgChartPath.points[hoveredPoint] && (
              <div
                className="absolute bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 z-20 space-y-1"
                style={{
                  left: `${(svgChartPath.points[hoveredPoint].x / 800) * 100}%`,
                  top: `${(svgChartPath.points[hoveredPoint].y / 180) * 100}%`
                }}
              >
                <p className="font-bold text-slate-300 border-b border-slate-700 pb-1">
                  {svgChartPath.points[hoveredPoint].data.date}
                </p>
                <p className="text-white font-extrabold">
                  Revenue: ₹{svgChartPath.points[hoveredPoint].data.revenue.toLocaleString('en-IN')}
                </p>
                <p className="text-indigo-300 font-semibold text-[11px]">
                  Orders: {svgChartPath.points[hoveredPoint].data.ordersCount}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Collapsible ₹1 Test Payment Section ── */}
        {showTestProduct && (
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 shadow-md relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 p-2 border border-gray-200 shadow-sm">
                  <img src="/images/voeux_logo.png" alt="Test Product" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase text-[#3B429F] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      ADMIN TEST MODE
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      REAL ₹1 CHARGE
                    </span>
                  </div>
                  <h2 className="text-base font-black text-slate-900">{TEST_PRODUCT.name}</h2>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-xl">{TEST_PRODUCT.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3B429F] hover:bg-[#2B308B] text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4" />
                  Buy Now ₹1
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 font-bold text-xs px-6 py-3 rounded-xl transition border cursor-pointer whitespace-nowrap ${
                    added
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-white border-gray-300 text-slate-700 hover:bg-gray-50'
                  }`}
                >
                  {added ? <><CheckCircle className="w-4 h-4" /> Added!</> : <><Package className="w-4 h-4" /> Add to Cart</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Search Bar & Filter Controls ── */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Phone, Email, City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#3B429F] focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: `All (${allCombinedOrders.length})` },
              { id: 'paid', label: `Paid Online (${paidCount})` },
              { id: 'cod', label: `COD (${allCombinedOrders.length - paidCount})` },
              { id: 'today', label: `Today` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#3B429F] border-[#3B429F] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-slate-600 hover:text-slate-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* ── Orders List ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#3B429F]" />
              Showing {filteredOrders.length} Orders
            </h3>
            <span className="text-xs text-slate-500 font-medium">Click order card to expand details</span>
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-14 text-center space-y-3 shadow-sm">
              <RefreshCw className="w-8 h-8 text-[#3B429F] animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">Loading latest customer orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-14 text-center space-y-3 shadow-sm">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-base font-black text-slate-900">No Orders Found</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchTerm
                  ? `No orders matching "${searchTerm}". Try clearing search.`
                  : 'No customer orders placed yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const isExpanded = expandedOrderId === order.id;
                const items = order.items || [];
                const addr = order.shippingAddress || {};
                const isPaid = order.paymentMethod === 'Razorpay' || order.paymentMethod === 'RAZORPAY_ONLINE' || (order.paymentId && order.paymentId !== 'N/A');

                return (
                  <div
                    key={order.id || order.firebaseKey}
                    className={`bg-white border rounded-3xl transition-all overflow-hidden ${
                      isExpanded ? 'border-[#3B429F] shadow-md ring-1 ring-[#3B429F]' : 'border-gray-200/80 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    {/* Order Summary Header Row */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition select-none"
                    >
                      {/* Left side order info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-gray-200 font-mono">
                            #{order.id || 'VX-ORDER'}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {isPaid ? 'PAID ONLINE (RAZORPAY)' : (order.paymentMethod || 'COD')}
                          </span>
                          {order.status && (
                            <span className="text-[10px] font-bold text-slate-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                              {order.status}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-700">
                          <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#3B429F] inline-block" />
                            {addr.fullName || order.userName || 'Customer'}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {order.userEmail || addr.email || 'N/A'}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {order.userPhone || addr.phone || addr.mobile || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Right side price & action */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-gray-100 pt-4 lg:pt-0">
                        <div className="text-left lg:text-right">
                          <p className="text-xl font-black text-slate-900 tracking-tight">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 lg:justify-end mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyOrderDetails(order);
                            }}
                            className="p-2.5 rounded-xl bg-gray-100 hover:bg-[#3B429F] text-slate-600 hover:text-white transition cursor-pointer"
                            title="Copy details for WhatsApp/Courier"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <div className="p-2.5 rounded-xl bg-gray-100 text-slate-500">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200/80 p-6 bg-slate-50/50 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Delivery Address */}
                          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#3B429F] flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Customer Delivery Address
                            </h4>
                            <div className="space-y-1.5 text-xs text-slate-600">
                              <p className="font-extrabold text-slate-900 text-sm">{addr.fullName || order.userName || 'N/A'}</p>
                              <p>{addr.street || 'Street not specified'}</p>
                              <p>{addr.city ? `${addr.city} - ${addr.pincode || ''}` : ''}</p>
                              {addr.state && <p>{addr.state}</p>}
                              <p className="pt-2 text-slate-500 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-[#3B429F]" />
                                Phone: <span className="text-slate-900 font-bold">{order.userPhone || addr.phone || addr.mobile || 'N/A'}</span>
                              </p>
                              <p className="text-slate-500 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-[#3B429F]" />
                                Email: <span className="text-slate-900 font-bold">{order.userEmail || addr.email || 'N/A'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Payment Breakdown */}
                          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Payment Details
                            </h4>
                            <div className="space-y-2.5 text-xs">
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-500">Payment Status:</span>
                                <span className="font-extrabold text-emerald-700">{isPaid ? 'PAID ONLINE (RAZORPAY)' : 'CASH ON DELIVERY'}</span>
                              </div>
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-500">Payment ID:</span>
                                <span className="font-mono text-slate-900 text-[11px] font-bold">{order.paymentId || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-500">Payment Method:</span>
                                <span className="text-slate-900 font-bold">{order.paymentMethod || 'Razorpay LIVE'}</span>
                              </div>

                              {order.referral && order.referral.rewardVoucherCode && (
                                <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-1">
                                  <p className="text-[10px] font-black uppercase text-[#3B429F]">REFERRAL REWARD CODE GENERATED</p>
                                  <p className="font-mono text-xs text-slate-900 font-bold">{order.referral.rewardVoucherCode}</p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Items Purchased Breakdown */}
                        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#3B429F]" />
                            Items Purchased ({items.length})
                          </h4>
                          <div className="divide-y divide-gray-100">
                            {items.map((it, idx) => {
                              const pName = it.name || (it.product && it.product.name) || 'VOEUX Product';
                              const qty = it.quantity || 1;
                              const price = it.price || (it.product && it.product.price) || 0;
                              const img = it.image || (it.product && it.product.image) || '/images/voeux_logo.png';

                              return (
                                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl p-1.5 shrink-0 border border-gray-200 shadow-sm">
                                      <img src={img} alt={pName} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-extrabold text-slate-900">{pName}</p>
                                      <p className="text-[11px] text-slate-500 font-medium">Qty: {qty} × ₹{price.toLocaleString('en-IN')}</p>
                                    </div>
                                  </div>
                                  <p className="text-sm font-black text-slate-900">₹{(qty * price).toLocaleString('en-IN')}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => copyOrderDetails(order)}
                            className="flex items-center gap-2 bg-[#3B429F] hover:bg-[#2B308B] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition cursor-pointer shadow-sm"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy Formatted Order Details (for Shipping)</span>
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

      </main>
    </div>
  );
};
