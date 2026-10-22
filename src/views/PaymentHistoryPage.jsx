import React from 'react';
import { useApp } from '../context/AppContext';
import { Receipt, CheckCircle, CreditCard } from 'lucide-react';

export const PaymentHistoryPage = () => {
  const { orders, currentUser, setReceiptModalOrder } = useApp();

  const transactions = orders.map(ord => ({
    txnId: ord.paymentTxnId || `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    orderId: ord.id,
    foodName: ord.foodName,
    amount: ord.totalAmount,
    method: ord.paymentMethod || 'UPI',
    date: ord.orderDate,
    status: ord.paymentStatus || 'Payment Successful',
    order: ord
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
          Payment & Financial History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed ledger of food handling fees, delivery charges, and financial receipts.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Food Item</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => (
                <tr key={txn.txnId} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{txn.txnId}</td>
                  <td className="p-4 font-mono font-bold text-slate-600">{txn.orderId}</td>
                  <td className="p-4 font-semibold text-slate-900">{txn.foodName}</td>
                  <td className="p-4 font-extrabold text-emerald-700">₹{txn.amount}</td>
                  <td className="p-4 font-medium">{txn.method}</td>
                  <td className="p-4 text-slate-500">{new Date(txn.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ✓ Successful
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setReceiptModalOrder(txn.order)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
