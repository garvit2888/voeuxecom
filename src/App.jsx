import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CategoryPage } from './components/CategoryPage';
import { WhatsNewPage } from './components/WhatsNewPage';
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
import { PRODUCTS, CATEGORIES } from './data/products';
import { ArrowRight, Star, ShieldCheck, Zap, Wrench } from 'lucide-react';

import { WarrantyPolicyPage } from './components/WarrantyPolicyPage';

const MainContent = () => {
  const { activePage, setActivePage, productsList, toasts } = useShop();

  const renderPage = () => {
    switch (activePage) {
      case 'android-players':
        return <CategoryPage categoryId="android-players" />;
      case 'speakers-soundbars':
        return <CategoryPage categoryId="speakers-soundbars" />;
      case 'amplifiers':
        return <CategoryPage categoryId="amplifiers" />;
      case 'whats-new':
        return <WhatsNewPage />;
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
      case 'home':
      default:
        return (
          <div className="space-y-16 pb-16">
            {/* Hero Banner */}
            <Hero />

            {/* Clean Categories Grid */}
            <section className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Shop by Category</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => setActivePage(cat.id)}
                    className="clean-card group p-5 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#3B429F] uppercase">
                        {(productsList || PRODUCTS).filter(p => p.category === cat.id).length} { (productsList || PRODUCTS).filter(p => p.category === cat.id).length === 1 ? 'Item' : 'Items' }
                      </span>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#3B429F] transition">{cat.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3B429F] flex items-center gap-1">
                        Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                      </span>
                      <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bestsellers Grid */}
            <section className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Best Selling Electronics</h2>
                </div>
                <button onClick={() => setActivePage('android-players')} className="btn-secondary text-xs flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productsList.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* Clean What's New Drop Highlight */}
            <section className="container mx-auto px-4">
              <div className="bg-gray-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-lg">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                    New Product Drop 2026
                  </span>
                  <h3 className="text-2xl font-black leading-tight">
                    VOEUX® Android 10.1" Dual Knob Piano Buttons (4GB/64GB) Stereo
                  </h3>
                  <p className="text-xs text-gray-300">
                    Car Multimedia Player Car Stereo (Double Din) with Apple CarPlay & Android Auto.
                  </p>
                  <button
                    onClick={() => {
                      window.open('https://www.flipkart.com/voeux-android-10-1-dual-knob-piano-buttons-4gb-64gb-car-multimedia-player-stereo/p/itm4f6bce63370ea?pid=CDPHJ9ARWNKNAHCJ&lid=LSTCDPHJ9ARWNKNAHCJITYXYO&marketplace=FLIPKART&q=voeux+piano+dual+knob+&store=search.flipkart.com&srno=s_1_3&otracker=search&otracker1=search&fm=Search&iid=5363074a-e955-46d7-b64f-d87734da1a22.CDPHJ9ARWNKNAHCJ.SEARCH&ppt=sp&ppn=sp&ssid=bx1j33hn280000001786093465039&qH=8c13c5ea026e2c9a&ov_redirect=true&ov_redirect=true', '_blank');
                    }}
                    className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
                  >
                    <span>Explore VOEUX 10.1" Dual Knob Piano Buttons</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-slate-950 p-2 rounded-2xl shadow-lg border border-slate-800 flex items-center justify-center shrink-0 w-full md:w-80 h-56 overflow-hidden">
                  <img src="/images/voeux_dual_knob_piano_stereo.jpg" alt="VOEUX Dual Knob Piano Buttons Stereo" className="w-full h-full object-cover rounded-xl" />
                </div>
              </div>
            </section>

            {/* Real Verified Flipkart Customer Reviews */}
            <section className="container mx-auto px-4">
              <div className="text-center max-w-xl mx-auto space-y-1 mb-8">
                <h2 className="text-xl font-bold text-gray-900">Verified Customer Reviews</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {[
                  {
                    name: 'Vicky Chavan',
                    product: 'VOEUX® Premium X80 Series Dual Knob Stereo',
                    title: 'Perfect product!',
                    review: 'Awesome 👍',
                    rating: 4.5,
                    timestamp: '2026-04-09T00:00:00Z',
                    verifiedBadge: 'Flipkart Verified Buyer'
                  },
                  {
                    name: 'Flipkart Customer',
                    product: 'VOEUX® AMP Board 150W Mono Class AB Amplifier',
                    title: 'Classy product',
                    review: 'Nice parrot bass super hard ♥️♥️♥️',
                    rating: 5,
                    timestamp: '2026-07-26T00:00:00Z',
                    verifiedBadge: 'Flipkart Verified Buyer'
                  },
                  {
                    name: 'Harishchandra ABDUL',
                    product: 'VOEUX® Dual Knob Piano Button Stereo',
                    title: 'Terrific purchase',
                    review: 'Best product in this prices, amazing and touch with...',
                    rating: 5,
                    timestamp: '2026-03-09T00:00:00Z',
                    verifiedBadge: 'Flipkart Verified Buyer'
                  }
                ].map((rev, i) => {
                  const getRelativeTimeAgo = (isoDateStr) => {
                    const date = new Date(isoDateStr);
                    const now = new Date();
                    const diffInMs = Math.max(0, now - date);

                    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                    const diffInMonths = Math.floor(diffInDays / 30);
                    const diffInYears = Math.floor(diffInDays / 365);

                    if (diffInYears >= 1) return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
                    if (diffInMonths >= 1) return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
                    if (diffInDays >= 1) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
                    return 'today';
                  };

                  return (
                    <div key={i} className="clean-card p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-yellow-100 text-yellow-900 font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border border-yellow-300/60">
                            <span className="bg-yellow-400 text-[#2874F0] font-black text-[9px] px-1 rounded italic leading-none">f</span>
                            {rev.verifiedBadge}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">{getRelativeTimeAgo(rev.timestamp)}</span>
                        </div>

                      <div>
                        <span className="text-[10px] text-[#3B429F] font-bold block uppercase">{rev.product}</span>
                        <h4 className="font-extrabold text-gray-900 text-sm mt-0.5">{rev.title}</h4>
                      </div>

                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(Math.floor(rev.rating))].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                        ))}
                        {rev.rating % 1 !== 0 && (
                          <span className="text-[10px] font-bold text-gray-700 ml-1">4.5★</span>
                        )}
                      </div>

                      <p className="text-gray-700 font-medium leading-relaxed">"{rev.review}"</p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-gray-500">
                      <span className="font-bold text-gray-900">{rev.name}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        ✓ Verified Purchase
                      </span>
                    </div>
                  </div>
                );
              })}
              </div>
            </section>

          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      
      {/* Toast Notification */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-xs pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-gray-900 text-white p-3 rounded-lg text-xs shadow-xl flex items-center gap-2 pointer-events-auto"
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />

      <CartDrawer />
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
