import React from 'react';
import { useApp } from '../context/AppContext';
import { formatOrderDateTime } from '../utils/dateUtils';
import { X, Printer, Download, CheckCircle, ShieldCheck, Utensils } from 'lucide-react';

export const ReceiptModal = () => {
  const { receiptModalOrder, setReceiptModalOrder } = useApp();

  if (!receiptModalOrder) return null;

  const order = receiptModalOrder;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Meal_Connect_Receipt_${order.id || 'Order'}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="receipt-modal-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <div className="receipt-modal-dialog bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative animate-in zoom-in-95 duration-200">
        
        {/* Header (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Official Payment Receipt</span>
          <button
            onClick={() => setReceiptModalOrder(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 bg-white">
          
          {/* Brand & Receipt Header */}
          <div className="text-center space-y-2 border-b border-slate-200 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Utensils className="w-6 h-6" />
            </div>
            <h2 className="font-extrabold text-2xl text-slate-900 font-heading">
              Meal Connect
            </h2>
            <p className="text-xs text-slate-500 font-medium">Official Food Transfer & Payment Receipt</p>
            
            <div className="pt-2 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-xs text-emerald-800 font-bold border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verified Food Rescue Transaction</span>
              </span>
            </div>
          </div>

          {/* Key Meta Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-slate-400 font-medium block">Order ID</span>
              <strong className="text-slate-900 font-mono text-sm">{order.id}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Transaction ID</span>
              <strong className="text-slate-900 font-mono text-xs">{order.paymentTxnId || 'TXN-9981245781'}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Date & Time</span>
              <strong className="text-slate-900">
                {formatOrderDateTime(order.orderDate)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Payment Status</span>
              <strong className="text-emerald-700 font-bold">✓ Paid ({order.paymentMethod || 'UPI'})</strong>
            </div>
          </div>

          {/* Party Details */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">DONATING HOTEL / RESTAURANT</span>
              <p className="font-extrabold text-slate-900 text-sm">{order.hotelName}</p>
              <p className="text-slate-500 text-xs">{order.hotelLocation || order.pickupLocation || 'Indiranagar, Bengaluru'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">RESCUING TRUST / NGO</span>
              <p className="font-extrabold text-slate-900 text-sm">{order.trustName || 'Hope Foundation Trust'}</p>
              <p className="text-slate-500 text-xs">Verified Organization</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">ITEM BREAKDOWN</span>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Food Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">{order.foodName}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{order.quantity} {order.unit || 'portions'}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{order.subtotal === 0 ? 'FREE' : `₹${order.subtotal}`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">{order.subtotal === 0 ? 'FREE' : `₹${order.subtotal}`}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Handling / Logistics</span>
              <span className="font-semibold">₹{order.deliveryCharge || 0}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="text-emerald-700 font-mono text-lg">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-slate-100 space-y-1">
            <p className="text-xs font-semibold text-slate-700">
              Thank you for being part of the Food Rescue Movement.
            </p>
            <p className="text-[11px] text-slate-400">
              Every meal rescued reduces greenhouse emissions and feeds communities in need.
            </p>
          </div>

        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 no-print">
          <button
            onClick={() => setReceiptModalOrder(null)}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={handlePrint}
            className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF Receipt
          </button>
        </div>

      </div>

    </div>
  );
};
