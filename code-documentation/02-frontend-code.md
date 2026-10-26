# 02 – Frontend Application Source Code

> **Meal Connect (Food Rescue Marketplace)**  
> Comprehensive documentation of the React 19 Single Page Application (SPA), including application shell, global state management, centralized API client, interactive views, modular components, and frontend utility libraries.

---

## 📑 Table of Contents
1. [Application Entry & Router Shell](#1-application-entry--router-shell)
   - [`src/main.jsx`](#srcmainjsx)
   - [`src/App.jsx`](#srcappjsx)
2. [Global State Management Engine](#2-global-state-management-engine)
   - [`src/context/AppContext.jsx` (Overview & Core State Architecture)](#srccontextappcontextjsx)
3. [Centralized Backend API Client](#3-centralized-backend-api-client)
   - [`src/services/api.js`](#srcservicesapijs)
4. [Page Views & Portals](#4-page-views--portals)
   - [`src/views/MarketplacePage.jsx`](#srcviewsmarketplacepagejsx)
   - [`src/views/CheckoutPage.jsx`](#srcviewscheckoutpagejsx)
   - [`src/views/ImpactPage.jsx`](#srcviewsimpactpagejsx)
5. [Interactive Components & Modals](#5-interactive-components--modals)
   - [`src/components/FoodCard.jsx`](#srccomponentsfoodcardjsx)
   - [`src/components/CartDrawer.jsx`](#srccomponentscartdrawerjsx)
   - [`src/components/QrVerificationModal.jsx`](#srccomponentsqrverificationmodaljsx)
6. [Utility & Helper Functions](#6-utility--helper-functions)
   - [`src/utils/dateUtils.js`](#srcutilsdateutilsjs)
   - [`src/utils/qrUtils.js`](#srcutilsqrutilsjs)
   - [`src/utils/expiryUtils.js`](#srcutilsexpiryutilsjs)

---

## 1. Application Entry & Router Shell

### `src/main.jsx`

Purpose: The client-side entry point mounting the React virtual DOM tree inside `#root` using React 19's `createRoot` API and `StrictMode`.

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

### `src/App.jsx`

Purpose: The master application router and layout shell. Controls client-side view switching based on application state (`activeView`), renders navigation, footers, toast notifications, cart drawers, and modal containers.

```jsx
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
```

---

## 2. Global State Management Engine

### `src/context/AppContext.jsx`

Purpose: Centralized state store managing authentication credentials, user roles (`hotel`, `trust`, `admin`), surplus food listings, active cart items, order history, real-time toasts, and asynchronous synchronization with backend REST APIs.

```javascript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_HOTELS, 
  INITIAL_TRUSTS, 
  INITIAL_FOOD_LISTINGS,
  getInitialFoodListings,
  INITIAL_ORDERS, 
  INITIAL_NOTIFICATIONS,
  SYSTEM_STATS 
} from '../data/mockData';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { calculateFoodStatus, getDefaultExpiryTimes } from '../utils/expiryUtils';
import { generateOrderQRCode, generatePickupPin } from '../utils/qrUtils';
import { api } from '../services/api';

const AppContext = createContext();

const normalizeDietary = (dietary) => {
  if (dietary === 'Non-Veg' || dietary === 'Non-Vegetarian') {
    return 'Non-Veg';
  }
  return 'Veg';
};

const VALID_VIEWS = [
  'landing',
  'role-select',
  'hotel-login',
  'trust-login',
  'admin-login',
  'marketplace',
  'hotel-dashboard',
  'trust-dashboard',
  'admin-dashboard',
  'checkout',
  'payment-success',
  'order-tracking',
  'order-history',
  'payment-history',
  'impact'
];

const getViewFromUrlOrStorage = () => {
  if (typeof window === 'undefined') return 'landing';

  // 1. Check URL Hash (e.g. #hotel-dashboard, #marketplace, etc.)
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim();
  if (hash) {
    if (VALID_VIEWS.includes(hash)) return hash;
    if (hash === 'explore-food' || hash === 'food') return 'marketplace';
    if (hash === 'home') return 'landing';
    if (hash === 'cart') return 'marketplace';
  }

  // 2. Check URL Pathname (e.g. /hotel-dashboard)
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').split('?')[0].trim();
  if (pathname) {
    if (VALID_VIEWS.includes(pathname)) return pathname;
    if (hash === 'explore-food' || hash === 'food') return 'marketplace';
    if (pathname === 'home') return 'landing';
  }

  // 3. Check localStorage
  const saved = localStorage.getItem('fm_active_view');
  if (saved && VALID_VIEWS.includes(saved)) {
    return saved;
  }

  // 4. Default to role dashboard if already logged in and no specific view
  const savedRole = localStorage.getItem('fm_role');
  if (savedRole === 'hotel') return 'hotel-dashboard';
  if (savedRole === 'trust') return 'trust-dashboard';
  if (savedRole === 'admin') return 'admin-dashboard';

  return 'landing';
};

export const AppProvider = ({ children }) => {
  // Current session & role
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('fm_role') || 'guest';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('fm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState(() => {
    return getViewFromUrlOrStorage();
  });

  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState(null);
  
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(() => {
    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      const queryId = hashParams.get('orderId') || new URLSearchParams(window.location.search).get('orderId');
      if (queryId) return queryId;
    }
    return localStorage.getItem('fm_tracking_order_id') || 'ORD-2026-8801';
  });

  const [receiptModalOrder, setReceiptModalOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('fm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Master collections
  const [hotels, setHotels] = useState(INITIAL_HOTELS);
  const [trusts, setTrusts] = useState(INITIAL_TRUSTS);
  const [listings, setListings] = useState(() => getInitialFoodListings());
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Synchronize state changes to localStorage
  useEffect(() => {
    localStorage.setItem('fm_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fm_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fm_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('fm_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast Notification Trigger
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
  };

  // Cart Management
  const addToCart = (food, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.food.id === food.id);
      if (existing) {
        return prev.map(item =>
          item.food.id === food.id
            ? { ...item, quantity: Math.min(food.quantity, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { food, quantity }];
    });
    showToast(`Added ${quantity} portion(s) of ${food.name} to rescue cart`);
  };

  const updateCartQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.food.id === foodId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (foodId) => {
    setCart(prev => prev.filter(item => item.food.id !== foodId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order Placement
  const placeOrder = async ({ food, quantity, fulfillmentType, paymentMethod, notes }) => {
    try {
      const orderPayload = {
        foodId: food.id || food._id,
        foodName: food.name,
        hotelId: food.hotelId,
        hotelName: food.hotelName,
        trustId: currentUser?.id || 'trust-1',
        trustName: currentUser?.name || 'Hope Foundation Trust',
        quantity: Number(quantity) || 1,
        unit: food.unit || 'portions',
        pricePerUnit: food.price || 0,
        totalAmount: (food.price || 0) * (Number(quantity) || 1) + (fulfillmentType === 'delivery' ? 45 : 0),
        fulfillmentType,
        paymentMethod,
        notes
      };

      // Call Backend API
      const res = await api.orders.create(orderPayload);
      const createdOrder = res.order || res.data || res;

      // Update local state
      setOrders(prev => [createdOrder, ...prev]);
      setListings(prev =>
        prev.map(item =>
          item.id === food.id
            ? { ...item, quantity: Math.max(0, item.quantity - quantity) }
            : item
        )
      );
      clearCart();
      showToast('Food rescue order confirmed successfully!');
      return createdOrder;
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
      throw err;
    }
  };

  // Pickup Verification
  const verifyPickup = async (codeOrPin, hotelUser) => {
    try {
      const res = await api.orders.verifyPickup(codeOrPin);
      if (res.success) {
        setOrders(prev =>
          prev.map(o => (o.id === res.order.id ? res.order : o))
        );
        showToast(`Pickup verified for order ${res.order.id}`);
        return { success: true, order: res.order };
      }
      return { success: false, error: res.error || 'Verification failed' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Metrics
  const totalMealsRescued = orders.reduce((acc, curr) => acc + (curr.quantity || 0), 1250);
  const totalKgRescued = Math.round(totalMealsRescued * 0.45);
  const totalPeopleServed = totalMealsRescued * 2;

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        activeView,
        setActiveView,
        selectedFoodForDetail,
        setSelectedFoodForDetail,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        receiptModalOrder,
        setReceiptModalOrder,
        toastMessage,
        showToast,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        listings,
        setListings,
        orders,
        setOrders,
        hotels,
        setHotels,
        trusts,
        setTrusts,
        notifications,
        setNotifications,
        placeOrder,
        verifyPickup,
        totalMealsRescued,
        totalKgRescued,
        totalPeopleServed
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
```

---

## 3. Centralized Backend API Client

### `src/services/api.js`

Purpose: Central HTTP service abstraction communicating with the Express.js server endpoints. Handles base URLs, bearer token injection from `localStorage`, JSON serialization, and error mapping.

```javascript
// Frontend API Client for Meal Connect Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal request helper that handles JSON, authorization token headers, and error parsing
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('fm_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to Meal Connect backend server. Please check your connection.');
    }
    throw error;
  }
};

export const api = {
  // Auth API
  auth: {
    loginHotel: (email, password) =>
      request('/auth/login-hotel', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),

    registerHotel: (hotelData) =>
      request('/auth/register-hotel', {
        method: 'POST',
        body: JSON.stringify(hotelData)
      }),

    loginTrust: (email, password) =>
      request('/auth/login-trust', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),

    registerTrust: (trustData) =>
      request('/auth/register-trust', {
        method: 'POST',
        body: JSON.stringify(trustData)
      }),

    loginAdmin: (email, password) =>
      request('/auth/login-admin', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),

    getMe: () => request('/auth/me'),

    getHotels: () => request('/auth/hotels'),

    getTrusts: () => request('/auth/trusts'),

    toggleHotelVerification: (id) =>
      request(`/auth/hotels/${id}/verify`, { method: 'PUT' }),

    toggleTrustVerification: (id) =>
      request(`/auth/trusts/${id}/verify`, { method: 'PUT' })
  },

  // Food Management API
  food: {
    getListings: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.category && params.category !== 'All') query.set('category', params.category);
      if (params.dietary && params.dietary !== 'all') query.set('dietary', params.dietary);
      if (params.priceFilter && params.priceFilter !== 'all') query.set('priceFilter', params.priceFilter);
      if (params.maxDistance) query.set('maxDistance', params.maxDistance);
      if (params.sortBy) query.set('sortBy', params.sortBy);

      const qs = query.toString();
      return request(`/food${qs ? `?${qs}` : ''}`);
    },

    getById: (id) => request(`/food/${id}`),

    getMyListings: () => request('/food/my-listings'),

    create: (foodData) =>
      request('/food', {
        method: 'POST',
        body: JSON.stringify(foodData)
      }),

    update: (id, foodData) =>
      request(`/food/${id}`, {
        method: 'PUT',
        body: JSON.stringify(foodData)
      }),

    delete: (id) =>
      request(`/food/${id}`, {
        method: 'DELETE'
      })
  },

  // Cart API
  cart: {
    get: () => request('/cart'),

    add: (foodId, quantity = 1) =>
      request('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ foodId, quantity })
      }),

    updateQuantity: (foodId, quantity) =>
      request(`/cart/item/${foodId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      }),

    remove: (foodId) =>
      request(`/cart/item/${foodId}`, {
        method: 'DELETE'
      }),

    clear: () =>
      request('/cart', {
        method: 'DELETE'
      })
  },

  // Orders API
  orders: {
    getAll: () => request('/orders'),

    getById: (id) => request(`/orders/${id}`),

    create: (orderData) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      }),

    updateStatus: (id, status) =>
      request(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }),

    verifyPickup: (orderIdOrPin) =>
      request('/orders/verify-pickup', {
        method: 'POST',
        body: JSON.stringify({ orderIdOrPin })
      })
  },

  // Payments API
  payments: {
    createOrder: (payload) =>
      request('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    verify: (payload) =>
      request('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    getHistory: () => request('/payments')
  },

  // Reports & Admin API
  reports: {
    getDashboardStats: () => request('/reports/dashboard'),
    getReportData: () => request('/reports/generate')
  },

  admin: {
    getStats: () => request('/admin/stats'),
    getDashboardStats: () => request('/admin/dashboard'),
    getExpiredListings: () => request('/admin/expired-listings'),
    getReportData: () => request('/admin/report'),
    toggleHotelVerification: (id) => request(`/admin/hotels/${id}/verify`, { method: 'PUT' }),
    toggleTrustVerification: (id) => request(`/admin/trusts/${id}/verify`, { method: 'PUT' })
  },

  // Impact Statistics API
  impact: {
    getStatistics: () => request('/impact')
  },

  // Notifications API
  notifications: {
    getAll: () => request('/notifications'),

    markRead: (id) =>
      request(`/notifications/${id}/read`, {
        method: 'PUT'
      }),

    markAllRead: () =>
      request('/notifications/read-all', {
        method: 'PUT'
      })
  }
};
```

---

## 4. Page Views & Portals

### `src/views/MarketplacePage.jsx`

Purpose: The surplus food marketplace interface. Implements live text search, category filtering (Breakfast, Cooked Meals, Snacks, etc.), price filtering (Free vs Paid), maximum distance sliders, and dynamic expiry badges.

```jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailsModal } from '../components/FoodDetailsModal';
import { calculateFoodStatus } from '../utils/expiryUtils';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Flame, 
  MapPin, 
  ArrowUpDown, 
  AlertTriangle, 
  RotateCcw, 
  Tag,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

export const MarketplacePage = ({ onDirectCheckout }) => {
  const { listings, selectedFoodForDetail, setSelectedFoodForDetail } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const [priceFilter, setPriceFilter] = useState('all');
  const [maxDistance, setMaxDistance] = useState(10);
  const [sortBy, setSortBy] = useState('expiring');

  const categories = [
    'All', 'Breakfast', 'Lunch & Main Course', 'Snacks', 
    'Sweets & Desserts', 'Drinks', 'Non-Vegetarian', 
    'Combo Meals', 'Rice & Breads', 'Cooked Meals', 'Bakery'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const urgentCount = useMemo(() => {
    return listings.filter(item => {
      if (item.status === 'Collected' || item.quantity <= 0) return false;
      const st = calculateFoodStatus(item.preparedTime, item.bestBeforeTime);
      return st.isExpiringSoon;
    }).length;
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(query) ||
        item.hotelName.toLowerCase().includes(query) ||
        item.hotelLocation.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      const matchesPrice = priceFilter === 'all' || 
        (priceFilter === 'free' && item.price === 0) ||
        (priceFilter === 'paid' && item.price > 0);

      const matchesDistance = (item.distanceKm || 2.5) <= maxDistance;

      return matchesSearch && matchesCategory && matchesPrice && matchesDistance;
    }).sort((a, b) => {
      const timeA = new Date(a.bestBeforeTime).getTime();
      const timeB = new Date(b.bestBeforeTime).getTime();

      if (sortBy === 'expiring') {
        return timeA - timeB;
      } else if (sortBy === 'nearest') {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      } else if (sortBy === 'lowest_price') {
        return a.price - b.price;
      } else if (sortBy === 'highest_qty') {
        return b.quantity - a.quantity;
      }
      return 0;
    });
  }, [listings, searchTerm, selectedCategory, priceFilter, maxDistance, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Marketplace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Verified Surplus Food Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading mt-2">
            Surplus Food Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse fresh, safe surplus food listed by partner hotels for immediate trust collection.
          </p>
        </div>

        {urgentCount > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900 font-medium">
              <span className="font-extrabold text-amber-800">{urgentCount} urgent listing(s)</span> expiring soon.
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search food, hotel, or area..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Food Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800">No surplus food listings found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          filteredListings.map(food => (
            <FoodCard
              key={food.id}
              food={food}
              onOpenDetails={() => setSelectedFoodForDetail(food)}
              onQuickOrder={() => onDirectCheckout(food, 1)}
            />
          ))
        )}
      </div>

      {/* Food Details Modal */}
      {selectedFoodForDetail && (
        <FoodDetailsModal
          food={selectedFoodForDetail}
          onClose={() => setSelectedFoodForDetail(null)}
          onOrder={(food, qty) => {
            setSelectedFoodForDetail(null);
            onDirectCheckout(food, qty);
          }}
        />
      )}
    </div>
  );
};
```

---

### `src/views/CheckoutPage.jsx`

Purpose: Handles order finalization for verified Trusts/NGOs. Supports pickup vs. delivery selection, simulation of payment workflows (free claims for ₹0 food vs. simulated UPI, Card, and NetBanking methods), and order creation.

```jsx
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

  const [fulfillmentType, setFulfillmentType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

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
      if (!createdOrder) return;
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Fulfillment Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">1. Fulfillment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  fulfillmentType === 'pickup'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">Direct Trust Pickup</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Collect directly from hotel counter. Free of charge.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  fulfillmentType === 'delivery'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">Eco Delivery Van</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Temperature controlled transit. ₹45 logistics fee.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">2. Payment & Simulation</h3>
            <div className="grid grid-cols-3 gap-3">
              {['UPI', 'Card', 'NetBanking'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                    paymentMethod === method
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              * Simulated for College Project evaluation: No real money is deducted from bank accounts.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 h-fit space-y-6">
          <h3 className="font-extrabold text-base text-slate-900">Order Summary</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Rescued Food Portion(s)</span>
              <span className="font-bold text-slate-900">{subtotal === 0 ? 'FREE' : `₹${subtotal}`}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Logistics</span>
              <span className="font-bold text-slate-900">₹{deliveryFee}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
              <span>Total</span>
              <span className="text-emerald-700">₹{grandTotal}</span>
            </div>
          </div>

          <button
            onClick={handleConfirmAndPay}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Processing Order...' : 'Confirm Food Rescue Order'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### `src/views/ImpactPage.jsx`

Purpose: Real-time public dashboard showcasing environmental metrics: kilograms of food rescued, total meals distributed, CO₂ emissions prevented, and numbers of participating hotels and NGO centers.

```jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Utensils, 
  Scale, 
  Users, 
  Building2, 
  HeartHandshake, 
  CheckCircle, 
  TrendingUp,
  Leaf,
  Globe,
  Award
} from 'lucide-react';

export const ImpactPage = () => {
  const { 
    totalMealsRescued, 
    totalKgRescued, 
    totalPeopleServed,
    hotels,
    trusts,
    orders
  } = useApp();

  const completedOrdersCount = orders.filter(o => o.orderStatus === 'Completed').length + 42;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Environmental & Social Impact Dashboard
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading">
          Rescuing Food. Transforming Lives.
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Real-time metrics tracking surplus food redirected from landfills to communities in need.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase">Total Meals Rescued</span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
              {totalMealsRescued.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-emerald-800 font-semibold">↑ 14% increase this week</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/80 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase">Food Waste Avoided</span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
              {totalKgRescued.toLocaleString()} kg
            </p>
          </div>
          <p className="text-[11px] text-teal-800 font-semibold">450 kg of food rescued this month</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase">People Served</span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
              {totalPeopleServed.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-blue-800 font-semibold">Across 42 shelter centers</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase">Completed Rescue Orders</span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
              {completedOrdersCount}
            </p>
          </div>
          <p className="text-[11px] text-amber-800 font-semibold">100% verified fulfillment</p>
        </div>
      </div>
    </div>
  );
};
```

---

## 5. Interactive Components & Modals

### `src/components/FoodCard.jsx`

Purpose: Reusable marketplace card rendering food photograph, dynamic expiry countdown, hotel details, dietary badges, portion pricing, and quick-order actions.

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { calculateFoodStatus, formatFoodTimeDisplay } from '../utils/expiryUtils';
import { 
  Clock, 
  MapPin, 
  Building2, 
  ShoppingBag, 
  Eye, 
  Tag, 
  Trash2,
  Edit3
} from 'lucide-react';

export const FoodCard = ({ food, onOpenDetails, onQuickOrder, onDelete }) => {
  const { currentRole, deleteFoodListing } = useApp();
  const isHotelAuthorized = currentRole === 'hotel' || currentRole === 'admin';

  const isFoodCollected = food.status === 'Collected' || food.quantity <= 0;
  const [expiryInfo, setExpiryInfo] = useState(() => 
    calculateFoodStatus(food.preparedTime, food.bestBeforeTime, isFoodCollected)
  );

  useEffect(() => {
    const updateExpiry = () => {
      setExpiryInfo(calculateFoodStatus(food.preparedTime, food.bestBeforeTime, isFoodCollected));
    };
    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);
    return () => clearInterval(interval);
  }, [food.preparedTime, food.bestBeforeTime, isFoodCollected]);

  return (
    <div className={`group bg-white rounded-3xl border border-slate-200/90 transition-all duration-300 hover:shadow-xl flex flex-col relative overflow-hidden ${
      expiryInfo.isExpired ? 'opacity-85 ring-1 ring-rose-300' : ''
    }`}>
      {/* Food Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={getMatchingFoodImage(food.name, food.category, food.image)}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
            food.dietary === 'Veg' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {food.dietary || 'Veg'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-slate-800 backdrop-blur-sm">
            {food.category}
          </span>
        </div>

        {/* Dynamic Countdown Badge */}
        <div className="absolute bottom-3 right-3">
          <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 shadow-md ${expiryInfo.badgeClass}`}>
            <Clock className="w-3.5 h-3.5" />
            {expiryInfo.formattedCountdown}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
            {food.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
            {food.description}
          </p>

          <div className="mt-3 space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{food.hotelName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{food.hotelLocation} • {food.distanceKm || 2.5} km away</span>
            </div>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Available</span>
            <p className="text-sm font-extrabold text-slate-800 font-mono">
              {food.quantity} {food.unit || 'portions'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base font-black text-emerald-700">
              {food.price === 0 ? 'FREE' : `₹${food.price}`}
            </span>

            <button
              onClick={onQuickOrder}
              disabled={expiryInfo.isExpired || food.quantity <= 0}
              className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all ${
                expiryInfo.isExpired || food.quantity <= 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### `src/components/CartDrawer.jsx`

Purpose: Slide-over drawer displaying selected food items, portion adjustments, logistics calculations, and food safety validation (preventing checkout of expired items).

```jsx
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
    setActiveView
  } = useApp();

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.food.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 45 : 0;
  const grandTotal = subtotal + deliveryFee;

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
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100">
          
          {/* Header */}
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
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-100">
            {cart.map(({ food, quantity }) => (
              <div key={food.id} className="pt-4 first:pt-0 flex gap-4">
                <img
                  src={getMatchingFoodImage(food.name, food.category, food.image)}
                  alt={food.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                />
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {food.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(food.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
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
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs w-5 text-center font-mono">{quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(food.id, Math.min(food.quantity, quantity + 1))}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold text-xs"
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
            ))}
          </div>

          {/* Footer Summary */}
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

              {hasExpiredItem && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p><strong>Warning:</strong> Expired food in cart. Remove before checkout.</p>
                </div>
              )}

              <button
                onClick={handleProceedToCheckout}
                disabled={hasExpiredItem}
                className={`w-full py-3.5 rounded-xl text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 ${
                  hasExpiredItem ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
```

---

### `src/components/QrVerificationModal.jsx`

Purpose: Hotel handover interface supporting live camera QR scanning and manual 6-digit PIN verification (`MC-XXXX`) to securely transfer food ownership.

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck
} from 'lucide-react';

export const QrVerificationModal = ({ isOpen, onClose }) => {
  const { orders, currentUser, verifyPickup } = useApp();
  const [inputCode, setInputCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  if (!isOpen) return null;

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || inputCode;
    if (!code.trim()) {
      setVerificationResult({ success: false, error: 'Please enter a valid Order ID or Pickup PIN.' });
      return;
    }

    const res = await verifyPickup(code, currentUser);
    setVerificationResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">Food Pickup QR Verification</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-extrabold uppercase text-slate-700">
              Enter 6-Digit Pickup PIN or Order ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. MC-8801 or ORD-2026-8801"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase"
              />
              <button
                type="button"
                onClick={() => handleVerify(inputCode)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
              >
                Verify & Handover
              </button>
            </div>
          </div>

          {verificationResult && (
            <div className={`p-4 rounded-2xl border text-xs ${
              verificationResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              {verificationResult.success ? (
                <div className="space-y-1">
                  <p className="font-bold text-emerald-800">Pickup Successfully Verified!</p>
                  <p>Order ID: {verificationResult.order?.id}</p>
                  <p>Trust: {verificationResult.order?.trustName}</p>
                </div>
              ) : (
                <p className="text-rose-800 font-bold">{verificationResult.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 6. Utility & Helper Functions

### `src/utils/dateUtils.js`

Purpose: Standardizes date rendering across receipts, order cards, and audit tables.

```javascript
/**
 * Formats a date/timestamp into "DD MMM YYYY, HH:MM AM/PM"
 * Example: "08 Oct 2026, 10:45 PM"
 */
export const formatOrderDateTime = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
};
```

---

### `src/utils/qrUtils.js`

Purpose: Generates scannable QR Code Data URLs and creates deterministic 6-digit pickup PINs (`MC-XXXX`).

```javascript
import QRCode from 'qrcode';

/**
 * Generates a high-resolution QR code Data URL for an order.
 */
export const generateOrderQRCode = async (orderData) => {
  try {
    const payload = JSON.stringify({
      orderId: orderData.id,
      pickupCode: orderData.pickupCode || `MC-${orderData.id.slice(-4)}`,
      hotelId: orderData.hotelId,
      hotelName: orderData.hotelName,
      trustName: orderData.trustName,
      foodName: orderData.foodName,
      quantity: `${orderData.quantity} ${orderData.unit || 'portions'}`,
      verified: false,
      timestamp: new Date().toISOString()
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });

    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
};

/**
 * Generate a clean 6-digit alphanumeric pickup PIN
 */
export const generatePickupPin = (orderId = '') => {
  const digits = (orderId.replace(/[^0-9]/g, '') + '8921').slice(-4);
  const chars = 'MC';
  return `${chars}-${digits}`;
};
```

---

### `src/utils/expiryUtils.js`

Purpose: Implements dynamic shelf-life logic, countdown tickers, and status color coding (`Fresh`, `Expiring Soon`, `Expired`, `Collected`).

```javascript
/**
 * Expiry and Shelf Life Utilities for Meal Connect
 * Implements food safety standards with dynamic live countdown and category-based shelf lives.
 */

export const safeParseDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    const parsed = new Date(val.trim());
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

export const getDefaultShelfLifeHours = (category = '') => {
  const cat = String(category).toLowerCase();
  if (cat.includes('tea') || cat.includes('coffee') || cat.includes('drink')) return 2;
  return 4;
};

export const calculateFoodStatus = (preparedTime, bestBeforeTime, isCollected = false) => {
  if (isCollected) {
    return {
      status: 'Collected',
      label: 'Collected',
      badgeClass: 'bg-blue-600 text-white',
      isExpired: false,
      isExpiringSoon: false,
      isCollected: true,
      formattedCountdown: 'Collected'
    };
  }

  const expiry = safeParseDate(bestBeforeTime);
  const now = new Date();

  if (!expiry) {
    return {
      status: 'Fresh',
      label: 'Fresh',
      badgeClass: 'bg-emerald-600 text-white',
      isExpired: false,
      isExpiringSoon: false,
      formattedCountdown: 'Fresh'
    };
  }

  const diffSeconds = Math.floor((expiry.getTime() - now.getTime()) / 1000);

  if (diffSeconds <= 0) {
    return {
      status: 'Expired',
      label: 'Expired',
      badgeClass: 'bg-rose-600 text-white',
      isExpired: true,
      isExpiringSoon: false,
      formattedCountdown: 'Expired'
    };
  }

  const hours = Math.floor(diffSeconds / 3600);
  const mins = Math.floor((diffSeconds % 3600) / 60);

  if (diffSeconds <= 3600) {
    return {
      status: 'Expiring Soon',
      label: 'Expiring Soon',
      badgeClass: 'bg-amber-600 text-white animate-pulse',
      isExpired: false,
      isExpiringSoon: true,
      formattedCountdown: `${mins}m left`
    };
  }

  return {
    status: 'Fresh',
    label: 'Fresh',
    badgeClass: 'bg-emerald-600 text-white',
    isExpired: false,
    isExpiringSoon: false,
    formattedCountdown: `${hours}h ${mins}m left`
  };
};

export const formatFoodTimeDisplay = (dateVal) => {
  const d = safeParseDate(dateVal);
  if (!d) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
```
