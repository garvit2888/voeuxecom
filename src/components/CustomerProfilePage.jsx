import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { User, Package, MapPin, LogOut, Clock, CheckCircle, Truck, ExternalLink, ShieldCheck } from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user, logoutUser, orders, setActivePage } = useShop();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile'

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <User className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Please Sign In to View Your Account</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">Access your active orders, shipping addresses, and warranty certificates.</p>
        <button
          onClick={() => setActivePage('home')}
          className="btn-primary text-xs py-2.5 px-6"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const userOrders = orders.filter(o => o.userEmail === user.email || o.userPhone === user.phone);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 text-left max-w-5xl">
      
      {/* Header Profile Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#3B429F] text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name || 'VOEUX Customer'}</h1>
            <p className="text-xs text-gray-500">{user.email} • {user.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              logoutUser();
              setActivePage('home');
            }}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-gray-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 ${
            activeTab === 'orders'
              ? 'border-[#3B429F] text-[#3B429F]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 ${
            activeTab === 'profile'
              ? 'border-[#3B429F] text-[#3B429F]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No Orders Placed Yet</h3>
              <p className="text-xs text-gray-500">Your direct VOEUX store orders will appear here automatically.</p>
              <button onClick={() => setActivePage('home')} className="btn-primary text-xs py-2 px-5 mt-2">
                Start Shopping
              </button>
            </div>
          ) : (
            userOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block">Order ID: #{order.id}</span>
                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {order.status || 'ORDER PLACED'}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-gray-100 border border-gray-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-xs text-[#3B429F] font-extrabold mt-0.5">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Address & Total Footer */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 bg-gray-50/50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <div>
                    <span className="text-gray-500 font-semibold block">Shipping Address:</span>
                    <span className="text-gray-800 font-medium">{order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-gray-500 font-semibold block">Total Amount Paid:</span>
                    <span className="text-base font-black text-[#3B429F]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Profile Details */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">Personal Information</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 font-semibold block">Full Name</span>
              <span className="text-gray-900 font-bold text-sm">{user.name}</span>
            </div>

            <div>
              <span className="text-gray-400 font-semibold block">Email Address</span>
              <span className="text-gray-900 font-medium">{user.email}</span>
            </div>

            <div>
              <span className="text-gray-400 font-semibold block">Phone Number</span>
              <span className="text-gray-900 font-medium">{user.phone}</span>
            </div>

            <div>
              <span className="text-gray-400 font-semibold block">Default Shipping Address</span>
              <span className="text-gray-900 font-medium">
                {user.address ? `${user.address}, ${user.city} - ${user.pincode}` : 'No address saved yet.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
