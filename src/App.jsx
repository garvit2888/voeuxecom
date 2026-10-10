import React, { useEffect, useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CategoryPage } from './components/CategoryPage';
import { JoinUsPage } from './components/JoinUsPage';
import { WarrantyPortal } from './components/WarrantyPortal';
import { InstallationPortal } from './components/InstallationPortal';
import { DealerLocator } from './components/DealerLocator';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs';
import { SupportFAQ } from './components/SupportFAQ';
import { TermsAndConditions } from './components/TermsAndConditions';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CarSelectorModal } from './components/CarSelectorModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { PRODUCTS, CATEGORIES } from './data/products';
import { ArrowRight, Star, ShieldCheck, Zap, Wrench, Building2, MessageSquare } from 'lucide-react';
import { WarrantyPolicyPage } from './components/WarrantyPolicyPage';
import { FlipkartOpsAdmin } from './components/FlipkartOpsAdmin';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerProfilePage } from './components/CustomerProfilePage';
import { InventoryQRPortal } from './components/InventoryQRPortal';
import { ConfettiOverlay } from './components/ConfettiOverlay';
import { AdminTestPaymentPage } from './components/AdminTestPaymentPage';

const PriceHikeCountdown = () => {
  const targetDate = new Date('2026-10-11T00:00:00+05:30').getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(targetDate - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft <= 0) return null; // Hide after 12 AM

  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="w-full bg-black text-white py-6 px-4 flex flex-col items-center justify-center border-b border-gray-800 shadow-inner">
      <div className="flex justify-center items-center gap-3 sm:gap-4 text-3xl sm:text-4xl font-black font-mono">
        <div className="flex flex-col items-center bg-gray-900 rounded-xl px-4 sm:px-6 py-2 shadow-lg border border-gray-800">
          <span>{String(hours).padStart(2, '0')}</span>
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest mt-1 text-gray-400">Hours</span>
        </div>
        <span className="animate-pulse text-gray-500">:</span>
        <div className="flex flex-col items-center bg-gray-900 rounded-xl px-4 sm:px-6 py-2 shadow-lg border border-gray-800">
          <span>{String(minutes).padStart(2, '0')}</span>
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest mt-1 text-gray-400">Mins</span>
        </div>
        <span className="animate-pulse text-gray-500">:</span>
        <div className="flex flex-col items-center bg-gray-900 rounded-xl px-4 sm:px-6 py-2 shadow-lg border border-gray-800">
          <span>{String(seconds).padStart(2, '0')}</span>
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest mt-1 text-gray-400">Secs</span>
        </div>
      </div>
      <p className="text-xs sm:text-sm font-bold mt-5 max-w-2xl text-center text-gray-300 px-2 leading-relaxed">
        The prices of all VOEUX® Android Car Players will officially revise tonight. Secure yours now at the current discounted rate!
      </p>
    </div>
  );
};


