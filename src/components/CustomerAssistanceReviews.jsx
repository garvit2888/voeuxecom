import React, { useState, useEffect } from 'react';
import { Star, X, Send, CheckCircle2 } from 'lucide-react';

export const PRODUCT_OPTIONS = [
  'VOEUX® AMP Board 150W Mono Class AB Car Amplifier',
  'Voeux X80 Diamond Premium Android Car Stereo (4GB+64GB)',
  'VOEUX® 160W 2-in-1 Separable Bluetooth Soundbar with Subwoofer',
  'Voeux Android 10.1" Dual Knob Piano Buttons (4GB/64GB) Car Player',
  'Voeux Android 4+64GB, 6th Gen, 4 Core Car Stereo',
  'Voeux Single Knob Piano Series Android Stereo (4GB+64GB)',
  'Voeux 6" 2-Way Coaxial Car Speakers, 380W High Bass (VE-CS606)',
  'Voeux Premium 2 Way 6.5" 75W RMS Coaxial Speaker (460W) (VE-CS606PT2)',
  'Voeux SVX-UND001 10-Inch Underseat Powerful Subwoofer (120W RMS)',
  'Voeux X80 Android Player + 4 Speakers + Frame Combo',
  'Voeux 9" TS7 Android Player + 4 Speakers + Frame Combo',
  'Voeux Single Knob Android Player + 4 Speakers + Frame Combo',
  'Other VOEUX Product'
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-voeux-amp-02',
    name: 'Verified Customer',
    productName: 'VOEUX® AMP Board 150W Mono Class AB Car Amplifier',
    rating: 5,
    reviewText: 'Wonderful! Very good product and works very well. I am fully satisfied.',
    avatarBg: 'bg-indigo-600',
    submittedAt: 'Verified Review'
  }
];

const AVATAR_COLORS = [
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-amber-600'
];

