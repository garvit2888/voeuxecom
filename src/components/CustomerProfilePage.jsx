import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Package, User, Gift, Share2, Phone, Mail, Edit2, Plus, LogOut, CheckCircle, Truck, MapPin, ChevronRight, X } from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user, logoutUser, orders, setActivePage, addToast } = useShop();
  const [activeTab, setActiveTab] = useState('profile'); // 'orders' | 'profile' | 'rewards' | 'referral'
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    pincode: '',
    state: 'Delhi'
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4 max-w-md">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <User className="w-8 h-8 text-[#3B429F]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Account</h2>
        <p className="text-xs text-gray-500 leading-relaxed">Sign in to view active orders, manage shipping addresses, and check warranty status.</p>
        <button
          onClick={() => setActivePage('home')}
          className="bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-3 px-6 rounded-xl transition shadow-md cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const userOrders = orders.filter(o => o.userEmail === user.email || o.userPhone === user.phone);

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
      addToast('Please fill in all address fields', 'warning');
      return;
    }
    user.address = newAddress.street;
    user.city = newAddress.city;
    user.pincode = newAddress.pincode;
    try { localStorage.setItem('voeux_user', JSON.stringify(user)); } catch(e){}
    setIsAddAddressOpen(false);
    addToast('Address updated successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 text-left">
      <div className="container mx-auto px-4 sm:px-8 py-8 space-y-8 max-w-6xl">
        
        {/* Page Title: "Your Account" (Matches Noise Header) */}
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Your Account
          </h1>
        </div>

        {/* 2-Column Noise Layout: Left Sidebar + Right Main Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar (Light Gray Container like Noise) */}
          <div className="md:col-span-3 bg-[#F9F9F9] rounded-2xl border border-gray-100 p-2 flex flex-col justify-between min-h-[420px] shadow-2xs">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full py-3.5 px-5 text-xs font-bold rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60 font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <span>Your orders</span>
                {userOrders.length > 0 && (
                  <span className="bg-[#3B429F] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {userOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full py-3.5 px-5 text-xs font-bold rounded-xl text-left transition cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60 font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <span>Your profile</span>
              </button>

              <button
                onClick={() => setActiveTab('rewards')}
                className={`w-full py-3.5 px-5 text-xs font-bold rounded-xl text-left transition cursor-pointer ${
                  activeTab === 'rewards'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60 font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <span>VOEUX Rewards</span>
              </button>

              <button
                onClick={() => setActiveTab('referral')}
                className={`w-full py-3.5 px-5 text-xs font-bold rounded-xl text-left transition cursor-pointer ${
                  activeTab === 'referral'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60 font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <span>REP Referral Program</span>
              </button>
            </div>

            {/* Floating Black Reward Pill (Exact Noise Replica) */}
            <div className="pt-6 p-2">
              <div className="bg-black text-white rounded-full px-4 py-2.5 flex items-center gap-2.5 text-xs font-bold shadow-md cursor-pointer hover:bg-gray-900 transition">
                <Gift className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>0 VOEUX Cash</span>
              </div>
            </div>
          </div>

          {/* Right Main Container */}
          <div className="md:col-span-9 space-y-8">
            
            {/* TAB: YOUR PROFILE (Exact Noise Layout) */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                
                {/* Greeting & Main Details Card */}
                <div className="border-b border-gray-200 pb-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      Hi, {user.name || 'Valued Customer'}
                    </h2>

                    <div className="flex items-center gap-4 text-xs font-bold text-[#3B429F]">
                      <button
                        onClick={() => setIsAddAddressOpen(true)}
                        className="flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          logoutUser();
                          setActivePage('home');
                        }}
                        className="hover:underline cursor-pointer text-[#3B429F]"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>

                  {/* Phone & Email Row */}
                  <div className="flex flex-wrap items-center gap-6 text-xs text-gray-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone || '+919999484530'}</span>
                      <button
                        onClick={() => setIsAddAddressOpen(true)}
                        className="text-[#3B429F] font-bold flex items-center gap-0.5 hover:underline cursor-pointer ml-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user.email || 'customer@voeux.in'}</span>
                    </div>
                  </div>
                </div>

                {/* Manage Addresses Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                      Manage addresses
                    </h3>

                    <button
                      onClick={() => setIsAddAddressOpen(true)}
                      className="text-xs font-bold text-[#3B429F] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add address</span>
                    </button>
                  </div>

                  {/* Address List or Empty State */}
                  {user.address ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="border border-gray-200 rounded-2xl p-5 space-y-2 bg-white relative shadow-2xs">
                        <span className="bg-[#3B429F] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Default Address
                        </span>
                        <p className="font-bold text-gray-900 text-sm pt-1">{user.name}</p>
                        <p className="text-gray-600 leading-relaxed">{user.address}, {user.city} - {user.pincode}</p>
                        <p className="text-gray-500 font-medium pt-1">Phone: {user.phone}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-500 text-sm font-medium">
                      You have no saved addresses in your profile
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: YOUR ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Your orders
                  </h2>
                  <span className="text-xs text-gray-500 font-medium">Total: {userOrders.length} order(s)</span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="py-16 text-center text-gray-500 text-sm font-medium space-y-3">
                    <Package className="w-12 h-12 text-gray-300 mx-auto" />
                    <p>You have not placed any orders yet</p>
                    <button
                      onClick={() => setActivePage('home')}
                      className="bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition cursor-pointer"
                    >
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-2xl p-6 space-y-4 bg-white shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2 text-xs">
                          <div>
                            <span className="font-black text-gray-900 text-sm block">Order #{order.id}</span>
                            <span className="text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`font-bold px-3 py-1 rounded-full text-[11px] ${
                              order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-[#3B429F]'
                            }`}>
                              {order.status || 'ORDER PLACED'}
                            </span>
                            <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full text-[11px]">
                              {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-xs">
                              <img src={item.image} alt={item.name} className="w-14 h-14 object-contain bg-gray-50 rounded-xl p-1 border border-gray-100 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                                <p className="text-[#3B429F] font-extrabold mt-0.5">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-900">
                          <span>Total Paid:</span>
                          <span className="text-base font-black text-[#3B429F]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: VOEUX REWARDS */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    VOEUX Rewards
                  </h2>
                </div>

                <div className="border border-gray-200 rounded-2xl p-8 text-center space-y-3 bg-white">
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto text-yellow-600">
                    <Gift className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">0 VOEUX Cash Balance</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Earn 5% VOEUX Cash back on every car audio & stereo purchase. Redeem points directly on your next checkout!
                  </p>
                </div>
              </div>
            )}

            {/* TAB: REFERRAL PROGRAM */}
            {activeTab === 'referral' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    REP Referral Program
                  </h2>
                </div>

                <div className="border border-gray-200 rounded-2xl p-8 space-y-4 bg-white text-xs">
                  <h3 className="text-base font-bold text-gray-900">Refer Friends & Earn ₹500 Voucher</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Share your unique VOEUX link with car enthusiast friends. When they buy an Android stereo or soundbar, you both get ₹500 instant discount!
                  </p>

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://voeuxtechnologies.in/?ref=${user.phone || 'VOEUX'}`}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-mono flex-1"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://voeuxtechnologies.in/?ref=${user.phone || 'VOEUX'}`);
                        addToast('Referral link copied to clipboard!', 'success');
                      }}
                      className="bg-[#3B429F] text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer hover:bg-[#2B308B] transition"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Add / Edit Address Modal */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 border border-gray-200 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Edit / Add Address</h3>
              <button onClick={() => setIsAddAddressOpen(false)} className="text-gray-400 hover:text-gray-900 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={e => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="House No, Street, Building, Landmark"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:border-[#3B429F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:border-[#3B429F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={newAddress.pincode}
                    onChange={e => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="Pincode"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:border-[#3B429F] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#3B429F] hover:bg-[#2B308B] text-white font-bold py-3 rounded-xl transition cursor-pointer mt-2"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
