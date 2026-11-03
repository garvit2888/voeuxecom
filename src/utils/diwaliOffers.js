// Utility for VOEUX Diwali Dhamaka Sale (4th Nov - 8th Nov 2026)

export const DIWALI_CONFIG = {
  // Starts on 4th Nov 2026 at 12:00 AM IST
  startDate: new Date('2026-11-04T00:00:00+05:30').getTime(),
  // Ends on 8th Nov 2026 at 11:59:59 PM IST
  endDate: new Date('2026-11-08T23:59:59+05:30').getTime(),
  title: 'VOEUX® DIWALI DHAMAKA SALE',
  dateRange: '4th to 8th November',
  bannerText: 'VOEUX DIWALI SALE FROM 4TH NOVEMBER TO 8TH NOVEMBER'
};

/**
 * Check if the Diwali sale is active.
 * Automatically active between Nov 4 00:00 and Nov 8 23:59:59 IST,
 * or if overridden via localStorage or query parameter for testing/preview.
 */
export const isDiwaliSaleActive = () => {
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('diwali') === 'active') return true;
    if (searchParams.get('diwali') === 'preview') return true;
    if (searchParams.get('diwali') === 'off') return false;

    const savedMode = localStorage.getItem('voeux_diwali_mode');
    if (savedMode === 'active') return true;
    if (savedMode === 'countdown') return false;
  }

  const now = Date.now();
  return now >= DIWALI_CONFIG.startDate && now <= DIWALI_CONFIG.endDate;
};

/**
 * Check if the countdown timer should be shown (before Nov 4, 12 AM).
 */
export const isDiwaliTimerActive = () => {
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem('voeux_diwali_mode');
    if (savedMode === 'active') return false;
    if (savedMode === 'countdown') return true;

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('diwali') === 'active') return false;
    if (searchParams.get('diwali') === 'countdown') return true;
  }

  const now = Date.now();
  return now < DIWALI_CONFIG.startDate;
};

/**
 * Calculate the Diwali discount for any product:
 * 1) Android Players: ₹500 off
 * 2) Car Speakers: ₹500 off
 * 3) Soundbar: ₹250 off
 * 4) Underseat Subwoofer: ₹1,000 off
 * 5) Combo Bundles: ₹500 off
 */
export const getDiwaliDiscount = (product) => {
  if (!product) return 0;

  const cat = (product.category || '').toLowerCase();
  const id = (product.id || '').toLowerCase();
  const name = (product.name || '').toLowerCase();

  // 1) Android Players: 500 off
  if (cat === 'android-players' || id.includes('x80') || id.includes('piano') || id.includes('ts7') || name.includes('android player')) {
    return 500;
  }

  // 2) Car Speakers: 500 off
  if (cat === 'car-speakers' || id.includes('svx001') || id.includes('svx005') || (name.includes('speaker') && !cat.includes('soundbar') && !name.includes('soundbar'))) {
    return 500;
  }

  // 3) Soundbar: 250 off
  if (cat === 'speakers-soundbars' || id.includes('soundbar') || name.includes('soundbar')) {
    return 250;
  }

  // 4) Underseat Subwoofer: 1,000 off
  if (cat === 'subwoofers' || product.subcategory === 'underseat-subwoofer' || id.includes('underseat') || id.includes('subwoofer')) {
    return 1000;
  }

  // 5) Combo Bundles: 500 off
  if (cat === 'bundles' || product.isBundle || id.includes('bundle')) {
    return 500;
  }

  // 6) Car Amplifiers: 149 off
  if (cat === 'amplifiers' || id.includes('amp') || name.includes('amplifier')) {
    return 149;
  }

  return 0;
};

/**
 * Get pricing details including regular price, MRP, and Diwali discount.
 */
export const getDiwaliPricing = (product, activeOverride = null) => {
  if (!product) {
    return {
      regularPrice: 0,
      mrp: 0,
      diwaliPrice: 0,
      discount: 0,
      hasDiwaliDiscount: false
    };
  }

  const regularPrice = product.price || 0;
  const mrp = product.originalPrice || regularPrice;
  const discount = getDiwaliDiscount(product);
  const active = activeOverride !== null ? activeOverride : isDiwaliSaleActive();

  const diwaliPrice = active && discount > 0 ? Math.max(0, regularPrice - discount) : regularPrice;

  return {
    regularPrice,
    mrp,
    diwaliPrice,
    discount,
    hasDiwaliDiscount: active && discount > 0
  };
};
