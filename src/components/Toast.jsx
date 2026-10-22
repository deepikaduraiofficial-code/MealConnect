import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

export const Toast = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />
  };

  const bgColors = {
    success: 'border-emerald-200 bg-white text-slate-800 shadow-emerald-100',
    info: 'border-blue-200 bg-white text-slate-800 shadow-blue-100',
    warning: 'border-amber-200 bg-white text-slate-800 shadow-amber-100',
    error: 'border-rose-200 bg-white text-slate-800 shadow-rose-100'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short transition-all duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${bgColors[toast.type] || bgColors.success}`}>
        {icons[toast.type] || icons.success}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
};
