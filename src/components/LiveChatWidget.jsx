import React from 'react';
import { useShop } from '../context/ShopContext';

export const LiveChatWidget = () => {
  const { activePage, selectedProductModal } = useShop();

  const getWhatsAppMessage = () => {
    // 1. If currently viewing an exact product modal or product detail page
    if (selectedProductModal) {
      const prodName = selectedProductModal.name;
      const cat = (selectedProductModal.category || '').toLowerCase();
      const priceStr = selectedProductModal.price ? ` (₹${selectedProductModal.price.toLocaleString('en-IN')})` : '';

      if (cat === 'android-players' || prodName.toLowerCase().includes('stereo') || prodName.toLowerCase().includes('android')) {
        return `Hello VOEUX Team, I am inquiring about the "${prodName}" Android Car Player${priceStr}. Could you please help me with specifications, custom frame fitment for my car, and warranty details?`;
      }
      if (cat === 'car-speakers' || prodName.toLowerCase().includes('speaker')) {
        return `Hello VOEUX Team, I am inquiring about "${prodName}"${priceStr}. Could you please guide me on sound output, wiring, and speaker fitment for my car?`;
      }
      if (cat === 'subwoofers' || prodName.toLowerCase().includes('subwoofer')) {
        return `Hello VOEUX Team, I am inquiring about the "${prodName}"${priceStr}. Could you please share details on dimensions, bass performance, and underseat fitment for my car?`;
      }
      if (cat === 'amplifiers' || prodName.toLowerCase().includes('amp')) {
        return `Hello VOEUX Team, I am inquiring about the "${prodName}"${priceStr}. Could you please guide me on power ratings, channels, and compatibility with my car sound setup?`;
      }
      if (cat === 'bundles' || selectedProductModal.isBundle) {
        return `Hello VOEUX Team, I am inquiring about the "${prodName}"${priceStr}. Could you please help me choose the speaker variant, custom frame, and installation for my car?`;
      }
      return `Hello VOEUX Team, I am inquiring about "${prodName}"${priceStr}. Could you please share more details, pricing, and car compatibility?`;
    }

    // 2. If on specific category or functional page
    switch (activePage) {
      case 'android-players':
        return `Hello VOEUX Team, I am browsing your Android Car Players collection on your website. Could you please help me choose the best Android stereo with Wireless CarPlay and custom frame for my car?`;
      case 'car-speakers':
        return `Hello VOEUX Team, I am browsing your Car Speakers collection (6" & 6.5" High-Bass Speakers). Could you please recommend the best speaker upgrade for my car?`;
      case 'speakers-soundbars':
        return `Hello VOEUX Team, I am interested in your 160W 2-in-1 Separable Soundbar. Could you please share details regarding audio output, connectivity modes, and availability?`;
      case 'amplifiers':
        return `Hello VOEUX Team, I am exploring your Car Amplifiers (150W Mono Class AB). Could you please guide me on compatibility and installation with my car audio setup?`;
      case 'subwoofers':
        return `Hello VOEUX Team, I am exploring your 10" Underseat Powered Subwoofer (SVX-UND001). Could you please help me with underseat fitment dimensions and bass output for my car?`;
      case 'bundles':
        return `Hello VOEUX Team, I am interested in your Complete Audio Video Upgrade Combo Bundles (Android Stereo + 4 Speakers + Frame). Could you please assist me with the best combo package for my car?`;
      case 'warranty':
      case 'warranty-registration':
      case 'warranty-policy':
        return `Hello VOEUX Support, I need assistance regarding warranty registration, warranty policy, or product support for my VOEUX equipment.`;
      case 'dealers':
        return `Hello VOEUX Team, I would like to find an authorized dealer or installer for VOEUX products in my city.`;
      case 'installation':
        return `Hello VOEUX Support, I have a query regarding installation guidance and car fitment for my VOEUX product.`;
      case 'join-us':
      case 'distributor-program':
      case 'distributor-application':
        return `Hello VOEUX Team, I am interested in partnering with VOEUX through the Official Distributor Program. Could you please guide me through the business evaluation process?`;
      case 'contact-us':
      case 'support':
        return `Hello VOEUX Support Team, I am on your contact/support page and have a query regarding your products and customer services.`;
      case 'home':
      default:
        return `Hello VOEUX Team, I am visiting your official online portal. Could you please assist me with product recommendations, car fitment, and current festive offers?`;
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    const message = getWhatsAppMessage();
    const url = `https://wa.me/919999484530?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-32 sm:bottom-5 right-4 sm:right-6 z-50 animate-float-delayed">
      <button
        type="button"
        onClick={handleClick}
        className="group relative p-3 sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-bold text-xs shadow-emerald-500/40 border border-emerald-400 cursor-pointer select-none"
        title="Chat on WhatsApp (+91 9999484530)"
      >
        <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span className="hidden sm:inline font-extrabold tracking-wide text-xs">WhatsApp Support</span>
      </button>
    </div>
  );
};
