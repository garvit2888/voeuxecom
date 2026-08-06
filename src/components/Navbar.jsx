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
    { id: 'whats-new', label: "What's New Drops" },
    { id: 'warranty', label: 'Register Warranty' },
    { id: 'about-us', label: 'About Us' },
    { id: 'contact-us', label: 'Contact Us' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      {/* News Channel Ticker Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 overflow-hidden relative">
        <div className="animate-news-ticker tracking-wide font-bold">
          For WhatsApp Orders use code <span className="text-yellow-400 font-extrabold bg-slate-800 px-2 py-0.5 rounded border border-yellow-400/40">VOEUX10</span> for extra discount on all Car Electronics! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; For WhatsApp Orders use code <span className="text-yellow-400 font-extrabold bg-slate-800 px-2 py-0.5 rounded border border-yellow-400/40">VOEUX10</span> for extra discount on all Car Electronics!
        </div>
      </div>

      {/* Main Minimal Navbar */}
      <nav className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="container mx-auto flex items-center justify-between gap-3">
          
          {/* Official Brand Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setActivePage('home')}>
            <img
              src="/images/voeux_logo.png"
              alt="VOEUX® Car Electronics"
              className="h-8 sm:h-10 w-auto rounded-lg shadow-sm hover:opacity-95 transition"
            />
          </div>

          {/* Minimal Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8 text-xs font-semibold tracking-wide text-gray-700">
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

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Desktop Search Input */}
            <div className="relative hidden md:block w-48">
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



            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-black rounded-lg bg-gray-100"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 space-y-3 animate-in fade-in duration-200">
            {/* Mobile Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />

              {searchResults.length > 0 && searchQuery && (
                <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-200 divide-y divide-gray-100 max-h-48 overflow-y-auto">
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProductModal(p);
                        setSearchQuery('');
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-2.5 flex items-center gap-3 active:bg-gray-100 cursor-pointer"
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

            {/* Mobile Nav Links */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActivePage(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-xl text-left font-semibold transition ${
                    activePage === link.id ? 'bg-[#3B429F] text-white shadow-sm' : 'bg-gray-50 text-gray-800 border border-gray-200'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
