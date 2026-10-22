import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { CheckCircle2, Receipt, Truck, ArrowRight, ShieldCheck, Sparkles, Printer } from 'lucide-react';

export const PaymentSuccessPage = () => {
  const { 
    lastPlacedOrder, 
    setActiveView, 
    setActiveTrackingOrderId,
    setReceiptModalOrder
  } = useApp();

  const order = lastPlacedOrder || {
    id: 'ORD-2026-8801',
    paymentTxnId: 'TXN-9981245781',
    foodName: 'Vegetable Biryani & Salan',
    hotelName: 'Green Leaf Hotel',
    hotelLocation: 'Indiranagar, Bengaluru',
    trustName: 'Hope Foundation Trust',
    quantity: 20,
    unit: 'portions',
    subtotal: 0,
    deliveryCharge: 45,
    totalAmount: 45,
    paymentMethod: 'UPI',
    orderDate: new Date().toISOString()
  };

  useEffect(() => {
    // Fire confetti for celebration!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handlePrintReceipt = () => {
    setReceiptModalOrder(order);
    setTimeout(() => {
      const originalTitle = document.title;
      document.title = `Meal_Connect_Receipt_${order.id || 'Order'}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8 animate-in zoom-in-95 duration-300">
      
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />

        {/* Big Green Success Badge */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Payment Successful & Verified
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            Food Rescue Order Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Your payment was processed successfully. The hotel has been notified and is preparing the food for handover.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-left text-xs space-y-3">
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
            <div>
              <span className="text-slate-400 font-medium block">Order ID</span>
              <strong className="text-slate-900 font-mono text-sm">{order.id}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Transaction ID</span>
              <strong className="text-slate-900 font-mono text-xs">{order.paymentTxnId}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 font-medium block">Food Item</span>
              <strong className="text-slate-900">{order.foodName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Donating Hotel</span>
              <strong className="text-slate-900">{order.hotelName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Amount Paid</span>
              <strong className="text-emerald-600 font-extrabold text-sm">₹{order.totalAmount} ({order.paymentMethod})</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Status</span>
              <strong className="text-emerald-700 font-bold">Confirmed / Paid</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 no-print">
          <button
            onClick={handlePrintReceipt}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Receipt
          </button>

          <button
            onClick={() => {
              setActiveTrackingOrderId(order.id);
              setActiveView('order-tracking');
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4 text-slate-600" />
            Track Order Progress
          </button>
        </div>

      </div>

    </div>
  );
};
