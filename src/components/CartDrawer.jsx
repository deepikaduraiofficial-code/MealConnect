import React from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { calculateFoodStatus } from '../utils/expiryUtils';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Building2,
  AlertCircle,
  AlertTriangle,
  Ban
} from 'lucide-react';

export const CartDrawer = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    setActiveView,
    currentRole,
    currentUser
  } = useApp();

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.food.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 45 : 0;
  const grandTotal = subtotal + deliveryFee;

  const isVerifiedTrust = currentRole === 'trust' && currentUser?.verified;

  // Check if any cart item has expired
  const hasExpiredItem = cart.some(item => {
    const st = calculateFoodStatus(item.food.preparedTime, item.food.bestBeforeTime);
    return st.isExpired;
  });

  const handleProceedToCheckout = () => {
    if (hasExpiredItem) return;
    setIsCartOpen(false);
    setActiveView('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-in slide-in-from-right duration-300">
          
          {/* Cart Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg font-heading">Food Rescue Cart</h2>
                <p className="text-xs text-slate-400">{cart.length} item(s) selected</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1">Browse available food listings to rescue food today.</p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('marketplace');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  Explore Food Marketplace
                </button>
              </div>
            ) : (
              cart.map(({ food, quantity }) => (
                <div key={food.id} className="pt-4 first:pt-0 flex gap-4">
                  {(() => {
                    const cartImg = getMatchingFoodImage(food.name, food.category, food.image);
                    return cartImg ? (
                      <img
                        src={cartImg}
                        alt={food.name}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-slate-200/80 border border-slate-300 shrink-0" />
                    );
                  })()}
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {food.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(food.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {food.hotelName}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => updateCartQuantity(food.id, quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold text-xs hover:bg-slate-200 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs w-5 text-center font-mono">{quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(food.id, Math.min(food.quantity, quantity + 1))}
                          className="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold text-xs hover:bg-slate-200 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-slate-900">
                        {food.price === 0 ? 'FREE' : `₹${food.price * quantity}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Food Subtotal</span>
                  <span className="font-bold text-slate-900">{subtotal === 0 ? 'FREE' : `₹${subtotal}`}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Logistics & Handling</span>
                  <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-emerald-700 font-extrabold">₹{grandTotal}</span>
                </div>
              </div>

              {/* Unverified trust notice */}
              {currentRole === 'trust' && !currentUser?.verified && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Notice:</strong> Your trust account is waiting for admin verification. You can still test ordering for project presentation demo!
                  </p>
                </div>
              )}

              {/* Expired Item in Cart Warning */}
              {hasExpiredItem && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Food Safety Warning:</strong> Your cart contains food that has reached its best-before time. Please remove expired items before proceeding.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={hasExpiredItem}
                  className={hasExpiredItem 
                    ? "w-full py-3.5 rounded-xl bg-slate-200 text-slate-400 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                    : "w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  }
                >
                  <span>{hasExpiredItem ? "Cannot Checkout Expired Food" : "Proceed to Checkout"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex justify-between text-xs text-slate-500 pt-1">
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="hover:underline font-semibold"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={clearCart}
                    className="text-rose-500 hover:underline font-semibold"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
