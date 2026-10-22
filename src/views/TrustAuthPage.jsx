import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HeartHandshake, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye,
  EyeOff,
  ArrowLeft,
  Users
} from 'lucide-react';

export const TrustAuthPage = () => {
  const { loginTrust, registerTrust, setActiveView, trusts } = useApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('hope.trust@ngonetwork.org');
  const [loginPassword, setLoginPassword] = useState('trust123');

  // Register Form
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await loginTrust(loginEmail, loginPassword);
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
      const res = await registerTrust(regData);
      if (!res.success) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (trust) => {
    setLoginEmail(trust.email);
    setLoginPassword('trust123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center bg-gradient-to-b from-emerald-50/40 via-slate-50 to-slate-100">
      
      {/* Navigation Back Button */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between">
        <button
          onClick={() => setActiveView('role-select')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Selection
        </button>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
          <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Trust / NGO Portal
        </span>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100/80 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold tracking-wider text-emerald-400 uppercase">
                Trust & NGO Beneficiary Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                {mode === 'login' ? 'Trust / NGO Login' : 'Trust / NGO Registration'}
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {mode === 'login' 
              ? 'Sign in to claim surplus food donations, place orders, and track deliveries for your community.' 
              : 'Register your trust, non-profit, orphanage or charity organization to receive surplus food.'}
          </p>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-800/90 p-1 rounded-2xl mt-5 border border-slate-700">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Trust / NGO Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Trust Account
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
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Trust / NGO Email ID
              </label>
              <input
                type="email"
                placeholder="hope.trust@ngonetwork.org"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50 text-slate-900"
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
                  placeholder="Enter your trust password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50 text-slate-900"
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
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Login as Trust / NGO</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Switcher */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Demo Trust Accounts (1-Click Fill)
              </p>
              <div className="flex flex-wrap gap-2">
                {trusts.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => fillDemoAccount(t)}
                    className="text-[11px] px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200/80 transition-colors flex items-center gap-1"
                  >
                    <span>🤝 {t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch to Register link */}
            <div className="text-center pt-2 text-xs text-slate-500">
              Don't have a Trust / NGO account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className="text-emerald-600 font-bold hover:underline"
              >
                Create Trust / NGO Account / Register
              </button>
            </div>

          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-3.5">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-slate-400" /> Trust / NGO Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Hope Community Foundation"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email ID *
                </label>
                <input
                  type="email"
                  placeholder="contact@trust.org"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Number *
              </label>
              <input
                type="tel"
                placeholder="+91 98450 12345"
                value={regData.phone}
                onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Trust / NGO Location & Address *
              </label>
              <input
                type="text"
                placeholder="e.g. 14 Charity Lane, Richmond Town, Bengaluru"
                value={regData.location}
                onChange={(e) => setRegData({ ...regData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mt-3"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Register Trust / NGO & Open Dashboard</span>
            </button>

            {/* Switch to Login link */}
            <div className="text-center pt-2 text-xs text-slate-500">
              Already have a registered Trust / NGO account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className="text-emerald-600 font-bold hover:underline"
              >
                Log In to Trust / NGO Portal
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
