import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Utensils,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const RoleSelectPage = () => {
  const { setActiveView } = useApp();

  return (
    <div className="min-h-[85vh] py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col justify-center space-y-10">
      
      {/* Page Title & Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Role-Based Authentication Portals</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Select Your <span className="text-emerald-600">Login Portal</span>
        </h1>
        <p className="text-sm text-slate-600">
          Meal Connect uses dedicated authentication flows for each role. Choose your organization type below to open your dedicated login page.
        </p>
      </div>

      {/* 3 SEPARATE LOGIN ROLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* OPTION 1: HOTEL LOGIN */}
        <div className="bg-white rounded-3xl p-7 border-2 border-slate-200/80 hover:border-amber-400 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                Food Donor Portal
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading mt-2">
                Hotel / Restaurant
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                For hotels, caterers, banquet halls, and food businesses wanting to list edible surplus meals.
              </p>
            </div>

            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Post surplus food with timer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Manage trust orders & pickup</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Register new hotel partner</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveView('hotel-login')}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
          >
            <span>HOTEL LOGIN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* OPTION 2: TRUST / NGO LOGIN */}
        <div className="bg-white rounded-3xl p-7 border-2 border-slate-200/80 hover:border-emerald-400 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-7 h-7" />
            </div>
            
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                Beneficiary Portal
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading mt-2">
                Trust / NGO
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                For verified non-profits, orphanages, and community trusts seeking surplus food for beneficiaries.
              </p>
            </div>

            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Browse live food marketplace</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Place orders & live GPS tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Register new Trust / NGO</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveView('trust-login')}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
          >
            <span>TRUST / NGO LOGIN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* OPTION 3: ADMIN LOGIN */}
        <div className="bg-white rounded-3xl p-7 border-2 border-slate-200/80 hover:border-blue-500 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                Master Administration
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading mt-2">
                Admin Panel
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                For platform moderators to verify organizations, audit food listings, and generate impact reports.
              </p>
            </div>

            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Approve / verify hotels & trusts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Moderate food listings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Direct secure login only</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveView('admin-login')}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
          >
            <span>ADMIN LOGIN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
