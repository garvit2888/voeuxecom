import React from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { CAR_FITMENT_GUIDES, getCarGuideBySlug } from '../data/carGuides';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ShoppingCart,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const CarFitmentGuidePage = ({ slug }) => {
  const {
    setActivePage,
    setSelectedProductModal,
    openVirtualFit,
    addToCart,
    setIsCartOpen,
    productsList,
  } = useShop();

  const guide = getCarGuideBySlug(slug) || CAR_FITMENT_GUIDES[0];
  const catalog = productsList || PRODUCTS;
  const recommendedProducts = guide.recommendedProductIds
    .map((id) => catalog.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      {/* Dark Automotive Hero Banner */}
      <section className="bg-black text-white pt-10 pb-14 px-4 sm:px-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/55 mb-6">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="hover:text-white cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => setActivePage('android-players')}
              className="hover:text-white cursor-pointer"
            >
              Car Android Players
            </button>
            <span>/</span>
            <span className="text-white/90">{guide.carName}</span>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('android-players')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white mb-5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Car Android Players</span>
          </button>

          <p className="text-[11px] uppercase tracking-[0.28em] text-[#7c85ff] mb-2">
            VOEUX® OFFICIAL FITMENT GUIDE · {guide.make.toUpperCase()}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Best Android Player for {guide.carName}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/75 max-w-3xl leading-relaxed">
            {guide.heroSummary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3.5 py-1.5 border border-white/20 bg-white/5 text-white/90">
              Compatible Years: <strong>{guide.modelYears}</strong>
            </span>
            <span className="px-3.5 py-1.5 border border-[#3B429F] bg-[#3B429F]/20 text-white">
              Recommended Size: <strong>{guide.recommendedSize}</strong>
            </span>
            <span className="px-3.5 py-1.5 border border-white/20 bg-white/5 text-white/90 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>1-Year VOEUX® India Warranty</span>
            </span>
          </div>

          {/* Direct Virtual Fit CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => openVirtualFit(recommendedProducts[0])}
              className="px-7 py-3.5 bg-white text-black hover:bg-[#3B429F] hover:text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Preview on Your {guide.carName} Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage('bundles')}
              className="px-7 py-3.5 border border-white/35 hover:border-white text-white text-xs uppercase tracking-[0.2em] font-medium transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>View Stereo + 4 Speakers Combos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-12 space-y-14">
        {/* Recommended VOEUX Models for this Car */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Top Recommended VOEUX® Android Players for {guide.carName}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Official 4GB RAM + 64GB ROM QLED &amp; IPS Android Car Stereos with Wireless Apple CarPlay, Android Auto &amp; Pan-India Free Delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedProducts.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between bg-white hover:shadow-lg transition-shadow"
              >
                <div>
                  <div
                    onClick={() => setSelectedProductModal(product)}
                    className="h-56 bg-gray-50 flex items-center justify-center p-4 cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={`${product.name} for ${guide.carName}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-5">
                    <h3
                      onClick={() => setSelectedProductModal(product)}
                      className="text-base font-bold text-gray-900 hover:text-[#3B429F] cursor-pointer line-clamp-2"
                    >
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2.5">
                      <span className="text-xl font-extrabold text-gray-900">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                      {(product.shortSpecs || []).slice(0, 4).map((spec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3B429F] shrink-0 mt-0.5" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product);
                      setIsCartOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-black hover:bg-[#3B429F] text-white text-xs uppercase tracking-[0.18em] font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProductModal(product)}
                      className="py-2 px-3 border border-gray-300 hover:border-black text-gray-800 text-[11px] font-medium rounded-lg cursor-pointer"
                    >
                      Full Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => openVirtualFit(product)}
                      className="py-2 px-3 border border-[#3B429F]/40 hover:bg-[#3B429F]/10 text-[#3B429F] text-[11px] font-semibold rounded-lg cursor-pointer"
                    >
                      Virtual Fit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fitment & Installation Checklist */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              {guide.carName} Fitment &amp; Installation Checklist
            </h2>
            <ul className="mt-5 space-y-3.5">
              {guide.fitmentNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#3B429F] shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Why Upgrade Your {guide.carName} Stereo to VOEUX®?
            </h2>
            <p className="mt-4 text-sm text-gray-700 leading-relaxed">
              {guide.whyUpgrade}
            </p>
            <div className="mt-6 p-4 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 space-y-1.5">
              <p className="font-bold text-gray-900">Included with Every Official VOEUX® Order:</p>
              <p>• 1-Year Domestic Warranty on Manufacturing Defects</p>
              <p>• Free Pan-India Shipping on Android Car Players</p>
              <p>• Dedicated Fitment Support &amp; Certified Dealer Network</p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-[#3B429F]" />
            <span>{guide.carName} Android Player FAQs</span>
          </h2>
          <div className="space-y-4">
            {guide.faqs.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-5 bg-white">
                <h3 className="text-base font-bold text-gray-900">{item.q}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links to Other Popular Indian Car Guides */}
        <section className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">
            Explore VOEUX® Android Player Fitment Guides by Car Model
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {CAR_FITMENT_GUIDES.map((other) => (
              <button
                key={other.slug}
                type="button"
                onClick={() => setActivePage(`car/${other.slug}`)}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  other.slug === guide.slug
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#3B429F] hover:text-[#3B429F]'
                }`}
              >
                Android Player for {other.carName}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
