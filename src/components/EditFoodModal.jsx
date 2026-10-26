import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { calculateFoodStatus, toDateTimeLocal, getDefaultExpiryTimes } from '../utils/expiryUtils';
import { 
  X, 
  Save, 
  Edit3, 
  Tag, 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Upload, 
  Check, 
  AlertCircle,
  Building2,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'Breakfast',
  'Lunch & Main Course',
  'Snacks',
  'Sweets & Desserts',
  'Drinks',
  'Non-Vegetarian',
  'Combo Meals',
  'Rice & Breads',
  'Cooked Meals',
  'Bakery',
  'Beverages & Desserts'
];

const UNITS = ['portions', 'kg', 'meals', 'boxes', 'packets'];

export const EditFoodModal = ({ isOpen, onClose, food, onSave }) => {
  const { updateFoodListing, setSelectedFoodForDetail, selectedFoodForDetail } = useApp();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cooked Meals',
    image: '',
    description: '',
    quantity: 1,
    unit: 'portions',
    price: 0,
    preparedTime: '',
    bestBeforeTime: '',
    pickupLocation: '',
    dietary: 'Veg'
  });

  const [imageError, setImageError] = useState('');

  // Populate formData whenever modal opens with food item
  useEffect(() => {
    if (food) {
      const normalizedDietary = (food.dietary === 'Non-Veg' || food.dietary === 'Non-Vegetarian') ? 'Non-Veg' : 'Veg';
      const cur = new Date();
      const defaults = getDefaultExpiryTimes(food.category || 'Cooked Meals', food.preparedTime || cur);
      setFormData({
        name: food.name || '',
        category: food.category || 'Cooked Meals',
        image: food.image || '',
        description: food.description || '',
        quantity: food.quantity || 1,
        unit: food.unit || 'portions',
        price: food.price || 0,
        preparedTime: food.preparedTime ? toDateTimeLocal(food.preparedTime) : defaults.preparedTimeLocal,
        bestBeforeTime: food.bestBeforeTime ? toDateTimeLocal(food.bestBeforeTime) : defaults.bestBeforeTimeLocal,
        pickupLocation: food.pickupLocation || food.hotelLocation || '',
        dietary: normalizedDietary
      });
      setImageError('');
    }
  }, [food, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !food) return null;

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type.toLowerCase())) {
      setImageError('Unsupported format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, image: event.target.result }));
      setImageError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a food name');
      return;
    }

    const prepIso = formData.preparedTime ? new Date(formData.preparedTime).toISOString() : new Date().toISOString();
    const expiryIso = formData.bestBeforeTime ? new Date(formData.bestBeforeTime).toISOString() : new Date(Date.now() + 4 * 3600 * 1000).toISOString();

    const updatedFood = {
      ...food,
      name: formData.name.trim(),
      category: formData.category,
      image: formData.image !== undefined ? formData.image : (food.image || ''),
      description: formData.description.trim(),
      quantity: Number(formData.quantity),
      unit: formData.unit,
      price: Number(formData.price),
      preparedTime: prepIso,
      bestBeforeTime: expiryIso,
      pickupLocation: formData.pickupLocation.trim() || food.hotelLocation,
      hotelLocation: formData.pickupLocation.trim() || food.hotelLocation,
      dietary: formData.dietary
    };

    updateFoodListing(updatedFood);

    // If currently viewing in detail modal, sync it
    if (selectedFoodForDetail && selectedFoodForDetail.id === food.id) {
      setSelectedFoodForDetail(updatedFood);
    }

    if (onSave) {
      onSave(updatedFood);
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                Edit Food Listing
              </h2>
              <p className="text-xs text-slate-500">
                Update listing details for <span className="font-semibold text-slate-700">{food.hotelName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors border border-slate-200/60 shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Food Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Hyderabadi Chicken Biryani"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dietary (Veg / Non-Veg) & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dietary Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, dietary: 'Veg' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
                    formData.dietary === 'Veg'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Vegetarian
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, dietary: 'Non-Veg' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
                    formData.dietary === 'Non-Veg'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Non-Vegetarian
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Price per Unit (₹) <span className="text-slate-400 font-normal">(0 = Free Donation)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Math.max(0, Number(e.target.value)) }))}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Available Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Math.max(1, Number(e.target.value)) }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pickup Location
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                placeholder="e.g. Hotel Main Gate, Indiranagar"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Smart Food Timing & Expiry Calculation */}
          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Smart Preparation & Expiry Timeline
              </span>
              {formData.preparedTime && formData.bestBeforeTime && (() => {
                const previewStatus = calculateFoodStatus(formData.preparedTime, formData.bestBeforeTime);
                return (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    previewStatus.isExpired 
                      ? 'bg-rose-100 text-rose-700' 
                      : previewStatus.isExpiringSoon 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {previewStatus.label} ({previewStatus.timeRemainingFormatted})
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Prepared Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.preparedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, preparedTime: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Best-Before Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.bestBeforeTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, bestBeforeTime: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
              Remaining shelf life is dynamically calculated in real time. Expired foods are auto-blocked from orders.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Food Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the freshness, packing details, preparation info..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Image Upload / Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Food Image
            </label>
            {(() => {
              const previewImg = getMatchingFoodImage(formData.name || food.name, formData.category, formData.image);
              return (
                <div className="flex items-center gap-3">
                  {previewImg ? (
                    <img
                      src={previewImg}
                      alt="Food preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 shrink-0" />
                  )}
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="edit-food-file-input"
                    />
                    <label
                      htmlFor="edit-food-file-input"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      {previewImg ? 'Change Image' : 'Upload Image'}
                    </label>
                    {previewImg && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: '' }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                      >
                        Remove Image
                      </button>
                    )}
                    {imageError && (
                      <p className="text-[11px] text-rose-500 mt-1">{imageError}</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
