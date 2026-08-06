import React from 'react';
import { Heart } from 'lucide-react';

export const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-10">
      
      {/* Official Story Card */}
      <div className="bg-[#3B429F] text-white p-8 sm:p-10 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <h2 className="text-xl font-black tracking-tight">VOEUX – Built for Your Drive</h2>
          <span className="font-mono italic font-extrabold text-lg">voeux®</span>
        </div>
        <p className="text-sm leading-relaxed text-indigo-100 font-medium">
          Voeux was born from years of hands-on experience in car electronics. What started as an offline family business is now built for online drivers like you. We focus on reliability, clean design, and real performance — products we confidently install in our own cars.
        </p>
        <p className="text-xs font-bold text-white flex items-center gap-1 pt-1">
          Thank you for choosing Voeux <Heart className="w-4 h-4 fill-red-400 text-red-400 inline" />
        </p>
      </div>



      {/* Real Stats */}
      <div className="bg-gray-900 text-white p-8 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <span className="text-2xl font-black text-cyan-400">400+</span>
          <span className="text-[10px] uppercase block opacity-80 mt-1">E-Commerce Orders Delivered</span>
        </div>
        <div>
          <span className="text-2xl font-black text-cyan-400">1 YEAR</span>
          <span className="text-[10px] uppercase block opacity-80 mt-1">Warranty*</span>
        </div>
        <div>
          <span className="text-2xl font-black text-cyan-400">24/7</span>
          <span className="text-[10px] uppercase block opacity-80 mt-1">WhatsApp Support Agent</span>
        </div>
        <div>
          <span className="text-2xl font-black text-cyan-400">4.9 ★</span>
          <span className="text-[10px] uppercase block opacity-80 mt-1">Customer Rating</span>
        </div>
      </div>

    </div>
  );
};