const MainContent = () => {
  const { activePage, setActivePage, productsList, toasts, lastAddedProduct, setIsCartOpen, cartAnimating, setSelectedProductModal } = useShop();

  // Capture incoming referral parameters (?ref=9999999999 or #ref=...)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref') || (window.location.hash.includes('ref=') ? window.location.hash.split('ref=')[1] : null);
      if (refParam) {
        sessionStorage.setItem('voeux_active_referrer', refParam);
      }
    } catch (e) {}
  }, []);

  // Secret admin orders dashboard & test page — accessible via #orders, #admin-orders, #admin-test-garvit2888
  useEffect(() => {
    const checkSecretRoute = () => {
      const hash = window.location.hash;
      if (
        hash === '#admin-test-garvit2888' ||
        hash === '#orders' ||
        hash === '#admin-orders' ||
        hash === '#all-orders'
      ) {
        setActivePage('admin-test-payment');
      }
    };
    checkSecretRoute();
    window.addEventListener('hashchange', checkSecretRoute);
    return () => window.removeEventListener('hashchange', checkSecretRoute);
  }, [setActivePage]);


  const renderPage = () => {
    switch (activePage) {
      case 'admin-test-payment':
        return <AdminTestPaymentPage />;
      case 'voeux-ops':
      case 'flipkart-admin':
      case 'flipkart-automation':
      case 'flipkart-api':
      case 'flipkart-sync':
      case 'flipkart-developer':
        return <FlipkartOpsAdmin />;
      case 'inventory-qr':
      case 'warehouse-qr':
        return <InventoryQRPortal />;
      case 'android-players':
        return <CategoryPage categoryId="android-players" />;
      case 'car-speakers':
        return <CategoryPage categoryId="car-speakers" />;
      case 'speakers-soundbars':
        return <CategoryPage categoryId="speakers-soundbars" />;
      case 'amplifiers':
        return <CategoryPage categoryId="amplifiers" />;
      case 'join-us':
      case 'distributor-program':
        return <JoinUsPage />;
      case 'about-us':
        return <AboutUs />;
      case 'contact-us':
        return <ContactUs />;
      case 'support':
        return <SupportFAQ />;
      case 'warranty':
      case 'warranty-registration':
        return <WarrantyPortal />;
      case 'warranty-policy':
        return <WarrantyPolicyPage />;
      case 'installation':
        return <InstallationPortal />;
      case 'dealers':
        return <DealerLocator />;
      case 'terms':
        return <TermsAndConditions />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'profile':
      case 'my-orders':
        return <CustomerProfilePage />;
      case 'home':
      default:
        return (
          <div className="space-y-16 pb-16">
            {/* Hero Banner */}
            <Hero />

            {/* Countdown Timer */}
            <PriceHikeCountdown />

            {/* Clean Categories Grid */}
            <section className="container mx-auto px-4 min-h-[100dvh] flex flex-col justify-center py-10">
              <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900">Shop by Category</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => setActivePage(cat.id)}
                    className="group cursor-pointer flex flex-col justify-between items-center text-center transition"
                  >
                    <div className="w-full h-48 sm:h-80 flex items-center justify-center overflow-hidden mb-4">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500"
                      />
                    </div>
                    <div className="w-full text-center">
                      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 group-hover:text-[#3B429F] transition-colors">{cat.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bestsellers Grid */}
            <section className="container mx-auto px-4 min-h-[100dvh] flex flex-col justify-center py-10">
              <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900">Best Selling Electronics</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-10">
                {productsList.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* ========== JOIN US / OFFICIAL DISTRIBUTOR PROGRAM BANNER ========== */}
            <section className="group min-h-[100dvh] flex flex-col justify-center py-20 px-6 sm:px-16 bg-black text-white relative overflow-hidden text-left hover:shadow-[0_0_50px_rgba(59,66,159,0.3)] transition-shadow duration-700">
              {/* Premium Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-1000 z-0 pointer-events-none" />
              
              <div className="container mx-auto relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
                <div className="space-y-6 max-w-3xl transform transition-transform duration-700 group-hover:translate-x-2">
                  <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
                    Partner With VOEUX® — Official Distributor Program
                  </h2>
                  <p className="text-slate-300 text-base sm:text-xl font-medium leading-relaxed group-hover:text-white transition-colors duration-500">
                    Join India's fastest growing automotive electronics brand. Expand your business with our high-demand Android stereos, soundbars, amplifiers, and car accessories with direct factory support.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto transform transition-transform duration-700 group-hover:-translate-x-2">
                  <button
                    onClick={() => setActivePage('join-us')}
                    className="relative px-8 py-5 rounded-2xl bg-white text-[#3B429F] font-extrabold text-lg sm:text-xl tracking-wide flex items-center justify-center gap-3 overflow-hidden group/btn shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-shadow cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-white transition-transform duration-500 group-hover/btn:scale-105" />
                    <span className="relative z-10 transition-transform duration-500 group-hover/btn:-translate-x-1">Explore Distributor Program</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-transform duration-500 group-hover/btn:translate-x-2" />
                  </button>
                </div>
              </div>
            </section>

          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      {/* Brand Splash Screen on Initial Load */}
      <SplashScreen />

      {/* Added to Cart Celebration Pop-Up Card */}
      {lastAddedProduct && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-6 z-[120] animate-cart-toast-in max-w-xs sm:max-w-sm bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/40 flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0 overflow-hidden flex items-center justify-center border border-slate-700">
            <img src={lastAddedProduct.image} alt={lastAddedProduct.name} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5 text-left">
            <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Product added to cart!</span>
            </div>
            <h4 className="text-xs font-bold text-white truncate leading-tight">{lastAddedProduct.name}</h4>
            <p className="text-[11px] text-gray-400 font-semibold">₹{lastAddedProduct.price?.toLocaleString('en-IN')}</p>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-3 py-2 bg-[#3B429F] hover:bg-[#2B308B] text-white text-[11px] font-extrabold rounded-xl transition shrink-0 cursor-pointer shadow-md"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Standard Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-xs pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-gray-900 text-white p-3 rounded-lg text-xs shadow-xl flex items-center gap-2 pointer-events-auto border border-gray-800"
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />

      <ConfettiOverlay />
      <CartDrawer />
      <CustomerAuthModal />
      <CarSelectorModal />
      <LiveChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainContent />
    </ShopProvider>
  );
}
