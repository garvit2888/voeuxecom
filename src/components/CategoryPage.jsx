import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, CATEGORIES, CAR_MODELS } from '../data/products';
import { ProductCard } from './ProductCard';
import { Search, ArrowUpDown } from 'lucide-react';

export const CategoryPage = ({ categoryId }) => {
  const { productsList } = useShop();

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
  const [selectedMake, setSelectedMake] = useState('All');

  let filtered = categoryProducts.filter(p => {
    const matchesPrice = p.price <= maxPrice;
    const matchesQuery = p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                         p.shortSpecs.some(s => s.toLowerCase().includes(filterQuery.toLowerCase()));
    const matchesMake = selectedMake === 'All' || p.compatibility.some(c => c.toLowerCase().includes(selectedMake.toLowerCase()));
    return matchesPrice && matchesQuery && matchesMake;
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
      
      {/* Category Header */}
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-left">
        <span className="badge-minimal">VOEUX® Category</span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{category.name}</h1>
        <p className="text-xs text-gray-500 mt-1">{category.description}</p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-xs w-full">
          <input
            type="text"
            placeholder="Search category..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#3B429F]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>



        {/* Car Make Filter */}
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <span className="text-gray-600 font-medium">Make:</span>
          <select
            value={selectedMake}
            onChange={e => setSelectedMake(e.target.value)}
            className="bg-transparent text-gray-900 focus:outline-none cursor-pointer"
          >
            <option value="All">All Makes</option>
            {CAR_MODELS.map(c => (
              <option key={c.make} value={c.make}>{c.make}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3B429F]"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 text-xs">
          No products found matching your filter options.
        </div>
      )}

    </div>
  );
};
