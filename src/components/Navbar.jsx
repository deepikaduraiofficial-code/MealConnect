import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationDropdown } from './NotificationDropdown';
import { 
  Utensils, 
  ShoppingBag, 
  ShieldCheck, 
  Building2, 
  HeartHandshake, 
  UserCheck, 
  ChevronDown,
  Sparkles,
  Award,
  Layers
} from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const { 
    currentRole, 
    currentUser, 
    switchRole, 
    activeView, 
    setActiveView, 
    cart, 
    setIsCartOpen,
    resetDemoData
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => {
              if (currentRole === 'hotel') setActiveView('hotel-dashboard');
              else if (currentRole === 'trust') setActiveView('trust-dashboard');
              else if (currentRole === 'admin') setActiveView('admin-dashboard');
              else setActiveView('landing');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-heading">
                  Meal <span className="text-emerald-600">Connect</span>
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Rescue Food. Reduce Waste. Feed Communities.
              </p>
            </div>
          </div>

          {/* Nav Links: Role-based conditional rendering */}
          {currentRole === 'guest' && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              <button
                onClick={() => setActiveView('landing')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'landing' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeView === 'marketplace' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Explore Food
              </button>

              <button
                onClick={() => setActiveView('impact')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'impact' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Impact Stats
              </button>
            </nav>
          )}

          {currentRole === 'hotel' && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              <button
                onClick={() => setActiveView('hotel-dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'hotel-dashboard' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-700 hover:text-emerald-700'
                }`}
              >
                Hotel Dashboard
              </button>
            </nav>
          )}

          {currentRole === 'admin' && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              <button
                onClick={() => setActiveView('admin-dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'admin-dashboard' 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Admin Panel
              </button>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell */}
            <NotificationDropdown />

            {/* Cart Button: ONLY visible for logged-in Trust/NGO user */}
            {currentRole === 'trust' && currentUser && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-2 font-semibold text-xs border border-slate-200/70"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Cart</span>
                {cartTotalItems > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {cartTotalItems}
                  </span>
                )}
              </button>
            )}

            {/* DEMO ROLE SWITCHER & LOGIN DROPDOWN */}
            <div className="relative">
              {currentRole !== 'guest' && currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentRole === 'hotel') setActiveView('hotel-dashboard');
                      else if (currentRole === 'trust') setActiveView('trust-dashboard');
                      else if (currentRole === 'admin') setActiveView('admin-dashboard');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                      currentRole === 'hotel' 
                        ? 'bg-amber-50 text-amber-900 border-amber-200' 
                        : currentRole === 'trust'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-slate-900 text-white border-slate-800'
                    }`}
                  >
                    {currentRole === 'hotel' && <Building2 className="w-3.5 h-3.5 text-amber-600" />}
                    {currentRole === 'trust' && <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />}
                    {currentRole === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
                    <span className="max-w-[120px] sm:max-w-[160px] truncate">{currentUser.name || currentRole}</span>
                  </button>

                  <button
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Switch Portal / Account"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Login Portals</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                </button>
              )}

              {isRoleDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 text-slate-700 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dedicated Login Portals</p>
                      <p className="text-xs text-slate-500">Choose your role to open dedicated login</p>
                    </div>

                    <button
                      onClick={() => { setActiveView('hotel-login'); setIsRoleDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/70 hover:bg-amber-100/90 border border-amber-200/60 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-600" /> Hotel Login / Register
                      </span>
                      <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-extrabold">Portal</span>
                    </button>

                    <button
                      onClick={() => { setActiveView('trust-login'); setIsRoleDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100/90 border border-emerald-200/60 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-emerald-600" /> Trust / NGO Login
                      </span>
                      <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-extrabold">Portal</span>
                    </button>

                    <button
                      onClick={() => { setActiveView('admin-login'); setIsRoleDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" /> Admin Login
                      </span>
                      <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-extrabold">Admin</span>
                    </button>

                    <div className="border-t border-slate-100 my-1 pt-1 space-y-1">
                      <button
                        onClick={() => { setActiveView('role-select'); setIsRoleDropdownOpen(false); }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        ⚡ View All 3 Login Options Page
                      </button>

                      {currentRole !== 'guest' && (
                        <button
                          onClick={() => { switchRole('guest'); setIsRoleDropdownOpen(false); }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          🚪 Logout Current Session
                        </button>
                      )}

                      <button
                        onClick={() => { resetDemoData(); setIsRoleDropdownOpen(false); }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        ↺ Reset Demo Data
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
