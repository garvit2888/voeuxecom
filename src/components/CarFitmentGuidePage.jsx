import React from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { CAR_FITMENT_GUIDES, getCarGuideBySlug } from '../data/carGuides';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  ShieldCheck,
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

  // Show same-brand cars first, then popular Indian models for internal discovery
  const sameMakeGuides = CAR_FITMENT_GUIDES.filter(
    (g) => g.make === guide.make && g.slug !== guide.slug
  );
  const otherPopularGuides = CAR_FITMENT_GUIDES.filter(
    (g) => g.make !== guide.make
  ).slice(0, 12);

  return (
    <article className="min-h-screen bg-white text-gray-900 pb-24">
      {/* ==================== VOEUX.BLOG EDITORIAL MASTHEAD ==================== */}
      <div className="w-full bg-black text-white border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('blog')}
            className="inline-flex items-baseline gap-0.5 text-xl sm:text-2xl font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>Voeux</span>
            <span className="text-[#7c85ff]">.</span>
            <span className="font-light tracking-wide text-white/90">Blog</span>
          </button>

          <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.2em] text-white/60">
            <button
              type="button"
              onClick={() => setActivePage('blog')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              All 52 Car Guides
            </button>
            <button
              type="button"
              onClick={() => setActivePage('android-players')}
              className="hidden sm:inline-block hover:text-white transition-colors cursor-pointer"
            >
              Shop Players
            </button>
          </div>
        </div>
      </div>

      {/* ==================== EDITORIAL ARTICLE HEADER ==================== */}
      <header className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-10 border-b border-gray-200">
        {/* Minimalist Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActivePage('home');
            }}
            className="hover:text-black transition-colors"
          >
            Home
          </a>
          <span>/</span>
          <a
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              setActivePage('blog');
            }}
            className="hover:text-black transition-colors"
          >
            Voeux.Blog
          </a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{guide.carName}</span>
        </nav>

        <p className="text-[11px] uppercase tracking-[0.26em] text-[#3B429F] font-semibold mb-3">
          VOEUX.BLOG · {guide.make.toUpperCase()} · {guide.segment.toUpperCase()}
        </p>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-950 tracking-tight leading-[1.12] max-w-4xl">
          Best Android Player for {guide.carName}: Fitment, Screen Size &amp; Buying Guide
        </h1>

        <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl font-normal">
          {guide.heroSummary}
        </p>

        {/* Clean Hairline Spec Strip (Unboxed) */}
        <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <p className="uppercase tracking-[0.18em] text-gray-400 mb-1">Compatible Models</p>
            <p className="text-sm font-semibold text-gray-900">{guide.modelYears}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.18em] text-gray-400 mb-1">Recommended Display</p>
            <p className="text-sm font-semibold text-gray-900">{guide.recommendedSize}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.18em] text-gray-400 mb-1">OEM Door Speaker Bay</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">{guide.doorSpeakerSize}</p>
          </div>
        </div>
      </header>

      {/* ==================== MAIN EDITORIAL CONTENT ==================== */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* Section 1: Vehicle-Specific Upgrade Insight */}
        <section className="py-12 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#3B429F] font-semibold">
                01 / THE UPGRADE
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-snug">
                How VOEUX® Upgrades Your {guide.carName}
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-5 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>{guide.whyUpgrade}</p>
              <p>
                Because the {guide.carName} uses a {guide.dashLayout}, choosing a properly proportioned 9-inch or 10.1-inch Double-DIN head unit matters. Every official VOEUX® Android Car Stereo runs 4GB RAM and 64GB internal storage with Wireless Apple CarPlay, Android Auto, built-in GPS navigation, Bluetooth hands-free calling, and a 4×50W MOSFET amplifier stage — so navigation stays fluid and audio stays clean even at highway speeds.
              </p>

              <div className="pt-4">
                <h3 className="text-xs uppercase tracking-[0.22em] text-gray-400 font-semibold mb-4">
                  {guide.carName} Fitment &amp; Wiring Details
                </h3>
                <ul className="space-y-3">
                  {guide.fitmentNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-800">
                      <span className="text-[#3B429F] font-bold mt-0.5">—</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Unboxed Recommended VOEUX Products (Matches VOEUX Store Aesthetic) */}
        <section className="py-14 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#3B429F] font-semibold">
                02 / RECOMMENDED HARDWARE
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                Best VOEUX® Android Players for {guide.carName}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('android-players')}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-gray-600 hover:text-[#3B429F] font-semibold cursor-pointer"
            >
              <span>View Full Lineup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="group flex flex-col justify-between">
                <div>
                  <div
                    onClick={() => setSelectedProductModal(product)}
                    className="w-full h-56 flex items-center justify-center overflow-hidden mb-5 cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={`${product.name} for ${guide.carName}`}
                      className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3
                    onClick={() => setSelectedProductModal(product)}
                    className="text-base font-bold text-gray-950 group-hover:text-[#3B429F] transition-colors cursor-pointer leading-snug"
                  >
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="text-xl font-extrabold text-gray-950">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <ul className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                    {(product.shortSpecs || []).slice(0, 4).map((spec, i) => (
                      <li key={i}>• {spec}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product);
                      setIsCartOpen(true);
                    }}
                    className="w-full py-3 bg-black hover:bg-[#3B429F] text-white text-[11px] uppercase tracking-[0.22em] font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <div className="flex items-center justify-between pt-1 text-[11px] uppercase tracking-[0.18em]">
                    <button
                      type="button"
                      onClick={() => setSelectedProductModal(product)}
                      className="text-gray-600 hover:text-black font-medium cursor-pointer"
                    >
                      View Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => openVirtualFit(product)}
                      className="text-[#3B429F] hover:underline font-semibold cursor-pointer"
                    >
                      Try Virtual Fit →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Signature VOEUX Black Editorial Virtual Fit Band */}
        <section className="my-14 bg-black text-white px-6 sm:px-12 py-10 sm:py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#7c85ff] mb-2">
              VOEUX® VIRTUAL FIT
            </p>
            <h2 className="text-xl sm:text-3xl font-light uppercase tracking-[0.1em] text-white leading-snug">
              See It on Your {guide.carName} Dashboard Before You Buy
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-white/65 leading-relaxed">
              Unsure between 9-inch and 10.1-inch? Upload a front-view photograph of your {guide.carName} dashboard and preview the exact VOEUX® unit fitted to real physical scale — available in English, Hindi, Telugu &amp; Marathi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openVirtualFit(recommendedProducts[0])}
            className="shrink-0 px-8 py-4 border border-white bg-white text-black hover:bg-[#3B429F] hover:border-[#3B429F] hover:text-white text-[11px] uppercase tracking-[0.24em] font-medium transition-all cursor-pointer inline-flex items-center justify-center gap-2.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Virtual Fit</span>
          </button>
        </section>

        {/* Section 4: Honest Brand Reliability (Strictly Factual — Zero Exaggeration) */}
        <section className="py-12 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#3B429F] font-semibold">
                03 / BRAND RELIABILITY
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-snug">
                Why Choose Official VOEUX® Electronics
              </h2>
              <p className="mt-3 text-xs text-gray-500 leading-relaxed inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3B429F]" />
                <span>Backed by 1-Year Domestic Warranty in India</span>
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-gray-200">
              {guide.brandReliability.map((point, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  <span className="text-xs font-mono text-[#3B429F] font-semibold pt-0.5">
                    0{idx + 1}
                  </span>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Editorial FAQ (Clean Hairline Dividers, Zero Boxes) */}
        <section className="py-12 border-b border-gray-200">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#3B429F] font-semibold">
            04 / QUESTIONS &amp; ANSWERS
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight mb-8">
            {guide.carName} Android Player FAQs
          </h2>

          <div className="divide-y divide-gray-200">
            {guide.faqs.map((item, idx) => (
              <div key={idx} className="py-5 first:pt-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-950">{item.q}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-3xl">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Clean Internal Discovery Links Across Voeux.Blog */}
        <section className="pt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-extrabold text-gray-950">
              More on Voeux.Blog
            </h2>
            <button
              type="button"
              onClick={() => setActivePage('blog')}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#3B429F] hover:underline font-semibold cursor-pointer"
            >
              <span>Browse All {CAR_FITMENT_GUIDES.length} Car Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {[...sameMakeGuides, ...otherPopularGuides].slice(0, 14).map((other) => (
              <a
                key={other.slug}
                href={`/car/${other.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(`car/${other.slug}`);
                }}
                className="text-gray-600 hover:text-[#3B429F] underline decoration-gray-300 underline-offset-4 transition-colors"
              >
                {other.carName}
              </a>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActivePage('blog')}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-600 hover:text-black cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Voeux.Blog</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage('bundles')}
              className="text-xs uppercase tracking-[0.2em] text-gray-600 hover:text-[#3B429F] font-semibold cursor-pointer"
            >
              Explore Stereo + 4 Speakers Combos →
            </button>
          </div>
        </section>
      </div>
    </article>
  );
};
