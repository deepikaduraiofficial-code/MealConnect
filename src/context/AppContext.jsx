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
import { isDeletedImage, isValidFoodImage } from '../utils/foodImageResolver';
import { calculateFoodStatus, getDefaultExpiryTimes } from '../utils/expiryUtils';
import { generateOrderQRCode, generatePickupPin } from '../utils/qrUtils';
import { api } from '../services/api';

const AppContext = createContext();

// Unwanted duplicate / invalid item IDs confirmed for removal
export const REMOVED_FOOD_IDS = new Set([
  'food-20',  // Duplicate Chapati
  'food-105', // Duplicate Chapati
  'food-50',  // Murukku (no image)
  'food-51',  // Mixture (no image)
  'food-52',  // Sundal (no image)
  'food-53',  // Pani Puri (no image)
  'food-54',  // Masala Puri (no image)
  'food-56',  // Cutlet (no image)
  'food-57',  // Vegetable Cutlet (no image)
  'food-60'   // Spring Roll (no image)
]);

export const isValidFoodItem = (item) => {
  if (!item || !item.name) return false;
  const id = String(item.id || item._id || '');
  if (id && REMOVED_FOOD_IDS.has(id)) return false;
  return isValidFoodImage(item.image);
};

const normalizeDietary = (dietary) => {
  if (dietary === 'Non-Veg' || dietary === 'Non-Vegetarian') {
    return 'Non-Veg';
  }
  return 'Veg';
};

