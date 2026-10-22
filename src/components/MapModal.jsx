import React from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Navigation, Building2, HeartHandshake, ShieldCheck } from 'lucide-react';

export const MapModal = () => {
  const { mapModalData, setMapModalData } = useApp();

  if (!mapModalData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Navigation className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base font-heading">Food Rescue Logistics & Route Map</h3>
          </div>
          <button
            onClick={() => setMapModalData(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mock Map View */}
        <div className="relative h-72 sm:h-80 bg-slate-900 overflow-hidden flex items-center justify-center">
          
          {/* Map Grid Pattern background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Mock Road Lines */}
          <svg className="absolute inset-0 w-full h-full stroke-emerald-500/40" strokeWidth="3" strokeDasharray="6 6">
            <path d="M 120 180 Q 250 80, 450 140 T 580 200" fill="none" className="animate-pulse" />
          </svg>

          {/* Hotel Location Node */}
          <div className="absolute left-[20%] top-[45%] flex flex-col items-center group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20 animate-bounce-short">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="mt-2 bg-slate-950/90 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold border border-slate-800 shadow-lg text-center backdrop-blur-md">
              <p className="text-amber-400">HOTEL PICKUP</p>
              <p className="truncate max-w-[120px]">{mapModalData.destination || 'Green Leaf Hotel'}</p>
            </div>
          </div>

          {/* Trust Location Node */}
          <div className="absolute right-[20%] top-[35%] flex flex-col items-center group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="mt-2 bg-slate-950/90 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold border border-slate-800 shadow-lg text-center backdrop-blur-md">
              <p className="text-emerald-400">TRUST / NGO DESTINATION</p>
              <p className="truncate max-w-[120px]">{mapModalData.origin || 'Hope Foundation'}</p>
            </div>
          </div>

          {/* Route Info Badge Floating */}
          <div className="absolute bottom-4 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-white text-xs font-semibold flex items-center gap-3 shadow-xl">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Navigation className="w-3.5 h-3.5" /> Est. Distance: <strong>{mapModalData.distanceKm || '2.4'} km</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Transit Time: ~15 mins</span>
          </div>

        </div>

        {/* Modal Info Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <p className="font-bold text-slate-900">Pickup Address:</p>
            <p className="text-slate-500 mt-0.5">{mapModalData.destination}</p>
          </div>
          <button
            onClick={() => setMapModalData(null)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Close Map
          </button>
        </div>

      </div>

    </div>
  );
};
