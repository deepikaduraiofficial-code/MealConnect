import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailsModal } from '../components/FoodDetailsModal';
import { calculateFoodStatus } from '../utils/expiryUtils';
import { isValidFoodImage } from '../utils/foodImageResolver';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Flame, 
  MapPin, 
  ArrowUpDown, 
  AlertTriangle, 
  RotateCcw, 
  Tag,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

export const MarketplacePage = ({ onDirectCheckout }) => {
  const { listings, selectedFoodForDetail, setSelectedFoodForDetail } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'free', 'paid'
  const [maxDistance, setMaxDistance] = useState(10);
  const [sortBy, setSortBy] = useState('expiring'); // 'expiring', 'nearest', 'lowest_price', 'highest_qty'

  const categories = ['All', 'Breakfast', 'Lunch & Main Course', 'Snacks', 'Sweets & Desserts', 'Drinks', 'Non-Vegetarian', 'Combo Meals', 'Rice & Breads', 'Cooked Meals', 'Bakery', 'Beverages & Desserts'];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Urgent items banner count (<= 1 hour remaining - Expiring Soon)
  const urgentCount = useMemo(() => {
    return listings.filter(item => {
      if (!isValidFoodImage(item.image)) return false;
      if (item.status === 'Collected' || item.quantity <= 0) return false;
      const st = calculateFoodStatus(item.preparedTime, item.bestBeforeTime);
      return st.isExpiringSoon;
    }).length;
  }, [listings]);

  // Filter & Sort Logic
  const filteredListings = useMemo(() => {
    const now = new Date().getTime();

    return listings.filter((item) => {
      // Must have a valid authentic food image (completely remove black/empty cards)
      if (!isValidFoodImage(item.image)) {
        return false;
      }

      // Search matches (supports both "chapathi" and "chapati" transliteration)
      const query = searchTerm.toLowerCase().trim();
      const normQuery = query.replace(/chapathi/g, 'chapati');
      const normName = item.name.toLowerCase().replace(/chapathi/g, 'chapati');
      const matchesSearch = !query || 
        normName.includes(normQuery) ||
        item.name.toLowerCase().includes(query) ||
        item.hotelName.toLowerCase().includes(query) ||
        item.hotelLocation.toLowerCase().includes(query);

      // Category filter
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      // Price filter
      const matchesPrice = priceFilter === 'all' || 
        (priceFilter === 'free' && item.price === 0) ||
        (priceFilter === 'paid' && item.price > 0);

      // Distance filter
      const matchesDistance = (item.distanceKm || 2.5) <= maxDistance;

      return matchesSearch && matchesCategory && matchesPrice && matchesDistance;
    }).sort((a, b) => {
      const timeA = new Date(a.bestBeforeTime).getTime();
      const timeB = new Date(b.bestBeforeTime).getTime();

      if (sortBy === 'expiring') {
        return timeA - timeB; // Expiring soonest first
      } else if (sortBy === 'nearest') {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      } else if (sortBy === 'lowest_price') {
        return a.price - b.price;
      } else if (sortBy === 'highest_qty') {
        return b.quantity - a.quantity;
      }
      return 0;
    });
  }, [listings, searchTerm, selectedCategory, priceFilter, maxDistance, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
              Available Food <span className="text-emerald-600">Marketplace</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {filteredListings.length} Active Listings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover surplus food listed by verified hotels and restaurants ready for immediate rescue.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
          >
            <option value="expiring">⚡ Expiring Soonest (Urgent)</option>
            <option value="nearest">📍 Nearest First</option>
            <option value="lowest_price">💰 Lowest Price / Free</option>
            <option value="highest_qty">📦 Highest Quantity</option>
          </select>
        </div>
      </div>

      {/* URGENT FOOD ALERT BANNER */}
      {urgentCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">
                ⚡ Urgent Food Alert: {urgentCount} Listing(s) Expiring Within 3 Hours!
              </h4>
              <p className="text-xs text-amber-100">
                Rescue these meals immediately before they expire. Sorted at the top of marketplace.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setSortBy('expiring'); }}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs hover:bg-amber-50 transition-colors shrink-0 shadow-md"
          >
            Show Expiring First
          </button>
        </div>
      )}

      {/* SEARCH AND FILTER CONTROLS BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
        
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by food name (e.g. Biryani), hotel name (e.g. Green Leaf), or location (e.g. Indiranagar)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Dropdown Filter Area */}
        <div className="relative inline-block" ref={categoryDropdownRef}>
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(prev => !prev)}
            className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 flex items-center gap-2"
          >
            <span>{selectedCategory === 'All' ? 'All' : `All (${selectedCategory})`}</span>
            {isCategoryDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-emerald-100" />
            ) : (
              <ChevronDown className="w-4 h-4 text-emerald-100" />
            )}
          </button>

          {/* Vertical Category Dropdown Panel */}
          {isCategoryDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-30 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
              <div className="flex flex-col divide-y divide-slate-50">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{cat}</span>
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Price:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPriceFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${priceFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setPriceFilter('free')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${priceFilter === 'free' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  Free Only
                </button>
                <button
                  onClick={() => setPriceFilter('paid')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${priceFilter === 'paid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                >
                  Paid
                </button>
              </div>
            </div>

            {/* Distance Filter Slider */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Max Distance:</span>
              <input
                type="range"
                min="1"
                max="25"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-24 accent-emerald-600"
              />
              <span className="font-mono font-bold text-slate-800">{maxDistance} km</span>
            </div>

          </div>

          {/* Reset Filters button */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setPriceFilter('all');
              setMaxDistance(25);
              setSortBy('expiring');
            }}
            className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>

        </div>

      </div>

      {/* FOOD CARDS GRID */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Food Listings Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No active food listings match your selected search or filter criteria. Try resetting filters or expanding distance.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setPriceFilter('all');
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            View All Food Listings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onOpenDetails={(item) => setSelectedFoodForDetail(item)}
              onQuickOrder={(item) => onDirectCheckout(item, 1)}
            />
          ))}
        </div>
      )}

      {/* Food Details Modal */}
      {selectedFoodForDetail && (
        <FoodDetailsModal
          food={selectedFoodForDetail}
          onClose={() => setSelectedFoodForDetail(null)}
          onDirectCheckout={onDirectCheckout}
        />
      )}

    </div>
  );
};