const sanitizeFoodItem = (item) => {
  if (!item) return item;
  const currentImg = item.image;
  const cleanImg = (!currentImg || isDeletedImage(currentImg))
    ? ''
    : currentImg;
  return {
    ...item,
    image: cleanImg,
    dietary: normalizeDietary(item.dietary)
  };
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
    return localStorage.getItem('fm_active_tracking_order_id') || null;
  });

  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [mapModalData, setMapModalData] = useState(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState(null);

  // Entities state with initial fallbacks
  const [hotels, setHotels] = useState(() => {
    const saved = localStorage.getItem('fm_hotels');
    return saved ? JSON.parse(saved) : INITIAL_HOTELS;
  });

  const [trusts, setTrusts] = useState(() => {
    const saved = localStorage.getItem('fm_trusts');
    return saved ? JSON.parse(saved) : INITIAL_TRUSTS;
  });

  const [listings, setListings] = useState(() => {
    // Purge outdated caches with old image references and invalid cards
    try {
      localStorage.removeItem('fm_listings');
      localStorage.removeItem('fm_listings_v2');
      localStorage.removeItem('fm_listings_v3');
      localStorage.removeItem('fm_listings_v4');
    } catch (e) {}

    const saved = localStorage.getItem('fm_listings_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.filter(isValidFoodItem).map(sanitizeFoodItem);
          if (sanitized.length > 0) {
            localStorage.setItem('fm_listings_v5', JSON.stringify(sanitized));
            return sanitized;
          }
        }
      } catch (e) {}
    }
    const initials = getInitialFoodListings().filter(isValidFoodItem).map(sanitizeFoodItem);
    try {
      localStorage.setItem('fm_listings_v5', JSON.stringify(initials));
    } catch (e) {}
    return initials;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('fm_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(o => ({
            ...o,
            foodImage: (!o.foodImage || isDeletedImage(o.foodImage))
              ? ''
              : o.foodImage,
            food: o.food ? sanitizeFoodItem(o.food) : o.food,
            pickupCode: o.pickupCode || `MC-${(o.id || '9000').slice(-4)}`,
            isQrVerified: o.isQrVerified ?? (o.orderStatus === 'Collected' || o.orderStatus === 'Completed'),
            pickupVerification: o.pickupVerification || null
          }));
        }
      } catch (e) {}
    }
    return INITIAL_ORDERS.map(o => ({
      ...o,
      foodImage: (!o.foodImage || isDeletedImage(o.foodImage))
        ? ''
        : o.foodImage,
      food: o.food ? sanitizeFoodItem(o.food) : o.food
    }));
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('fm_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter(item => item && isValidFoodItem(item.food))
            .map(item => ({
              ...item,
              food: sanitizeFoodItem(item.food)
            }));
        }
      } catch (e) {}
    }
    return [];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('fm_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [isCartOpen, setIsCartOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim();
      if (hash === 'cart') return true;
    }
    return localStorage.getItem('fm_is_cart_open') === 'true';
  });

  const [toast, setToast] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [adminStats, setAdminStats] = useState(null);

  // Toast alert trigger helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch initial data from backend APIs
  const refreshBackendData = useCallback(async () => {
    try {
      // 1. Fetch Listings
      const listingsRes = await api.food.getListings().catch(() => null);
      if (listingsRes && listingsRes.success && Array.isArray(listingsRes.data) && listingsRes.data.length > 0) {
        const sanitized = listingsRes.data
          .filter(isValidFoodItem)
          .map(item => sanitizeFoodItem({
            ...item,
            id: item.id || item._id
          }));
        if (sanitized.length > 0) {
          setListings(sanitized);
          localStorage.setItem('fm_listings_v5', JSON.stringify(sanitized));
        }
      }

      // 2. Fetch Hotels
      const hotelsRes = await api.auth.getHotels().catch(() => null);
      if (hotelsRes && hotelsRes.success && Array.isArray(hotelsRes.data)) {
        setHotels(hotelsRes.data);
        localStorage.setItem('fm_hotels', JSON.stringify(hotelsRes.data));
      }

      // 3. Fetch Trusts
      const trustsRes = await api.auth.getTrusts().catch(() => null);
      if (trustsRes && trustsRes.success && Array.isArray(trustsRes.data)) {
        setTrusts(trustsRes.data);
        localStorage.setItem('fm_trusts', JSON.stringify(trustsRes.data));
      }

      // 4. Fetch Orders (if authenticated)
      const token = localStorage.getItem('fm_token');
      if (token) {
        const ordersRes = await api.orders.getAll().catch(() => null);
        if (ordersRes && ordersRes.success && Array.isArray(ordersRes.data)) {
          const sanitizedOrders = ordersRes.data.map(o => ({
            ...o,
            id: o.orderId || o.id || o._id,
            pickupCode: o.pickupCode || `MC-${(o.orderId || o.id || '9000').slice(-4)}`
          }));
          setOrders(sanitizedOrders);
          localStorage.setItem('fm_orders', JSON.stringify(sanitizedOrders));
        }

        // Fetch Cart
        const cartRes = await api.cart.get().catch(() => null);
        if (cartRes && cartRes.success && Array.isArray(cartRes.data)) {
          setCart(cartRes.data);
          localStorage.setItem('fm_cart', JSON.stringify(cartRes.data));
        }

        // Fetch Notifications
        const notifsRes = await api.notifications.getAll().catch(() => null);
        if (notifsRes && notifsRes.success && Array.isArray(notifsRes.data)) {
          setNotifications(notifsRes.data);
          localStorage.setItem('fm_notifications', JSON.stringify(notifsRes.data));
        }
      }

      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend sync note: operating in hybrid local mode', err);
    }
  }, []);

  // Sync data with backend on component mount
  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  // Save state to localStorage on change for offline resilience
  useEffect(() => {
    localStorage.setItem('fm_role', currentRole);
    if (currentUser) {
      localStorage.setItem('fm_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fm_user');
    }
    localStorage.setItem('fm_hotels', JSON.stringify(hotels));
    localStorage.setItem('fm_trusts', JSON.stringify(trusts));
    const validListings = listings.filter(isValidFoodItem);
    localStorage.setItem('fm_listings_v5', JSON.stringify(validListings));
    try {
      localStorage.removeItem('fm_listings_v4');
      localStorage.removeItem('fm_listings_v3');
      localStorage.removeItem('fm_listings');
    } catch (e) {}
    localStorage.setItem('fm_orders', JSON.stringify(orders));
    localStorage.setItem('fm_cart', JSON.stringify(cart));
    localStorage.setItem('fm_notifications', JSON.stringify(notifications));
  }, [currentRole, currentUser, hotels, trusts, listings, orders, cart, notifications]);

  // Sync activeView with localStorage & URL hash
  useEffect(() => {
    localStorage.setItem('fm_active_view', activeView);
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      const targetHash = activeView === 'landing' ? '' : activeView;
      if (currentHash !== targetHash) {
        if (targetHash === '') {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
          window.location.hash = targetHash;
        }
      }
    }
  }, [activeView]);

  // Sync activeTrackingOrderId with localStorage
  useEffect(() => {
    if (activeTrackingOrderId) {
      localStorage.setItem('fm_active_tracking_order_id', activeTrackingOrderId);
    } else {
      localStorage.removeItem('fm_active_tracking_order_id');
    }
  }, [activeTrackingOrderId]);

  // Sync isCartOpen with localStorage
  useEffect(() => {
    localStorage.setItem('fm_is_cart_open', isCartOpen ? 'true' : 'false');
  }, [isCartOpen]);

  // Handle browser Back / Forward navigation (popstate & hashchange)
  useEffect(() => {
    const handleNavigation = () => {
      const view = getViewFromUrlOrStorage();
      if (view && VALID_VIEWS.includes(view)) {
        setActiveView(view);
      }
      const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      const queryId = hashParams.get('orderId') || new URLSearchParams(window.location.search).get('orderId');
      if (queryId) {
        setActiveTrackingOrderId(queryId);
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  // Hotel Authentication Flow (Connected to Backend)
  const loginHotel = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both Hotel Email ID and Password.' };
    }

    try {
      const res = await api.auth.loginHotel(email, password);
      if (res.success && res.token) {
        localStorage.setItem('fm_token', res.token);
        setCurrentRole('hotel');
        setCurrentUser(res.user);
        setActiveView('hotel-dashboard');
        showToast(res.message || `Logged in as Hotel: ${res.user.name}`);
        refreshBackendData();
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Hotel login failed' };
    } catch (err) {
      // Local fallback for offline demo
      const cleanEmail = email.trim().toLowerCase();
      const found = hotels.find(h => h.email.toLowerCase() === cleanEmail);
      if (found) {
        setCurrentRole('hotel');
        setCurrentUser(found);
        setActiveView('hotel-dashboard');
        showToast(`Logged in as Hotel: ${found.name}`);
        return { success: true, user: found };
      }
      return { success: false, error: err.message || 'No hotel account found with this Email ID.' };
    }
  };

  const registerHotel = async ({ name, email, password, ownerName, phone, location }) => {
    if (!name?.trim() || !email?.trim() || !password?.trim() || !ownerName?.trim() || !phone?.trim() || !location?.trim()) {
      return { success: false, error: 'Please fill in all required Hotel registration fields.' };
    }

    try {
      const res = await api.auth.registerHotel({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        location: location.trim(),
        address: location.trim()
      });

      if (res.success && res.token) {
        localStorage.setItem('fm_token', res.token);
        setCurrentRole('hotel');
        setCurrentUser(res.user);
        setHotels(prev => [res.user, ...prev]);
        setActiveView('hotel-dashboard');
        showToast(res.message || `Hotel registered successfully! Welcome, ${res.user.name}`);
        refreshBackendData();
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (err) {
      return { success: false, error: err.message || 'Hotel registration failed. Please try again.' };
    }
  };

  // Trust / NGO Authentication Flow (Connected to Backend)
  const loginTrust = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both Trust / NGO Email ID and Password.' };
    }

    try {
      const res = await api.auth.loginTrust(email, password);
      if (res.success && res.token) {
        localStorage.setItem('fm_token', res.token);
        setCurrentRole('trust');
        setCurrentUser(res.user);
        setActiveView('trust-dashboard');
        showToast(res.message || `Logged in as Trust / NGO: ${res.user.name}`);
        refreshBackendData();
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Trust login failed' };
    } catch (err) {
      // Local fallback for offline demo
      const cleanEmail = email.trim().toLowerCase();
      const found = trusts.find(t => t.email.toLowerCase() === cleanEmail);
      if (found) {
        setCurrentRole('trust');
        setCurrentUser(found);
        setActiveView('trust-dashboard');
        showToast(`Logged in as Trust / NGO: ${found.name}`);
        return { success: true, user: found };
      }
      return { success: false, error: err.message || 'No Trust / NGO account found with this Email ID.' };
    }
  };

  const registerTrust = async ({ name, email, password, phone, location }) => {
    if (!name?.trim() || !email?.trim() || !password?.trim() || !phone?.trim() || !location?.trim()) {
      return { success: false, error: 'Please fill in all required Trust / NGO registration fields.' };
    }

    try {
      const res = await api.auth.registerTrust({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        location: location.trim(),
        address: location.trim()
      });

      if (res.success && res.token) {
        localStorage.setItem('fm_token', res.token);
        setCurrentRole('trust');
        setCurrentUser(res.user);
        setTrusts(prev => [res.user, ...prev]);
        setActiveView('trust-dashboard');
        showToast(res.message || `Trust / NGO registered successfully! Welcome, ${res.user.name}`);
        refreshBackendData();
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (err) {
      return { success: false, error: err.message || 'Trust registration failed. Please try again.' };
    }
  };

  // Dedicated Admin Authentication Flow (No public registration endpoint!)
  const loginAdmin = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both Admin Email ID and Password.' };
    }

    try {
      const res = await api.auth.loginAdmin(email, password);
      if (res.success && res.token) {
        localStorage.setItem('fm_token', res.token);
        setCurrentRole('admin');
        setCurrentUser(res.user);
        setActiveView('admin-dashboard');
        showToast(res.message || 'Logged in as Master Administrator');
        refreshBackendData();
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Admin login failed' };
    } catch (err) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'admin@foodrescue.org') {
        const adminUser = {
          id: 'admin-master',
          name: 'Master System Administrator',
          role: 'admin',
          email: cleanEmail,
          accessLevel: 'SuperAdmin'
        };
        setCurrentRole('admin');
        setCurrentUser(adminUser);
        setActiveView('admin-dashboard');
        showToast('Logged in as Master Administrator');
        return { success: true, user: adminUser };
      }
      return { success: false, error: err.message || 'Invalid Admin credentials.' };
    }
  };

  // Switch active user role (Demo friendly)
  const switchRole = (role, defaultUser = null) => {
    setCurrentRole(role);
    if (role === 'guest') {
      setCurrentUser(null);
      setActiveView('landing');
      localStorage.removeItem('fm_token');
    } else if (role === 'hotel') {
      const user = defaultUser || hotels[0];
      setCurrentUser(user);
      setActiveView('hotel-dashboard');
      showToast(`Switched to Hotel: ${user.name}`);
    } else if (role === 'trust') {
      const user = defaultUser || trusts[0];
      setCurrentUser(user);
      setActiveView('trust-dashboard');
      showToast(`Switched to Trust / NGO: ${user.name}`);
    } else if (role === 'admin') {
      setCurrentUser({ name: 'Master System Administrator', role: 'admin', email: 'admin@foodrescue.org' });
      setActiveView('admin-dashboard');
      showToast('Switched to Admin');
    }
  };

  // Universal Logout
  const logout = () => {
    setCurrentRole('guest');
    setCurrentUser(null);
    setActiveView('landing');
    localStorage.removeItem('fm_user');
    localStorage.removeItem('fm_token');
    localStorage.setItem('fm_role', 'guest');
    localStorage.setItem('fm_active_view', 'landing');
    if (typeof window !== 'undefined') {
      window.location.hash = '';
      window.history.replaceState(null, '', window.location.pathname);
    }
    showToast('Logged out successfully', 'info');
  };

  // Add Food Listing (Backend Connected)
  const addFoodListing = async (newListingData) => {
    const hotel = currentUser || hotels[0];
    const defaultTimes = getDefaultExpiryTimes(
      newListingData.category || 'Cooked Meals', 
      newListingData.preparedTime || new Date()
    );

    const preparedTime = newListingData.preparedTime 
      ? new Date(newListingData.preparedTime).toISOString() 
      : defaultTimes.preparedTime;

    const bestBeforeTime = newListingData.bestBeforeTime 
      ? new Date(newListingData.bestBeforeTime).toISOString() 
      : defaultTimes.bestBeforeTime;

    const payload = {
      ...newListingData,
      preparedTime,
      bestBeforeTime,
      dietary: normalizeDietary(newListingData.dietary)
    };

    try {
      const res = await api.food.create(payload);
      if (res && res.success && res.data) {
        const created = {
          ...res.data,
          id: res.data.id || res.data._id
        };
        setListings(prev => [created, ...prev]);
        showToast('Food listing created successfully!');
        refreshBackendData();
        return created;
      }
    } catch (err) {
      console.warn('Backend food create note:', err.message);
    }

    // Local fallback
    const newId = `food-${Date.now()}`;
    const newListing = {
      id: newId,
      hotelId: hotel.id || hotel._id,
      hotelName: hotel.name,
      hotelLocation: hotel.location || 'Bengaluru',
      coordinates: hotel.coordinates || { lat: 12.9716, lng: 77.5946 },
      status: 'Available',
      distanceKm: (Math.random() * 4 + 1).toFixed(1),
      ...payload
    };

    setListings(prev => [newListing, ...prev]);

    const newNotif = {
      id: `notif-${Date.now()}`,
      roleTarget: 'Trust',
      title: '🍲 New Food Available',
      message: `${hotel.name} posted ${newListing.quantity} ${newListing.unit} of ${newListing.name}!`,
      timestamp: 'Just now',
      read: false,
      type: 'new_food'
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast('Food listing created successfully!');
    return newListing;
  };

  // Update Food Listing (Backend Connected)
  const updateFoodListing = async (updatedListing) => {
    const sanitized = {
      ...updatedListing,
      dietary: normalizeDietary(updatedListing.dietary)
    };

    const targetId = updatedListing._id || updatedListing.id;

    try {
      if (targetId && !targetId.startsWith('food-demo')) {
        await api.food.update(targetId, sanitized).catch(() => null);
      }
    } catch (e) {}

    setListings(prev => prev.map(item => (item.id === targetId || item._id === targetId) ? { ...item, ...sanitized } : item));
    showToast('Listing updated successfully!');
  };

  // Delete Food Listing (Backend Connected)
  const deleteFoodListing = async (listingId) => {
    try {
      if (listingId && !listingId.startsWith('food-demo')) {
        await api.food.delete(listingId).catch(() => null);
      }
    } catch (e) {}

    setListings(prev => prev.filter(item => item.id !== listingId && item._id !== listingId));
    setCart(prev => prev.filter(c => c.food.id !== listingId && c.food._id !== listingId));
    if (selectedFoodForDetail && (selectedFoodForDetail.id === listingId || selectedFoodForDetail._id === listingId)) {
      setSelectedFoodForDetail(null);
    }
    showToast('Food item deleted successfully', 'success');
  };

  // Permanently Delete Food Image - Removes listing to completely prevent empty/black cards from returning
  const deleteFoodImage = async (listingId) => {
    try {
      if (listingId && !String(listingId).startsWith('food-demo')) {
        await api.food.delete(listingId).catch(() => null);
      }
    } catch (e) {
      console.warn('Backend food delete note:', e.message);
    }

    setListings(prev => prev.filter(item => item.id !== listingId && item._id !== listingId));
    setCart(prev => prev.filter(c => c.food.id !== listingId && c.food._id !== listingId));
    if (selectedFoodForDetail && (selectedFoodForDetail.id === listingId || selectedFoodForDetail._id === listingId)) {
      setSelectedFoodForDetail(null);
    }

    showToast('Food listing with removed image deleted successfully', 'success');
  };

  // Cart operations (Backend Connected with local sync)
  const addToCart = async (food, qty = 1) => {
    if (qty <= 0) return;
    const expiry = calculateFoodStatus(food.preparedTime, food.bestBeforeTime);
    if (expiry.isExpired) {
      showToast('⚠️ Cannot add expired food to cart. This item is no longer safe for consumption.', 'error');
      return;
    }

    try {
      const foodId = food._id || food.id;
      if (localStorage.getItem('fm_token')) {
        await api.cart.add(foodId, qty).catch(() => null);
      }
    } catch (e) {}

    setCart((prev) => {
      const existing = prev.find(item => item.food.id === food.id || item.food._id === food._id);
      if (existing) {
        const newQty = Math.min(food.quantity, existing.quantity + qty);
        showToast(`Updated quantity in cart (${newQty})`);
        return prev.map(item => (item.food.id === food.id || item.food._id === food._id) ? { ...item, quantity: newQty } : item);
      } else {
        showToast(`Added ${food.name} to Cart`);
        return [...prev, { food, quantity: qty }];
      }
    });
  };

  const updateCartQuantity = async (foodId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(foodId);
      return;
    }

    try {
      if (localStorage.getItem('fm_token')) {
        await api.cart.updateQuantity(foodId, newQty).catch(() => null);
      }
    } catch (e) {}

    setCart((prev) => prev.map(item => (item.food.id === foodId || item.food._id === foodId) ? { ...item, quantity: newQty } : item));
  };

  const removeFromCart = async (foodId) => {
    try {
      if (localStorage.getItem('fm_token')) {
        await api.cart.remove(foodId).catch(() => null);
      }
    } catch (e) {}

    setCart((prev) => prev.filter(item => item.food.id !== foodId && item.food._id !== foodId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = async () => {
    try {
      if (localStorage.getItem('fm_token')) {
        await api.cart.clear().catch(() => null);
      }
    } catch (e) {}
    setCart([]);
  };

  // Place Order & Generate Payment Transaction (Backend Connected)
  const placeOrder = async (orderData) => {
    const food = orderData.food;
    const expiry = calculateFoodStatus(food.preparedTime, food.bestBeforeTime);
    if (expiry.isExpired) {
      showToast('⚠️ This food item has expired and cannot be ordered.', 'error');
      return null;
    }

    const trust = currentUser || trusts[0];
    const foodId = food._id || food.id;

    // Try backend order creation first
    try {
      const res = await api.orders.create({
        foodId,
        quantity: orderData.quantity,
        fulfillmentType: orderData.fulfillmentType || 'pickup',
        paymentMethod: orderData.paymentMethod || 'UPI',
        paymentTxnId: orderData.paymentTxnId,
        notes: orderData.notes || ''
      });

      if (res && res.success && res.data) {
        const serverOrder = {
          ...res.data,
          id: res.data.orderId || res.data.id || res.data._id
        };

        setOrders(prev => [serverOrder, ...prev]);
        setLastPlacedOrder(serverOrder);
        setCart(prev => prev.filter(c => c.food.id !== foodId && c.food._id !== foodId));

        // Deduct remaining locally
        setListings(prev => prev.map(item => {
          if (item.id === foodId || item._id === foodId) {
            const rem = Math.max(0, item.quantity - orderData.quantity);
            return { ...item, quantity: rem, status: rem <= 0 ? 'Ordered' : 'Available' };
          }
          return item;
        }));

        refreshBackendData();
        return serverOrder;
      }
    } catch (err) {
      console.warn('Backend order placement note:', err.message);
    }

    // Local fallback if server unreachable
    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txnId = `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const pickupPin = generatePickupPin(orderId);

    const newOrder = {
      id: orderId,
      trustId: trust.id || trust._id,
      trustName: trust.name,
      hotelId: food.hotelId || food.hotel,
      hotelName: food.hotelName,
      hotelLocation: food.hotelLocation,
      pickupLocation: food.pickupLocation || food.hotelLocation,
      foodId: food.id || food._id,
      foodName: food.name,
      foodImage: food.image,
      quantity: orderData.quantity,
      unit: food.unit || 'portions',
      pricePerUnit: food.price,
      subtotal: food.price * orderData.quantity,
      deliveryCharge: orderData.fulfillmentType === 'delivery' ? 45 : 0,
      totalAmount: (food.price * orderData.quantity) + (orderData.fulfillmentType === 'delivery' ? 45 : 0),
      fulfillmentType: orderData.fulfillmentType || 'pickup',
      paymentMethod: orderData.paymentMethod || 'UPI',
      paymentTxnId: txnId,
      paymentStatus: 'Payment Successful',
      orderStatus: 'Food Ready',
      orderDate: new Date().toISOString(),
      estimatedDelivery: 'Ready for Pickup / Verification',
      notes: orderData.notes || '',
      pickupCode: pickupPin,
      qrCodeDataUrl: '',
      isQrVerified: false,
      pickupVerification: null,
      timeline: [
        { status: "Order Placed", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
        { status: "Hotel Confirmed", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
        { status: "Food Ready", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
        { status: "Picked Up", time: "Pending", done: false },
        { status: "Delivered", time: "Pending", done: false },
        { status: "Completed", time: "Pending", done: false }
      ]
    };

    generateOrderQRCode(newOrder).then(dataUrl => {
      if (dataUrl) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, qrCodeDataUrl: dataUrl } : o));
      }
    }).catch(console.error);

    setListings(prev => prev.map(item => {
      if (item.id === food.id || item._id === food._id) {
        const rem = item.quantity - orderData.quantity;
        return {
          ...item,
          quantity: Math.max(0, rem),
          status: rem <= 0 ? 'Ordered' : 'Available'
        };
      }
      return item;
    }));

    setOrders(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    setCart(prev => prev.filter(c => c.food.id !== food.id && c.food._id !== food._id));

    return newOrder;
  };

  // Hotel QR Code / PIN Pickup Verification (Backend Connected)
  const verifyPickup = async (orderIdOrPin, hotelUser) => {
    if (!hotelUser) {
      return { success: false, error: 'User session not found. Please log in.' };
    }

    const cleanInput = (orderIdOrPin || '').trim().toUpperCase();
    if (!cleanInput) {
      return { success: false, error: 'Please enter a valid Order ID or Pickup PIN.' };
    }

    try {
      const res = await api.orders.verifyPickup(cleanInput);
      if (res && res.success && res.data) {
        const updated = {
          ...res.data,
          id: res.data.orderId || res.data.id || res.data._id
        };
        setOrders(prev => prev.map(o => (o.id === updated.id || o.orderId === updated.orderId) ? updated : o));
        showToast(res.message || `✓ QR Pickup Verified! Order ${updated.id} marked as Collected.`);
        refreshBackendData();
        return { success: true, order: updated };
      }
    } catch (err) {
      // If error came from server (e.g. duplicate verification, unauthorized), return it
      if (err.message && !err.message.includes('fetch') && !err.message.includes('connect')) {
        return { success: false, error: err.message };
      }
    }

    // Local fallback
    const order = orders.find(o => 
      (o.id && o.id.toUpperCase() === cleanInput) || 
      (o.pickupCode && o.pickupCode.toUpperCase() === cleanInput)
    );

    if (!order) {
      return { 
        success: false, 
        error: `No food order found matching "${cleanInput}". Please double check the QR code or PIN.` 
      };
    }

    const isSuperAdmin = currentRole === 'admin' || hotelUser.role === 'admin';
    const isOwnerHotel = order.hotelId === hotelUser.id || order.hotelName === hotelUser.name;

    if (!isOwnerHotel && !isSuperAdmin) {
      return {
        success: false,
        error: `Authorization Restricted: Order ${order.id} belongs to "${order.hotelName}". You are signed in as "${hotelUser.name}". Only the donating hotel can verify pickup.`
      };
    }

    if (order.isQrVerified || order.orderStatus === 'Collected' || order.orderStatus === 'Completed') {
      const verifiedAt = order.pickupVerification 
        ? `${order.pickupVerification.pickupDate} at ${order.pickupVerification.pickupTime}`
        : 'previously';
      return {
        success: false,
        error: `Duplicate Verification Prevented: Order ${order.id} was already collected and verified on ${verifiedAt}. This QR code has expired.`
      };
    }

    const now = new Date();
    const dayStr = String(now.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${dayStr} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const pickupRecord = {
      pickupDate: formattedDate,
      pickupTime: formattedTime,
      orderId: order.id,
      hotelName: order.hotelName,
      trustName: order.trustName,
      foodItem: order.foodName,
      collectedQuantity: `${order.quantity} ${order.unit || 'portions'}`,
      verifiedBy: hotelUser.name || 'Hotel Front Desk'
    };

    setOrders(prev => prev.map(o => {
      if (o.id === order.id) {
        const updatedTimeline = (o.timeline || []).map(step => {
          if (step.status === 'Picked Up' || step.status === 'Delivered' || step.status === 'Completed') {
            return {
              ...step,
              done: true,
              time: step.time === 'Pending' ? formattedTime : step.time
            };
          }
          return step;
        });

        return {
          ...o,
          orderStatus: 'Collected',
          isQrVerified: true,
          pickupVerification: pickupRecord,
          timeline: updatedTimeline
        };
      }
      return o;
    }));

    showToast(`✓ QR Pickup Verified! Order ${order.id} marked as Collected.`);
    return { success: true, order: { ...order, orderStatus: 'Collected', isQrVerified: true, pickupVerification: pickupRecord } };
  };

  // Advance Order Status (Hotel or Trust action)
  const advanceOrderStatus = async (orderId, newStatus) => {
    try {
      await api.orders.updateStatus(orderId, newStatus).catch(() => null);
    } catch (e) {}

    const statuses = ["Order Placed", "Hotel Confirmed", "Food Ready", "Picked Up", "Delivered", "Completed"];
    
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId || ord.orderId === orderId) {
        const nextIndex = statuses.indexOf(newStatus);
        const updatedTimeline = (ord.timeline || []).map((step, idx) => {
          if (idx <= nextIndex) {
            return {
              ...step,
              done: true,
              time: step.time === "Pending" ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : step.time
            };
          }
          return step;
        });

        return {
          ...ord,
          orderStatus: newStatus,
          timeline: updatedTimeline
        };
      }
      return ord;
    }));

    showToast(`Order ${orderId} status updated to ${newStatus}`);
  };

  // Admin approval toggles (Backend Connected)
  const toggleHotelVerification = async (hotelId) => {
    try {
      await api.auth.toggleHotelVerification(hotelId).catch(() => null);
    } catch (e) {}

    setHotels(prev => prev.map(h => {
      if (h.id === hotelId || h._id === hotelId) {
        const nextState = !h.verified;
        showToast(`Hotel "${h.name}" verification status: ${nextState ? 'Verified ✓' : 'Unverified'}`);
        return { ...h, verified: nextState };
      }
      return h;
    }));
  };

  const toggleTrustVerification = async (trustId) => {
    try {
      await api.auth.toggleTrustVerification(trustId).catch(() => null);
    } catch (e) {}

    setTrusts(prev => prev.map(t => {
      if (t.id === trustId || t._id === trustId) {
        const nextState = !t.verified;
        if (currentUser && (currentUser.id === trustId || currentUser._id === trustId)) {
          setCurrentUser(prevUser => ({ ...prevUser, verified: nextState }));
        }
        showToast(`Trust "${t.name}" verification status: ${nextState ? 'Verified ✓' : 'Pending'}`);
        return { ...t, verified: nextState };
      }
      return t;
    }));
  };

  // Mark notification as read
  const markNotificationAsRead = async (id) => {
    try {
      await api.notifications.markRead(id).catch(() => null);
    } catch (e) {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.notifications.markAllRead().catch(() => null);
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Reset to default data
  const resetDemoData = () => {
    setHotels(INITIAL_HOTELS);
    setTrusts(INITIAL_TRUSTS);
    setListings(INITIAL_FOOD_LISTINGS);
    setOrders(INITIAL_ORDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCart([]);
    localStorage.clear();
    showToast('Demo data reset to initial state');
  };

  // Calculated Live Stats
  const totalMealsRescued = orders.reduce((sum, o) => sum + (parseInt(o.quantity) || 0), 0) + SYSTEM_STATS.mealsRescuedToday;
  const totalKgRescued = Math.round(totalMealsRescued * 0.45);
  const totalPeopleServed = totalMealsRescued * 2;

  return (
    <AppContext.Provider value={{
      currentRole,
      currentUser,
      switchRole,
      activeView,
      setActiveView,
      hotels,
      trusts,
      listings,
      orders,
      cart,
      notifications,
      isCartOpen,
      setIsCartOpen,
      toast,
      showToast,
      selectedFoodForDetail,
      setSelectedFoodForDetail,
      activeTrackingOrderId,
      setActiveTrackingOrderId,
      lastPlacedOrder,
      setLastPlacedOrder,
      mapModalData,
      setMapModalData,
      receiptModalOrder,
      setReceiptModalOrder,
      loginHotel,
      registerHotel,
      loginTrust,
      registerTrust,
      loginAdmin,
      logout,
      addFoodListing,
      updateFoodListing,
      deleteFoodListing,
      deleteFoodImage,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      placeOrder,
      verifyPickup,
      advanceOrderStatus,
      toggleHotelVerification,
      toggleTrustVerification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      resetDemoData,
      totalMealsRescued,
      totalKgRescued,
      totalPeopleServed,
      isBackendConnected,
      refreshBackendData,
      adminStats,
      setAdminStats
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
