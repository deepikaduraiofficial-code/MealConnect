import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Utensils, 
  Scale, 
  Users, 
  Building2, 
  HeartHandshake, 
  CheckCircle, 
  TrendingUp,
  Leaf,
  Globe,
  Award
} from 'lucide-react';

export const ImpactPage = () => {
  const { 
    totalMealsRescued, 
    totalKgRescued, 
    totalPeopleServed,
    hotels,
    trusts,
    orders
  } = useApp();

  const completedOrdersCount = orders.filter(o => o.orderStatus === 'Completed').length + 42;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Environmental & Social Impact Dashboard
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading">
          Rescuing Food. Transforming Lives.
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Real-time metrics tracking surplus food redirected from landfills to communities in need.
        </p>
      </div>

      {/* Main Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase">Total Meals Rescued</span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
              {totalMealsRescued.toLocaleString()}
            </p>
          </div>
          <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full w-[85%]" />
          </div>
          <p className="text-[11px] text-emerald-800 font-semibold">↑ 14% increase this week</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/80 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase">Food Waste Avoided</span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
              {totalKgRescued.toLocaleString()} kg
            </p>
          </div>
          <div className="w-full bg-teal-200 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full w-[90%]" />
          </div>
          <p className="text-[11px] text-teal-800 font-semibold">450 kg of food rescued this month</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase">People Served</span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
              {totalPeopleServed.toLocaleString()}
            </p>
          </div>
          <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-[75%]" />
          </div>
          <p className="text-[11px] text-blue-800 font-semibold">Across 42 shelter centers</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase">Completed Rescue Orders</span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
              {completedOrdersCount}
            </p>
          </div>
          <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full w-[95%]" />
          </div>
          <p className="text-[11px] text-amber-800 font-semibold">100% verified fulfillment</p>
        </div>

      </div>

      {/* Network Counter */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <Building2 className="w-6 h-6" />
            <span className="text-3xl font-extrabold font-mono">{hotels.length + 20}</span>
          </div>
          <p className="text-xs font-bold text-slate-300">Verified Hotels & Restaurants</p>
        </div>

        <div className="space-y-1 border-y md:border-y-0 md:border-x border-slate-800 py-4 md:py-0">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <HeartHandshake className="w-6 h-6" />
            <span className="text-3xl font-extrabold font-mono">{trusts.length + 38}</span>
          </div>
          <p className="text-xs font-bold text-slate-300">Verified Trusts & NGOs</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-teal-400">
            <Leaf className="w-6 h-6" />
            <span className="text-3xl font-extrabold font-mono">9,350 kg</span>
          </div>
          <p className="text-xs font-bold text-slate-300">Estimated CO2 Emissions Saved</p>
        </div>

      </div>

    </div>
  );
};
