import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { Search, ShoppingCart, Menu, X, User, ChevronRight } from 'lucide-react';

export const Navbar = () => {
  const {
    activePage,
    setActivePage,
    cart,
    setIsCartOpen,
    setSelectedProductModal,
    user,
    setIsAuthModalOpen,
    cartAnimating
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const navLinks = [
    { id: 'android-players', label: 'Android Players' },
    { id: 'car-speakers', label: 'Car Speakers' },
    { id: 'speakers-soundbars', label: 'Speakers & Soundbars' },
    { id: 'amplifiers', label: 'Car Amplifiers' },
    { id: 'warranty', label: 'Register Warranty' }
  ];

  const handleAccountClick = () => {
    if (user) {
      setActivePage('profile');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      {/* Top Header Bar (Desktop Sticky Header & News Ticker) */}
      <header className="sticky top-0 z-40 w-full bg-slate-950 text-white border-b border-slate-800 shadow-md">
        
        {/* News Ticker Banner */}
        <div className="bg-[#3B429F] text-white text-[11px] py-1.5 overflow-hidden relative border-b border-indigo-900/40">
          <div className="animate-news-ticker tracking-wide font-semibold">
            Get 10% OFF — enter code <span className="text-yellow-300 font-extrabold bg-indigo-900/80 px-2 py-0.5 rounded border border-yellow-300/40">VOEUX10</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Get 10% OFF — enter code <span className="text-yellow-300 font-extrabold bg-indigo-900/80 px-2 py-0.5 rounded border border-yellow-300/40">VOEUX10</span>
          </div>
        </div>

        {/* Mobile-Only: VOEUX Logo Row below the ticker */}
        <div className="lg:hidden flex items-center px-4 py-2.5 bg-slate-950 border-b border-slate-800">
          <div
            className="cursor-pointer"
            onClick={() => setActivePage('home')}
          >
            <img
              src="/images/voeux_logo.png"
              alt="VOEUX® Electronics"
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>

        {/* Noise-Style Desktop Header: Single Line, Proper Spacing */}
        <nav className="hidden lg:block px-6 py-3.5">
          <div className="container mx-auto flex items-center justify-between gap-6">
            
            {/* Left: Brand Logo */}
            <div
              className="flex justify-start items-center cursor-pointer shrink-0"
              onClick={() => setActivePage('home')}
            >
              <img
                src="/images/voeux_logo.png"
                alt="VOEUX® Electronics"
                className="h-8 w-auto object-contain transition hover:opacity-90"
              />
            </div>

            {/* Center: Clean Nav Links in One Line */}
            <div className="flex items-center space-x-8 text-xs font-medium text-slate-200 tracking-tight">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => setActivePage(link.id)}
                  className={`py-1 transition-colors cursor-pointer whitespace-nowrap ${
                    activePage === link.id
                      ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
                      : 'hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right: Search Icon, Profile Icon, Cart Icon with Red Counter Badge */}
            <div className="flex items-center space-x-5 text-slate-200 shrink-0">
              
              {/* Search Toggle Icon */}
              <div className="relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-1.5 hover:text-white transition cursor-pointer"
                  title="Search Products"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Popover Search Bar */}
                {isSearchOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full bg-gray-100 text-xs rounded-xl pl-9 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="mt-2 divide-y divide-gray-100 max-h-56 overflow-y-auto">
                        {searchResults.map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedProductModal(p);
                              setSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className="p-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg cursor-pointer text-left"
                          >
                            <img src={p.image} alt={p.name} className="w-8 h-8 object-contain bg-gray-100 rounded p-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                              <p className="text-[10px] text-[#3B429F] font-bold">₹{p.price.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Icon */}
              <button
                onClick={handleAccountClick}
                className="p-1.5 hover:text-white transition cursor-pointer flex items-center gap-1"
                title={user ? user.name : 'Account'}
              >
                <User className="w-5 h-5" />
              </button>

              {/* Cart Icon with Red Counter Badge + Celebration Animation */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 hover:text-white transition cursor-pointer"
                aria-label="View Cart"
              >
                {/* Confetti burst dots */}
                {cartAnimating && (
                  <>
                    <span className="confetti-dot confetti-1" style={{top:'-4px',left:'-4px'}} />
                    <span className="confetti-dot confetti-2" style={{top:'-4px',right:'-4px'}} />
                    <span className="confetti-dot confetti-3" style={{top:'4px',right:'-8px'}} />
                    <span className="confetti-dot confetti-4" style={{top:'-8px',left:'4px'}} />
                    <span className="confetti-dot confetti-5" style={{top:'-6px',left:'50%'}} />
                    <span className="confetti-dot confetti-6" style={{top:'0px',left:'-8px'}} />
                  </>
                )}
                {/* Ring glow wrapper */}
                <span className={`inline-flex rounded-full p-0.5 ${cartAnimating ? 'animate-cart-ring' : ''}`}>
                  <ShoppingCart className={`w-5 h-5 ${cartAnimating ? 'animate-cart-bounce text-yellow-300' : ''}`} />
                </span>
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-slate-950 transition-all ${cartAnimating ? 'scale-125' : 'scale-100'}`}>
                    {cartCount}
                  </span>
                )}
              </button>

            </div>

          </div>
        </nav>
      </header>

      {/* ==================== MOBILE FLOATING CAPSULE NAVIGATION BAR ==================== */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-[90] max-w-sm mx-auto bg-[#3B429F] text-white rounded-full px-4 py-2.5 flex items-center justify-between shadow-2xl border border-indigo-400/30 backdrop-blur-lg">
        {/* Left: Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-1.5 text-white font-bold text-xs p-1 cursor-pointer hover:opacity-90 active:scale-95 transition"
          aria-label="Toggle Mobile Menu"
        >
          {isMobileMenuOpen ? <Menu className="w-5 h-5 text-white opacity-80" /> : <Menu className="w-5 h-5 text-white" />}
          <span className="text-xs font-black tracking-wider uppercase">Menu</span>
        </button>

        {/* Center: Brand Logo */}
        <div
          onClick={() => {
            setActivePage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center justify-center cursor-pointer p-1"
        >
          <img
            src="/images/voeux_logo.png"
            alt="VOEUX® Logo"
            className="h-6 w-auto object-contain"
          />
        </div>

        {/* Right: Account & Cart Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAccountClick}
            className="p-1 text-white hover:text-indigo-100 transition cursor-pointer active:scale-95"
            aria-label="Account"
          >
            <User className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1 text-white hover:text-indigo-100 transition cursor-pointer active:scale-95"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#3B429F]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Modal */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-[85] bg-black/65 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200"
        >
          {/* Inner Drawer — stopPropagation prevents inner click from closing menu */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#3B429F] rounded-t-[32px] p-5 pt-3 space-y-3 max-h-[80vh] overflow-y-auto mb-20 shadow-2xl border-t border-indigo-400/30 text-left"
          >
            {/* Top Handle Indicator */}
            <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto my-1.5" />

            {/* Mobile Nav Links - Sleek White Premium Cards */}
            <div className="space-y-2.5 pt-1">
              {navLinks.map(link => {
                const isActive = activePage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActivePage(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full p-4 rounded-2xl font-black text-xs transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                      isActive
                        ? 'bg-white text-[#3B429F] shadow-lg shadow-indigo-950/40 ring-2 ring-white/60'
                        : 'bg-white/95 hover:bg-white text-gray-900 shadow-md'
                    }`}
                  >
                    <span className="tracking-tight text-sm font-extrabold">{link.label}</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition ${isActive ? 'bg-[#3B429F] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
