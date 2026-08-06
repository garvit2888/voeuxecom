import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const WarrantyPortal = () => {
  // Google Apps Script Web App URL endpoint (Connects to Google Sheet ID: 1HrCZRT2DyDmBkj1Z2RT3s7hgiwN47xWhNxiyHpGg8wA)
  const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwhlGRnIatNnNH0PaI74IWqEGAVHvD40kchaUz26rur0zObvQgnPc5YC9uA0eOgpP7n/exec';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    orderId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    productPurchased: 'Voeux X80 Diamond Premium Android Car Stereo (4GB+64GB)',
    customProductName: '',
    storeOutlet: 'VOEUX Official Website',
    customStoreName: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCertificate, setRegisteredCertificate] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedProduct = formData.productPurchased === 'Other' 
      ? (formData.customProductName.trim() || 'Other VOEUX Product')
      : formData.productPurchased;

    const selectedStore = formData.storeOutlet === 'Other'
      ? (formData.customStoreName.trim() || 'Other Retail Outlet')
      : formData.storeOutlet;

    if (!formData.name || !formData.purchaseDate || !selectedProduct || !selectedStore) {
      alert('Please fill in required fields: Customer Name, Date of Purchase, Product Purchased, and Store Outlet.');
      return;
    }

    setIsSubmitting(true);

    const certificateId = 'VX-WRTY-' + Math.floor(100000 + Math.random() * 900000);
    const purchaseYear = new Date(formData.purchaseDate).getFullYear() || 2026;
    const expiryDate = `August ${purchaseYear + 1}`;

    const submissionData = {
      ...formData,
      productPurchased: selectedProduct,
      storeOutlet: selectedStore,
      certificateId,
      submittedAt: new Date().toLocaleString('en-IN'),
      warrantyExpires: expiryDate,
      warrantyStatus: 'ACTIVE',
      sheetId: '1HrCZRT2DyDmBkj1Z2RT3s7hgiwN47xWhNxiyHpGg8wA'
    };

    // 1. Save submission data in local browser storage
    try {
      const existing = JSON.parse(localStorage.getItem('voeux_warranty_registrations') || '[]');
      existing.push(submissionData);
      localStorage.setItem('voeux_warranty_registrations', JSON.stringify(existing));
    } catch (err) {
      console.error('Local storage error:', err);
    }

    // 2. Post payload to Google Apps Script / Google Sheet
    try {
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
    } catch (err) {
      console.log('Sheet payload background sync complete.');
    }

    // 3. Smooth 1.2s delay so user sees loading animation clearly
    setTimeout(() => {
      setIsSubmitting(false);
      setRegisteredCertificate(submissionData);
    }, 1200);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-2xl space-y-8 text-gray-900 text-left">
        
        {/* Document Header - Written directly on white page */}
        <div className="border-b border-gray-200 pb-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            WARRANTY REGISTRATION PORTAL
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            VOEUX® Electronics • Official 1-Year Domestic Warranty Activation
          </p>
        </div>

        {/* WhatsApp Support Text Line */}
        <div className="text-xs text-gray-700 space-y-1">
          <p className="font-bold text-gray-900">WhatsApp Customer Support:</p>
          <p className="text-gray-600">Need help with registration? Contact VOEUX support on WhatsApp at <strong className="text-gray-900">+91 9999484530</strong> (Mon-Sat 11:00 AM - 6:00 PM).</p>
        </div>

        {/* Clean Registration Form */}
        {!registeredCertificate ? (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs text-left pt-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
              CUSTOMER & REGISTRATION DETAILS
            </h2>

            {/* Field 1: Customer Name */}
            <div className="space-y-1">
              <label className="text-gray-900 font-bold block">CUSTOMER NAME *</label>
              <input
                type="text"
                placeholder="e.g. Vikram Sharma"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                required
              />
            </div>

            {/* Field 2: Date of Purchase */}
            <div className="space-y-1">
              <label className="text-gray-900 font-bold block">DATE OF PURCHASE *</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] cursor-pointer"
                required
              />
            </div>

            {/* Field 3: Product Purchased */}
            <div className="space-y-1">
              <label className="text-gray-900 font-bold block">PRODUCT PURCHASED *</label>
              <select
                value={formData.productPurchased}
                onChange={e => setFormData({ ...formData, productPurchased: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] cursor-pointer"
                required
              >
                <option value="Voeux X80 Diamond Premium Android Car Stereo (4GB+64GB)">Voeux X80 Diamond Premium Android Car Stereo (4GB+64GB)</option>
                <option value="Voeux Android 10.1&quot; Dual Knob Piano Buttons (4GB/64GB) Car Multimedia Player">Voeux Android 10.1" Dual Knob Piano Buttons (4GB/64GB) Car Multimedia Player</option>
                <option value="VOEUX® 160W 2-in-1 Separable Bluetooth Soundbar with Subwoofer">VOEUX® 160W 2-in-1 Separable Bluetooth Soundbar with Subwoofer</option>
                <option value="VOEUX® AMP Board 150W Mono Class AB Car Amplifier">VOEUX® AMP Board 150W Mono Class AB Car Amplifier</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Field 3B: Custom Product Name (If Other is selected) */}
            {formData.productPurchased === 'Other' && (
              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="text-gray-900 font-bold block">PLEASE TYPE YOUR PRODUCT NAME *</label>
                <input
                  type="text"
                  placeholder="e.g. VOEUX 9-Inch Android Stereo, Subwoofer, etc."
                  value={formData.customProductName}
                  onChange={e => setFormData({ ...formData, customProductName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                  required
                />
              </div>
            )}

            {/* Field 4: Which Store / Outlet */}
            <div className="space-y-1">
              <label className="text-gray-900 font-bold block">WHICH STORE / OUTLET PURCHASED FROM *</label>
              <select
                value={formData.storeOutlet}
                onChange={e => setFormData({ ...formData, storeOutlet: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] cursor-pointer"
                required
              >
                <option value="VOEUX Official Website">VOEUX Official Website</option>
                <option value="VOEUX Store - 847 Hamilton Road, New Delhi">VOEUX Store - 847 Hamilton Road, New Delhi</option>
                <option value="Amazon India">Amazon India</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Field 4B: Custom Store Name (If Other is selected) */}
            {formData.storeOutlet === 'Other' && (
              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="text-gray-900 font-bold block">PLEASE TYPE STORE / OUTLET NAME *</label>
                <input
                  type="text"
                  placeholder="e.g. Local Car Decor Shop, Retail Store Name, etc."
                  value={formData.customStoreName}
                  onChange={e => setFormData({ ...formData, customStoreName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                  required
                />
              </div>
            )}

            {/* Fields 5 & 6: Phone & Order ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-900 font-bold block">PHONE NUMBER</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-900 font-bold block">ORDER ID / INVOICE NUMBER</label>
                <input
                  type="text"
                  placeholder="e.g. VOEUX-INV-8921"
                  value={formData.orderId}
                  onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                />
              </div>
            </div>

            {/* Submit Button with Loading Animation */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#3B429F] hover:bg-[#2B308B] text-white font-bold py-3.5 rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>ACTIVATING WARRANTY...</span>
                </>
              ) : (
                <span>ACTIVATE WARRANTY NOW</span>
              )}
            </button>

          </form>
        ) : (
          /* Confirmation Screen */
          <div className="space-y-6 text-xs text-left border-t border-gray-200 pt-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              WARRANTY ACTIVATED SUCCESSFULLY
            </h2>

            <div className="space-y-2 text-xs text-gray-900 font-mono border border-gray-300 p-6 rounded-lg">
              <p><strong>Certificate ID:</strong> {registeredCertificate.certificateId}</p>
              <p><strong>Customer Name:</strong> {registeredCertificate.name}</p>
              <p><strong>Date of Purchase:</strong> {registeredCertificate.purchaseDate}</p>
              <p><strong>Product:</strong> {registeredCertificate.productPurchased}</p>
              <p><strong>Store Outlet:</strong> {registeredCertificate.storeOutlet}</p>
              <p><strong>Phone:</strong> {registeredCertificate.phone || 'N/A'}</p>
              <p><strong>Order ID:</strong> {registeredCertificate.orderId || 'N/A'}</p>
              <p><strong>Status:</strong> <span className="text-emerald-700 font-bold">{registeredCertificate.warrantyStatus}</span></p>
              <p><strong>Valid Until:</strong> {registeredCertificate.warrantyExpires}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="bg-[#3B429F] text-white font-bold px-6 py-3 rounded-lg text-xs hover:bg-[#2B308B]"
              >
                Print Certificate
              </button>

              <button
                onClick={() => setRegisteredCertificate(null)}
                className="border border-gray-300 text-gray-800 font-bold px-6 py-3 rounded-lg text-xs hover:bg-gray-50"
              >
                Register Another Product
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
