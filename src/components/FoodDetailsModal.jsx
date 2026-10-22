import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { EditFoodModal } from './EditFoodModal';
import { calculateFoodStatus, formatFoodTimeDisplay } from '../utils/expiryUtils';
import { 
  X, 
  Clock, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Navigation,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit3,
  Tag,
  Sparkles,
  Ban
} from 'lucide-react';

export const FoodDetailsModal = ({ food, onClose, onDirectCheckout }) => {
  const { 
    addToCart, 
    setIsCartOpen, 
    setMapModalData, 
    currentRole, 
    currentUser, 
    deleteFoodListing,
    setActiveView
  } = useApp();
  
  const [selectedQty, setSelectedQty] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Dynamic live expiry tracking (1 second interval)
  const isFoodCollected = food ? (food.status === 'Collected' || (food.quantity <= 0 && food.status === 'Ordered')) : false;
  const [expiryInfo, setExpiryInfo] = useState(() => 
    food ? calculateFoodStatus(food.preparedTime, food.bestBeforeTime, isFoodCollected) : {}
  );

  useEffect(() => {
    if (!food) return;
    const updateExpiry = () => {
      setExpiryInfo(calculateFoodStatus(food.preparedTime, food.bestBeforeTime, isFoodCollected));
    };
    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);
    return () => clearInterval(interval);
  }, [food, isFoodCollected]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!food) return null;

  const isHotelAuthorized = currentRole === 'hotel' || currentRole === 'admin';
  const isTrustUser = currentRole === 'trust' && currentUser;

  const maxQty = food.quantity || 1;
  const unitPrice = food.price || 0;
  const totalPrice = unitPrice * selectedQty;

  const handleDeleteConfirm = (id) => {
    deleteFoodListing(id);
    onClose();
  };

  const handleAddToCart = () => {
    if (expiryInfo.isExpired) return;
    addToCart(food, selectedQty);
    setIsCartOpen(true);
    onClose();
  };

  const handleOrderNow = () => {
    if (expiryInfo.isExpired) return;
    addToCart(food, selectedQty);
    if (onDirectCheckout) {
      onDirectCheckout(food, selectedQty);
    } else {
      setIsCartOpen(true);
    }
    onClose();
  };

  const formattedPreparedTime = formatFoodTimeDisplay(food.preparedTime);
  const formattedBestBefore = formatFoodTimeDisplay(food.bestBeforeTime);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-md backdrop-blur-md transition-all border border-slate-200/60"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Large Food Image */}
        <div className="md:w-5/12 relative h-64 md:h-auto bg-slate-100 shrink-0">
          <img
            src={getMatchingFoodImage(food.name, food.category, food.image)}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = getMatchingFoodImage(food.name, food.category);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:hidden" />
          
          <div className="absolute bottom-4 left-4 right-4 text-white md:hidden">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md inline-block mb-1">
              {food.category}
            </span>
            <h3 className="font-extrabold text-xl">{food.name}</h3>
          </div>
        </div>

        {/* Right Side: Details Content */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
          
          <div className="space-y-4">
            
            {/* Category & Badge */}
            <div className="hidden md:flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                {food.category}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Safe & Inspected Food
              </span>
            </div>

            {/* Food Title & Hotel */}
            <div className="hidden md:block space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
                {food.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>{food.hotelName}</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold">{food.distanceKm || '2.5'} km away</span>
              </div>
            </div>

            {/* Food Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {food.description || "Freshly cooked edible surplus food stored in climate-controlled food grade containers."}
            </p>

            {/* SMART FOOD EXPIRY COUNTDOWN & STATUS CARD */}
            <div className={`p-4 rounded-2xl border ${
              expiryInfo.isExpired 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : expiryInfo.isExpiringSoon
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${expiryInfo.badgeClass}`}>
                    {expiryInfo.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {expiryInfo.isExpired 
                      ? 'Best-before time elapsed' 
                      : expiryInfo.isExpiringSoon 
                        ? 'Expiring soon – Urgent rescue' 
                        : 'Freshly prepared & safe'}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{expiryInfo.formattedCountdown}</span>
                </div>
              </div>

              {/* Countdown Ticker Box if active */}
              {!expiryInfo.isExpired && (
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200/60 font-mono text-xs">
                  <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80">
                    <span className="text-base font-extrabold text-slate-900">{String(expiryInfo.hoursLeft).padStart(2, '0')}</span>
                    <span className="block text-[9px] font-sans font-bold uppercase text-slate-400">Hours</span>
                  </div>
                  <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80">
                    <span className="text-base font-extrabold text-slate-900">{String(expiryInfo.minutesLeft).padStart(2, '0')}</span>
                    <span className="block text-[9px] font-sans font-bold uppercase text-slate-400">Minutes</span>
                  </div>
                  <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80">
                    <span className="text-base font-extrabold text-slate-900">{String(expiryInfo.secondsLeft).padStart(2, '0')}</span>
                    <span className="block text-[9px] font-sans font-bold uppercase text-slate-400">Seconds</span>
                  </div>
                </div>
              )}

              {/* Shelf Life Progress Bar */}
              {!expiryInfo.isExpired && (
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                    <span>Shelf Life Remaining</span>
                    <span>{expiryInfo.shelfLifePercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        expiryInfo.isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${expiryInfo.shelfLifePercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Expired Warning Message */}
              {expiryInfo.isExpired && (
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700 pt-1">
                  <Ban className="w-4 h-4 shrink-0" />
                  <span>Ordering is strictly disabled for expired food items to ensure health safety.</span>
                </div>
              )}
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Prepared Time</span>
                <p className="font-extrabold text-slate-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> {formattedPreparedTime}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-amber-600">Best Before</span>
                <p className="font-extrabold text-amber-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> {formattedBestBefore}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Available Quantity</span>
                <p className="font-extrabold text-slate-900">
                  {food.quantity} {food.unit || 'portions'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Pickup Location</span>
                <p className="font-extrabold text-slate-900 truncate" title={food.pickupLocation || food.hotelLocation}>
                  {food.pickupLocation || food.hotelLocation}
                </p>
              </div>
            </div>

            {/* Map Shortcut Button */}
            <button
              onClick={() => {
                setMapModalData({
                  origin: "Your Organization",
                  destination: `${food.hotelName} (${food.pickupLocation || food.hotelLocation})`,
                  distanceKm: food.distanceKm || 2.4,
                  hotelCoords: food.coordinates
                });
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200/70"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              View Location Map & Route ({food.distanceKm || '2.5'} km)
            </button>

            {/* QUANTITY SELECTOR & TOTAL PRICE: ONLY FOR LOGGED-IN TRUST / NGO USERS AND IF NOT EXPIRED */}
            {isTrustUser && !expiryInfo.isExpired && (
              <>
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Select Quantity</span>
                    <span className="text-[11px] text-slate-500">Max limit: {maxQty} {food.unit || 'portions'}</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-emerald-200 shadow-xs">
                    <button
                      onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                      disabled={selectedQty <= 1}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-100 disabled:opacity-40 text-slate-700 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-base w-8 text-center text-slate-900 font-mono">
                      {selectedQty}
                    </span>
                    <button
                      onClick={() => setSelectedQty(Math.min(maxQty, selectedQty + 1))}
                      disabled={selectedQty >= maxQty}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-100 disabled:opacity-40 text-slate-700 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Calculation Summary */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 font-medium">Total Amount:</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {totalPrice === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE DONATION</span>
                    ) : (
                      <span>₹{totalPrice} <span className="text-xs text-slate-400 font-normal">(₹{unitPrice}/ea)</span></span>
                    )}
                  </span>
                </div>
              </>
            )}

          </div>

          {/* Action Buttons Area */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            
            {/* If Expired: Show clear disabled action for all users */}
            {expiryInfo.isExpired ? (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-4 rounded-xl bg-slate-100 text-rose-600 font-extrabold text-xs cursor-not-allowed flex items-center justify-center gap-2 border border-rose-200 shadow-xs"
              >
                <Ban className="w-4 h-4" />
                <span>Food Expired – Ordering Strictly Prohibited</span>
              </button>
            ) : isTrustUser ? (
              /* Trust User Action Buttons: Add to Cart and Order Now */
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3 px-4 rounded-xl border-2 border-slate-900 text-slate-900 font-bold text-xs hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleOrderNow}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Guest Action Prompt */}
            {!isTrustUser && !isHotelAuthorized && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('trust-login');
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Login as Trust / NGO to Order
              </button>
            )}

            {/* Authorized Hotel User Actions: Edit Food & Delete Food Item */}
            {isHotelAuthorized && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  Edit Food Listing
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Delete Food Item
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          foodItem={food}
        />
      )}

      {/* Edit Food Modal */}
      {isEditModalOpen && (
        <EditFoodModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          food={food}
        />
      )}

    </div>
  );
};
