import React, { useState } from 'react';
import { DEALERS } from '../data/products';
import { MapPin, Phone, Star, Search, Navigation } from 'lucide-react';

export const DealerLocator = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDealers = DEALERS.filter(
    d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pin.includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 text-xs">
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center space-y-3">
        <MapPin className="w-8 h-8 text-[#3B429F] mx-auto" />
        <h1 className="text-2xl font-extrabold text-gray-900">VOEUX® Certified Dealer Network</h1>
        <p className="text-gray-600">Find your nearest store for live demos and instant fitment.</p>

        <div className="max-w-md mx-auto relative pt-2">
          <input
            type="text"
            placeholder="Search by City or PIN code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-full pl-9 pr-4 py-2 text-xs focus:border-[#3B429F]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-4.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredDealers.map(dealer => (
          <div key={dealer.id} className="clean-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="bg-indigo-50 text-[#3B429F] font-bold text-[10px] px-2 py-0.5 rounded">
                  {dealer.city}
                </span>
                <div className="flex items-center text-yellow-400 font-bold">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="ml-1 text-gray-800">{dealer.rating}</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-900">{dealer.name}</h3>
              <p className="text-gray-600">{dealer.address}</p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <a href={`tel:${dealer.phone}`} className="font-bold text-[#3B429F] flex items-center gap-1">
                <Phone className="w-3 h-3" /> Call
              </a>
              <button
                onClick={() => alert(`Directions to ${dealer.name}`)}
                className="btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" /> Map
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
