import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { CAR_FITMENT_GUIDES } from '../data/carGuides';
import { Search, ArrowRight, Sparkles } from 'lucide-react';

export const VoeuxBlogIndexPage = () => {
  const { setActivePage, openVirtualFit } = useShop();
  const [query, setQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('All');

  const makes = useMemo(() => {
    const unique = Array.from(new Set(CAR_FITMENT_GUIDES.map((g) => g.make)));
    return ['All', ...unique];
  }, []);

  const filteredGuides = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CAR_FITMENT_GUIDES.filter((g) => {
      const matchMake = selectedMake === 'All' || g.make === selectedMake;
      if (!matchMake) return false;
      if (!q) return true;
      return (
        g.carName.toLowerCase().includes(q) ||
        g.make.toLowerCase().includes(q) ||
        g.segment.toLowerCase().includes(q)
      );
    });
  }, [query, selectedMake]);

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-24">
      {/* Voeux.Blog Editorial Masthead */}
      <header className="w-full bg-black text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="inline-flex items-baseline gap-0.5 text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            <span>Voeux</span>
            <span className="text-[#7c85ff]">.</span>
            <span className="font-light tracking-wide text-white/90">Blog</span>
          </div>
          <p className="mt-4 text-sm sm:text-base text-white/65 max-w-2xl leading-relaxed">
            Car-specific Android Player fitment guides, dashboard compatibility notes, and audio upgrade insights for India’s {CAR_FITMENT_GUIDES.length} most popular vehicles.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => openVirtualFit()}
              className="px-6 py-3 bg-white text-black hover:bg-[#3B429F] hover:text-white text-[11px] uppercase tracking-[0.22em] font-medium transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try VOEUX® Virtual Fit</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage('android-players')}
              className="px-6 py-3 border border-white/30 hover:border-white text-white text-[11px] uppercase tracking-[0.22em] font-light transition-all cursor-pointer"
            >
              Shop Android Players
            </button>
          </div>
        </div>
      </header>

      {/* Search & Brand Filter Strip (Unboxed Editorial Style) */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="relative w-full md:max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-0 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your car (e.g. Creta, Swift, Thar, Nexon)..."
              className="w-full pl-7 pr-3 py-2 border-b border-gray-300 focus:border-black focus:outline-none text-sm text-gray-900 bg-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {makes.map((make) => (
              <button
                key={make}
                type="button"
                onClick={() => setSelectedMake(make)}
                className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                  selectedMake === make
                    ? 'border-[#3B429F] text-black font-semibold'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                {make}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Hairline Editorial Article List (Zero Boxy Cards) */}
        <div className="divide-y divide-gray-200">
          {filteredGuides.map((guide) => (
            <a
              key={guide.slug}
              href={`/car/${guide.slug}`}
              onClick={(e) => {
                e.preventDefault();
                setActivePage(`car/${guide.slug}`);
              }}
              className="group py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 -mx-3 px-3 transition-colors"
            >
              <div className="max-w-3xl">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#3B429F] font-semibold">
                  {guide.make} · {guide.segment} · {guide.recommendedSize}
                </p>
                <h2 className="mt-1.5 text-lg sm:text-xl font-bold text-gray-950 group-hover:text-[#3B429F] transition-colors">
                  Best Android Player for {guide.carName}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {guide.heroSummary}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-gray-500 group-hover:text-black font-medium">
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-500">
            No car guides matched &ldquo;{query}&rdquo;. Every VOEUX® Android Player uses universal Double-DIN sizing and fits nearly all cars with a model-specific fascia frame.
          </p>
        )}
      </div>
    </div>
  );
};
