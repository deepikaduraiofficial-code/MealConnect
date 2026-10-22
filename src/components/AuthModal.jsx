import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Building2, HeartHandshake, ShieldCheck, Mail, Lock, Phone, MapPin, User, FileText } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialTab = 'hotel' }) => {
  const { switchRole, showToast } = useApp();

  const [activeRoleTab, setActiveRoleTab] = useState(initialTab); // 'hotel' | 'trust' | 'admin'
  const [isRegistering, setIsRegistering] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    headPerson: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    location: 'Bengaluru',
    regDetails: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeRoleTab === 'admin') {
      switchRole('admin');
      showToast('Admin logged in successfully!');
    } else if (activeRoleTab === 'hotel') {
      const hotelUser = {
        id: `hotel-${Date.now()}`,
        name: formData.name || 'Grand Season Hotel',
        ownerName: formData.headPerson || 'Manager',
        email: formData.email || 'hotel@rescue.org',
        phone: formData.phone || '+91 98765 00000',
        address: formData.address || 'MG Road',
        location: formData.location || 'Bengaluru',
        verified: true,
        rating: 4.8
      };
      switchRole('hotel', hotelUser);
      showToast(`Welcome back, ${hotelUser.name}!`);
    } else if (activeRoleTab === 'trust') {
      const trustUser = {
        id: `trust-${Date.now()}`,
        name: formData.name || 'Seva Welfare Trust',
        headPerson: formData.headPerson || 'Trust Head',
        email: formData.email || 'trust@rescue.org',
        phone: formData.phone || '+91 91234 56789',
        regDetails: formData.regDetails || 'REG/2026/KA/8819',
        address: formData.address || 'Koramangala',
        location: formData.location || 'Bengaluru',
        verified: true,
        peopleServed: 120
      };
      switchRole('trust', trustUser);
      showToast(`Welcome back, ${trustUser.name}!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative animate-in zoom-in-95 duration-200">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white space-y-4">
          <div>
            <h2 className="text-xl font-extrabold font-heading">
              {isRegistering ? 'Create Account' : 'Portal Login'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your role to access Meal Connect
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveRoleTab('hotel')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRoleTab === 'hotel' 
                  ? 'bg-amber-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Hotel
            </button>

            <button
              onClick={() => setActiveRoleTab('trust')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRoleTab === 'trust' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" /> Trust / NGO
            </button>

            <button
              onClick={() => setActiveRoleTab('admin')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRoleTab === 'admin' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          
          {activeRoleTab === 'admin' ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs border border-blue-100">
                <strong>Admin Portal:</strong> Manage verified hotels, approve trust applications, moderate listings and monitor impact statistics.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    defaultValue="admin@foodrescue.org"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Master Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    defaultValue="admin123"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              
              {isRegistering && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {activeRoleTab === 'hotel' ? 'Hotel / Restaurant Name' : 'Trust / NGO Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={activeRoleTab === 'hotel' ? 'e.g. Royal Palace Hotel' : 'e.g. Seva Feeding Foundation'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {activeRoleTab === 'hotel' ? 'Manager / Owner Name' : 'Contact Person / Head'}
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.headPerson}
                      onChange={(e) => setFormData({ ...formData, headPerson: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {activeRoleTab === 'trust' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">NGO Registration Details (12A / 80G)</label>
                      <input
                        type="text"
                        placeholder="e.g. REG/2026/NGO/9981"
                        value={formData.regDetails}
                        onChange={(e) => setFormData({ ...formData, regDetails: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Address & Location</label>
                    <input
                      type="text"
                      placeholder="Address, City"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  defaultValue={activeRoleTab === 'hotel' ? 'greenleaf@hotel.com' : 'hope@trust.org'}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <input
                  type="password"
                  defaultValue="password123"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all mt-4"
          >
            {activeRoleTab === 'admin' ? 'Login as Admin' : isRegistering ? 'Complete Registration' : `Login as ${activeRoleTab === 'hotel' ? 'Hotel' : 'Trust'}`}
          </button>

          {activeRoleTab !== 'admin' && (
            <div className="text-center pt-2 text-xs text-slate-500">
              {isRegistering ? (
                <p>
                  Already registered?{' '}
                  <button type="button" onClick={() => setIsRegistering(false)} className="text-emerald-600 font-bold hover:underline">
                    Login here
                  </button>
                </p>
              ) : (
                <p>
                  New organization?{' '}
                  <button type="button" onClick={() => setIsRegistering(true)} className="text-emerald-600 font-bold hover:underline">
                    Register now
                  </button>
                </p>
              )}
            </div>
          )}

        </form>

      </div>

    </div>
  );
};
