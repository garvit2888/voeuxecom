import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Lock, Mail, Phone, User, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-left">
        
        {/* Header Banner */}
        <div className="bg-[#3B429F] p-6 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center font-black text-xl text-white">
              V
            </div>
            <div>
              <h2 className="text-lg font-bold">VOEUX® Account</h2>
              <p className="text-xs text-indigo-100">Sign in to manage orders & fast checkout</p>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
              mode === 'login'
                ? 'border-[#3B429F] text-[#3B429F] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
              mode === 'register'
                ? 'border-[#3B429F] text-[#3B429F] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (10 digits) *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
                />
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode (6 digits)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#3B429F]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B429F] hover:bg-[#2B308B] text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>VOEUX® Secure Encrypted Authentication</span>
        </div>

      </div>
    </div>
  );
};
