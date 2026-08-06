import React from 'react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export const ContactUs = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8 text-xs">
      
      {/* Page Header */}
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Contact VOEUX® Support</h1>
        <p className="text-gray-600">Get in touch with our team for queries, fitment support & store locations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Official Address & Contact Info Card */}
        <div className="clean-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-3">
              Official Store & Head Office
            </h3>
            
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#3B429F] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  847 PROPERTY, PART OF PROP NO.847, WARD NO-1, Hamilton Road, New Delhi, Central Delhi, NEW DELHI
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-[#3B429F] shrink-0" />
                <a href="tel:9999484530" className="font-bold text-gray-900 hover:text-[#3B429F]">
                  +91 9999484530
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#3B429F] shrink-0" />
                <a href="mailto:voeuxexperience@gmail.com" className="font-bold text-[#3B429F] hover:underline">
                  voeuxexperience@gmail.com
                </a>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 pt-3 border-t border-gray-100">
            Open Monday to Saturday (11:00 AM to 6:00 PM)
          </p>
        </div>

        {/* WhatsApp Direct Support Card */}
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> WhatsApp Live Support
            </div>
            <p className="text-emerald-700 leading-relaxed">
              Have questions about car stereo fitment, Android player specs, or doorstep installation? Chat live with our team on WhatsApp.
            </p>
          </div>

          <div>
            <a
              href="https://wa.me/919999484530?text=Hi%20VOEUX,%20I%20have%20a%20query%20regarding%20car%20electronics"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition shadow-md"
            >
              Start WhatsApp Chat (+91 9999484530)
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
