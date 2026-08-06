import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';
import { fetchLiveFlipkartPrice } from '../utils/flipkartPriceScraper';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Helper to parse page name from URL Hash for browser Back/Forward navigation
  const getPageFromHash = () => {
    const hash = (window.location.hash || '').replace('#', '').trim();
    if (!hash) return 'home';
    if (hash.startsWith('product-detail')) return 'product-detail';
    return hash;
  };

  const [activePage, _setActivePageState] = useState(() => getPageFromHash());

  const setActivePage = (page, skipHistory = false) => {
    _setActivePageState(page);
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
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const setSelectedProductModal = (product) => {
    const current = productsList.find(p => p.id === product?.id) || product;
    _setSelectedProductModal(current);
    if (product) {
      _setActivePageState('product-detail');
      window.history.pushState({ page: 'product-detail', productId: product.id }, '', `#product-detail?id=${product.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCarSelectorOpen, setIsCarSelectorOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [selectedCar, setSelectedCar] = useState({ make: 'Hyundai', model: 'Creta', year: '2022' });

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
    addToast(`Added "${product.name}" to cart!`, 'success');
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

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedProductModal,
        setSelectedProductModal,
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
        addToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
