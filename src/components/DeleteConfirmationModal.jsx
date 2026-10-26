import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, MapPin, Tag, Building2, ShoppingBag } from 'lucide-react';
import { getMatchingFoodImage } from '../utils/foodImageResolver';

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, foodItem, mode = 'listing' }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !foodItem) return null;

  const isImageMode = mode === 'image';
  const previewImg = getMatchingFoodImage(foodItem.name, foodItem.category, foodItem.image);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Danger Icon Badge & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm ring-4 ring-rose-50">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 id="delete-dialog-title" className="text-xl font-extrabold text-slate-900 font-heading">
              {isImageMode ? 'Delete Food Image' : 'Delete Food Item'}
            </h3>
            <p className="text-sm font-semibold text-slate-700">
              {isImageMode 
                ? `Are you sure you want to permanently delete this food image?`
                : 'Are you sure you want to delete this food item?'}
            </p>
          </div>

          {/* Item details preview card being deleted */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex gap-3 items-center">
            {previewImg ? (
              <img
                src={previewImg}
                alt={foodItem.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-200/80 border border-slate-300 shrink-0" />
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="font-extrabold text-slate-900 text-sm truncate">
                {foodItem.name}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{foodItem.hotelName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {foodItem.quantity} {foodItem.unit || 'portions'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-800">
                  {foodItem.price === 0 ? 'FREE' : `₹${foodItem.price}`}
                </span>
              </div>
            </div>
          </div>

          {/* Explanation Warning */}
          <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50/70 p-3 rounded-xl border border-rose-100">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="leading-snug">
              {isImageMode
                ? 'This will permanently remove the image from this food listing and storage. The food item, price, quantity, and availability will stay active.'
                : 'This will permanently remove this item and its complete details from the food listing, categories, and search results.'}
            </p>
          </div>

          {/* Action Buttons: Cancel and Delete */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(foodItem.id || foodItem._id);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              {isImageMode ? 'Delete Image' : 'Delete Listing'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
