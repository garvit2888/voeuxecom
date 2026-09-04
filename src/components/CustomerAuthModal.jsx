import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Lock, Mail, Phone, User, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const CustomerAuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser, registerUser, addToast } = useShop();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    pincode: '',
    state: 'Delhi'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setErrorMsg(''); // Clear inline error on any field change
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '', address: '', city: '', pincode: '', state: 'Delhi' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!formData.email || !formData.password) {
          setErrorMsg('Please enter your email or mobile number and password');
          setLoading(false);
          return;
        }
        await loginUser(formData.email, formData.password);
      } else {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          setErrorMsg('Please fill in all required fields');
          setLoading(false);
          return;
        }
        if (formData.phone.replace(/\D/g, '').length !== 10) {
          setErrorMsg('Please enter a valid 10-digit mobile number');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setErrorMsg('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }
        const { confirmPassword, ...userData } = formData;
        await registerUser(userData);
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-left">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3B429F]">VOEUX® OFFICIAL STORE</span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex mx-6 mt-4 bg-gray-100 rounded-2xl p-1 gap-1">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              mode === 'login' ? 'bg-white text-[#3B429F] shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              mode === 'register' ? 'bg-white text-[#3B429F] shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form — autoComplete="off" blocks browser from pre-filling saved credentials */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">

          {/* ── Inline Error Banner — appears above all inputs ── */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span className="text-xs font-semibold text-red-700 leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Full Name — register only */}
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="new-password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Email or Phone for Login / Email for Register */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              {mode === 'login' ? 'Email Address or Mobile Number *' : 'Email Address *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type={mode === 'login' ? 'text' : 'email'}
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={mode === 'login' ? 'Registered email or 10-digit mobile number' : 'name@example.com'}
                autoComplete="new-password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Phone — register only */}
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Mobile Number * (10 digits)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  autoComplete="new-password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              Password *{mode === 'register' && ' (min. 6 characters)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3.5 top-2.5 text-gray-400 hover:text-gray-700 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password — register only */}
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={`w-full bg-gray-50 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none transition ${
                    formData.confirmPassword && formData.confirmPassword !== formData.password
                      ? 'border-red-400 focus:border-red-500'
                      : formData.confirmPassword && formData.confirmPassword === formData.password
                      ? 'border-emerald-400 focus:border-emerald-500'
                      : 'border-gray-200 focus:border-[#3B429F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  className="absolute right-3.5 top-2.5 text-gray-400 hover:text-gray-700 transition"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 ml-1">Passwords do not match</p>
                )}
                {formData.confirmPassword && formData.confirmPassword === formData.password && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1 ml-1">&#10003; Passwords match</p>
                )}
              </div>
            </div>
          )}

          {/* Optional Address — register only */}
          {mode === 'register' && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-600">
                Default Shipping Address <span className="text-gray-400 font-normal">(Optional — saves time at checkout)</span>
              </p>
              <input
                type="text" name="address"
                value={formData.address} onChange={handleChange}
                placeholder="House No, Street, Landmark"
                autoComplete="new-password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text" name="city"
                  value={formData.city} onChange={handleChange}
                  placeholder="City"
                  autoComplete="new-password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                />
                <input
                  type="text" name="pincode"
                  value={formData.pincode} onChange={handleChange}
                  placeholder="6-digit Pincode"
                  autoComplete="new-password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#3B429F] focus:outline-none transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B429F] hover:bg-[#2B308B] active:bg-[#20246B] text-white font-bold py-3.5 rounded-xl text-xs transition shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit encrypted · Your data is safe with VOEUX®</span>
        </div>

      </div>
    </div>
  );
};
