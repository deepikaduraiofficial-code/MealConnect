import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { EditFoodModal } from './EditFoodModal';
import { calculateFoodStatus, formatFoodTimeDisplay } from '../utils/expiryUtils';
import { 
  Clock, 
  MapPin, 
  Building2, 
  ShoppingBag, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Tag, 
  Trash2,
  Edit3,
  MoreVertical,
  X,
  Package,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export const FoodCard = ({ food, onOpenDetails, onQuickOrder, onDelete }) => {
  const { currentRole, currentUser, deleteFoodListing, deleteFoodImage } = useApp();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteImageModalOpen, setIsDeleteImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Authorized hotel/admin users can edit and delete food listings & images
  const isHotelAuthorized = currentRole === 'hotel' || currentRole === 'admin';

  // Resolved food image - empty string if deleted or not assigned
  const resolvedImage = getMatchingFoodImage(food.name, food.category, food.image);

  // If food listing does not have a valid, authentic image, completely omit rendering it
  if (!resolvedImage || resolvedImage.trim() === '') {
    return null;
  }

  // Listen for global menu open event & click outside to close dropdown
  useEffect(() => {
    const handleGlobalMenuOpen = (e) => {
      if (e.detail !== food.id) {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('food-menu-opened', handleGlobalMenuOpen);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('food-menu-opened', handleGlobalMenuOpen);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [food.id]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prev => {
      const next = !prev;
      if (next) {
        window.dispatchEvent(new CustomEvent('food-menu-opened', { detail: food.id }));
      }
      return next;
    });
  };

  // Calculate live dynamic food expiry status (Fresh, Expiring Soon, Expired, Collected)
  const isFoodCollected = food.status === 'Collected' || food.quantity <= 0 && food.status === 'Ordered';
  const [expiryInfo, setExpiryInfo] = useState(() => 
    calculateFoodStatus(food.preparedTime, food.bestBeforeTime, isFoodCollected)
  );

  useEffect(() => {
    const updateExpiry = () => {
      setExpiryInfo(calculateFoodStatus(food.preparedTime, food.bestBeforeTime, isFoodCollected));
    };
    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);
    return () => clearInterval(interval);
  }, [food.preparedTime, food.bestBeforeTime, isFoodCollected]);

  // Format prepared time cleanly
  const formattedPreparedTime = formatFoodTimeDisplay(food.preparedTime);

  const handleDeleteConfirm = (id) => {
    deleteFoodListing(id);
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleDeleteImageConfirm = (id) => {
    deleteFoodImage(id);
  };

  return (
    <>
      <div 
        className={`group bg-white rounded-3xl border border-slate-200/90 transition-all duration-300 hover:shadow-xl flex flex-col relative ${
          expiryInfo.isExpired ? 'opacity-85 ring-1 ring-rose-300' : ''
        } ${
          isMenuOpen ? 'z-40 ring-2 ring-emerald-500/20 shadow-xl' : 'z-10 shadow-sm'
        }`}
      >
        
        {/* Food Image Wrapper (rounded top, overflow hidden for clean zoom) */}
        <div 
          onClick={() => onOpenDetails(food)}
          className="relative h-48 sm:h-52 w-full rounded-t-3xl overflow-hidden cursor-pointer bg-slate-100"
        >
          <img
            src={resolvedImage}
            alt={food.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              expiryInfo.isExpired ? 'grayscale-40 contrast-90' : ''
            }`}
            onError={(e) => {
              const card = e.target.closest('.group');
              if (card) card.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

          {/* SMART EXPIRY STATUS & COUNTDOWN BADGE (Floating on Food Card) */}
          <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 shadow-md backdrop-blur-md border ${
              expiryInfo.status === 'Expired'
                ? 'bg-rose-900/90 text-rose-100 border-rose-500/50'
                : expiryInfo.status === 'Expiring Soon'
                  ? 'bg-amber-500/95 text-slate-950 border-amber-300 animate-pulse'
                  : expiryInfo.status === 'Collected'
                    ? 'bg-blue-900/90 text-blue-100 border-blue-500/50'
                    : 'bg-emerald-900/90 text-emerald-100 border-emerald-500/50'
            }`}>
              {expiryInfo.status === 'Expiring Soon' ? (
                <AlertTriangle className="w-3 h-3 text-slate-950 shrink-0" />
              ) : expiryInfo.status === 'Fresh' ? (
                <Sparkles className="w-3 h-3 text-emerald-300 shrink-0" />
              ) : (
                <Clock className="w-3 h-3 shrink-0" />
              )}
              <span>{expiryInfo.status.toUpperCase()}</span>
              {expiryInfo.status !== 'Expired' && expiryInfo.status !== 'Collected' && (
                <span className="font-mono opacity-90">• {expiryInfo.formattedCountdown}</span>
              )}
            </span>
          </div>
        </div>

        {/* Floating Top Bar: Free Donation/Price, Veg/Non-Veg, Category, and Three-Dot Menu (⋮) */}
        {/* Placed with pointer-events-none so dropdown is NOT clipped by any overflow-hidden container */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-20">
          
          {/* Top-Left: Free Donation or Price Tag Label */}
          <div className="pointer-events-auto">
            {food.price === 0 ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1">
                <Tag className="w-3 h-3" /> FREE DONATION
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 font-extrabold text-xs shadow-md flex items-center gap-1 backdrop-blur-md">
                ₹{food.price} <span className="text-[10px] text-slate-300 font-normal">/ unit</span>
              </span>
            )}
          </div>

          {/* Top-Right: Veg / Non-Veg label, Food Category, and Three-Dot Menu (⋮) */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Veg / Non-Veg Label */}
            {food.dietary && (
              <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 backdrop-blur-md shadow-xs ${
                food.dietary === 'Non-Veg' 
                  ? 'bg-rose-900/90 text-rose-200 border border-rose-700/50' 
                  : 'bg-emerald-900/90 text-emerald-200 border border-emerald-700/50'
              }`}>
                <span className={`w-2 h-2 rounded-full ${food.dietary === 'Non-Veg' ? 'bg-red-500' : 'bg-emerald-400'}`} />
                {food.dietary}
              </span>
            )}

            {/* Food Category Label */}
            <span className="px-2.5 py-1 rounded-full bg-white/95 text-slate-800 text-[10px] font-bold backdrop-blur-md shadow-xs hidden xs:inline-block max-w-[120px] truncate">
              {food.category}
            </span>

            {/* THREE-DOT MENU (⋮) */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={toggleMenu}
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all font-bold text-sm border focus:outline-none ${
                  isMenuOpen 
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30' 
                    : 'bg-white/95 hover:bg-white text-slate-800 hover:text-emerald-700 border-slate-200/80'
                }`}
                title="Food Details & Actions"
                aria-label="Food Details & Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* THREE-DOT DROPDOWN PANEL (Responsive & Never clipped) */}
              {isMenuOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-left text-xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                      Food Details & Actions
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 1. Available, 2. Prepared, 3. Location, 4. Food Status */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {/* 1. Available */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Available:
                      </span>
                      <span className="font-extrabold text-slate-900">
                        {food.quantity} {food.unit || 'portions'}
                      </span>
                    </div>

                    {/* 2. Prepared */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Prepared:
                      </span>
                      <span className="font-extrabold text-slate-900">
                        {formattedPreparedTime}
                      </span>
                    </div>

                    {/* 3. Location */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Location:
                      </span>
                      <span className="font-extrabold text-slate-900 truncate max-w-[130px]" title={food.pickupLocation || food.hotelLocation}>
                        {food.pickupLocation || food.hotelLocation}
                      </span>
                    </div>

                    {/* 4. Food Status */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Food Status:
                      </span>
                      <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] border ${expiryInfo.statusClass}`}>
                        {expiryInfo.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Live Expiry Countdown in Menu */}
                    {expiryInfo.status !== 'Expired' && expiryInfo.status !== 'Collected' && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Best Before:
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {expiryInfo.formattedCountdown}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions: 5. View Details, 6. Delete, 7. Edit Food */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    
                    {/* 5. View Details */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                        onOpenDetails(food);
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>View Details</span>
                    </button>

                    {/* 7. Edit Food – Authorized Hotel/Admin Users Only */}
                    {isHotelAuthorized && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Edit Food</span>
                      </button>
                    )}

                    {/* 6a. Delete Food Image – Only when item currently has an image */}
                    {isHotelAuthorized && resolvedImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          setIsDeleteImageModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Delete Food Image</span>
                      </button>
                    )}

                    {/* 6b. Delete Listing – Authorized Hotel/Admin Users Only */}
                    {isHotelAuthorized && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          setIsDeleteModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Delete Listing</span>
                      </button>
                    )}

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simplified Food Card Body: ONLY Hotel Name, Distance from User, and Food Name */}
        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-1.5 flex-1">
          {/* Hotel Name & Distance */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-700 truncate">{food.hotelName}</span>
            </div>
            <span className="shrink-0 text-slate-500 text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
              {food.distanceKm || '2.5'} km away
            </span>
          </div>

          {/* Food Name */}
          <h3 
            onClick={() => onOpenDetails(food)}
            className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug truncate hover:text-emerald-700 cursor-pointer transition-colors"
            title={food.name}
          >
            {food.name}
          </h3>
        </div>

      </div>

      {/* Delete Food Image Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteImageModalOpen}
        onClose={() => setIsDeleteImageModalOpen(false)}
        onConfirm={handleDeleteImageConfirm}
        foodItem={food}
        mode="image"
      />

      {/* Delete Food Listing Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        foodItem={food}
        mode="listing"
      />

      {/* Edit Food Modal */}
      <EditFoodModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        food={food}
      />
    </>
  );
};
