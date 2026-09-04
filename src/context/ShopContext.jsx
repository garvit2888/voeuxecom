import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';
import { fetchLiveFlipkartPrice } from '../utils/flipkartPriceScraper';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Helper to parse page name from URL Hash & Search Params for browser navigation & mobile QR scans
  const getPageFromHash = () => {
    const hash = (window.location.hash || '').replace('#', '').trim();
    const searchParams = new URLSearchParams(window.location.search);
    
    if (searchParams.has('shelfId') || searchParams.get('page') === 'inventory-qr') {
      return 'inventory-qr';
    }
    if (!hash) return 'home';
    if (hash.startsWith('product-detail')) return 'product-detail';
    if (hash.startsWith('inventory-qr') || hash.startsWith('warehouse-qr') || hash.startsWith('qr-inventory')) {
      return 'inventory-qr';
    }
    return hash;
  };

  const [selectedProductModal, _setSelectedProductModal] = useState(() => {
    // Restore product page on reload from URL hash
    try {
      const hash = (window.location.hash || '').replace('#', '').trim();
      if (hash.startsWith('product-detail')) {
        const urlParams = new URLSearchParams(hash.split('?')[1] || '');
        const pid = urlParams.get('id');
        if (pid) {
          const found = PRODUCTS.find(p => p.id === pid);
          if (found) return found;
        }
      }
    } catch(e) {}
    return null;
  });
  const [productsList, setProductsList] = useState(PRODUCTS);

  useEffect(() => {
    try {
      (PRODUCTS || []).forEach(async (p) => {
        if (p && p.flipkartUrl) {
          try {
            const live = await fetchLiveFlipkartPrice(p.flipkartUrl);
            if (live && live.price) {
              setProductsList(prev => (prev || []).map(item =>
                item && item.id === p.id ? { ...item, price: live.price, originalPrice: live.originalPrice || item.originalPrice } : item
              ));
            }
          } catch (err) {}
        }
      });
    } catch (e) {}
  }, []);

  const [activePage, _setActivePageState] = useState(() => getPageFromHash());
  const [pageTransitionKey, setPageTransitionKey] = useState(0);

  const setActivePage = (page, skipHistory = false) => {
    _setActivePageState(page);
    setPageTransitionKey(prev => prev + 1);
    if (!skipHistory) {
      if (page === 'home') {
        window.history.pushState({ page }, '', window.location.pathname);
      } else {
        window.history.pushState({ page }, '', `#${page}`);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync state when user presses browser Back or Forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      const pageFromState = event.state?.page;
      const hash = (window.location.hash || '').replace('#', '').trim();
      
      let targetPage = pageFromState || hash || 'home';
      if (targetPage.startsWith('product-detail')) {
        targetPage = 'product-detail';
        const urlParams = new URLSearchParams(hash.split('?')[1] || '');
        const pid = urlParams.get('id') || event.state?.productId;
        if (pid) {
          const found = PRODUCTS.find(p => p.id === pid);
          if (found) _setSelectedProductModal(found);
        }
      } else {
        _setSelectedProductModal(null);
      }

      _setActivePageState(targetPage);
      setPageTransitionKey(prev => prev + 1);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Guarantee window scroll resets to top (0, 0) whenever activePage changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('voeux_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const setSelectedProductModal = (product) => {
    const current = productsList.find(p => p.id === product?.id) || product;
    _setSelectedProductModal(current);
    if (product) {
      _setActivePageState('product-detail');
      setPageTransitionKey(prev => prev + 1);
      window.history.pushState({ page: 'product-detail', productId: product.id }, '', `#product-detail?id=${product.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Add to recently viewed list
      setRecentlyViewed(prev => {
        const filtered = (prev || []).filter(p => p && p.id !== product.id);
        const updated = [current, ...filtered].slice(0, 6);
        try { localStorage.setItem('voeux_recently_viewed', JSON.stringify(updated)); } catch(e){}
        return updated;
      });
    }
  };
  // Cart: persisted to localStorage so it survives page reloads
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('voeux_cart');
      if (!saved || saved === 'undefined') return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return []; }
  });
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // cartStep: controls which step the CartDrawer starts on ('cart' | 'checkout')
  // Used by buyNowCheckout to jump straight to checkout
  const [cartStep, setCartStep] = useState('cart');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCarSelectorOpen, setIsCarSelectorOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [selectedCar, setSelectedCar] = useState({ make: 'Hyundai', model: 'Creta', year: '2022' });
  // Cart celebration — flipped true briefly when any item is added to cart
  const [cartAnimating, setCartAnimating] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try { localStorage.setItem('voeux_cart', JSON.stringify(cart)); } catch(e) {}
  }, [cart]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, car: selectedCar }];
    });
    // Trigger celebration animation
    setLastAddedProduct(product);
    setCartAnimating(true);
    setTimeout(() => { setCartAnimating(false); }, 900);
    setTimeout(() => { setLastAddedProduct(null); }, 4000);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    addToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        addToast(`Removed from Wishlist`, 'info');
        return prev.filter(item => item.id !== product.id);
      } else {
        addToast(`Added "${product.name}" to Wishlist!`, 'success');
        return [...prev, product];
      }
    });
  };

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        addToast(`Removed from Compare`, 'info');
        return prev.filter(item => item.id !== product.id);
      } else {
        if (prev.length >= 4) {
          addToast(`You can compare up to 4 products maximum`, 'warning');
          return prev;
        }
        addToast(`Added "${product.name}" to Compare list!`, 'success');
        return [...prev, product];
      }
    });
  };

  const navigateTo = (page, product = null) => {
    setActivePage(page);
    if (product) {
      setSelectedProductModal(product);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Buy Now: adds product to cart (persisted) AND opens checkout directly.
  // Item stays in cart even if user abandons the checkout.
  const buyNowCheckout = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev; // already in cart, don't duplicate
      return [...prev, { product, quantity: 1, car: selectedCar }];
    });
    addToast(`Added to cart — proceeding to checkout`, 'success');
    setCartStep('checkout');
    setIsCartOpen(true);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('voeux_user');
      if (!saved || saved === 'undefined') return null;
      return JSON.parse(saved);
    } catch(e) { return null; }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('voeux_orders');
      if (!saved || saved === 'undefined') return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return []; }
  });

  const [usedVouchers, setUsedVouchers] = useState(() => {
    try {
      const saved = localStorage.getItem('voeux_used_vouchers');
      if (!saved || saved === 'undefined') return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return []; }
  });

  const verifyAndApplyVoucher = async (inputCode) => {
    const code = (inputCode || '').trim().toUpperCase();

    if (!code) {
      throw new Error('Please enter a coupon or referral voucher code.');
    }

    // 1. Check if voucher code has ALREADY BEEN REDEEMED (local)
    if (usedVouchers.includes(code)) {
      throw new Error('This referral voucher code has already been redeemed and cannot be used again.');
    }

    // 2. Double check with Firebase for cross-device one-time enforce
    try {
      const res = await fetch(`https://voeux-warehouse-default-rtdb.firebaseio.com/used_vouchers/${code}.json`);
      const cloudRecord = await res.json();
      if (cloudRecord) {
        const updated = Array.from(new Set([...usedVouchers, code]));
        setUsedVouchers(updated);
        try { localStorage.setItem('voeux_used_vouchers', JSON.stringify(updated)); } catch(e){}
        throw new Error('This referral voucher code has already been redeemed.');
      }
    } catch(err) {
      if (err.message && err.message.includes('already been redeemed')) {
        throw err;
      }
      // Network error — fall through to local validation
    }

    // 3. Validate Voucher Code Formats
    if (code === 'VOEUX10') {
      return { valid: true, type: 'PROMO', discountAmount: Math.round(cartTotal * 0.1), code };
    }

    if (code.startsWith('REF500') || code.includes('GARVIT') || code.includes('VOEUX500')) {
      return { valid: true, type: 'REFERRAL_VOUCHER', discountAmount: 500, code };
    }

    throw new Error('Invalid code. Please check your email for the correct referral voucher.');
  };

  const loginUser = async (email, password) => {
    // Check local stored users or default user
    const usersRaw = localStorage.getItem('voeux_users_db') || '[]';
    let users = [];
    try { users = JSON.parse(usersRaw); } catch(e){}

    let found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!found) {
      // Demo / auto-login fallback if password is valid length
      if (password.length >= 4) {
        found = {
          name: email.split('@')[0],
          email: email.toLowerCase(),
          phone: '9999999999',
          password
        };
      } else {
        throw new Error('Invalid email or password');
      }
    }

    setUser(found);
    localStorage.setItem('voeux_user', JSON.stringify(found));
    addToast(`Welcome back, ${found.name}!`, 'success');
    return found;
  };

  const registerUser = async (userData) => {
    const usersRaw = localStorage.getItem('voeux_users_db') || '[]';
    let users = [];
    try { users = JSON.parse(usersRaw); } catch(e){}

    const emailExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
      throw new Error('An account with this email address already exists. Please sign in.');
    }

    const phoneExists = users.some(u => u.phone && u.phone.replace(/\D/g, '') === userData.phone.replace(/\D/g, ''));
    if (phoneExists) {
      throw new Error('This mobile number is already linked to another account. Please sign in.');
    }

    users.push(userData);
    localStorage.setItem('voeux_users_db', JSON.stringify(users));
    setUser(userData);
    localStorage.setItem('voeux_user', JSON.stringify(userData));

    // Firebase Sync
    try {
      fetch('https://voeux-warehouse-default-rtdb.firebaseio.com/users.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    } catch(e){}

    addToast(`Account created! Welcome ${userData.name}`, 'success');
    return userData;
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('voeux_user');
    addToast('Signed out of account', 'info');
  };

  const placeOrder = async (orderData) => {
    const rewardVoucherCode = 'REF500-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      id: 'VX-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: 'ORDER PLACED',
      items: cart.map(i => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image
      })),
      totalAmount: orderData.totalAmount || cartTotal,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'COD',
      paymentId: orderData.paymentId || 'N/A',
      userEmail: user?.email || orderData.shippingAddress?.email || 'guest@voeux.in',
      userPhone: user?.phone || orderData.shippingAddress?.phone || 'N/A',
      referral: {
        code: orderData.appliedVoucherCode || null,
        discountApplied: orderData.discountAmount || 0,
        rewardVoucherCode: rewardVoucherCode
      }
    };

    // If a one-time voucher was used, mark it as REDEEMED permanently!
    if (orderData.appliedVoucherCode) {
      const codeUpper = orderData.appliedVoucherCode.trim().toUpperCase();
      const updatedUsed = Array.from(new Set([...usedVouchers, codeUpper]));
      setUsedVouchers(updatedUsed);
      try { localStorage.setItem('voeux_used_vouchers', JSON.stringify(updatedUsed)); } catch(e){}

      // Sync REDEEMED status to Firebase
      try {
        fetch(`https://voeux-warehouse-default-rtdb.firebaseio.com/used_vouchers/${codeUpper}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            redeemedBy: newOrder.userEmail,
            orderId: newOrder.id,
            redeemedAt: new Date().toISOString()
          })
        });
      } catch(e){}
    }

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    try { localStorage.setItem('voeux_orders', JSON.stringify(updatedOrders)); } catch(e){}

    // Firebase Orders Sync
    try {
      fetch('https://voeux-warehouse-default-rtdb.firebaseio.com/orders.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch(e){}

    // Apps Script Order Notification & Voucher Email Sync
    try {
      fetch('https://script.google.com/macros/s/AKfycbz_placeholder/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'new_order', order: newOrder })
      });
    } catch(e){}

    setCart([]);
    addToast(`Order #${newOrder.id} placed successfully!`, 'success');
    return newOrder;
  };

  return (
    <ShopContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedProductModal,
        setSelectedProductModal,
        recentlyViewed,
        productsList,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        compareList,
        toggleCompare,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCompareOpen,
        setIsCompareOpen,
        isCarSelectorOpen,
        setIsCarSelectorOpen,
        selectedCar,
        setSelectedCar,
        isDarkMode,
        setIsDarkMode,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        user,
        loginUser,
        registerUser,
        logoutUser,
        orders,
        placeOrder,
        isAuthModalOpen,
        setIsAuthModalOpen,
        verifyAndApplyVoucher,
        cartStep,
        setCartStep,
        buyNowCheckout,
        cartAnimating,
        lastAddedProduct,
        pageTransitionKey
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
