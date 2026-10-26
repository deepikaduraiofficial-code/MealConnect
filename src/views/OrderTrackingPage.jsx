import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { formatOrderDateTime } from '../utils/dateUtils';
import { generateOrderQRCode } from '../utils/qrUtils';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Building2, 
  HeartHandshake, 
  Truck, 
  Navigation, 
  Receipt,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const OrderTrackingPage = () => {
  const { 
    orders, 
    activeTrackingOrderId, 
    setActiveView, 
    advanceOrderStatus, 
    setMapModalData,
    setReceiptModalOrder,
    currentRole
  } = useApp();

  const targetOrder = orders.find(o => o.id === activeTrackingOrderId) || orders[0];

  if (!targetOrder) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No active order to track</h2>
        <button
          onClick={() => setActiveView('marketplace')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          Explore Available Food
        </button>
      </div>
    );
  }

  const steps = [
    { title: "Order Placed", desc: "Trust placed food request & payment" },
    { title: "Hotel Confirmed", desc: "Hotel accepted & verified food availability" },
    { title: "Food Ready", desc: "Food packed in food-grade insulated containers" },
    { title: "Picked Up", desc: "Handed over to volunteer / trust agent" },
    { title: "Delivered", desc: "Arrived at trust community kitchen" },
    { title: "Completed", desc: "Meals served to beneficiaries" }
  ];

  const currentStepIndex = steps.findIndex(s => s.title === targetOrder.orderStatus);

  // Generate QR Code Data URL if not stored
  const [qrUrl, setQrUrl] = useState(targetOrder.qrCodeDataUrl || '');

  useEffect(() => {
    if (targetOrder.qrCodeDataUrl) {
      setQrUrl(targetOrder.qrCodeDataUrl);
    } else {
      generateOrderQRCode(targetOrder).then(url => {
        if (url) setQrUrl(url);
      }).catch(console.error);
    }
  }, [targetOrder]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveView('order-history')}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </button>
        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
          Tracking ID: {targetOrder.id}
        </span>
      </div>

      {/* Main Tracking Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 space-y-8">
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            {(() => {
              const trackingImg = getMatchingFoodImage(targetOrder.foodName, '', targetOrder.foodImage);
              return trackingImg ? (
                <img
                  src={trackingImg}
                  alt={targetOrder.foodName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-200/80 border border-slate-300 shrink-0" />
              );
            })()}
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">{targetOrder.foodName}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                From {targetOrder.hotelName} → For {targetOrder.trustName}
              </p>
              <p className="text-xs font-bold text-emerald-700 mt-1">
                Quantity: {targetOrder.quantity} {targetOrder.unit || 'portions'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setMapModalData({
                  origin: targetOrder.trustName,
                  destination: `${targetOrder.hotelName} (${targetOrder.pickupLocation})`,
                  distanceKm: 2.8
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <Navigation className="w-4 h-4 text-emerald-600" /> View Map
            </button>

            <button
              onClick={() => setReceiptModalOrder(targetOrder)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4 text-slate-500" /> Receipt
            </button>
          </div>
        </div>

        {/* UNIQUE QR CODE PICKUP VERIFICATION PASS */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-6 sm:p-7 rounded-3xl border border-slate-700 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                    Official Pickup Pass
                  </span>
                  <span className="text-xs text-slate-400">• Show at Hotel Desk</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  Food Collection QR Verification Pass
                </h3>
              </div>
            </div>

            <div>
              {targetOrder.orderStatus === 'Collected' || targetOrder.isQrVerified ? (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/40 flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ✓ Pickup Collected & Verified
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-400/40 flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Ready for Handover
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
            {/* Left: Scannable QR Code Image */}
            <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
              <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-white/20">
                {qrUrl ? (
                  <img src={qrUrl} alt="Pickup QR Code" className="w-36 h-36 object-contain rounded-lg" />
                ) : (
                  <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-mono font-bold">
                    Generating QR...
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold text-center sm:text-left">
                Scan with hotel camera scanner
              </span>
            </div>

            {/* Right: Pickup PIN and Verification Details */}
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Pickup Verification PIN (Manual Backup)
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-widest block">
                  {targetOrder.pickupCode || `MC-${targetOrder.id.slice(-4)}`}
                </span>
                <p className="text-[11px] text-slate-400">
                  Provide this 6-digit code or display the QR code when collecting food from <strong>{targetOrder.hotelName}</strong>.
                </p>
              </div>

              {/* Handover Details */}
              {targetOrder.pickupVerification ? (
                <div className="bg-emerald-950/60 border border-emerald-800/80 p-3 rounded-xl text-xs space-y-1 text-emerald-200">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <ShieldCheck className="w-4 h-4" /> Verified Collection Record
                  </p>
                  <p className="text-[11px]">
                    Collected on: <strong>{targetOrder.pickupVerification.pickupDate} at {targetOrder.pickupVerification.pickupTime}</strong>
                  </p>
                  <p className="text-[11px]">
                    Verified by: <strong>{targetOrder.pickupVerification.verifiedBy}</strong>
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Authorized for pickup at: {targetOrder.pickupLocation || targetOrder.hotelLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VISUAL PROGRESS TIMELINE */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Live Order Stage Progress
            </h3>
            <span className="text-xs font-bold text-emerald-600 animate-pulse">
              Current Stage: {targetOrder.orderStatus}
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-1 before:bg-slate-200">
            {steps.map((step, idx) => {
              const isDone = idx <= (currentStepIndex >= 0 ? currentStepIndex : 0);
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.title} className="relative flex items-start gap-4">
                  {/* Circle Indicator */}
                  <div className={`absolute -left-6 sm:-left-8 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                    isDone 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30' 
                      : 'bg-white text-slate-400 border-slate-300'
                  }`}>
                    {isDone ? '✓' : idx + 1}
                  </div>

                  <div className="flex-1 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-extrabold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Active Stage
                          </span>
                        )}
                      </div>
                      {step.title === 'Order Placed' && targetOrder.orderDate && (
                        <span className="text-xs font-semibold text-slate-600 sm:text-right">
                          {formatOrderDateTime(targetOrder.orderDate)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Action button to simulate advancing order stage for college demo */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs">
            <span className="font-bold text-amber-400">Presentation Demo Control:</span>
            <p className="text-slate-400">Advance order stage to demonstrate full timeline</p>
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex < steps.length - 1 && (
              <button
                onClick={() => advanceOrderStatus(targetOrder.id, steps[currentStepIndex + 1].title)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-md"
              >
                Advance to next: "{steps[currentStepIndex + 1].title}"
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
