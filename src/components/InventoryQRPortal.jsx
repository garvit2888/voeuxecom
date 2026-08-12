import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import {
  QrCode,
  Printer,
  Package,
  User,
  MapPin,
  Plus,
  Minus,
  CheckCircle,
  ArrowLeft,
  Search,
  ExternalLink,
  RefreshCcw,
  Sparkles,
  Layers,
  Copy,
  Check,
  Smartphone
} from 'lucide-react';

export const InventoryQRPortal = () => {
  const { setActivePage } = useShop();

  // Initial Pre-seeded Shelves Data (persisted in localStorage)
  const defaultShelves = [
    {
      id: 'VOEUX-INV-101',
      shelfNumber: 'A-12',
      productName: 'Voeux X80 Diamond Premium Android Car Stereo (4GB+64GB)',
      assistantName: 'Rajesh Kumar',
      quantity: 45,
      notes: 'Rack 1, Top Tier • High Demand Item',
      createdAt: new Date(Date.now() - 86400000 * 3).toLocaleString('en-IN')
    },
    {
      id: 'VOEUX-INV-102',
      shelfNumber: 'B-04',
      productName: 'VOEUX® 160W 2-in-1 Separable Bluetooth Soundbar with Subwoofer',
      assistantName: 'Vikram Singh',
      quantity: 28,
      notes: 'Zone B Soundbar Bay',
      createdAt: new Date(Date.now() - 86400000 * 2).toLocaleString('en-IN')
    },
    {
      id: 'VOEUX-INV-103',
      shelfNumber: 'C-08',
      productName: 'Voeux Android 4+64GB, 6th Gen, 4 Core Car Stereo with Apple CarPlay & Android Auto',
      assistantName: 'Amit Sharma',
      quantity: 60,
      notes: 'Carbon Black Series Pallet',
      createdAt: new Date(Date.now() - 86400000 * 1).toLocaleString('en-IN')
    }
  ];

  const [shelves, setShelves] = useState(() => {
    try {
      const saved = localStorage.getItem('voeux_warehouse_shelves');
      return saved ? JSON.parse(saved) : defaultShelves;
    } catch (e) {
      return defaultShelves;
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('voeux_warehouse_shelves', JSON.stringify(shelves));
    } catch (e) {}
  }, [shelves]);

  // Form State
  const [productName, setProductName] = useState(PRODUCTS[0]?.name || '');
  const [customProduct, setCustomProduct] = useState('');
  const [assistantName, setAssistantName] = useState('');
  const [shelfNumber, setShelfNumber] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [notes, setNotes] = useState('');

  // Active View State: 'create' | 'qr-generated' | 'shelf-detail' | 'all-shelves'
  const [viewMode, setViewMode] = useState('create');
  const [activeShelf, setActiveShelf] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Detect URL parameter when scanned from mobile phone camera
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shelfIdFromUrl = urlParams.get('shelfId');
    const hash = window.location.hash || '';

    if (shelfIdFromUrl) {
      const matched = shelves.find(s => s.id === shelfIdFromUrl);
      if (matched) {
        setActiveShelf(matched);
        setViewMode('shelf-detail');
      } else {
        // Create temporary view if dynamic shelf ID scanned
        const dynamicShelf = {
          id: shelfIdFromUrl,
          shelfNumber: urlParams.get('shelf') || 'A-01',
          productName: urlParams.get('product') || 'VOEUX Car Electronics Product',
          assistantName: urlParams.get('assistant') || 'Warehouse Staff',
          quantity: parseInt(urlParams.get('qty') || '30', 10),
          notes: 'Scanned via Mobile Camera',
          createdAt: new Date().toLocaleString('en-IN')
        };
        setActiveShelf(dynamicShelf);
        setViewMode('shelf-detail');
      }
    }
  }, []);

  // Submit Handler for Generating New QR Tag
  const handleGenerateQR = (e) => {
    e.preventDefault();
    const selectedProd = productName === 'CUSTOM' ? customProduct : productName;
    if (!selectedProd || !assistantName || !shelfNumber) {
      alert('Please fill in Product Name, Assistant Name, and Shelf Number.');
      return;
    }

    const newId = `VOEUX-INV-${Math.floor(100 + Math.random() * 900)}`;
    const newShelf = {
      id: newId,
      shelfNumber: shelfNumber.toUpperCase().trim(),
      productName: selectedProd,
      assistantName: assistantName.trim(),
      quantity: Number(quantity) || 1,
      notes: notes.trim() || 'Standard Storage Zone',
      createdAt: new Date().toLocaleString('en-IN')
    };

    setShelves(prev => [newShelf, ...prev]);
    setActiveShelf(newShelf);
    setViewMode('qr-generated');
  };

  // Helper to generate full scan URL encoded into QR Code
  const getScanUrl = (shelf) => {
    if (!shelf) return window.location.href;
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?shelfId=${shelf.id}&shelf=${encodeURIComponent(shelf.shelfNumber)}&product=${encodeURIComponent(shelf.productName)}&assistant=${encodeURIComponent(shelf.assistantName)}&qty=${shelf.quantity}#inventory-qr`;
  };

  // Helper to generate QR Image URL
  const getQrImageUrl = (shelf) => {
    const scanUrl = getScanUrl(shelf);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(scanUrl)}&margin=1`;
  };

  // Copy Link Handler
  const handleCopyLink = (shelf) => {
    const url = getScanUrl(shelf);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Print Handler
  const handlePrintTag = () => {
    window.print();
  };

  // Stock Quantity Adjuster
  const updateQuantity = (amount) => {
    if (!activeShelf) return;
    const newQty = Math.max(0, activeShelf.quantity + amount);
    const updated = { ...activeShelf, quantity: newQty };
    setActiveShelf(updated);
    setShelves(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const filteredShelves = shelves.filter(s =>
    s.shelfNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.assistantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white py-8 px-4 sm:px-6">
      
      {/* ==================== PRINTABLE STICKER TAG (HIDDEN ON SCREEN, SHOWN ON PRINT) ==================== */}
      {activeShelf && (
        <div id="printable-qr-tag" className="hidden print:block font-sans text-black bg-white p-6">
          <div className="max-w-xs mx-auto border-4 border-black p-5 rounded-2xl text-center space-y-3 bg-white">
            <div className="border-b-2 border-black pb-2">
              <h2 className="text-xl font-black tracking-widest uppercase text-black">VOEUX® LOGISTICS</h2>
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Warehouse Shelf Inventory Tag</p>
            </div>

            <div className="bg-black text-white font-black text-2xl py-2 px-3 rounded-lg tracking-widest">
              SHELF {activeShelf.shelfNumber}
            </div>

            <div className="flex justify-center py-1">
              <img
                src={getQrImageUrl(activeShelf)}
                alt="Shelf QR Code"
                className="w-44 h-44 object-contain border-2 border-black p-1 rounded-md"
              />
            </div>

            <div className="text-left space-y-1 text-xs border-t-2 border-black pt-2 font-medium">
              <p className="truncate"><strong>PRODUCT:</strong> {activeShelf.productName}</p>
              <p><strong>ASSISTANT:</strong> {activeShelf.assistantName}</p>
              <p><strong>INITIAL STOCK:</strong> {activeShelf.quantity} Units</p>
              <p><strong>TAG ID:</strong> {activeShelf.id}</p>
              <p><strong>DATE:</strong> {activeShelf.createdAt}</p>
            </div>

            <div className="border-t border-dashed border-gray-400 pt-2 text-[9px] text-gray-700 italic">
              Scan QR code with mobile phone camera to open live inventory details & update stock.
            </div>
          </div>
        </div>
      )}

      {/* ==================== MAIN APPLICATION INTERFACE (NON-PRINT) ==================== */}
      <div className="max-w-4xl mx-auto space-y-8 print:hidden">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600/30 text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-full border border-indigo-500/30 tracking-widest uppercase">
                Internal Logistics Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              <QrCode className="w-7 h-7 text-cyan-400" />
              <span>Warehouse QR Inventory System</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Generate printable shelf QR codes & scan tags live via phone camera
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('create')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'create' ? 'bg-[#3B429F] text-white shadow-lg shadow-indigo-900/50' : 'bg-slate-900 text-gray-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>New QR Tag</span>
            </button>

            <button
              onClick={() => setViewMode('all-shelves')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'all-shelves' ? 'bg-[#3B429F] text-white shadow-lg shadow-indigo-900/50' : 'bg-slate-900 text-gray-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Shelves ({shelves.length})</span>
            </button>
          </div>
        </div>

        {/* ==================== VIEW 1: CREATE NEW SHELF QR TAG FORM ==================== */}
        {viewMode === 'create' && (
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Generate Warehouse Shelf QR Tag</h2>
                <p className="text-xs text-gray-400">Enter shelf allocation details to produce a printable sticker tag</p>
              </div>
            </div>

            <form onSubmit={handleGenerateQR} className="space-y-5">
              
              {/* Product Selection */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select Product</span>
                </label>
                <select
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  {PRODUCTS.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Enter Custom Product Name...</option>
                </select>

                {productName === 'CUSTOM' && (
                  <input
                    type="text"
                    placeholder="Type custom product name..."
                    value={customProduct}
                    onChange={(e) => setCustomProduct(e.target.value)}
                    className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    required
                  />
                )}
              </div>

              {/* Grid 2-cols: Assistant Name & Shelf Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Warehouse Assistant Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Shelf Number / Rack Zone</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A-12 or Zone 3-B"
                    value={shelfNumber}
                    onChange={(e) => setShelfNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white uppercase placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>
              </div>

              {/* Quantity & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Notes / Pallet Batch Info</label>
                  <input
                    type="text"
                    placeholder="e.g. Top Rack, Fast Moving, Batch #2026-08"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs sm:text-sm font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-900/60 cursor-pointer"
              >
                <QrCode className="w-5 h-5" />
                <span>GENERATE & PREVIEW PRINTABLE QR CODE TAG</span>
              </button>
            </form>
          </div>
        )}

        {/* ==================== VIEW 2: QR GENERATED & PRINT PREVIEW ==================== */}
        {viewMode === 'qr-generated' && activeShelf && (
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">QR Code Tag Ready for Printing</h2>
                  <p className="text-xs text-gray-400">Stick this printed QR tag on Warehouse Shelf {activeShelf.shelfNumber}</p>
                </div>
              </div>

              <button
                onClick={() => setViewMode('create')}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            {/* Visual Label Box Preview */}
            <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center gap-8 justify-between">
              
              {/* QR Image Frame */}
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-slate-900 text-center">
                  <img
                    src={getQrImageUrl(activeShelf)}
                    alt="Generated QR"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                  <span className="block mt-2 text-[10px] font-black tracking-widest text-slate-800 uppercase">
                    SCAN WITH PHONE CAMERA
                  </span>
                </div>

                <button
                  onClick={() => handleCopyLink(activeShelf)}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1.5 pt-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Direct Scan Link Copied!' : 'Copy Direct Scan URL'}</span>
                </button>
              </div>

              {/* Shelf Tag Summary */}
              <div className="flex-1 space-y-4 text-left">
                <div>
                  <span className="bg-indigo-600/30 text-cyan-300 text-[11px] font-black px-3 py-1 rounded-full border border-indigo-500/30 tracking-widest uppercase">
                    SHELF LOCATION
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                    SHELF {activeShelf.shelfNumber}
                  </h1>
                </div>

                <div className="space-y-2 text-xs text-gray-300 border-y border-slate-800/80 py-3">
                  <p><strong className="text-white">Product:</strong> {activeShelf.productName}</p>
                  <p><strong className="text-white">Assigned Assistant:</strong> {activeShelf.assistantName}</p>
                  <p><strong className="text-white">Stock Quantity:</strong> <span className="text-emerald-400 font-bold">{activeShelf.quantity} Units</span></p>
                  <p><strong className="text-white">Tag Record ID:</strong> <span className="font-mono text-gray-400">{activeShelf.id}</span></p>
                </div>

                {/* Print Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handlePrintTag}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PRINT STICKER TAG (WINDOW.PRINT)</span>
                  </button>

                  <button
                    onClick={() => setViewMode('shelf-detail')}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>Test Mobile Phone Scan View</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== VIEW 3: SCANNED SHELF DETAIL VIEW (PHONE CAMERA VIEW) ==================== */}
        {viewMode === 'shelf-detail' && activeShelf && (
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl space-y-6 text-left animate-in fade-in duration-300">
            
            {/* Header notification badge */}
            <div className="bg-indigo-950/80 border border-indigo-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-cyan-300">
                <Smartphone className="w-5 h-5 shrink-0" />
                <span>Scanned Live from Warehouse Mobile Camera</span>
              </div>
              <button
                onClick={() => setViewMode('all-shelves')}
                className="text-[11px] text-gray-400 hover:text-white underline shrink-0"
              >
                View All Shelves
              </button>
            </div>

            {/* Shelf Location Tag */}
            <div>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-3 py-1 rounded-full border border-cyan-500/40 uppercase tracking-widest">
                VERIFIED SHELF LOCATION
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-1.5 tracking-tight">
                SHELF {activeShelf.shelfNumber}
              </h1>
              <p className="text-xs text-gray-400 mt-1">Tag ID: <span className="font-mono text-cyan-400">{activeShelf.id}</span> • Scanned at {new Date().toLocaleTimeString('en-IN')}</p>
            </div>

            {/* Product Details Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <span className="text-[10px] text-gray-500 font-extrabold uppercase">Product Item</span>
                <h3 className="text-base font-bold text-white mt-0.5">{activeShelf.productName}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-800/80 pt-3">
                <div>
                  <span className="text-[10px] text-gray-500">Assigned Assistant</span>
                  <p className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeShelf.assistantName}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500">Zone / Notes</span>
                  <p className="font-semibold text-white mt-0.5">{activeShelf.notes || 'Standard Rack'}</p>
                </div>
              </div>
            </div>

            {/* Live Stock Counter & Quick Adjuster */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-300 font-semibold">Current Live Stock Quantity</span>
                <div className="text-3xl font-black text-emerald-400 mt-0.5">
                  {activeShelf.quantity} <span className="text-xs font-normal text-gray-400">Units</span>
                </div>
              </div>

              {/* Adjust Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(-1)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center justify-center cursor-pointer border border-slate-700"
                  title="Decrease Stock Count"
                >
                  <Minus className="w-5 h-5 text-red-400" />
                </button>

                <button
                  onClick={() => updateQuantity(1)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center justify-center cursor-pointer border border-slate-700"
                  title="Increase Stock Count"
                >
                  <Plus className="w-5 h-5 text-emerald-400" />
                </button>

                <button
                  onClick={() => handlePrintTag()}
                  className="ml-2 bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-extrabold py-3 px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Reprint Tag</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ==================== VIEW 4: ALL WAREHOUSE SHELVES LIST ==================== */}
        {viewMode === 'all-shelves' && (
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">All Warehouse Shelves & QR Tags</h2>
                <p className="text-xs text-gray-400">Search active shelf allocations across the warehouse</p>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search shelf # or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-400"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {filteredShelves.map(shelf => (
                <div
                  key={shelf.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3 hover:border-indigo-500/40 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="bg-indigo-600/30 text-cyan-300 text-xs font-black px-2.5 py-0.5 rounded-lg border border-indigo-500/30 uppercase">
                      SHELF {shelf.shelfNumber}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{shelf.id}</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{shelf.productName}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Assistant: <strong className="text-gray-200">{shelf.assistantName}</strong></p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-emerald-400 font-extrabold">{shelf.quantity} Units in Stock</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveShelf(shelf);
                          setViewMode('shelf-detail');
                        }}
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => {
                          setActiveShelf(shelf);
                          setViewMode('qr-generated');
                        }}
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Print QR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
