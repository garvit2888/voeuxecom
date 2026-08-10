import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const {
    activePage,
    setActivePage,
    cart,
    setIsCartOpen,
    setSelectedProductModal
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'android-players', label: 'Android Players' },
    { id: 'speakers-soundbars', label: 'Speakers & Soundbars' },
    { id: 'amplifiers', label: 'Car Amplifiers' },
    { id: 'whats-new', label: "What's New Drops" },
    { id: 'warranty', label: 'Register Warranty' },
    { id: 'about-us', label: 'About Us' },
    { id: 'contact-us', label: 'Contact Us' }
  ];

  return (
    <>
      {/* Top Header Bar (Desktop Sticky Header & News Ticker) */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
        {/* News Channel Ticker Banner */}
        <div className="bg-slate-900 text-white text-xs py-2 overflow-hidden relative">
          <div className="animate-news-ticker tracking-wide font-bold">
            For WhatsApp Orders use code <span className="text-yellow-400 font-extrabold bg-slate-800 px-2 py-0.5 rounded border border-yellow-400/40">VOEUX10</span> for extra discount on all Car Electronics! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; For WhatsApp Orders use code <span className="text-yellow-400 font-extrabold bg-slate-800 px-2 py-0.5 rounded border border-yellow-400/40">VOEUX10</span> for extra discount on all Car Electronics!
          </div>
        </div>

        {/* Main Minimal Navbar (Desktop Only) */}
        <nav className="hidden lg:block px-4 py-3 sm:px-6 sm:py-4">
          <div className="container mx-auto flex items-center justify-between gap-3">
            
            {/* Official Brand Logo */}
            <div
              className="flex justify-start items-center cursor-pointer"
              onClick={() => setActivePage('home')}
            >
              <img
                src="/images/voeux_logo.png"
                alt="VOEUX® Car Electronics"
                className="h-10 w-auto object-contain rounded-lg shadow-sm hover:opacity-95 transition"
              />
            </div>

            {/* Minimal Links (Desktop) */}
            <div className="flex items-center space-x-8 text-xs font-semibold tracking-wide text-gray-700">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => setActivePage(link.id)}
                  className={`py-1 transition-colors ${
                    activePage === link.id
                      ? 'text-[#3B429F] font-bold border-b-2 border-[#3B429F]'
                      : 'hover:text-[#3B429F]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right Actions (Desktop Search) */}
            <div className="flex items-center justify-end space-x-4">
              <div className="relative w-48">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full bg-gray-100 text-gray-900 placeholder-gray-400 text-xs rounded-full pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />

                {/* Suggestions */}
                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl z-50 border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    {searchResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProductModal(p);
                          setSearchQuery('');
                        }}
                        className="p-2.5 flex items-center gap-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded bg-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-[#3B429F] font-bold">₹{p.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </nav>
      </header>

      {/* ==================== MOBILE FLOATING CAPSULE NAVIGATION BAR ==================== */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-[90] max-w-sm mx-auto bg-[#3B429F] text-white rounded-full px-4 py-2.5 flex items-center justify-between shadow-2xl border border-indigo-400/50 backdrop-blur-lg">
        {/* Left: Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 text-white hover:text-cyan-300 font-black text-sm p-1 cursor-pointer transition-colors"
          aria-label="Toggle Mobile Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-cyan-300 animate-spin-once" /> : <Menu className="w-5 h-5 text-white" />}
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase">Menu</span>
        </button>

        {/* Center / Right: Original Uploaded VOEUX Brand Logo Image */}
        <div
          onClick={() => {
            setActivePage('home');
            setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center justify-center cursor-pointer p-1"
        >
          <img
            src="/images/voeux_logo.png"
            alt="VOEUX® Logo"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </div>
      </div>

      {/* ==================== MOBILE ANIMATED POPUP MENU (NO WHITE BACKGROUND) ==================== */}
      {isMobileMenuOpen && (
        <>
          {/* Transparent Backdrop Click Catch to Close Menu */}
          <div
            className="lg:hidden fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Floating Menu Card Popping Up Directly Above MENU Button */}
          <div className="lg:hidden fixed bottom-18 left-4 right-4 z-[85] max-w-sm mx-auto bg-slate-950/90 backdrop-blur-2xl text-white rounded-3xl p-5 border border-indigo-500/40 shadow-2xl shadow-indigo-950/80 animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out origin-bottom">
            
            {/* Header Title with Thin Font */}
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3 mb-3">
              <span className="text-xs font-light tracking-widest text-indigo-200 uppercase">
                Explore Voeux®
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transparent Search Bar */}
            <div className="relative mb-3.5">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 text-white placeholder-gray-400 text-xs font-light rounded-xl pl-9 pr-3 py-2 border border-slate-700/70 focus:outline-none focus:border-cyan-400/80 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />

              {searchResults.length > 0 && searchQuery && (
                <div className="mt-2 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-indigo-500/30 divide-y divide-slate-800 max-h-48 overflow-y-auto">
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProductModal(p);
                        setSearchQuery('');
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-2.5 flex items-center gap-3 hover:bg-indigo-600/20 cursor-pointer transition"
                    >
                      <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded bg-slate-800" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-light text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-cyan-400 font-normal">₹{p.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Menu Options Grid with Thin Font & No White Background */}
            <div className="grid grid-cols-2 gap-2 text-xs font-light tracking-wide">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActivePage(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left font-light tracking-wide transition-all duration-200 border ${
                    activePage === link.id
                      ? 'bg-[#3B429F] text-white font-normal border-indigo-400 shadow-md shadow-indigo-900/50'
                      : 'bg-white/5 hover:bg-indigo-600/20 text-gray-200 border-white/10 hover:border-cyan-400/40 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

          </div>
        </>
      )}
    </>
  );
};
