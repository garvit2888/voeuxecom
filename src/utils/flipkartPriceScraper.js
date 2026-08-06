/**
 * Live Flipkart Price Fetcher via Google Apps Script proxy
 * Calls your own Apps Script web app — no CORS issues, runs server-side on Google's infrastructure.
 */

// ✅ Your deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhlGRnIatNnNH0PaI74IWqEGAVHvD40kchaUz26rur0zObvQgnPc5YC9uA0eOgpP7n/exec';

export const fetchLiveFlipkartPrice = async (flipkartUrl) => {
  if (!flipkartUrl || typeof flipkartUrl !== 'string') return null;

  try {
    // Cache key based on last 20 chars of URL
    const safeId = flipkartUrl.replace(/[^a-zA-Z0-9]/g, '').slice(-20);
    const cacheKey = `voeux_fk_price_${safeId}`;

    // Return cached price if valid (15-minute TTL)
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (_) {}

    // Call Google Apps Script as server-side Flipkart proxy
    const apiUrl = `${APPS_SCRIPT_URL}?action=getPrice`;
    const res = await fetch(apiUrl);

    if (!res.ok) return null;

    const json = await res.json();

    if (json && json.success && json.price && json.price > 500) {
      const result = {
        price: json.price,
        originalPrice: json.originalPrice || null
      };

      // Cache the result
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: result
        }));
      } catch (_) {}

      return result;
    }

  } catch (err) {
    // Silently fail — fall back to static price from products.js
  }

  return null;
};
