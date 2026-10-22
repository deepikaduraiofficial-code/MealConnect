import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';

export const HotelAuthPage = () => {
  const { loginHotel, registerHotel, setActiveView, hotels } = useApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('contact@greenleafhotel.com');
  const [loginPassword, setLoginPassword] = useState('hotel123');

  // Register Form
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    ownerName: '',
    phone: '',
    location: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await loginHotel(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await registerHotel(regData);
      if (!res.success) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (hotel) => {
    setLoginEmail(hotel.email);
    setLoginPassword('hotel123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center bg-gradient-to-b from-amber-50/40 via-slate-50 to-slate-100">
      
      {/* Navigation Back Button */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between">
        <button
          onClick={() => setActiveView('role-select')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Selection
        </button>
        <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-200">
          <Building2 className="w-3.5 h-3.5 text-amber-600" /> Dedicated Hotel Portal
        </span>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-amber-100/80 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold tracking-wider text-amber-400 uppercase">
                Hotel & Restaurant Partner Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                {mode === 'login' ? 'Hotel Login' : 'Hotel Registration'}
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {mode === 'login' 
              ? 'Sign in to post surplus meals, manage orders, and monitor your food rescue impact.' 
              : 'Register your hotel, restaurant or catering kitchen to donate or sell surplus food.'}
          </p>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-800/90 p-1 rounded-2xl mt-5 border border-slate-700">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login' 
                  ? 'bg-amber-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hotel Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register' 
                  ? 'bg-amber-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Hotel Account
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Hotel Email ID
              </label>
              <input
                type="email"
                placeholder="contact@greenleafhotel.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50/50 text-slate-900"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your hotel password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50/50 text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Login as Hotel</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Switcher */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Demo Hotel Accounts (1-Click Fill)
              </p>
              <div className="flex flex-wrap gap-2">
                {hotels.slice(0, 3).map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => fillDemoAccount(h)}
                    className="text-[11px] px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200/80 transition-colors flex items-center gap-1"
                  >
                    <span>🏨 {h.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch to Register link */}
            <div className="text-center pt-2 text-xs text-slate-500">
              Don't have a hotel account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className="text-amber-600 font-bold hover:underline"
              >
                Create Hotel Account / Register
              </button>
            </div>

          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-3.5">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Hotel Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Grand Heritage Palace Hotel"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Hotel Email ID *
                </label>
                <input
                  type="email"
                  placeholder="contact@hotel.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password *
                </label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Hotel Contact Person *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar (Manager)"
                  value={regData.ownerName}
                  onChange={(e) => setRegData({ ...regData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Hotel Location & Address *
              </label>
              <input
                type="text"
                placeholder="e.g. 104 MG Road, Indiranagar, Bengaluru"
                value={regData.location}
                onChange={(e) => setRegData({ ...regData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 mt-3"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Register Hotel & Open Dashboard</span>
            </button>

            {/* Switch to Login link */}
            <div className="text-center pt-2 text-xs text-slate-500">
              Already have a registered hotel account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className="text-amber-600 font-bold hover:underline"
              >
                Log In to Hotel Portal
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
