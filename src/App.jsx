import React, { useEffect, useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CategoryPage } from './components/CategoryPage';
import { JoinUsPage } from './components/JoinUsPage';
import { DistributorApplicationForm } from './components/DistributorApplicationForm';
import { WarrantyPortal } from './components/WarrantyPortal';
import { InstallationPortal } from './components/InstallationPortal';
import { DealerLocator } from './components/DealerLocator';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs';
import { SupportFAQ } from './components/SupportFAQ';
import { TermsAndConditions } from './components/TermsAndConditions';
import { ProductDetailPage } from './components/ProductDetailPage';
import { BundleDetailPage } from './components/BundleDetailPage';
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
import { CustomerAssistanceReviews } from './components/CustomerAssistanceReviews';


const MainContent = () => {
  const { activePage, setActivePage, productsList, toasts, lastAddedProduct, setIsCartOpen, cartAnimating, setSelectedProductModal, selectedProductModal } = useShop();

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

  // Dynamic On-Page SEO & Structured Data Updater (Zero UI changes)
  useEffect(() => {
    const defaultTitle = 'VOEUX® Official Store | Premium Car Android Players, Subwoofers, Speakers & Soundbars';
    const defaultDesc = 'Shop official VOEUX® car electronics & home audio in India. Explore 9" & 10.1" QLED Car Android Players with Wireless Apple CarPlay & Android Auto, 160W 2-in-1 Bluetooth Soundbars, 10" Underseat Subwoofers, 460W Coaxial Car Speakers & Class AB Amplifiers.';

    const pageSeoMap = {
      'home': {
        title: defaultTitle,
        desc: defaultDesc
      },
      'android-players': {
        title: 'Car Android Players (9" & 10.1" QLED, 4GB+64GB, Wireless CarPlay) | VOEUX® Official Store',
        desc: 'Buy VOEUX® 9-inch & 10.1-inch QLED Android Car Stereos with 4GB RAM, 64GB ROM, Dual Rotary Knobs, Wireless Apple CarPlay, Android Auto & AHD Reverse Camera. Universal Double-DIN Fit.'
      },
      'car-speakers': {
        title: '6" & 6.5" Coaxial Car Door Speakers (High Bass, Dual Voice Coil) | VOEUX® Official Store',
        desc: 'Upgrade your car audio with VOEUX® VE-CS606 (380W 6-inch) and VE-CS606PT2 (460W 6.5-inch) 2-Way Coaxial Car Speakers featuring Dual Voice Coil technology and high sensitivity.'
      },
      'speakers-soundbars': {
        title: 'VOEUX® 160W 2-in-1 Separable Bluetooth Soundbar with Subwoofer | Official Store',
        desc: 'Shop the VOEUX® 160W RMS 2.1 Channel Convertible Soundbar. Use as a sleek horizontal TV soundbar or twin vertical tower speakers with dedicated external subwoofer, Bluetooth 5.0 & HDMI ARC.'
      },
      'subwoofers': {
        title: '10-Inch Active Underseat Car Subwoofer (120W RMS / 900W Peak) | VOEUX® Official Store',
        desc: 'Experience deep punchy bass without losing boot space with the VOEUX® SVX-UND001 10-Inch Powered Underseat Car Subwoofer. Ultra-slim 6.8 cm profile with built-in amplifier & wired bass remote.'
      },
      'amplifiers': {
        title: '150W Mono Class AB Car Amplifier Board for Basstubes & Subwoofers | VOEUX® Official Store',
        desc: 'Shop the VOEUX® 150W RMS Mono Class AB Car Amplifier Board featuring variable bass crossover control (40Hz–200Hz), RCA & high-level inputs, and 25A fuse protection.'
      },
      'bundles': {
        title: 'Car Android Stereo + 4 Speakers + Frame Combo Bundles | VOEUX® Official Store',
        desc: 'Save big with complete VOEUX® Car Audio Upgrade Combos including a 9" or 10.1" Android Car Player, 4 High-Bass Coaxial Speakers, and a custom Double-DIN dashboard frame.'
      },
      'warranty': {
        title: 'Online Warranty Registration & Support | VOEUX® Electronics India',
        desc: 'Register your 1-Year Domestic Warranty for official VOEUX® Car Android Players, Soundbars, Subwoofers, Car Speakers, and Amplifiers.'
      },
      'dealers': {
        title: 'Authorized Dealer & Installer Locator | VOEUX® Electronics India',
        desc: 'Find authorized VOEUX® car audio dealers and fitment studios across New Delhi, Mumbai, Bengaluru, and pan-India.'
      },
      'join-us': {
        title: 'Become an Authorized VOEUX® Distributor or Dealer | Partner Program',
        desc: 'Partner with VOEUX® Electronics India. Apply for our official car electronics and audio distributor network.'
      }
    };

    let nextTitle = defaultTitle;
    let nextDesc = defaultDesc;

    if (selectedProductModal && selectedProductModal.name) {
      nextTitle = `${selectedProductModal.name} – ₹${Number(selectedProductModal.price).toLocaleString('en-IN')} | VOEUX® Official Store`;
      nextDesc = selectedProductModal.description || `${selectedProductModal.name} available at ₹${Number(selectedProductModal.price).toLocaleString('en-IN')} with 1-Year VOEUX® Warranty and Free Delivery across India.`;
    } else if (pageSeoMap[activePage]) {
      nextTitle = pageSeoMap[activePage].title;
      nextDesc = pageSeoMap[activePage].desc;
    }

    document.title = nextTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', nextDesc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', nextTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', nextDesc);

    // Inject dynamic Product JSON-LD when viewing a product
    let scriptEl = document.getElementById('voeux-dynamic-product-ld');
    if (selectedProductModal && selectedProductModal.name) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'voeux-dynamic-product-ld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      const productImage = selectedProductModal.image?.startsWith('http')
        ? selectedProductModal.image
        : `https://voeuxtechnologies.in${selectedProductModal.image || '/images/voeux_logo.png'}`;

      scriptEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: selectedProductModal.name,
        sku: selectedProductModal.id,
        image: [productImage],
        description: selectedProductModal.description || nextDesc,
        brand: {
          '@type': 'Brand',
          name: 'VOEUX'
        },
        offers: {
          '@type': 'Offer',
          url: 'https://voeuxtechnologies.in/',
          priceCurrency: 'INR',
          price: String(selectedProductModal.price),
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: 'https://schema.org/InStock'
        }
      });
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [activePage, selectedProductModal]);


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
      case 'subwoofers':
        return <CategoryPage key="subwoofers" categoryId="subwoofers" />;
      case 'bundles':
        return <CategoryPage categoryId="bundles" />;
      case 'join-us':
      case 'distributor-program':
        return <JoinUsPage />;
      case 'distributor-application':
      case 'distributor-form':
      case 'apply-distributor':
        return <DistributorApplicationForm />;
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
        return selectedProductModal?.isBundle ? <BundleDetailPage bundle={selectedProductModal} /> : <ProductDetailPage />;
      case 'profile':
      case 'my-orders':
        return <CustomerProfilePage />;
      case 'home':
      default:
        return (
          <div className="pb-16">
            {/* Hero Carousel (160W Soundbar, X80, etc.) */}
            <Hero />

            <div className="space-y-16 mt-16">
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

            {/* VOEUX – Built for Your Drive (About Us Homepage Section) */}
            <AboutUs />

            {/* Customer Assistance & Verified Experience Section */}
            <CustomerAssistanceReviews />

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
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between relative">
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
