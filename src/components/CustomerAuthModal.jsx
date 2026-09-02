import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Lock, Mail, Phone, User, ArrowRight, ShieldCheck } from 'lucide-react';

export const CustomerAuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser, registerUser, addToast } = useShop();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    pincode: '',
    state: 'Delhi'
  });
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!formData.email || !formData.password) {
          addToast('Please enter email and password', 'warning');
          setLoading(false);
          return;
        }
        await loginUser(formData.email, formData.password);
      } else {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          addToast('Please fill in all required fields', 'warning');
          setLoading(false);
          return;
        }
        await registerUser(formData);
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-left">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 bg-white">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3B429F]">OFFICIAL STORE</span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {mode === 'login' ? 'Customer Sign In' : 'Create Account'}
            </h2>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 mx-6 mt-4 rounded-2xl">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'login'
                ? 'bg-white text-[#3B429F] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'register'
                ? 'bg-white text-[#3B429F] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Mobile Phone (10 digits)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-700">Default Shipping Address (Optional)</p>
              
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House No, Street, Landmark"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                />
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit Pincode"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B429F] hover:bg-[#2B308B] active:bg-[#20246B] text-white font-bold py-3.5 rounded-xl text-xs transition shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Account Security</span>
        </div>

      </div>
    </div>
  );
};
