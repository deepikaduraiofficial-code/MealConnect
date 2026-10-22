import React from 'react';
import { useApp } from '../context/AppContext';
import { Utensils, Heart, Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  const { setActiveView, totalMealsRescued, totalKgRescued } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white font-heading">
                Meal <span className="text-emerald-400">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tagline: <strong className="text-emerald-300 font-semibold">“Rescue Food. Reduce Waste. Feed Communities.”</strong>
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bridging surplus food from Hotels & Restaurants to verified Trusts and NGOs, preventing landfill waste while nourishing those in need.
            </p>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveView('landing')} className="hover:text-emerald-400 transition-colors">
                  Home Landing Page
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('marketplace')} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Explore Available Food <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('impact')} className="hover:text-emerald-400 transition-colors">
                  Impact Dashboard & Counter
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('hotel-login')} className="hover:text-amber-400 transition-colors">
                  🏨 Hotel Login & Register
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('trust-login')} className="hover:text-emerald-400 transition-colors">
                  🤝 Trust / NGO Login & Register
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('admin-login')} className="hover:text-blue-400 transition-colors">
                  🛡️ Admin Login
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('role-select')} className="hover:text-emerald-400 transition-colors">
                  ⚡ All Login Portals
                </button>
              </li>
            </ul>
          </div>

          {/* Impact Stats Highlight */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Live Community Impact</h4>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Meals Rescued</span>
                <span className="text-sm font-extrabold text-emerald-400">{totalMealsRescued.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[78%]"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Food Waste Reduced</span>
                <span className="text-sm font-extrabold text-teal-400">{totalKgRescued.toLocaleString()} kg</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Help & Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@foodrescuemarketplace.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 (800) 555-RESCUE (73728)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sustainability Tech Hub, Bengaluru, India</span>
              </li>
              <li className="flex items-center gap-2 pt-2 text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% Admin Verified NGO Network</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Meal Connect — Mini Project Presentation Edition.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with passion for sustainable food tech</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>

      </div>
    </footer>
  );
};
