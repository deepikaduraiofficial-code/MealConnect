import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { CartDrawer } from './components/CartDrawer';
import { MapModal } from './components/MapModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LandingPage } from './views/LandingPage';
import { MarketplacePage } from './views/MarketplacePage';
import { HotelDashboard } from './views/HotelDashboard';
import { TrustDashboard } from './views/TrustDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { HotelAuthPage } from './views/HotelAuthPage';
import { TrustAuthPage } from './views/TrustAuthPage';
import { AdminLoginPage } from './views/AdminLoginPage';
import { RoleSelectPage } from './views/RoleSelectPage';
import { CheckoutPage } from './views/CheckoutPage';
import { PaymentSuccessPage } from './views/PaymentSuccessPage';
import { OrderTrackingPage } from './views/OrderTrackingPage';
import { OrderHistoryPage } from './views/OrderHistoryPage';
import { PaymentHistoryPage } from './views/PaymentHistoryPage';
import { ImpactPage } from './views/ImpactPage';

const MainContent = () => {
  const { activeView, setActiveView, addToCart, setIsCartOpen } = useApp();

  const handleOpenAuth = (role = 'hotel') => {
    if (role === 'hotel') {
      setActiveView('hotel-login');
    } else if (role === 'trust') {
      setActiveView('trust-login');
    } else if (role === 'admin') {
      setActiveView('admin-login');
    } else {
      setActiveView('role-select');
    }
  };

  const handleDirectCheckout = (food, qty = 1) => {
    addToCart(food, qty);
    setActiveView('checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar onOpenAuth={() => setActiveView('role-select')} />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'landing' && <LandingPage onOpenAuth={handleOpenAuth} />}
        {activeView === 'role-select' && <RoleSelectPage />}
        {activeView === 'hotel-login' && <HotelAuthPage />}
        {activeView === 'trust-login' && <TrustAuthPage />}
        {activeView === 'admin-login' && <AdminLoginPage />}
        {activeView === 'marketplace' && <MarketplacePage onDirectCheckout={handleDirectCheckout} />}
        {activeView === 'hotel-dashboard' && <HotelDashboard />}
        {activeView === 'trust-dashboard' && <TrustDashboard />}
        {activeView === 'admin-dashboard' && <AdminDashboard />}
        {activeView === 'checkout' && <CheckoutPage />}
        {activeView === 'payment-success' && <PaymentSuccessPage />}
        {activeView === 'order-tracking' && <OrderTrackingPage />}
        {activeView === 'order-history' && <OrderHistoryPage onDirectCheckout={handleDirectCheckout} />}
        {activeView === 'payment-history' && <PaymentHistoryPage />}
        {activeView === 'impact' && <ImpactPage />}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <MapModal />
      <ReceiptModal />

      {/* Toast popup */}
      <Toast />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
