import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Download, FileText, Wrench, ShieldCheck } from 'lucide-react';

export const SupportFAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Will installing a VOEUX® Android Player void my car factory warranty?',
      a: 'No. VOEUX® Android players come with 100% direct OEM coupler-to-coupler plug and play wiring harnesses. Zero wire cutting is involved.'
    },
    {
      q: 'How does the 1-Year Doorstep Express Replacement Warranty work?',
      a: 'If any issue arises, raise a ticket on our Warranty Portal. Our technician will visit your address to provide an instant doorstep unit replacement.'
    },
    {
      q: 'Does VOEUX® Android Player support Wireless CarPlay and Android Auto?',
      a: 'Yes! All VOEUX® HyperDrive series Android Players feature 5.8GHz Wi-Fi for instant wireless Apple CarPlay and Android Auto.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 text-xs">
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center space-y-2">
        <HelpCircle className="w-8 h-8 text-[#3B429F] mx-auto" />
        <h1 className="text-2xl font-extrabold text-gray-900">VOEUX® Help & Manuals</h1>
        <p className="text-gray-600">Frequently Asked Questions & Manual Downloads</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="clean-card p-4 space-y-2">
          <FileText className="w-5 h-5 text-[#3B429F]" />
          <h4 className="font-bold text-gray-900">HyperDrive QLED Manual</h4>
          <button onClick={() => alert('Downloading Manual PDF')} className="text-[#3B429F] font-bold flex items-center gap-1 hover:underline">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>

        <div className="clean-card p-4 space-y-2">
          <Wrench className="w-5 h-5 text-[#3B429F]" />
          <h4 className="font-bold text-gray-900">Car Wiring Diagram</h4>
          <button onClick={() => alert('Downloading Wiring Diagram PDF')} className="text-[#3B429F] font-bold flex items-center gap-1 hover:underline">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>

        <div className="clean-card p-4 space-y-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h4 className="font-bold text-gray-900">Warranty Policy</h4>
          <button onClick={() => alert('Downloading Warranty Policy PDF')} className="text-[#3B429F] font-bold flex items-center gap-1 hover:underline">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
        {faqs.map((faq, idx) => (
          <div key={idx} className="clean-card overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
              className="w-full p-4 text-left font-bold text-gray-900 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-[#3B429F] transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIdx === idx && (
              <div className="p-4 text-gray-600 border-t border-gray-200 bg-white leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
