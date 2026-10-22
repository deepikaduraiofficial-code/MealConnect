import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  KeyRound,
  Shield
} from 'lucide-react';

export const AdminLoginPage = () => {
  const { loginAdmin, setActiveView } = useApp();

  const [adminEmail, setAdminEmail] = useState('admin@foodrescue.org');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await loginAdmin(adminEmail, adminPassword);
      if (!res.success) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center bg-gradient-to-b from-blue-50/40 via-slate-50 to-slate-100">
      
      {/* Navigation Back Button */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <button
          onClick={() => setActiveView('role-select')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Selection
        </button>
        <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Dedicated Admin Portal
        </span>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100/80 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold tracking-wider text-blue-400 uppercase">
                Master System Control
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Admin Login
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Authorized personnel only. Access system verification queues, moderate food listings, and generate reports.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* ADMIN LOGIN FORM (ONLY ADMIN EMAIL & PASSWORD) */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Admin Email ID
            </label>
            <input
              type="email"
              placeholder="admin@foodrescue.org"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 text-slate-900 font-medium"
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
                placeholder="Enter master password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 text-slate-900"
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
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-blue-400" />
            <span>Login as Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Credentials Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Default Master Credentials</span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Email: <span className="font-bold text-slate-700">admin@foodrescue.org</span> • Password: <span className="font-bold text-slate-700">admin123</span>
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
