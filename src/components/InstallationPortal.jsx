import React, { useState } from 'react';
import { Wrench, MapPin, CheckCircle } from 'lucide-react';

export const InstallationPortal = () => {
  const [fitmentType, setFitmentType] = useState('doorstep');
  const [bookingDone, setBookingDone] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pinCode: '',
    date: '2026-08-08',
    timeSlot: '11:00 AM - 01:00 PM'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.pinCode) {
      alert('Please fill in required fields.');
      return;
    }
    setBookingDone(true);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8 text-xs">
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center space-y-2">
        <Wrench className="w-8 h-8 text-[#3B429F] mx-auto" />
        <h1 className="text-2xl font-extrabold text-gray-900">VOEUX® Certified Installation Booking</h1>
        <p className="text-gray-600">Doorstep fitting by certified technicians with zero wire cutting guarantee.</p>
      </div>

      {!bookingDone ? (
        <form onSubmit={handleSubmit} className="clean-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFitmentType('doorstep')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2 ${
                fitmentType === 'doorstep' ? 'bg-indigo-50 border-[#3B429F] text-[#3B429F] font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <MapPin className="w-4 h-4" /> Doorstep Fitting
            </button>
            <button
              type="button"
              onClick={() => setFitmentType('studio')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2 ${
                fitmentType === 'studio' ? 'bg-indigo-50 border-[#3B429F] text-[#3B429F] font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <Wrench className="w-4 h-4" /> Partner Studio
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 font-semibold block mb-1">NAME *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold block mb-1">PHONE *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold block mb-1">PIN CODE *</label>
              <input
                type="text"
                value={form.pinCode}
                onChange={e => setForm({ ...form, pinCode: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold block mb-1">DATE</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Confirm Appointment
          </button>
        </form>
      ) : (
        <div className="clean-card p-8 border-2 border-emerald-500 text-center space-y-3">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">Appointment Confirmed!</h3>
          <p className="text-gray-600">Booking ID: VX-FIT-9821 • Date: {form.date} ({form.timeSlot})</p>
          <button onClick={() => setBookingDone(false)} className="btn-secondary text-xs py-1.5 px-4">
            Book Another
          </button>
        </div>
      )}
    </div>
  );
};
