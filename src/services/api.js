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
    // If server is unavailable / offline, throw error with clean message
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

    deleteImage: (id) =>
      request(`/food/${id}/image`, {
        method: 'DELETE'
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
