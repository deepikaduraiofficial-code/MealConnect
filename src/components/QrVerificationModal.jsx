import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Package, 
  Clock, 
  Building2, 
  HeartHandshake, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const QrVerificationModal = ({ isOpen, onClose }) => {
  const { orders, currentUser, verifyPickup, showToast } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null); // { success, error, order }
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Filter orders assigned to this hotel that are ready or in progress
  const hotelPendingOrders = orders.filter(o => 
    (o.hotelId === currentUser?.id || o.hotelName === currentUser?.name) &&
    !o.isQrVerified &&
    o.orderStatus !== 'Collected' &&
    o.orderStatus !== 'Completed'
  );

  // Close & clean up camera
  const handleClose = () => {
    stopCamera();
    setInputCode('');
    setVerificationResult(null);
    setCameraError('');
    onClose();
  };

  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported by your browser. Please use manual PIN verification.');
        setIsCameraActive(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError('Camera permission not granted or device camera busy. Please use the manual PIN verification option below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || inputCode;
    if (!code.trim()) {
      setVerificationResult({ success: false, error: 'Please enter a valid Order ID or Pickup PIN.' });
      return;
    }

    const res = await verifyPickup(code, currentUser);
    setVerificationResult(res);
    if (res && res.success) {
      setInputCode('');
      stopCamera();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-heading">
                Food Pickup QR Verification
              </h3>
              <p className="text-xs text-slate-400">
                Authorized Hotel Handover for {currentUser?.name || 'Hotel'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          
          {/* CAMERA SCANNER TAB / OPTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                Live Camera Scanner
              </span>
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-xs transition-colors flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" /> Start Camera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
                >
                  Stop Camera
                </button>
              )}
            </div>

            {isCameraActive ? (
              <div className="relative h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  playsInline 
                  muted 
                />
                
                {/* Visual Viewfinder Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-44 h-44 border-2 border-emerald-400/80 rounded-2xl relative shadow-2xl animate-pulse">
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400" />
                  </div>
                </div>

                <div className="absolute bottom-2 bg-slate-900/90 text-white text-[11px] px-3 py-1 rounded-full border border-slate-700">
                  Align Trust agent's QR pass inside the frame
                </div>
              </div>
            ) : cameraError ? (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            ) : null}
          </div>

          {/* MANUAL PIN / ORDER ID ENTRY */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Manual QR Pass Code or Order ID Verification
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter PIN (e.g. MC-8801 or ORD-2026-8801)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleVerify(inputCode)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all shrink-0"
              >
                Verify & Confirm
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Trust drivers or volunteers present either their scannable QR Code pass or their 6-digit Pickup PIN upon collection.
            </p>
          </div>

          {/* VERIFICATION FEEDBACK BANNER */}
          {verificationResult && (
            <div className={`p-4 rounded-2xl border text-xs animate-in fade-in duration-200 ${
              verificationResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              {verificationResult.success ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Pickup Successfully Verified & Recorded!</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1.5 text-xs text-slate-700 font-medium">
                    <p><strong>Order ID:</strong> <span className="font-mono font-bold">{verificationResult.order?.id}</span></p>
                    <p><strong>Rescuing Trust:</strong> {verificationResult.order?.trustName}</p>
                    <p><strong>Food Handed Over:</strong> {verificationResult.order?.foodName} ({verificationResult.order?.quantity} {verificationResult.order?.unit})</p>
                    <p><strong>Collected Timestamp:</strong> {verificationResult.order?.pickupVerification?.pickupDate} at {verificationResult.order?.pickupVerification?.pickupTime}</p>
                    <p><strong>Verified By:</strong> {verificationResult.order?.pickupVerification?.verifiedBy}</p>
                    <p className="text-emerald-700 font-bold pt-1">
                      Status has been automatically updated to "Collected".
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 text-rose-800">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-xs">Verification Failed</h5>
                    <p className="mt-0.5 text-[11px] leading-relaxed">{verificationResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QUICK 1-CLICK VERIFICATION FOR HOTEL'S PENDING ORDERS */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Pending Pickups for {currentUser?.name} ({hotelPendingOrders.length})
              </span>
              <span className="text-[11px] text-slate-400">Quick Verification</span>
            </div>

            {hotelPendingOrders.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                ✓ All orders for your hotel have been collected and verified!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {hotelPendingOrders.map(ord => (
                  <div
                    key={ord.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-extrabold text-[10px]">
                          {ord.pickupCode}
                        </span>
                      </div>
                      <p className="text-slate-600 truncate mt-0.5">
                        {ord.trustName} • {ord.foodName} ({ord.quantity} {ord.unit})
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerify(ord.pickupCode || ord.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors shrink-0"
                    >
                      Verify Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Duplicate scan prevention active
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
