import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Receipt, Truck, RotateCcw, ArrowRight, QrCode } from 'lucide-react';

export const OrderHistoryPage = ({ onDirectCheckout }) => {
  const { 
    orders, 
    currentUser, 
    setActiveView, 
    setActiveTrackingOrderId, 
    setReceiptModalOrder,
    listings
  } = useApp();

  const myOrders = currentUser 
    ? orders.filter(o => o.trustId === currentUser.id || o.trustName === currentUser.name)
    : orders;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Food Rescue Order History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of food rescue orders placed by your organization.
          </p>
        </div>

        <button
          onClick={() => setActiveView('marketplace')}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
        >
          + Place New Order
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {myOrders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No past food orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Food Item</th>
                  <th className="p-4">Hotel / Restaurant</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{ord.id}</td>
                    <td className="p-4 font-semibold text-slate-900">{ord.foodName}</td>
                    <td className="p-4 text-slate-600">{ord.hotelName}</td>
                    <td className="p-4 font-bold">{ord.quantity} {ord.unit || 'portions'}</td>
                    <td className="p-4 font-bold text-slate-900">{ord.totalAmount === 0 ? 'FREE' : `₹${ord.totalAmount}`}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Paid ({ord.paymentMethod})
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        ord.orderStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setActiveTrackingOrderId(ord.id);
                          setActiveView('order-tracking');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                        title="View Scannable QR Code Pickup Pass"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR Pass</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTrackingOrderId(ord.id);
                          setActiveView('order-tracking');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        Track
                      </button>

                      <button
                        onClick={() => setReceiptModalOrder(ord)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
