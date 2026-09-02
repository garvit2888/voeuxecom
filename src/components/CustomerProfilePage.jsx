import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { User, Package, MapPin, LogOut, Clock, CheckCircle, Truck, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user, logoutUser, orders, setActivePage } = useShop();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses'

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4 max-w-md">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customer Account</h2>
        <p className="text-xs text-gray-500 leading-relaxed">Sign in to track orders, manage default shipping addresses, and download warranty receipts.</p>
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

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 text-left max-w-5xl">
      
      {/* Shopify-Style Account Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 bg-[#3B429F] text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3B429F]">OFFICIAL VOEUX® MEMBER</span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{user.name || 'VOEUX Customer'}</h1>
            <p className="text-xs text-gray-500 font-medium">{user.email} • {user.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              logoutUser();
              setActivePage('home');
            }}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 transition bg-white shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Nav & Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-4 space-y-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                activeTab === 'orders'
                  ? 'bg-[#3B429F] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Orders ({userOrders.length})</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                activeTab === 'profile'
                  ? 'bg-[#3B429F] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Account Details</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </div>

          {/* Quick Support Widget */}
          <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-5 space-y-2 text-xs">
            <h4 className="font-extrabold text-indigo-950">Need Assistance?</h4>
            <p className="text-indigo-800 text-[11px] font-medium leading-relaxed">
              Have questions about your order or warranty? Our support team is available on WhatsApp.
            </p>
            <button
              onClick={() => window.open('https://wa.me/919999484530', '_blank')}
              className="text-[#3B429F] font-bold hover:underline block pt-1"
            >
              Contact Support →
            </button>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="md:col-span-8 space-y-6">
          
          {/* TAB 1: ORDERS HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Order History</h2>

              {userOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
                  <Package className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-base font-bold text-gray-900">You haven't placed any orders yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">When you buy VOEUX products, your orders will appear here automatically.</p>
                  <button onClick={() => setActivePage('home')} className="bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition shadow-sm mt-2">
                    Browse Store
                  </button>
                </div>
              ) : (
                userOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
                      <div>
                        <span className="text-xs font-black text-gray-900 block">Order #{order.id}</span>
                        <span className="text-[11px] text-gray-400 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                          order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {order.status || 'ORDER PLACED'}
                        </span>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'}
                        </span>
                      </div>
                    </div>

                    {/* Items Stack */}
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-contain rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                            <p className="text-xs text-[#3B429F] font-extrabold mt-0.5">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 bg-gray-50/60 -mx-6 -mb-6 p-4 rounded-b-3xl">
                      <div>
                        <span className="text-gray-400 font-medium block">Shipping Address:</span>
                        <span className="text-gray-800 font-semibold">{order.shippingAddress?.fullName}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-gray-400 font-medium block">Total Paid:</span>
                        <span className="text-base font-black text-[#3B429F]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight border-b border-gray-100 pb-3">Personal Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-semibold block">Full Name</span>
                  <span className="text-gray-900 font-bold text-sm">{user.name}</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-semibold block">Email Address</span>
                  <span className="text-gray-900 font-bold text-xs">{user.email}</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-semibold block">Phone Number</span>
                  <span className="text-gray-900 font-bold text-xs">{user.phone}</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-semibold block">Default Shipping Address</span>
                  <span className="text-gray-900 font-semibold">
                    {user.address ? `${user.address}, ${user.city} - ${user.pincode}` : 'No address saved yet.'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
