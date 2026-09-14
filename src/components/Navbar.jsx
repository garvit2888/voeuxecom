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
          className="lg:hidden fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex justify-start animate-in fade-in duration-200"
        >
          {/* Inner Side Drawer Panel — dark navy blue background with white condensed uppercase text */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-[85%] max-w-sm h-full bg-[#181C4F] text-white p-6 sm:p-8 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300 text-left"
          >
            <div>
              {/* Top X Close Button */}
              <div className="flex items-center justify-between pb-6">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 -ml-1 text-white hover:text-indigo-200 transition cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-8 h-8 stroke-[2.5]" />
                </button>
              </div>

              {/* SECTION 1: SHOP */}
              <div className="space-y-4">
                <h3 className="font-condensed text-2xl font-normal uppercase tracking-wider text-white border-b border-indigo-400/20 pb-2">
                  SHOP
                </h3>
                <div className="space-y-3 font-condensed text-xl sm:text-2xl font-normal uppercase text-white tracking-wide">
                  <button
                    onClick={() => { setActivePage('home'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    ALL PRODUCTS
                  </button>
                  <button
                    onClick={() => { setActivePage('android-players'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    ANDROID CAR PLAYERS
                  </button>
                  <button
                    onClick={() => { setActivePage('car-speakers'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    CAR SPEAKERS
                  </button>
                  <button
                    onClick={() => { setActivePage('speakers-soundbars'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    SPEAKERS & SOUNDBARS
                  </button>
                  <button
                    onClick={() => { setActivePage('amplifiers'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    CAR AMPLIFIERS
                  </button>
                </div>
              </div>

              {/* SECTION 2: CONTACT US / HELP & INFORMATION */}
              <div className="space-y-4 pt-8">
                <h3 className="font-condensed text-2xl font-normal uppercase tracking-wider text-white border-b border-indigo-400/20 pb-2">
                  CONTACT US
                </h3>
                <div className="space-y-3 font-condensed text-xl sm:text-2xl font-normal uppercase text-white tracking-wide">
                  <button
                    onClick={() => { setActivePage('about-us'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    ABOUT US
                  </button>
                  <button
                    onClick={() => { setActivePage('contact-us'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    CONTACT INFORMATION
                  </button>
                  <button
                    onClick={() => { setActivePage('warranty'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    WARRANTY REGISTER PORTAL
                  </button>
                  <button
                    onClick={() => { setActivePage('warranty-policy'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    REPAIRS & WARRANTY POLICY
                  </button>
                  <button
                    onClick={() => { setActivePage('installation'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    INSTALLATION GUIDE & HELP
                  </button>
                  <button
                    onClick={() => { setActivePage('join-us'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    DISTRIBUTOR PROGRAM
                  </button>
                  <button
                    onClick={() => { setActivePage('dealers'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    DEALER LOCATOR
                  </button>
                </div>
              </div>

              {/* SECTION 3: TERMS & POLICIES */}
              <div className="space-y-4 pt-8">
                <h3 className="font-condensed text-2xl font-normal uppercase tracking-wider text-white border-b border-indigo-400/20 pb-2">
                  POLICIES & TERMS
                </h3>
                <div className="space-y-3 font-condensed text-xl sm:text-2xl font-normal uppercase text-white tracking-wide">
                  <button
                    onClick={() => { setActivePage('terms'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    PRIVACY POLICY
                  </button>
                  <button
                    onClick={() => { setActivePage('terms'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    REFUND POLICY
                  </button>
                  <button
                    onClick={() => { setActivePage('terms'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    SHIPPING POLICY
                  </button>
                  <button
                    onClick={() => { setActivePage('terms'); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left transition hover:text-indigo-300 cursor-pointer"
                  >
                    TERMS AND CONDITIONS
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Account Footer Link */}
            <div className="pt-10 mt-8 border-t border-indigo-400/20">
              <button
                onClick={() => {
                  handleAccountClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 text-white hover:text-indigo-200 uppercase font-condensed text-xl font-normal tracking-wide transition cursor-pointer"
              >
                <User className="w-6 h-6 text-indigo-300" />
                <span>{user ? user.name : 'MY ACCOUNT / SIGN IN'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
