import React from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { 
  Utensils, 
  Sparkles, 
  Building2, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Scale, 
  Users, 
  Zap,
  ChevronRight,
  Truck,
  Leaf
} from 'lucide-react';

export const LandingPage = ({ onOpenAuth }) => {
  const { 
    setActiveView, 
    switchRole, 
    totalMealsRescued, 
    totalKgRescued, 
    totalPeopleServed,
    listings
  } = useApp();

  const urgentCount = listings.filter(l => l.status === 'Available' && l.quantity > 0).length;

  return (
    <div className="space-y-20 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50">
        
        {/* Glow backdrop shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Ticker Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-200/80 shadow-md text-emerald-800 text-xs font-bold animate-pulse-subtle">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Zero Surplus Food Waste Initiative</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500 font-normal">{urgentCount} Active Food Listings</span>
            </div>

            {/* Main Project Title & Tagline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
                Meal <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">Connect</span>
              </h1>
              
              <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-heading">
                “Rescue Food. Reduce Waste. Feed Communities.”
              </p>
            </div>

            {/* Problem & Solution Short Statement */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Hotels and restaurants often prepare surplus edible food that goes unused, while verified NGOs and trusts desperately need food to serve hungry communities. Our digital platform bridges this gap instantly.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActiveView('marketplace')}
                className="px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                Explore Available Food
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveView('hotel-login')}
                className="px-6 py-4 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-extrabold text-sm border-2 border-amber-200 shadow-md transition-all flex items-center gap-2 hover:scale-105"
              >
                <Building2 className="w-4 h-4 text-amber-500" />
                HOTEL LOGIN
              </button>

              <button
                onClick={() => setActiveView('trust-login')}
                className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 hover:scale-105"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                TRUST / NGO LOGIN
              </button>

              <button
                onClick={() => setActiveView('admin-login')}
                className="px-5 py-4 rounded-2xl bg-blue-50 text-blue-900 hover:bg-blue-100 font-extrabold text-sm border-2 border-blue-200 shadow-xs transition-all flex items-center gap-1.5 hover:scale-105"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                ADMIN LOGIN
              </button>
            </div>

          </div>

          {/* Hero Feature Banner Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl bg-white/80 backdrop-blur-md p-6 sm:p-8 border border-slate-200/80 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm sm:text-base">
                <Clock className="w-5 h-5 text-amber-500 animate-spin-slow" />
                <span>Live Marketplace Preview — Rescuing Food Right Now</span>
              </div>
              <button 
                onClick={() => setActiveView('marketplace')}
                className="text-xs font-extrabold text-emerald-600 hover:underline flex items-center gap-1"
              >
                View All {listings.length} Listings <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {listings.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setActiveView('marketplace')}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/70 cursor-pointer transition-all space-y-3 group"
                >
                  <img
                    src={getMatchingFoodImage(item.name, item.category, item.image)}
                    alt={item.name}
                    className="w-full h-32 rounded-xl object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = getMatchingFoodImage(item.name, item.category);
                    }}
                  />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{item.hotelName}</p>
                    <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{item.quantity} {item.unit}</span>
                      <span className="text-emerald-600">{item.price === 0 ? 'FREE' : `₹${item.price}`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* LOGIN ROLE SELECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Role-Based Authentication Portals
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Select Your Login Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Dedicated authentication and dashboards for Hotels, Trusts/NGOs, and System Administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Role 1: Hotel Login */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-amber-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Hotel Portal
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">Hotels & Restaurants</h3>
                <p className="text-xs text-slate-500 mt-1">
                  List leftover meals, manage trust pickups, and register your hotel.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('hotel-login')}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>HOTEL LOGIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Role 2: Trust / NGO Login */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-emerald-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Trust / NGO Portal
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">Trusts & Charities</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Claim food donations, track rescue progress, and register your trust.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('trust-login')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>TRUST / NGO LOGIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Role 3: Admin Login */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-blue-500 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Admin Portal
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">Administration</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Master control to verify organizations and moderate listings.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('admin-login')}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>ADMIN LOGIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* IMPACT STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden space-y-8">
          
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Verified Real-Time Metrics</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading">
              Our Community Impact Today
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Transforming surplus food into smiles across verified charities and local trusts.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Utensils className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {totalMealsRescued.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 font-semibold">Meals Rescued Today</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-2">
                <Scale className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono">
                {totalKgRescued.toLocaleString()} kg
              </p>
              <p className="text-xs text-slate-400 font-semibold">Food Waste Reduced</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                28
              </p>
              <p className="text-xs text-slate-400 font-semibold">Verified Hotels</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
                42
              </p>
              <p className="text-xs text-slate-400 font-semibold">Verified Trusts</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 col-span-2 md:col-span-1 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
                {totalPeopleServed.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 font-semibold">People Served</p>
            </div>

          </div>

        </div>
      </section>

      {/* HOW THE PLATFORM WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Seamless 5-Step Process</span>
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            How Meal Connect Works
          </h2>
          <p className="text-sm text-slate-500">
            A complete end-to-end transparent workflow connecting food creators with trusted charities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">Hotel Uploads Food</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hotel posts leftover food details, quantity, prepare time, and best-before window.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">Trust Discovers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verified trusts search by location, category, and urgency countdown timers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">Select & Order</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select portion quantity, add to cart, and proceed through mock checkout.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">Order Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Live status timeline tracking: Order Placed → Confirmed → Ready → Pickup.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              5
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">Food Delivered</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Food arrives at trust center, feeding communities and updating live impact stats.
            </p>
          </div>

        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">For Hotels & Restaurants</h3>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero food waste disposal fees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>CSR & Sustainability accreditation badges</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated expiry alerts & listing tools</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">For Verified Trusts & NGOs</h3>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Access to nutritious quality-checked meals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Verified Trust badge (`✓ Verified Trust`)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Real-time logistics & order tracking</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">For Society & Planet</h3>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Drastic reduction in methane greenhouse emissions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Eliminating hunger in urban food deserts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Transparent analytics & impact reporting</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
};