export const CustomerAssistanceReviews = () => {
  const [reviews, setReviews] = useState(() => {
    try {
      localStorage.removeItem('voeux_customer_assistance_reviews');
      const saved = localStorage.getItem('voeux_customer_reviews_live');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy test reviews and unrefined drafts
          const validSaved = parsed.filter(r => 
            !r.id?.startsWith('rev-0') && 
            !r.name?.toLowerCase().includes('test') &&
            r.id !== 'rev-amp-01' &&
            r.id !== 'rev-voeux-amp-01' &&
            !r.reviewText?.includes('Maximum Power Output')
          );
          const existingIds = new Set(validSaved.map(r => r.id));
          const remainingInitials = INITIAL_REVIEWS.filter(r => !existingIds.has(r.id));
          return [...validSaved, ...remainingInitials];
        }
      }
    } catch (e) {
      console.error('Error loading reviews:', e);
    }
    return INITIAL_REVIEWS;
  });

  // Sync latest reviews from the cloud backend (Firebase Realtime DB) on mount
  useEffect(() => {
    const fetchBackendReviews = async () => {
      try {
        const res = await fetch('https://voeux-warehouse-default-rtdb.firebaseio.com/customer_reviews.json');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            const list = Object.values(data).filter(r => 
              r && r.id && !r.id.startsWith('rev-0') && 
              !r.name?.toLowerCase().includes('test') &&
              r.id !== 'rev-amp-01' &&
              r.id !== 'rev-voeux-amp-01' &&
              !r.reviewText?.includes('Maximum Power Output')
            );
            if (list.length > 0) {
              setReviews(prev => {
                const combined = [...list, ...prev];
                const seen = new Set();
                const unique = [];
                for (const r of combined) {
                  if (r && r.id && !seen.has(r.id)) {
                    seen.add(r.id);
                    unique.push(r);
                  }
                }
                return unique;
              });
            }
          }
        }
      } catch (err) {
        console.warn('Backend sync note:', err);
      }
    };
    fetchBackendReviews();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State: Name, Product Name, Rating, Review Text
  const [formData, setFormData] = useState({
    name: '',
    productName: '',
    rating: 5,
    reviewText: ''
  });

  // Support personal customer review link: #write-review, #review, or ?review=true
  useEffect(() => {
    const handleReviewTrigger = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        hash === '#write-review' || 
        hash === '#review' || 
        hash === '#customer-review' ||
        search.includes('review=true') ||
        search.includes('write-review=true')
      ) {
        setIsModalOpen(true);
        const section = document.getElementById('customer-reviews-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleReviewTrigger();
    window.addEventListener('hashchange', handleReviewTrigger);
    return () => window.removeEventListener('hashchange', handleReviewTrigger);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.productName.trim() || !formData.reviewText.trim()) {
      alert('Please fill in your name, select the product, and write your review.');
      return;
    }

    setIsSubmitting(true);

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newReview = {
      id: `rev-${Date.now()}`,
      name: formData.name.trim(),
      productName: formData.productName.trim(),
      rating: Number(formData.rating),
      reviewText: formData.reviewText.trim(),
      avatarBg: randomColor,
      submittedAt: new Date().toLocaleString('en-IN')
    };

    // 1. "There and then": Immediately update UI state right away
    setReviews(prev => [newReview, ...prev.filter(r => r.id !== newReview.id)]);

    // 2. Persist in localStorage so it stays across browser refreshes
    try {
      const stored = JSON.parse(localStorage.getItem('voeux_customer_reviews_live') || '[]');
      stored.unshift(newReview);
      localStorage.setItem('voeux_customer_reviews_live', JSON.stringify(stored));
    } catch (err) {
      console.error('LocalStorage save error:', err);
    }

    // 3. Save to Cloud Backend (Firebase Realtime Database)
    try {
      fetch(`https://voeux-warehouse-default-rtdb.firebaseio.com/customer_reviews/${newReview.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      }).catch(err => console.error('Firebase save error:', err));
    } catch (err) {
      console.error('Cloud backend write failed:', err);
    }

    // 4. Also post to Google Sheet webhook
    const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxJ8McdwGLCM2q9-lcSoDA22F7U0leONZ8ryBYKZ8kCPGYxbb-KqL7jVzYhC2IHiF-nmw/exec';
    try {
      fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'customer_review',
          customerName: newReview.name,
          productName: newReview.productName,
          rating: newReview.rating,
          reviewText: newReview.reviewText,
          submittedAt: newReview.submittedAt
        })
      }).catch(() => {});
    } catch (err) {
      // background sync
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', productName: '', rating: 5, reviewText: '' });
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        // Clean URL hash if it was opened via #write-review
        if (window.location.hash.toLowerCase().includes('review')) {
          history.replaceState(null, '', window.location.pathname);
        }
      }, 1200);
    }, 600);
  };

  return (
    <section id="customer-reviews-section" className="container mx-auto px-4 py-12 sm:py-16 text-gray-900 text-left border-t border-b border-gray-100 bg-white">
      
      {/* Header: Pure review showcase (no public write button to prevent fake submissions) */}
      <div className="mb-8 sm:mb-10 border-b border-gray-200 pb-4">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Customer Assistance Experience Reviews
        </h2>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Real feedback and assistance experiences from verified drivers.
        </p>
      </div>

      {/* Reviews Grid: Customer Initial + Name, Product Name, Stars, and Review Text */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="clean-card p-6 flex flex-col space-y-3.5 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm transition font-body"
          >
            {/* Top: Customer Name + Product Name + Stars */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                  {review.name}
                </h4>
                {review.productName && (
                  <p className="text-[11px] sm:text-xs font-semibold text-indigo-700 truncate mt-0.5">
                    {review.productName}
                  </p>
                )}
              </div>

              {/* Stars */}
              <div className="flex shrink-0 pt-0.5">
                {[...Array(review.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            {/* Review Text */}
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {review.reviewText}
            </p>
          </div>
        ))}
      </div>

      {/* Verified Customer Review Modal (Accessible via personal customer invitation link) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 text-gray-900 font-body">
            
            {/* Modal Header */}
            <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
              <span className="font-bold uppercase tracking-wider text-white text-xs">
                Verified Customer Support Experience Review
              </span>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (window.location.hash.toLowerCase().includes('review')) {
                    history.replaceState(null, '', window.location.pathname);
                  }
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 sm:p-8">
              {isSuccess ? (
                <div className="text-center space-y-3 py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Review Published!</h3>
                  <p className="text-xs text-gray-600">Your review is now live on the VOEUX official store.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {/* Trust helper note */}
                  <p className="text-xs text-gray-600 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed font-medium">
                    This review will help other buyers to trust our customer support experience better.
                  </p>
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Vikramaditya Sharma"
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3B429F]"
                    />
                  </div>

                  {/* Product Name (Roll-down Menu) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.productName}
                      onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B429F] cursor-pointer"
                    >
                      <option value="">Select a product...</option>
                      {PRODUCT_OPTIONS.map((prod) => (
                        <option key={prod} value={prod}>
                          {prod}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stars Rating */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          className="p-1 hover:scale-110 transition cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= formData.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-gray-600 ml-2">
                        {formData.rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.reviewText}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                      placeholder="Write your review and experience with VOEUX..."
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3B429F] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-[#3B429F] hover:bg-[#2B308B] active:bg-[#20246B] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Publishing Review...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Publish Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
