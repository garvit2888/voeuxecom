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
  let filtered = categoryProducts.filter(p => {
    const matchesPrice = p.price <= maxPrice;
    const matchesQuery = p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                         p.shortSpecs.some(s => s.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesPrice && matchesQuery;
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
