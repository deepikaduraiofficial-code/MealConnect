import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { calculateFoodStatus } from '../utils/expiryUtils';
import { 
  MapPin, 
  Building2, 
  Sparkles, 
  Filter, 
  Compass, 
  Search, 
  Clock, 
  Tag, 
  Layers,
  Map as MapIcon,
  ShoppingBag,
  LocateFixed,
  AlertCircle
} from 'lucide-react';

// Common Bengaluru Landmark Zones for demo & manual selection
const BANGALORE_ZONES = [
  { name: 'Richmond Town (HQ)', lat: 12.9650, lng: 77.6000 },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'Jayanagar', lat: 12.9250, lng: 77.5938 },
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
  { name: 'HAL Old Airport Rd', lat: 12.9601, lng: 77.6486 },
  { name: 'Ulsoor', lat: 12.9817, lng: 77.6284 }
];

export const NearbyRescueMap = ({ onSelectFood }) => {
  const { listings, hotels, setSelectedFoodForDetail } = useApp();

  // Filter States
  const [distanceFilter, setDistanceFilter] = useState('all'); // 'all' | '2' | '5' | '10'
  const [priceFilter, setPriceFilter] = useState('all'); // 'all' | 'free' | 'paid'
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all' | 'Veg' | 'Non-Veg'
  const [selectedHotelId, setSelectedHotelId] = useState(hotels[0]?.id || 'hotel-1');
  const [userLocationName, setUserLocationName] = useState('Richmond Town (HQ)');
  const [userCoords, setUserCoords] = useState({ lat: 12.9650, lng: 77.6000 });
  const [locationStatus, setLocationStatus] = useState('');

  // Handle GPS location permission
  const handleRequestGPS = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('Requesting current GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setUserLocationName(`GPS Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
        setLocationStatus('✓ Live GPS location locked successfully.');
        setTimeout(() => setLocationStatus(''), 4000);
      },
      (err) => {
        console.warn(err);
        setLocationStatus('GPS permission denied or unavailable. Using manual location selector.');
        setTimeout(() => setLocationStatus(''), 4000);
      },
      { timeout: 8000 }
    );
  };

  const handleManualLocationChange = (zoneName) => {
    const zone = BANGALORE_ZONES.find(z => z.name === zoneName);
    if (zone) {
      setUserLocationName(zone.name);
      setUserCoords({ lat: zone.lat, lng: zone.lng });
      setLocationStatus(`Manual location set to ${zone.name}`);
      setTimeout(() => setLocationStatus(''), 3000);
    }
  };

  // Filter active listings that are non-expired & available
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Must have valid image
      const resolvedImg = getMatchingFoodImage(item.name, item.category, item.image);
      if (!resolvedImg) return false;

      // Must be available and have quantity
      if (item.status === 'Ordered' || item.status === 'Collected' || item.quantity <= 0) return false;

      // Expiry check
      const expiry = calculateFoodStatus(item.preparedTime, item.bestBeforeTime);
      if (expiry.isExpired) return false;

      // Distance filter
      const dist = Number(item.distanceKm) || 2.5;
      if (distanceFilter === '2' && dist > 2) return false;
      if (distanceFilter === '5' && dist > 5) return false;
      if (distanceFilter === '10' && dist > 10) return false;

      // Price filter
      if (priceFilter === 'free' && item.price > 0) return false;
      if (priceFilter === 'paid' && item.price === 0) return false;

      // Dietary filter
      if (dietaryFilter !== 'all' && item.dietary !== dietaryFilter) return false;

      return true;
    });
  }, [listings, distanceFilter, priceFilter, dietaryFilter]);

  // Group listings by hotel
  const hotelPinMap = useMemo(() => {
    const map = {};
    hotels.forEach(h => {
      map[h.id] = {
        hotel: h,
        items: []
      };
    });
    filteredListings.forEach(item => {
      if (map[item.hotelId]) {
        map[item.hotelId].items.push(item);
      } else {
        // Fallback for custom hotelId
        map[item.hotelId] = {
          hotel: { id: item.hotelId, name: item.hotelName, location: item.hotelLocation, coordinates: item.coordinates },
          items: [item]
        };
      }
    });
    return map;
  }, [hotels, filteredListings]);

  // Selected hotel data
  const currentSelectedData = hotelPinMap[selectedHotelId] || Object.values(hotelPinMap)[0];
  const selectedHotel = currentSelectedData?.hotel;
  const selectedHotelItems = currentSelectedData?.items || [];


  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-0">
      
      {/* Top Map Header & Controls */}
      <div className="p-6 bg-slate-900 text-white border-b border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                  Interactive Live GIS
                </span>
                <span className="text-xs text-slate-400">• Real-Time Logistics</span>
              </div>
              <h2 className="text-xl font-extrabold text-white font-heading">
                Nearby Food Rescue Map & Transit Router
              </h2>
            </div>
          </div>

          {/* Location Selector (GPS + Manual) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRequestGPS}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm"
              title="Detect your device GPS coordinates"
            >
              <LocateFixed className="w-4 h-4" />
              <span>Use Device GPS</span>
            </button>

            <select
              value={userLocationName}
              onChange={(e) => handleManualLocationChange(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {BANGALORE_ZONES.map(z => (
                <option key={z.name} value={z.name}>{z.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Status Message */}
        {locationStatus && (
          <div className="text-xs text-emerald-300 font-bold bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/60 flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{locationStatus}</span>
          </div>
        )}

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          
          {/* Distance Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold pl-2 pr-1">Dist:</span>
            {[
              { id: 'all', label: 'All' },
              { id: '2', label: '< 2 km' },
              { id: '5', label: '< 5 km' },
              { id: '10', label: '< 10 km' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDistanceFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  distanceFilter === f.id ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Pricing Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold pl-2 pr-1">Price:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'free', label: 'Free Only' },
              { id: 'paid', label: 'Subsidized' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPriceFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  priceFilter === f.id ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Dietary Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold pl-2 pr-1">Diet:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'Veg', label: 'Veg Only' },
              { id: 'Non-Veg', label: 'Non-Veg' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDietaryFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  dietaryFilter === f.id ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Matching Food Count Pill */}
          <div className="ml-auto text-slate-300 text-xs font-semibold">
            <strong className="text-emerald-400">{filteredListings.length}</strong> rescue items match nearby
          </div>
        </div>

      </div>

      {/* Main Map Content: Split View (Interactive Canvas/SVG Map + Hotel Detail Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        
        {/* Left Side: Interactive Vector Geolocation Map (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 relative overflow-hidden flex flex-col justify-between p-6 select-none min-h-[380px]">
          
          {/* Subtle Grid Network Layer */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

          {/* Simulated Geographic Road Network Vectors */}
          <svg className="absolute inset-0 w-full h-full stroke-emerald-500/25 pointer-events-none" strokeWidth="2.5" strokeDasharray="8 6">
            <path d="M 60 120 Q 220 60, 380 140 T 520 280" fill="none" />
            <path d="M 140 320 Q 280 200, 480 80" fill="none" className="stroke-teal-500/30" />
            <path d="M 320 20 L 320 360" fill="none" className="stroke-slate-800" strokeWidth="1.5" />
            <path d="M 40 220 L 600 220" fill="none" className="stroke-slate-800" strokeWidth="1.5" />
          </svg>

          {/* Top Floating Map Notice */}
          <div className="relative z-10 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-semibold shadow-lg">
              📍 User Center: <strong className="text-white">{userLocationName}</strong>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Donor Markers</span>
            </div>
          </div>

          {/* INTERACTIVE HOTEL LOCATION PINS */}
          <div className="relative z-10 flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6 items-center justify-items-center py-6">
            {Object.entries(hotelPinMap).map(([id, data], index) => {
              const isSelected = selectedHotelId === id;
              const hasItems = data.items.length > 0;

              return (
                <div
                  key={id}
                  onClick={() => setSelectedHotelId(id)}
                  className={`group cursor-pointer flex flex-col items-center transition-all duration-300 transform ${
                    isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10 opacity-90'
                  }`}
                >
                  {/* Pin Pulse Ring */}
                  <div className="relative">
                    {isSelected && (
                      <div className="absolute -inset-2 rounded-2xl bg-emerald-500/30 animate-pulse pointer-events-none" />
                    )}
                    
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xl transition-all border-2 ${
                      isSelected 
                        ? 'bg-emerald-600 text-white border-white ring-4 ring-emerald-500/40 shadow-emerald-600/50' 
                        : hasItems
                          ? 'bg-amber-500 text-slate-950 border-amber-300 hover:bg-amber-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>

                    {/* Food Portions Count Badge */}
                    {hasItems && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] shadow-md border border-white">
                        {data.items.length}
                      </span>
                    )}
                  </div>

                  {/* Marker Label */}
                  <div className={`mt-2 px-2.5 py-1 rounded-xl text-center max-w-[130px] border shadow-lg backdrop-blur-md transition-all ${
                    isSelected 
                      ? 'bg-white text-slate-900 border-emerald-500 font-extrabold text-[11px]' 
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 text-[10px] font-semibold'
                  }`}>
                    <p className="truncate">{data.hotel.name}</p>
                    <p className={`text-[9px] ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {hasItems ? `${data.items.length} food items` : 'No items'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Map Legend */}
          <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Selected Hotel
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Active Donor (Has Food)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> No Current Surplus
              </span>
            </div>
            
            <span className="text-[11px] text-slate-500 font-medium">Click any hotel marker to view inventory & route</span>
          </div>

        </div>

        {/* Right Side: Selected Hotel Details & Available Food List (5 Cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-50/70 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 space-y-5">
          
          {/* Selected Hotel Header */}
          {selectedHotel ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Selected Donor Hotel
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" /> ~3.2 km from you
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                    {selectedHotel.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedHotel.location || selectedHotel.address || 'Bengaluru, Karnataka'}</span>
                  </p>
                </div>
              </div>

              {/* Available Food Items at this Hotel */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                    Available Food Items ({selectedHotelItems.length})
                  </h4>
                  <span className="text-slate-400 font-medium text-[11px]">Click item to inspect & order</span>
                </div>

                {selectedHotelItems.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-semibold">
                      No matching food listings at this hotel under the current filters.
                    </p>
                    <button
                      onClick={() => {
                        setDistanceFilter('all');
                        setPriceFilter('all');
                        setDietaryFilter('all');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedHotelItems.map(item => {
                      const expiry = calculateFoodStatus(item.preparedTime, item.bestBeforeTime);

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedFoodForDetail(item)}
                          className="p-3 bg-white hover:bg-emerald-50/40 rounded-2xl border border-slate-200/90 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {(() => {
                              const mapImg = getMatchingFoodImage(item.name, item.category, item.image);
                              return mapImg ? (
                                <img
                                  src={mapImg}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-200/80 border border-slate-300 shrink-0" />
                              );
                            })()}
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-xs text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                                {item.name}
                              </h5>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span>{item.quantity} {item.unit || 'portions'}</span>
                                <span>•</span>
                                <span className={item.price === 0 ? 'text-emerald-700 font-bold' : 'text-slate-900 font-bold'}>
                                  {item.price === 0 ? 'FREE' : `₹${item.price}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Food Expiry Status Badge */}
                          <div className="text-right shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold block ${expiry.badgeClass}`}>
                              {expiry.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              {expiry.formattedCountdown}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Select a donor hotel marker from the map to inspect food surplus inventory.
            </div>
          )}

          {/* Bottom Summary Tip */}
          <div className="text-[11px] text-slate-500 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Map automatically filters out expired foods to guarantee 100% food safety for your beneficiaries.</span>
          </div>

        </div>

      </div>

    </div>
  );
};
