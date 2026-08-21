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
  Edit3,
  Save,
  Layers,
  Copy,
  Check,
  Smartphone,
  RefreshCcw,
  Trash2,
  Database
} from 'lucide-react';

export const InventoryQRPortal = () => {
  const { setActivePage } = useShop();

  // Load shelves from localStorage and purge any leftover mock data
  const [shelves, setShelves] = useState(() => {
    try {
      const saved = localStorage.getItem('voeux_warehouse_shelves');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Purge any leftover mock IDs
        const clean = (parsed || []).filter(item => item && !['VOEUX-INV-101', 'VOEUX-INV-102', 'VOEUX-INV-103'].includes(item.id));
        return clean;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Save clean shelves list to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('voeux_warehouse_shelves', JSON.stringify(shelves));
    } catch (e) {}
  }, [shelves]);

  // Form Input States
  const [productName, setProductName] = useState(PRODUCTS[0]?.name || '');
  const [customProduct, setCustomProduct] = useState('');
  const [assistantName, setAssistantName] = useState('');
  const [shelfNumber, setShelfNumber] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [notes, setNotes] = useState('');

  // Active View State: 'create' | 'qr-generated' | 'shelf-detail' | 'all-shelves'
  const [viewMode, setViewMode] = useState('create');
  const [activeShelf, setActiveShelf] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [inlineQty, setInlineQty] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Deleted Shelf IDs — cloud is authoritative, always reset from Firebase on sync
  const [deletedIds, setDeletedIds] = useState([]);

  useEffect(() => {
    // Clear any stale local deletedIds so they never block new shelves from appearing
    try { localStorage.removeItem('voeux_deleted_shelf_ids'); } catch(e) {}
  }, []);

  // Default Firebase DB URL (Auto-syncs across all devices)
  const DEFAULT_FIREBASE_URL = 'https://voeux-warehouse-default-rtdb.firebaseio.com';

  const getActiveEndpoint = () => {
    try {
      const saved = localStorage.getItem('voeux_firebase_db_url');
      if (saved && saved.trim() && !saved.includes('asia-southeast1')) {
        return saved.trim().replace(/\/+$/, '');
      }
      localStorage.removeItem('voeux_firebase_db_url');
    } catch (e) {}
    return DEFAULT_FIREBASE_URL;
  };

  // Cloud Database Sync Endpoints
  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJ8McdwGLCM2q9-lcSoDA22F7U0leONZ8ryBYKZ8kCPGYxbb-KqL7jVzYhC2IHiF-nmw/exec';

  // Fetch Cloud Database Shelves and Sync Across Devices (Firebase Realtime DB REST API)
  const syncFromCloud = async () => {
    setIsSyncing(true);
    try {
      const cleanUrl = getActiveEndpoint();
      const targetUrl = `${cleanUrl}/warehouse.json?t=${Date.now()}`;

      const res = await fetch(targetUrl, { cache: 'no-store', headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' } });
      if (res.ok) {
        const payload = await res.json();
        let cloudShelves = [];
        let cloudDeletedIds = [];

        if (payload) {
          if (Array.isArray(payload.shelves)) {
            cloudShelves = payload.shelves;
          } else if (payload.data && Array.isArray(payload.data.shelves)) {
            cloudShelves = payload.data.shelves;
          } else if (typeof payload === 'object') {
            cloudShelves = Object.values(payload.shelves || payload || {}).filter(item => item && (item.id || item.shelfId));
          }

          if (Array.isArray(payload.deletedIds)) {
            cloudDeletedIds = payload.deletedIds;
          } else if (payload.data && Array.isArray(payload.data.deletedIds)) {
            cloudDeletedIds = payload.data.deletedIds;
          }
        }

        // Firebase is authoritative — use cloud deletedIds directly, don't merge stale local ones
        const currentDeleted = Array.isArray(cloudDeletedIds) ? cloudDeletedIds : [];
        setDeletedIds(currentDeleted);

        setShelves(prev => {
          let mergedMap = new Map();

          // 1. Local shelves
          (prev || []).forEach(s => {
            if (s && s.id && !currentDeleted.includes(s.id)) {
              mergedMap.set(s.id, s);
            }
          });

          // 2. Cloud shelves (authoritative)
          cloudShelves.forEach(item => {
            const cleanId = item.shelfId || item.id;
            if (cleanId && !currentDeleted.includes(cleanId) && !['VOEUX-INV-101', 'VOEUX-INV-102', 'VOEUX-INV-103'].includes(cleanId)) {
              const cleanItem = {
                id: cleanId,
                shelfNumber: item.shelfNumber || 'A-01',
                productName: item.productName || 'VOEUX Item',
                assistantName: item.assistantName || 'Assistant',
                quantity: Number(item.quantity) || 0,
                notes: item.notes || '',
                createdAt: item.createdAt || new Date().toLocaleString('en-IN')
              };
              mergedMap.set(cleanId, cleanItem);
            }
          });

          const updatedList = Array.from(mergedMap.values());
          try { localStorage.setItem('voeux_warehouse_shelves', JSON.stringify(updatedList)); } catch(e){}
          return updatedList;
        });
      }
    } catch (err) {
      console.log('Cloud sync status:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Push Shelf Record to Cloud Database (Firebase Realtime DB REST API)
  const pushToCloud = async (shelfItem, customList = null) => {
    if (!shelfItem || !shelfItem.id || (deletedIds || []).includes(shelfItem.id)) return;

    try {
      const currentList = customList || shelves;
      const idx = currentList.findIndex(s => s.id === shelfItem.id);
      let updatedList = [...currentList];
      if (idx > -1) {
        updatedList[idx] = shelfItem;
      } else {
        updatedList = [shelfItem, ...updatedList];
      }

      const cleanUrl = getActiveEndpoint();
      await fetch(`${cleanUrl}/warehouse.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelves: updatedList,
          deletedIds: deletedIds || []
        })
      });
    } catch (e) {}

    // Backup push to Google Apps Script
    try {
      fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_shelf',
          shelf: shelfItem
        })
      }).catch(() => {});
    } catch (e) {}
  };

  // Broadcast Shelf Deletion to Cloud Database
  const deleteFromCloud = async (shelfId) => {
    if (!shelfId) return;

    const newDeleted = Array.from(new Set([...(deletedIds || []), shelfId]));
    setDeletedIds(newDeleted);
    try { localStorage.setItem('voeux_deleted_shelf_ids', JSON.stringify(newDeleted)); } catch(e){}

    const remainingShelves = (shelves || []).filter(s => s.id !== shelfId);
    setShelves(remainingShelves);
    try { localStorage.setItem('voeux_warehouse_shelves', JSON.stringify(remainingShelves)); } catch(e){}

    try {
      const cleanUrl = getActiveEndpoint();
      await fetch(`${cleanUrl}/warehouse.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelves: remainingShelves,
          deletedIds: newDeleted
        })
      });
    } catch (e) {}

    // Backup delete command to Google Apps Script
    // Backup delete command to Google Apps Script
    try {
      fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_shelf',
          shelfId: shelfId
        })
      }).catch(() => {});
    } catch (e) {}
  };

  // Auto-sync cloud data automatically on mount, window focus, and background interval
  useEffect(() => {
    syncFromCloud();

    const interval = setInterval(() => {
      syncFromCloud();
    }, 25000);

    const handleWindowFocus = () => {
      syncFromCloud();
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Navigation with Browser History (Back / Forward Arrow Support)
  const navigateView = (mode, shelf = null, skipHistory = false) => {
    setViewMode(mode);
    setIsEditing(false);
    syncFromCloud(); // Auto sync on view switch
    if (shelf) {
      setActiveShelf(shelf);
      setInlineQty(String(shelf.quantity));
    }

    if (!skipHistory) {
      let newUrl = window.location.pathname;
      if (mode === 'shelf-detail' && shelf) {
        newUrl += `?shelfId=${shelf.id}&shelf=${encodeURIComponent(shelf.shelfNumber)}&product=${encodeURIComponent(shelf.productName)}&assistant=${encodeURIComponent(shelf.assistantName)}&qty=${shelf.quantity}#inventory-qr`;
      } else if (mode === 'qr-generated' && shelf) {
        newUrl += `?shelfId=${shelf.id}&preview=true#inventory-qr`;
      } else if (mode === 'all-shelves') {
        newUrl += `?page=inventory-qr&view=all#inventory-qr`;
      } else {
        newUrl += `#inventory-qr`;
      }
      window.history.pushState({ viewMode: mode, shelfId: shelf?.id }, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Master database sync payload generator
  const getMasterSyncUrl = () => {
    try {
      const payload = btoa(encodeURIComponent(JSON.stringify(shelves)));
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?syncShelves=${payload}#inventory-qr`;
    } catch (e) {
      return window.location.href;
    }
  };

  // Sync with browser Back and Forward button events (popstate) & mobile QR camera scan URLs
  useEffect(() => {
    const handleUrlState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const shelfIdFromUrl = urlParams.get('shelfId');
      const syncShelvesParam = urlParams.get('syncShelves');

      // Master database sync URL payload scanned
      if (syncShelvesParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(syncShelvesParam)));
          if (Array.isArray(decoded) && decoded.length > 0) {
            setShelves(prev => {
              const merged = [...prev];
              decoded.forEach(item => {
                if (item && item.id && !merged.some(m => m.id === item.id)) {
                  merged.unshift(item);
                }
              });
              try { localStorage.setItem('voeux_warehouse_shelves', JSON.stringify(merged)); } catch(e){}
              return merged;
            });
          }
        } catch (e) {}
      }

      // Single shelf QR tag scanned from mobile phone camera
      if (shelfIdFromUrl) {
        const shelfNumberVal = (urlParams.get('shelf') || 'A-01').toUpperCase();
        const productNameVal = urlParams.get('product') || 'VOEUX Electronics Item';
        const assistantNameVal = urlParams.get('assistant') || 'Warehouse Assistant';
        const quantityVal = parseInt(urlParams.get('qty') || '10', 10);
        const notesVal = urlParams.get('notes') || 'Scanned via QR Code Tag';

        const scannedShelf = {
          id: shelfIdFromUrl,
          shelfNumber: shelfNumberVal,
          productName: productNameVal,
          assistantName: assistantNameVal,
          quantity: isNaN(quantityVal) ? 10 : quantityVal,
          notes: notesVal,
          createdAt: new Date().toLocaleString('en-IN')
        };

        // Unconditionally save & merge into localStorage & state on this device
        setShelves(prev => {
          const idx = prev.findIndex(s => s.id === scannedShelf.id);
          let updatedList;
          if (idx > -1) {
            updatedList = [...prev];
            updatedList[idx] = { ...updatedList[idx], ...scannedShelf };
          } else {
            updatedList = [scannedShelf, ...prev];
          }
          try { localStorage.setItem('voeux_warehouse_shelves', JSON.stringify(updatedList)); } catch(e){}
          return updatedList;
        });

        setActiveShelf(scannedShelf);
        setInlineQty(String(scannedShelf.quantity));
        setViewMode(urlParams.get('preview') ? 'qr-generated' : 'shelf-detail');
        return;
      }

      const viewParam = urlParams.get('view');
      if (viewParam === 'all') setViewMode('all-shelves');
      else setViewMode('create');
    };

    handleUrlState();

    const handlePopState = () => {
      handleUrlState();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Submit Handler for Creating a New QR Code Tag
  const handleGenerateQR = (e) => {
    e.preventDefault();
    const selectedProd = productName === 'CUSTOM' ? customProduct : productName;
    if (!selectedProd || !assistantName || !shelfNumber) {
      alert('Please fill in Product Name, Assistant Name, and Shelf Number.');
      return;
    }

    const newId = `VOEUX-INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newShelf = {
      id: newId,
      shelfNumber: shelfNumber.toUpperCase().trim(),
      productName: selectedProd,
      assistantName: assistantName.trim(),
      quantity: Number(quantity) || 1,
      notes: notes.trim() || 'Standard Storage Zone',
      createdAt: new Date().toLocaleString('en-IN')
    };

    const updatedList = [newShelf, ...(shelves || [])];
    setShelves(updatedList);
    pushToCloud(newShelf, updatedList);
    navigateView('qr-generated', newShelf);
  };

  // Save Edits to Active Shelf
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editFormData || !activeShelf) return;

    const updated = {
      ...activeShelf,
      productName: editFormData.productName,
      assistantName: editFormData.assistantName,
      shelfNumber: editFormData.shelfNumber.toUpperCase().trim(),
      quantity: Number(editFormData.quantity) || 0,
      notes: editFormData.notes
    };

    setActiveShelf(updated);
    setInlineQty(String(updated.quantity));
    const updatedList = (shelves || []).map(s => s.id === updated.id ? updated : s);
    setShelves(updatedList);
    pushToCloud(updated, updatedList);
    setIsEditing(false);
  };

  // Direct Quantity Save Handler
  const handleDirectQtySave = (e) => {
    e.preventDefault();
    if (!activeShelf) return;
    const newNum = Number(inlineQty);
    if (isNaN(newNum) || newNum < 0) return;

    const updated = { ...activeShelf, quantity: newNum };
    setActiveShelf(updated);
    const updatedList = (shelves || []).map(s => s.id === updated.id ? updated : s);
    setShelves(updatedList);
    pushToCloud(updated, updatedList);
  };

  // Helper to generate full scan URL encoded into QR Code
  const getScanUrl = (shelf) => {
    if (!shelf) return window.location.href;
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?shelfId=${shelf.id}&shelf=${encodeURIComponent(shelf.shelfNumber)}&product=${encodeURIComponent(shelf.productName)}&assistant=${encodeURIComponent(shelf.assistantName)}&qty=${shelf.quantity}&notes=${encodeURIComponent(shelf.notes || '')}#inventory-qr`;
  };

  // Helper to generate QR Image URL
  const getQrImageUrl = (shelf) => {
    const scanUrl = getScanUrl(shelf);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(scanUrl)}&margin=1`;
  };

  // Copy Direct Link Handler
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

  // Stock Quantity Quick Adjuster (+ / -)
  const updateQuantity = (amount) => {
    if (!activeShelf) return;
    const newQty = Math.max(0, activeShelf.quantity + amount);
    const updated = { ...activeShelf, quantity: newQty };
    setActiveShelf(updated);
    setInlineQty(String(newQty));
    const updatedList = (shelves || []).map(s => s.id === updated.id ? updated : s);
    setShelves(updatedList);
    pushToCloud(updated, updatedList);
  };

  // Stock Quantity Quick Adjuster directly from Saved Shelves List
  const updateShelfQuantityInList = (shelfId, amount) => {
    const updatedList = (shelves || []).map(s => {
      if (s.id === shelfId) {
        const newQty = Math.max(0, s.quantity + amount);
        return { ...s, quantity: newQty };
      }
      return s;
    });
    setShelves(updatedList);
    const updatedItem = updatedList.find(s => s.id === shelfId);
    if (updatedItem) {
      if (activeShelf?.id === shelfId) {
        setActiveShelf(updatedItem);
        setInlineQty(String(updatedItem.quantity));
      }
      pushToCloud(updatedItem, updatedList);
    }
  };

  // Delete Shelf Handler
  const handleDeleteShelf = (shelfId) => {
    if (!shelfId) return;
    if (window.confirm('Are you sure you want to delete this shelf record from the database?')) {
      // 1. Register as deleted ID locally
      const updatedDeleted = Array.from(new Set([...deletedIds, shelfId]));
      setDeletedIds(updatedDeleted);
      try { localStorage.setItem('voeux_deleted_shelf_ids', JSON.stringify(updatedDeleted)); } catch(e){}

      // 2. Remove from local shelves state & localStorage
      const updatedShelves = shelves.filter(s => s.id !== shelfId);
      setShelves(updatedShelves);
      try { localStorage.setItem('voeux_warehouse_shelves', JSON.stringify(updatedShelves)); } catch(e){}

      if (activeShelf?.id === shelfId) {
        setActiveShelf(null);
      }

      // 3. Broadcast deletion to cloud database so all other devices clear it
      deleteFromCloud(shelfId);

      navigateView('all-shelves');
    }
  };

  // Total Available Stock Calculation
  const totalStockCount = shelves.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const filteredShelves = shelves.filter(s =>
    s.shelfNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.assistantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-8">
      
      {/* ==================== PRINTABLE STICKER TAG (STRICT PRINT ISOLATION WRAPPER) ==================== */}
      {activeShelf && (
        <div id="printable-qr-tag-wrapper" className={viewMode === 'qr-generated' ? 'block mb-8' : 'hidden print:block'}>
          <div className="font-sans text-black bg-white p-4">
            <div className="max-w-xs mx-auto border-4 border-black p-5 rounded-2xl text-center space-y-3 bg-white">
              <div className="border-b-2 border-black pb-2">
                <h2 className="text-xl font-black tracking-widest uppercase text-black">VOEUX® LOGISTICS</h2>
                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Warehouse Shelf Inventory Tag</p>
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
                <p><strong>CURRENT STOCK:</strong> {activeShelf.quantity} Units</p>
                <p><strong>TAG ID:</strong> {activeShelf.id}</p>
                <p><strong>DATE:</strong> {activeShelf.createdAt}</p>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 text-[9px] text-gray-700">
                Scan QR code with phone camera to view & update live shelf details.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MAIN APPLICATION INTERFACE (NON-PRINT) ==================== */}
      <div className="max-w-4xl mx-auto space-y-8 print:hidden">
        
        {/* Top Page Header (Clean Unboxed Website Header) */}
        <div className="border-b border-gray-200/80 pb-6 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                <QrCode className="w-8 h-8 text-[#3B429F]" />
                <span>Warehouse Inventory System</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateView('create')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  viewMode === 'create'
                    ? 'bg-[#3B429F] text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Create QR Tag</span>
              </button>

              <button
                onClick={() => navigateView('all-shelves')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  viewMode === 'all-shelves'
                    ? 'bg-[#3B429F] text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Saved Shelves ({shelves.length})</span>
              </button>
            </div>
          </div>

          {/* Total Stock Available Count Banner */}
          <div className="pt-2 flex flex-wrap items-center justify-start text-left gap-2 text-sm sm:text-base font-extrabold text-gray-900">
            <span>Total Stock Available:</span>
            <span className="text-[#3B429F] font-black">{totalStockCount} Units ({shelves.length} Shelves)</span>
          </div>
        </div>

        {/* ==================== VIEW 1: CREATE NEW SHELF QR TAG FORM ==================== */}
        {viewMode === 'create' && (
          <div className="space-y-6 text-left max-w-2xl">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-3">
              CREATE WAREHOUSE SHELF TAG
            </h2>

            <form onSubmit={handleGenerateQR} className="space-y-5 text-xs">
              
              {/* Product Selection */}
              <div className="space-y-1.5">
                <label className="text-gray-900 font-bold block">PRODUCT NAME *</label>
                <select
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
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
                    className="mt-2 w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                    required
                  />
                )}
              </div>

              {/* Grid 2-cols: Assistant Name & Shelf Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-900 font-bold block">WAREHOUSE ASSISTANT NAME *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-900 font-bold block">SHELF NUMBER / ZONE *</label>
                  <input
                    type="text"
                    placeholder="e.g. A or Zone B-04"
                    value={shelfNumber}
                    onChange={(e) => setShelfNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 uppercase focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                    required
                  />
                </div>
              </div>

              {/* Quantity & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-900 font-bold block">INITIAL QUANTITY *</label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-gray-900 font-bold block">NOTES / PALLET DETAILS</label>
                  <input
                    type="text"
                    placeholder="e.g. Rack 1, Top Tier, Fast Moving"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
              >
                <QrCode className="w-4 h-4" />
                <span>GENERATE & PREVIEW QR CODE TAG</span>
              </button>
            </form>
          </div>
        )}

        {/* ==================== VIEW 2: QR GENERATED & PREVIEW ==================== */}
        {viewMode === 'qr-generated' && activeShelf && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 uppercase">QR Code Tag Generated</h2>
                <p className="text-xs text-gray-500">Ready to print and attach to Shelf {activeShelf.shelfNumber}</p>
              </div>

              <button
                onClick={() => navigateView('create')}
                className="text-xs text-[#3B429F] hover:underline flex items-center gap-1 font-bold"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Form
              </button>
            </div>

            {/* Visual Tag Preview Card */}
            <div className="flex flex-col sm:flex-row items-center gap-8 justify-between pt-2">
              
              {/* QR Image Box */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-900 text-center">
                  <img
                    src={getQrImageUrl(activeShelf)}
                    alt="Generated QR"
                    className="w-48 h-48 object-contain"
                  />
                  <span className="block mt-2 text-[9px] font-extrabold text-gray-700 uppercase tracking-wider">
                    SCAN WITH PHONE CAMERA
                  </span>
                </div>

                <button
                  onClick={() => handleCopyLink(activeShelf)}
                  className="text-xs text-[#3B429F] hover:underline flex items-center gap-1 font-semibold pt-2"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Scan Link Copied!' : 'Copy Direct Scan URL'}</span>
                </button>
              </div>

              {/* Shelf Info Summary */}
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold text-[#3B429F] tracking-wider uppercase block">SHELF ALLOCATION</span>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
                    SHELF {activeShelf.shelfNumber}
                  </h1>
                </div>

                <div className="space-y-2 text-xs text-gray-700 border-y border-gray-200/80 py-4">
                  <p><strong className="text-gray-900">Product:</strong> {activeShelf.productName}</p>
                  <p><strong className="text-gray-900">Assistant:</strong> {activeShelf.assistantName}</p>
                  <p><strong className="text-gray-900">Stock Quantity:</strong> <span className="text-[#3B429F] font-extrabold">{activeShelf.quantity} Units</span></p>
                  <p><strong className="text-gray-900">Tag Record ID:</strong> <span className="font-mono text-gray-500">{activeShelf.id}</span></p>
                </div>

                {/* Print & View Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handlePrintTag}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PRINT TAG</span>
                  </button>

                  <button
                    onClick={() => navigateView('shelf-detail', activeShelf)}
                    className="bg-[#3B429F] hover:bg-[#2B308B] text-white font-bold text-xs py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>View Scanned Page</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== VIEW 3: SCANNED SHELF DETAILS & EDIT VIEW ==================== */}
        {viewMode === 'shelf-detail' && activeShelf && (
          <div className="space-y-6 text-left">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#3B429F] tracking-wider uppercase block">SCANNED SHELF LOCATION</span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
                  SHELF {activeShelf.shelfNumber}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">Tag ID: <span className="font-mono text-gray-700 font-bold">{activeShelf.id}</span></p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditFormData({ ...activeShelf });
                    setIsEditing(!isEditing);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-[#3B429F]" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
                </button>

                <button
                  onClick={() => handleDeleteShelf(activeShelf.id)}
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Delete this shelf record"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Delete Shelf</span>
                </button>
              </div>
            </div>

            {/* FULL EDIT FORM MODE */}
            {isEditing && editFormData ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs max-w-2xl pt-2">
                <h3 className="font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">EDIT SHELF DETAILS</h3>

                <div className="space-y-1.5">
                  <label className="text-gray-900 font-bold block">PRODUCT NAME</label>
                  <input
                    type="text"
                    value={editFormData.productName}
                    onChange={e => setEditFormData({ ...editFormData, productName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-900 font-bold block">ASSISTANT NAME</label>
                    <input
                      type="text"
                      value={editFormData.assistantName}
                      onChange={e => setEditFormData({ ...editFormData, assistantName: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-900 font-bold block">SHELF NUMBER</label>
                    <input
                      type="text"
                      value={editFormData.shelfNumber}
                      onChange={e => setEditFormData({ ...editFormData, shelfNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 uppercase focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-900 font-bold block">STOCK QUANTITY</label>
                    <input
                      type="number"
                      min="0"
                      value={editFormData.quantity}
                      onChange={e => setEditFormData({ ...editFormData, quantity: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-gray-900 font-bold block">NOTES</label>
                    <input
                      type="text"
                      value={editFormData.notes}
                      onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] bg-white shadow-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#3B429F] hover:bg-[#2B308B] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW & QUICK EDIT QUANTITY MODE */
              <div className="space-y-6 text-xs pt-2">
                {/* Product Information Section */}
                <div className="space-y-4 border-b border-gray-200/80 pb-6">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">PRODUCT NAME</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">{activeShelf.productName}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 pt-2">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ASSIGNED ASSISTANT</span>
                      <p className="font-bold text-gray-900 mt-1 text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#3B429F]" />
                        <span>{activeShelf.assistantName}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ZONE / NOTES</span>
                      <p className="font-semibold text-gray-900 mt-1">{activeShelf.notes || 'Standard Storage'}</p>
                    </div>
                  </div>
                </div>

                {/* Stock Counter & Editable Input Section */}
                <div className="space-y-4 pt-2">
                  <span className="text-xs text-gray-500 font-extrabold uppercase tracking-wider block">EDITABLE STOCK QUANTITY</span>
                  
                  <form onSubmit={handleDirectQtySave} className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => updateQuantity(-1)}
                        className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold transition flex items-center justify-center cursor-pointer shadow-xs"
                        title="Decrease Stock"
                      >
                        <Minus className="w-4 h-4 text-red-600" />
                      </button>

                      {/* Editable Numeric Quantity Input */}
                      <div className="relative flex-1 sm:w-36">
                        <input
                          type="number"
                          min="0"
                          value={inlineQty}
                          onChange={(e) => setInlineQty(e.target.value)}
                          className="w-full text-center font-black text-2xl text-[#3B429F] bg-white border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-[#3B429F]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => updateQuantity(1)}
                        className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold transition flex items-center justify-center cursor-pointer shadow-xs"
                        title="Increase Stock"
                      >
                        <Plus className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="submit"
                        className="flex-1 sm:flex-none bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update Stock Quantity</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintTag()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 px-5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Tag</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== VIEW 4: ALL SAVED WAREHOUSE SHELVES LIST ==================== */}
        {viewMode === 'all-shelves' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                  Saved Warehouse Shelves ({filteredShelves.length})
                </h2>
                <button
                  onClick={() => syncFromCloud()}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#3B429F] transition cursor-pointer"
                  title="Sync Latest Database"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search shelf #, product, assistant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-b-2 border-gray-300 text-gray-900 text-xs pl-8 pr-3 py-2 focus:outline-none focus:border-[#3B429F] bg-transparent"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-1 top-2.5" />
              </div>
            </div>

            {filteredShelves.length > 0 ? (
              <div className="space-y-2 divide-y divide-gray-100">
                {filteredShelves.map(shelf => (
                  <div
                    key={shelf.id}
                    className="pt-5 pb-6 space-y-3.5 text-xs transition"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#3B429F] text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
                          SHELF {shelf.shelfNumber}
                        </span>
                        <span className="text-xs font-mono text-gray-500 font-bold">
                          {shelf.id}
                        </span>
                      </div>

                      <span className="text-xs text-gray-400 font-medium">
                        Created: {shelf.createdAt}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* Product Info */}
                      <div className="md:col-span-2 space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">PRODUCT NAME</span>
                        <h3 className="text-base font-bold text-gray-900 leading-snug">{shelf.productName}</h3>
                        
                        {shelf.notes && (
                          <p className="text-xs text-gray-500 pt-0.5">
                            <strong>Zone / Notes:</strong> {shelf.notes}
                          </p>
                        )}
                      </div>

                      {/* Assistant & Stock Details */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ASSIGNED ASSISTANT</span>
                          <p className="font-bold text-gray-900 flex items-center gap-1.5 mt-0.5 text-sm">
                            <User className="w-4 h-4 text-[#3B429F]" />
                            <span>{shelf.assistantName}</span>
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">LIVE STOCK</span>
                          <span className="text-base font-black text-[#3B429F]">{shelf.quantity} Units</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Quick Actions Line */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      {/* Quantity Quick Adjust */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-semibold mr-1">Quick Adjust Stock:</span>
                        <button
                          onClick={() => updateShelfQuantityInList(shelf.id, -1)}
                          className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-red-600 transition cursor-pointer"
                          title="Decrease 1 Unit"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-gray-900 text-sm px-2 min-w-[28px] text-center">{shelf.quantity}</span>
                        <button
                          onClick={() => updateShelfQuantityInList(shelf.id, 1)}
                          className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-emerald-600 transition cursor-pointer"
                          title="Increase 1 Unit"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* View / Edit / Print / Delete Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleCopyLink(shelf)}
                          className="text-xs text-gray-600 hover:text-[#3B429F] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </button>

                        <button
                          onClick={() => navigateView('shelf-detail', shelf)}
                          className="text-xs text-[#3B429F] hover:underline font-extrabold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>View & Edit</span>
                        </button>

                        <button
                          onClick={() => navigateView('qr-generated', shelf)}
                          className="text-xs text-emerald-600 hover:underline font-extrabold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print QR Tag</span>
                        </button>

                        <button
                          onClick={() => handleDeleteShelf(shelf.id)}
                          className="text-xs text-red-600 hover:underline font-extrabold flex items-center gap-1 transition cursor-pointer"
                          title="Delete shelf record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-gray-500 space-y-3">
                <p className="text-sm font-semibold text-gray-700">No active shelf records found in database.</p>
                <button
                  onClick={() => navigateView('create')}
                  className="bg-[#3B429F] text-white text-xs font-bold py-2.5 px-5 rounded-xl mt-2 cursor-pointer shadow-md"
                >
                  Create First Shelf Tag
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
