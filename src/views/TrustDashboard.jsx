import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { NearbyRescueMap } from '../components/NearbyRescueMap';
import { calculateFoodStatus } from '../utils/expiryUtils';
import { 
  HeartHandshake, 
  ShieldCheck, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  Receipt, 
  Users, 
  Scale, 
  AlertCircle, 
  ArrowRight, 
  Truck, 
  LogOut, 
  Lock,
  QrCode,
  Compass,
  Navigation,
  AlertTriangle,
  Flame
} from 'lucide-react';

export const TrustDashboard = () => {
  const { 
    currentRole,
    currentUser, 
    orders, 
    listings, 
    setActiveView, 
    setActiveTrackingOrderId, 
    setReceiptModalOrder,
    toggleTrustVerification,
    logout
  } = useApp();

  // Access Control Protection
  if (currentRole !== 'trust' || !currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 font-heading">Trust / NGO Access Required</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          You must be logged in with a verified Trust / NGO account to access the trust dashboard and rescue orders.
        </p>
        <button
          onClick={() => setActiveView('trust-login')}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Go to Trust / NGO Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const trust = currentUser || { 
    id: 'trust-1', 
    name: 'Hope Foundation Trust', 
    headPerson: 'Sister Maria Joseph', 
    verified: true,
    location: 'Richmond Town, Bengaluru'
  };

  const isVerified = trust.verified !== false;

  // Filter orders for this trust
  const myOrders = orders.filter(o => o.trustId === trust.id || o.trustName === trust.name);
  const activeOrders = myOrders.filter(o => o.orderStatus !== 'Completed');
  const completedOrders = myOrders.filter(o => o.orderStatus === 'Completed');
  const totalFoodReceivedKg = completedOrders.reduce((sum, o) => sum + (parseInt(o.quantity) || 0), 0) * 2;
  const peopleServed = totalFoodReceivedKg * 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                Logged In as TRUST / NGO
              </span>
              {isVerified ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/40 flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> ✓ Verified Trust
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Pending Verification
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
              {trust.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Contact: {trust.headPerson || 'Organization Head'} • Location: {trust.location} • Email: {trust.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isVerified && (
            <button
              onClick={() => toggleTrustVerification(trust.id)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              ⚡ Simulate Admin Approval
            </button>
          )}

          <button
            onClick={() => setActiveView('marketplace')}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Explore Available Food
          </button>

          <button
            onClick={logout}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
            title="Log out of trust portal"
          >
            <LogOut className="w-4 h-4 text-rose-400" /> Logout
          </button>
        </div>
      </div>

      {/* UNVERIFIED ALERT BANNER */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm">Account Pending Verification</h4>
            <p>
              Your account is waiting for admin verification. Once verified, the <strong>✓ Verified Trust</strong> badge will be attached to your profile. (Use the button above to simulate admin approval for presentation).
            </p>
          </div>
        </div>
      )}

      {/* URGENT FOOD EXPIRY ALERT BANNER (Notifies Trust of foods expiring soon) */}
      {listings.some(l => {
        const exp = calculateFoodStatus(l.preparedTime, l.bestBeforeTime);
        return exp.isExpiringSoon && !exp.isExpired && l.status === 'Available' && l.quantity > 0;
      }) && (
        <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-md space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5 text-amber-950">
                  <span>⚡ Urgent Food Rescue Alert – Best-Before Window Closing!</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Surplus food items at nearby hotels are approaching their expiry deadline. Rescue them now before they go to waste.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('marketplace')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-slate-950" /> Rescue Urgent Food
            </button>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Food Orders</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{myOrders.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">All rescued orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active In-Progress</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono">{activeOrders.length}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Pending pickup / delivery</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Food Received</span>
          <p className="text-2xl font-extrabold text-teal-600 font-mono">{totalFoodReceivedKg || 120} kg</p>
          <span className="text-[11px] text-slate-500 font-medium">Rescued nutritious food</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">People Served</span>
          <p className="text-2xl font-extrabold text-rose-600 font-mono">{peopleServed || 360}</p>
          <span className="text-[11px] text-slate-500 font-medium">Community members fed</span>
        </div>

      </div>

      {/* DEDICATED INTERACTIVE NEARBY FOOD RESCUE MAP */}
      <NearbyRescueMap />

      {/* ACTIVE ORDERS SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              Active Orders & Live QR Pickup Passes
            </h2>
          </div>
          <button
            onClick={() => setActiveView('order-history')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            View Full Order History
          </button>
        </div>

        {myOrders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">You haven't placed any food rescue orders yet.</p>
            <button
              onClick={() => setActiveView('marketplace')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Browse Available Food
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={getMatchingFoodImage(ord.foodName, '', ord.foodImage)}
                    alt={ord.foodName}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200"
                    onError={(e) => {
                      e.target.src = getMatchingFoodImage(ord.foodName, '');
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{ord.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        ord.orderStatus === 'Collected' || ord.orderStatus === 'Completed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                      {ord.pickupCode && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-800">
                          PIN: {ord.pickupCode}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{ord.foodName}</h4>
                    <p className="text-xs text-slate-500">
                      From {ord.hotelName} • {ord.quantity} {ord.unit} • Total: ₹{ord.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTrackingOrderId(ord.id);
                      setActiveView('order-tracking');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Show Pickup QR Pass</span>
                  </button>

                  <button
                    onClick={() => setReceiptModalOrder(ord)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-500" /> Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
