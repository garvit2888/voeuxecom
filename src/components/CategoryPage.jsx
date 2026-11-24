import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, CATEGORIES, CAR_MODELS } from '../data/products';
import { CAR_FITMENT_GUIDES } from '../data/carGuides';
import { ProductCard } from './ProductCard';
import { Search, ArrowUpDown } from 'lucide-react';

export const CategoryPage = ({ categoryId }) => {
  const { productsList, setActivePage } = useShop();

  const category = CATEGORIES.find(c => c.id === categoryId) || {
    name: 'All Car Electronics',
    description: '4K Android Players, Soundbars, LED Lights & Accessories'
  };

  const allProds = productsList || PRODUCTS;

  const categoryProducts = categoryId
    ? allProds.filter(p => p.category === categoryId)
    : allProds;

  const [maxPrice, setMaxPrice] = useState(30000);
  const [sortBy, setSortBy] = useState('popular');
  const [filterQuery, setFilterQuery] = useState('');
  const [activeSub, setActiveSub] = useState('all');
  const subcategories = category.subcategories || [];
  let filtered = categoryProducts.filter(p => {
    const matchesPrice = p.price <= maxPrice;
    const matchesQuery = p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                         p.shortSpecs.some(s => s.toLowerCase().includes(filterQuery.toLowerCase()));
    const matchesSub = activeSub === 'all' || p.subcategory === activeSub;
    return matchesPrice && matchesQuery && matchesSub;
  });

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      
      {/* Category Header (Clean Typography, No Artificial Box Container) */}
      <div className="py-2 text-left border-b border-gray-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          {category.name}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          {category.description}
        </p>
      </div>

      {/* Subcategory Chips */}
      {subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[{ id: 'all', name: 'All' }, ...subcategories].map(sub => (
            <button
              key={sub.id}
              id={`subcategory-${sub.id}`}
              onClick={() => setActiveSub(sub.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
                activeSub === sub.id
                  ? 'bg-[#3B429F] text-white border-[#3B429F]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#3B429F] hover:text-[#3B429F]'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Filter Row (Clean & Unboxed Layout) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs py-1">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs w-full">
          <input
            type="text"
            placeholder="Search category..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="w-full bg-gray-100 border border-gray-200 text-gray-900 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3B429F] font-medium"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-gray-100 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
          >
            <option value="popular">Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 text-xs">
          No products found matching your filter options.
        </div>
      )}

      {/* Rich SEO Car-Wise Fitment Guides & Buying Guide on Android Players Category */}
      {categoryId === 'android-players' && (
        <section className="mt-14 pt-10 border-t border-gray-200 space-y-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Shop Car Android Player by Car Model (India Fitment Guides)
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
              Every VOEUX® 9-inch and 10.1-inch Android Car Stereo uses universal Double-DIN sizing with plug-and-play coupler harnesses for zero wire cutting. Explore our model-specific fitment guides below:
            </p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {CAR_FITMENT_GUIDES.map((guide) => (
                <a
                  key={guide.slug}
                  href={`/car/${guide.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePage(`car/${guide.slug}`);
                  }}
                  className="px-3.5 py-3 rounded-xl border border-gray-200 hover:border-[#3B429F] hover:text-[#3B429F] bg-gray-50 hover:bg-white text-xs font-semibold text-gray-800 transition-colors"
                >
                  Android Player for {guide.carName}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900">9-Inch vs 10.1-Inch Car Android Player</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Choose the 9-inch VOEUX® Carbon Black TS7 QLED for a clean flush OEM dashboard look, or step up to the 10.1-inch VOEUX® X80 Diamond Dual Knob for a wider cinema display with tactile rotary volume and tuning knobs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Wireless Apple CarPlay &amp; Android Auto</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                All VOEUX® 4GB RAM + 64GB ROM Car Android Players support Wireless Apple CarPlay, Android Auto, Google Maps navigation, Bluetooth 5.0/5.1 hands-free calling, Wi-Fi streaming, and steering wheel controls.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">1-Year Warranty &amp; Pan-India Delivery</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Every official VOEUX® car stereo includes a 1-Year Domestic Warranty, free pan-India shipping, and access to VOEUX® Virtual Fit so you can preview the player on your own dashboard before ordering.
              </p>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
