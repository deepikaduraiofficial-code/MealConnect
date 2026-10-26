import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { 
  Building2, 
  HeartHandshake, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Landmark, 
  CheckCircle, 
  Lock, 
  MapPin, 
  Truck, 
  ArrowLeft,
  QrCode
} from 'lucide-react';

export const CheckoutPage = () => {
  const { 
    cart, 
    currentUser, 
    currentRole, 
    placeOrder, 
    setActiveView, 
    setActiveTrackingOrderId,
    setReceiptModalOrder
  } = useApp();

  const [fulfillmentType, setFulfillmentType] = useState('pickup'); // 'pickup' | 'delivery'
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking'
  const [upiId, setUpiId] = useState('trust@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [isProcessing, setIsProcessing] = useState(false);

  // If cart is empty but user direct ordered
  const checkoutItems = cart.length > 0 ? cart : [];
  const primaryItem = checkoutItems[0]?.food;

  if (!primaryItem && cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Your Checkout Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please select food from the marketplace first.</p>
        <button
          onClick={() => setActiveView('marketplace')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          Explore Available Food
        </button>
      </div>
    );
  }

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.food.price * item.quantity), 0);
  const deliveryFee = fulfillmentType === 'delivery' ? 45 : 0;
  const grandTotal = subtotal + deliveryFee;

  const trust = currentUser || { name: 'Hope Foundation Trust', email: 'hope@trust.org', location: 'Bengaluru' };

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    if (!primaryItem) return;
    setIsProcessing(true);

    try {
      const createdOrder = await placeOrder({
        food: primaryItem,
        quantity: checkoutItems[0]?.quantity || 1,
        fulfillmentType,
        paymentMethod,
        notes: 'Handled via Meal Connect'
      });
      setIsProcessing(false);
      if (!createdOrder) {
        return;
      }
      setActiveTrackingOrderId(createdOrder.id || createdOrder.orderId);
      setActiveView('payment-success');
    } catch (err) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveView('marketplace')}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Marketplace
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-extrabold text-slate-800">Secure 256-Bit Encrypted Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ORDER & FULFILLMENT & PAYMENT METHOD */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Trust Details */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" /> Organization & Beneficiary Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Trust / NGO Name</span>
                <p className="font-extrabold text-slate-900">{trust.name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Verification Status</span>
                <p className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Trust
                </p>
              </div>
            </div>
          </div>

          {/* Fulfillment Option */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" /> Choose Fulfillment Method
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                  fulfillmentType === 'pickup' 
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">Direct NGO Pickup</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">FREE</span>
                </div>
                <p className="text-[11px] text-slate-500">Collect food directly from hotel location.</p>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                  fulfillmentType === 'delivery' 
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">Volunteer Delivery</span>
                  <span className="text-[10px] font-bold text-slate-700">₹45 Fee</span>
                </div>
                <p className="text-[11px] text-slate-500">Dispatched via food rescue volunteer network.</p>
              </button>
            </div>
          </div>

          {/* REALISTIC PAYMENT OPTIONS */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" /> Select Payment Method
            </h3>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'UPI' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'Card' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Debit / Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NetBanking')}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'NetBanking' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Landmark className="w-4 h-4 text-amber-600" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Sub-form inputs */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <QrCode className="w-12 h-12 text-slate-800 p-2 bg-white rounded-xl border border-slate-200 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Instant UPI QR & VPA</span>
                    <span className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM UPI</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="enter.your.vpa@upi"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {paymentMethod === 'Card' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Expiry (MM/YY)</label>
                    <input type="text" defaultValue="08/28" className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">CVV Code</label>
                    <input type="password" defaultValue="•••" className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'NetBanking' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <label className="font-bold text-slate-700">Select Bank</label>
                <select className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold">
                  <option>HDFC Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY & PAY BUTTON */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
            <h3 className="text-base font-extrabold font-heading text-white border-b border-slate-800 pb-3">
              Order & Payment Summary
            </h3>

            {/* Selected Food Item Preview */}
            <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              {(() => {
                const checkoutImg = getMatchingFoodImage(primaryItem.name, primaryItem.category, primaryItem.image);
                return checkoutImg ? (
                  <img
                    src={checkoutImg}
                    alt={primaryItem.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-700 border border-slate-600 shrink-0" />
                );
              })()}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs truncate text-white">{primaryItem.name}</h4>
                <p className="text-[11px] text-emerald-400 font-semibold">{primaryItem.hotelName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Quantity: {checkoutItems[0]?.quantity || 1} {primaryItem.unit || 'portions'}
                </p>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Food Item Price</span>
                <span className="font-bold text-white">{subtotal === 0 ? 'FREE' : `₹${subtotal}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Logistics & Handling</span>
                <span className="font-bold text-white">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-slate-800">
                <span>Total Amount Due</span>
                <span className="text-emerald-400 text-lg">₹{grandTotal}</span>
              </div>
            </div>

            {/* Confirm Order & Pay Button */}
            <button
              onClick={handleConfirmAndPay}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Payment...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirm Order & Pay ₹{grandTotal}
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-[10px] text-slate-400">
                Prototype Demo Mode: Mock payment processing active. No real credit card or bank money is deducted.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
