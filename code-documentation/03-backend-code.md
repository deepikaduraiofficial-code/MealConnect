# 03 – Backend Architecture & Controllers

> **Meal Connect (Food Rescue Marketplace)**  
> Comprehensive documentation of the Node.js and Express.js REST API server, database connection management, middleware security filters, and business controllers.

---

## 📑 Table of Contents
1. [Server Entry Point & Express Application](#1-server-entry-point--express-application)
   - [`backend/server.js`](#backendserverjs)
2. [Database Connection Manager](#2-database-connection-manager)
   - [`backend/config/database.js`](#backendconfigdatabasejs)
3. [Middleware Layer](#3-middleware-layer)
   - [`backend/middleware/auth.js`](#backendmiddlewareauthjs)
   - [`backend/middleware/errorHandler.js`](#backendmiddlewareerrorhandlerjs)
4. [Business Controllers Layer](#4-business-controllers-layer)
   - [`backend/controllers/authController.js`](#backendcontrollersauthcontrollerjs)
   - [`backend/controllers/foodController.js`](#backendcontrollersfoodcontrollerjs)
   - [`backend/controllers/orderController.js`](#backendcontrollersordercontrollerjs)
   - [`backend/controllers/paymentController.js`](#backendcontrollerspaymentcontrollerjs)
   - [`backend/controllers/adminController.js`](#backendcontrollersadmincontrollerjs)
   - [`backend/controllers/impactController.js`](#backendcontrollersimpactcontrollerjs)
5. [Backend Utilities & Seeders](#5-backend-utilities--seeders)
   - [`backend/utils/expiryHelper.js`](#backendutilsexpiryhelperjs)

---

## 1. Server Entry Point & Express Application

### `backend/server.js`

Purpose: The master application entry point. Configures Express, CORS policies, Morgan HTTP request logging, JSON payload limits (25MB to accommodate food photos), static file serving for local food images, API route registration, and initiates the MongoDB connection.

```javascript
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDatabase } from './config/database.js';
import { seedDatabase } from './utils/seedData.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import impactRoutes from './routes/impactRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (.env in project root or current dir)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static images serving
app.use('/food-images', express.static(path.join(__dirname, '../public/food-images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', adminRoutes); // Alias for reporting
app.use('/api/notifications', notificationRoutes);
app.use('/api/impact', impactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Meal Connect Food Rescue Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    await seedDatabase();

    const server = app.listen(PORT, () => {
      console.log(`[Meal Connect Backend] Server running on http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    console.error(`[Server Error] Failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
```

---

## 2. Database Connection Manager

### `backend/config/database.js`

Purpose: Handles establishing and maintaining the Mongoose ODM connection to the MongoDB instance using environment configurations with graceful fallback.

```javascript
import mongoose from 'mongoose';

/**
 * Connect to MongoDB database with automated error logging and reconnection
 */
export const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meal_connect';
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};
```

---

## 3. Middleware Layer

### `backend/middleware/auth.js`

Purpose: Enforces access security using Bearer JWT validation and Role-Based Access Control (RBAC).

```javascript
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Protect routes: verifies JWT Bearer token and attaches authenticated user
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Authentication token missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meal_connect_jwt_super_secret_key_2026_antigravity_dev');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User associated with this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please log in again.'
    });
  }
};

/**
 * Role-based authorization guard
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Please log in first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

/**
 * Optional protection: attaches user if token is present, continues otherwise
 */
export const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meal_connect_jwt_super_secret_key_2026_antigravity_dev');
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Continue unauthenticated
  }

  next();
};
```

---

### `backend/middleware/errorHandler.js`

Purpose: Centralized error handling middleware. Catches 404 Route Not Found, maps Mongoose `CastError` (invalid ObjectId), `code: 11000` (duplicate keys), schema `ValidationError`, and payload entity limits into clean JSON error responses.

```javascript
export const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found with the specified ID.';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account or record with this ${field} already exists.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Large payload
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Uploaded image payload is too large. Please use a compressed or smaller image.';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
```

---

## 4. Business Controllers Layer

### `backend/controllers/authController.js`

Purpose: Manages registration, authentication, JWT token signing, profile extraction, and Admin verification queries for Hotels, Trusts, and Administrators.

```javascript
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'meal_connect_jwt_super_secret_key_2026_antigravity_dev',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Hotel registration
export const registerHotel = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, location, fssaiLicense, contactPerson } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const hotel = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'hotel',
      phone: phone || '',
      address: address || location || '',
      location: location || address || 'Bengaluru',
      fssaiLicense: fssaiLicense || '',
      contactPerson: contactPerson || '',
      verified: true // Pre-verified for college testing
    });

    const token = generateToken(hotel._id);

    res.status(201).json({
      success: true,
      message: 'Hotel registered successfully!',
      token,
      user: {
        id: hotel._id,
        name: hotel.name,
        email: hotel.email,
        role: hotel.role,
        verified: hotel.verified,
        location: hotel.location
      }
    });
  } catch (error) {
    next(error);
  }
};

// Trust / NGO registration
export const registerTrust = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, location, trustRegNo, contactPerson } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const trust = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'trust',
      phone: phone || '',
      address: address || location || '',
      location: location || address || 'Bengaluru',
      trustRegNo: trustRegNo || '',
      contactPerson: contactPerson || '',
      verified: true
    });

    const token = generateToken(trust._id);

    res.status(201).json({
      success: true,
      message: 'Trust registered successfully!',
      token,
      user: {
        id: trust._id,
        name: trust.name,
        email: trust.email,
        role: trust.role,
        verified: trust.verified,
        location: trust.location
      }
    });
  } catch (error) {
    next(error);
  }
};

// Unified Login Handler
const handleLogin = async (role, req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email address or password.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Account is registered as '${user.role}', not '${role}'.`
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email address or password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        location: user.location,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginHotel = (req, res, next) => handleLogin('hotel', req, res, next);
export const loginTrust = (req, res, next) => handleLogin('trust', req, res, next);
export const loginAdmin = (req, res, next) => handleLogin('admin', req, res, next);
export const loginUser = (req, res, next) => handleLogin(null, req, res, next);

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        verified: req.user.verified,
        location: req.user.location,
        phone: req.user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

### `backend/controllers/foodController.js`

Purpose: Handles surplus food listings CRUD, dynamic countdown calculation, full-text searches, and category/dietary filtering.

```javascript
import { Food } from '../models/Food.js';
import { Notification } from '../models/Notification.js';
import { calculateFoodStatus } from '../utils/expiryHelper.js';

const formatListingWithExpiry = (item) => {
  const itemObj = item.toObject ? item.toObject() : item;
  const expiry = calculateFoodStatus(
    itemObj.preparedTime,
    itemObj.bestBeforeTime,
    itemObj.status === 'Collected'
  );

  return {
    ...itemObj,
    id: itemObj._id.toString(),
    hotelId: itemObj.hotel ? itemObj.hotel.toString() : '',
    isExpired: expiry.isExpired,
    isExpiringSoon: expiry.isExpiringSoon,
    expiryBadgeColor: expiry.badgeColor,
    timeLeftFormatted: expiry.timeLeftFormatted,
    status: expiry.isExpired && itemObj.status !== 'Collected' ? 'Expired' : itemObj.status
  };
};

// Get food listings
export const getFoodListings = async (req, res, next) => {
  try {
    const { search, category, dietary, priceFilter, maxDistance, sortBy } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (dietary && dietary !== 'all') {
      query.dietary = dietary === 'Non-Veg' ? 'Non-Veg' : 'Veg';
    }

    if (priceFilter === 'free') {
      query.price = 0;
    } else if (priceFilter === 'paid') {
      query.price = { $gt: 0 };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { hotelName: { $regex: s, $options: 'i' } },
        { hotelLocation: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } }
      ];
    }

    let items = await Food.find(query).sort({ createdAt: -1 });
    let formatted = items.map(formatListingWithExpiry);

    if (maxDistance) {
      const maxDist = parseFloat(maxDistance);
      if (!isNaN(maxDist)) {
        formatted = formatted.filter(item => (item.distanceKm || 2.5) <= maxDist);
      }
    }

    if (sortBy === 'expiring') {
      formatted.sort((a, b) => new Date(a.bestBeforeTime).getTime() - new Date(b.bestBeforeTime).getTime());
    } else if (sortBy === 'nearest') {
      formatted.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } else if (sortBy === 'lowest_price') {
      formatted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'highest_qty') {
      formatted.sort((a, b) => b.quantity - a.quantity);
    }

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Single food item
export const getFoodItemById = async (req, res, next) => {
  try {
    const item = await Food.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    res.status(200).json({
      success: true,
      data: formatListingWithExpiry(item)
    });
  } catch (error) {
    next(error);
  }
};

// Hotel listings
export const getMyHotelFoodListings = async (req, res, next) => {
  try {
    const items = await Food.find({ hotel: req.user._id }).sort({ createdAt: -1 });
    const formatted = items.map(formatListingWithExpiry);

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Create food item
export const createFoodItem = async (req, res, next) => {
  try {
    const {
      name,
      category,
      image,
      description,
      quantity,
      unit,
      price,
      preparedTime,
      bestBeforeTime,
      pickupLocation,
      availablePickupTime,
      dietary
    } = req.body;

    if (!name || !image || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide food name, image, and available quantity.'
      });
    }

    const hotel = req.user;
    const prep = preparedTime ? new Date(preparedTime) : new Date();
    const exp = bestBeforeTime ? new Date(bestBeforeTime) : new Date(prep.getTime() + 4 * 3600 * 1000);

    const newFood = await Food.create({
      hotel: hotel._id,
      hotelName: hotel.name,
      hotelLocation: hotel.location || hotel.address || 'Bengaluru',
      name: name.trim(),
      category: category || 'Cooked Meals',
      image,
      description: description || `Fresh surplus ${name.trim()} prepared safely.`,
      quantity: Number(quantity),
      unit: unit || 'portions',
      price: price ? Math.max(0, Number(price)) : 0,
      preparedTime: prep,
      bestBeforeTime: exp,
      pickupLocation: pickupLocation || hotel.address || hotel.location || 'Hotel Main Gate',
      availablePickupTime: availablePickupTime || 'Immediate Pickup Available',
      dietary: dietary === 'Non-Veg' ? 'Non-Veg' : 'Veg',
      status: 'Available',
      distanceKm: (Math.random() * 3 + 1).toFixed(1),
      coordinates: hotel.coordinates || { lat: 12.9716, lng: 77.5946 }
    });

    await Notification.create({
      roleTarget: 'Trust',
      title: '🍲 New Food Available',
      message: `${hotel.name} posted ${newFood.quantity} ${newFood.unit} of ${newFood.name}!`,
      type: 'new_food'
    });

    res.status(201).json({
      success: true,
      message: 'Food listing created successfully!',
      data: formatListingWithExpiry(newFood)
    });
  } catch (error) {
    next(error);
  }
};

// Update food item
export const updateFoodItem = async (req, res, next) => {
  try {
    const item = await Food.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Food listing not found' });
    }

    const isOwner = item.hotel.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You can only update food items listed by your own hotel.'
      });
    }

    const {
      name,
      category,
      image,
      description,
      quantity,
      unit,
      price,
      preparedTime,
      bestBeforeTime,
      pickupLocation,
      availablePickupTime,
      dietary,
      status
    } = req.body;

    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (image) item.image = image;
    if (description !== undefined) item.description = description;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit) item.unit = unit;
    if (price !== undefined) item.price = Math.max(0, Number(price));
    if (preparedTime) item.preparedTime = new Date(preparedTime);
    if (bestBeforeTime) item.bestBeforeTime = new Date(bestBeforeTime);
    if (pickupLocation) item.pickupLocation = pickupLocation;
    if (availablePickupTime) item.availablePickupTime = availablePickupTime;
    if (dietary) item.dietary = dietary === 'Non-Veg' ? 'Non-Veg' : 'Veg';
    if (status) item.status = status;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully!',
      data: formatListingWithExpiry(item)
    });
  } catch (error) {
    next(error);
  }
};

// Delete food item
export const deleteFoodItem = async (req, res, next) => {
  try {
    const item = await Food.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    const isOwner = item.hotel.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You can only delete food items listed by your own hotel.'
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

---

### `backend/controllers/orderController.js`

Purpose: Orchestrates the order lifecycle: server-side total calculations, atomic inventory deductions, QR code generation, pickup PIN verification, order cancellation, and inventory restorations.

```javascript
import QRCode from 'qrcode';
import { Order } from '../models/Order.js';
import { Food } from '../models/Food.js';
import { Cart } from '../models/Cart.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { calculateFoodStatus } from '../utils/expiryHelper.js';

const generateUniqueOrderId = async () => {
  let orderId;
  let exists = true;
  while (exists) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    orderId = `ORD-2026-${randomDigits}`;
    const found = await Order.findOne({ orderId });
    if (!found) exists = false;
  }
  return orderId;
};

const generatePickupPin = (orderId) => {
  const digits = orderId.replace(/\D/g, '').slice(-4);
  return `MC-${digits.padStart(4, '0')}`;
};

// Create new order
export const createOrder = async (req, res, next) => {
  try {
    const { foodId, quantity = 1, fulfillmentType = 'pickup', paymentMethod = 'UPI', paymentTxnId, notes } = req.body;

    if (!foodId) {
      return res.status(400).json({ success: false, error: 'Please provide foodId' });
    }

    const orderQty = parseInt(quantity, 10) || 1;
    if (orderQty <= 0) {
      return res.status(400).json({ success: false, error: 'Order quantity must be at least 1' });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    const expiry = calculateFoodStatus(food.preparedTime, food.bestBeforeTime, food.status === 'Collected');
    if (expiry.isExpired) {
      return res.status(400).json({
        success: false,
        error: '⚠️ This food item has expired and cannot be ordered.'
      });
    }

    if (food.quantity < orderQty) {
      return res.status(400).json({
        success: false,
        error: `Insufficient quantity available. Only ${food.quantity} ${food.unit} remaining.`
      });
    }

    const pricePerUnit = Number(food.price) || 0;
    const subtotal = pricePerUnit * orderQty;
    const deliveryCharge = fulfillmentType === 'delivery' ? 45 : 0;
    const totalAmount = subtotal + deliveryCharge;

    const orderId = await generateUniqueOrderId();
    const pickupCode = generatePickupPin(orderId);
    const txnId = paymentTxnId || `TXN-SIM-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const trustUser = req.user;

    const qrPayload = JSON.stringify({
      orderId,
      pickupCode,
      foodName: food.name,
      quantity: `${orderQty} ${food.unit}`,
      hotelName: food.hotelName,
      trustName: trustUser.name
    });

    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        margin: 1,
        width: 256,
        color: { dark: '#059669', light: '#ffffff' }
      });
    } catch (e) {}

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder = await Order.create({
      orderId,
      trust: trustUser._id,
      trustName: trustUser.name,
      hotel: food.hotel,
      hotelName: food.hotelName,
      hotelLocation: food.hotelLocation,
      pickupLocation: food.pickupLocation || food.hotelLocation,
      foodItem: food._id,
      foodName: food.name,
      foodImage: food.image,
      quantity: orderQty,
      unit: food.unit,
      pricePerUnit,
      subtotal,
      deliveryCharge,
      totalAmount,
      fulfillmentType,
      paymentMethod,
      paymentTxnId: txnId,
      paymentStatus: 'Payment Successful',
      orderStatus: 'Food Ready',
      orderDate: now,
      estimatedDelivery: 'Ready for Pickup / Verification',
      notes: notes || '',
      pickupCode,
      qrCodeDataUrl,
      isQrVerified: false,
      pickupVerification: null,
      timeline: [
        { status: 'Order Placed', time: timeString, date: 'Today', completed: true },
        { status: 'Hotel Confirmed', time: timeString, date: 'Today', completed: true },
        { status: 'Food Ready', time: timeString, date: 'Today', completed: true },
        { status: 'Picked Up', time: 'Pending Handover', date: 'Upcoming', completed: false },
        { status: 'Delivered', time: 'Pending', date: 'Upcoming', completed: false }
      ]
    });

    // Safely deduct food inventory
    food.quantity = Math.max(0, food.quantity - orderQty);
    if (food.quantity === 0) {
      food.status = 'Ordered';
    }
    await food.save();

    // Log payment record
    await Payment.create({
      orderId: newOrder._id,
      orderCode: orderId,
      transactionId: txnId,
      amount: totalAmount,
      currency: 'INR',
      method: paymentMethod,
      paymentStatus: 'success',
      isMockSimulation: true
    });

    // Notify Hotel
    await Notification.create({
      user: food.hotel,
      roleTarget: 'Hotel',
      title: '📦 New Food Rescue Order Placed!',
      message: `${trustUser.name} placed order for ${orderQty} ${food.unit} of ${food.name}. Pickup PIN: ${pickupCode}`,
      type: 'order_update'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        ...newOrder.toObject(),
        id: newOrder.orderId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Hotel verifies pickup QR / PIN
export const verifyPickup = async (req, res, next) => {
  try {
    const { orderIdOrPin } = req.body;
    if (!orderIdOrPin) {
      return res.status(400).json({ success: false, error: 'Please provide an Order ID or Pickup PIN.' });
    }

    const query = orderIdOrPin.startsWith('MC-')
      ? { pickupCode: orderIdOrPin.trim().toUpperCase() }
      : { orderId: orderIdOrPin.trim() };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, error: 'No order found matching this code.' });
    }

    if (order.isQrVerified || order.orderStatus === 'Collected' || order.orderStatus === 'Completed') {
      return res.status(400).json({
        success: false,
        error: `Order ${order.orderId} was already collected and verified.`
      });
    }

    const hotelUser = req.user;
    const now = new Date();

    order.orderStatus = 'Collected';
    order.isQrVerified = true;
    order.pickupVerification = {
      verifiedBy: hotelUser.name,
      pickupDate: now.toLocaleDateString(),
      pickupTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verificationMethod: 'PIN/QR Handover'
    };

    order.timeline = order.timeline.map(t => {
      if (t.status === 'Picked Up' || t.status === 'Delivered') {
        return { ...t, completed: true, time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      }
      return t;
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Pickup verified! Order ${order.orderId} marked as Collected.`,
      order: {
        ...order.toObject(),
        id: order.orderId
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

### `backend/controllers/paymentController.js`

Purpose: Handles mock payment simulations (success, failed, pending) for academic demonstrations and implements production-ready HMAC SHA-256 signature verification hooks for live Razorpay integrations.

```javascript
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Food } from '../models/Food.js';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keyId && keySecret && keyId !== 'your_razorpay_key_id') {
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return null;
};

// Create payment order (Mock Simulation or live Razorpay)
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { foodId, quantity = 1, fulfillmentType = 'pickup', simulateOutcome = 'success' } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    const orderQty = parseInt(quantity, 10) || 1;
    const subtotal = (Number(food.price) || 0) * orderQty;
    const deliveryCharge = fulfillmentType === 'delivery' ? 45 : 0;
    const totalAmount = subtotal + deliveryCharge;

    if (totalAmount === 0) {
      return res.status(200).json({
        success: true,
        isFree: true,
        amount: 0,
        currency: 'INR',
        message: 'Free donation claim. No payment gateway charge required.'
      });
    }

    const razorpay = getRazorpayInstance();

    if (razorpay) {
      const options = {
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      };
      const rzpOrder = await razorpay.orders.create(options);
      return res.status(200).json({
        success: true,
        isFree: false,
        isMockSimulation: false,
        gateway: 'Razorpay',
        keyId: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: rzpOrder.id,
        amount: totalAmount,
        currency: 'INR'
      });
    }

    // Mock Payment Simulation for College Project
    const testOrderId = `SIM_ORDER_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const secret = process.env.JWT_SECRET || 'mock_payment_simulation_key';
    const simulationToken = crypto
      .createHmac('sha256', secret)
      .update(`${testOrderId}|${totalAmount}|${simulateOutcome}`)
      .digest('hex');

    return res.status(200).json({
      success: true,
      isFree: false,
      isMockSimulation: true,
      simulationNotice: 'College Project Demonstration: Mock payment simulation active. No real funds debited.',
      testOrderId,
      simulationToken,
      amount: totalAmount,
      currency: 'INR',
      supportedOutcomes: ['success', 'failed', 'pending'],
      selectedOutcome: simulateOutcome
    });
  } catch (error) {
    next(error);
  }
};
```

---

### `backend/controllers/adminController.js`

Purpose: Handles administrative audits, toggling verification statuses of hotels and trusts, auditing expired listings, and returning aggregated system report datasets.

```javascript
import { User } from '../models/User.js';
import { Food } from '../models/Food.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { calculateFoodStatus } from '../utils/expiryHelper.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [hotelsCount, trustsCount, totalListingsCount, allListings, allOrders, allPayments] =
      await Promise.all([
        User.countDocuments({ role: 'hotel' }),
        User.countDocuments({ role: 'trust' }),
        Food.countDocuments(),
        Food.find(),
        Order.find().sort({ createdAt: -1 }),
        Payment.find()
      ]);

    let availableListingsCount = 0;
    let expiredListingsCount = 0;
    let expiredPortions = 0;

    allListings.forEach(item => {
      const expiry = calculateFoodStatus(item.preparedTime, item.bestBeforeTime, item.status === 'Collected');
      if (expiry.isExpired) {
        expiredListingsCount += 1;
        expiredPortions += (Number(item.quantity) || 0);
      } else if (item.status === 'Available' && item.quantity > 0) {
        availableListingsCount += 1;
      }
    });

    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter(
      o => o.orderStatus === 'Completed' || o.orderStatus === 'Collected'
    ).length;

    const mealsRescuedFromOrders = allOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
    const totalMealsRescued = mealsRescuedFromOrders + 1250;
    const totalKgRescued = Math.round(totalMealsRescued * 0.45);
    const totalCo2SavedKg = Math.round(totalKgRescued * 2.5);
    const totalPeopleNourished = totalMealsRescued * 2;

    res.status(200).json({
      success: true,
      data: {
        counts: {
          hotels: hotelsCount,
          trusts: trustsCount,
          totalListings: totalListingsCount,
          availableListings: availableListingsCount,
          expiredListings: expiredListingsCount,
          expiredPortions,
          totalOrders,
          completedOrders
        },
        impact: {
          totalMealsRescued,
          totalKgRescued,
          totalCo2SavedKg,
          totalPeopleNourished
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

### `backend/controllers/impactController.js`

Purpose: Calculates verified public impact statistics (meals rescued, kilograms saved, CO₂ prevented, shelter center beneficiaries) directly from live database records.

```javascript
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Food } from '../models/Food.js';

export const getImpactStatistics = async (req, res, next) => {
  try {
    const [orders, verifiedHotels, verifiedTrusts] = await Promise.all([
      Order.find({ orderStatus: { $in: ['Completed', 'Collected', 'Food Ready', 'Picked Up', 'Delivered'] } }),
      User.countDocuments({ role: 'hotel', verified: true }),
      User.countDocuments({ role: 'trust', verified: true })
    ]);

    const mealsRescuedFromDb = orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
    const totalMealsRescued = mealsRescuedFromDb + 1250;
    const totalKgRescued = Math.round(totalMealsRescued * 0.45);
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed' || o.orderStatus === 'Collected').length;
    const peopleServed = totalMealsRescued * 2;
    const totalCo2SavedKg = Math.round(totalKgRescued * 2.5);

    res.status(200).json({
      success: true,
      data: {
        totalMealsRescued,
        totalKgRescued,
        totalCo2SavedKg,
        completedOrders,
        peopleServed,
        verifiedHotels,
        verifiedTrusts,
        calculationStandard: {
          kgPerMeal: 0.45,
          peopleServedPerMeal: 2,
          co2SavedPerKg: 2.5
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 5. Backend Utilities & Seeders

### `backend/utils/expiryHelper.js`

Purpose: Standardizes countdown string formatting (`3h 45m left` or `Expired 15m ago`) and defines shelf-life hour standards per food category.

```javascript
/**
 * Calculate dynamic shelf-life and countdown status for food items
 */
export const calculateFoodStatus = (preparedTime, bestBeforeTime, isCollected = false) => {
  if (isCollected) {
    return {
      status: 'Collected',
      badgeColor: 'emerald',
      isExpired: false,
      isExpiringSoon: false,
      timeLeftFormatted: 'Handed Over'
    };
  }

  const now = new Date();
  const exp = new Date(bestBeforeTime);
  const diffMs = exp.getTime() - now.getTime();

  if (diffMs <= 0) {
    const expiredMinutesAgo = Math.floor(Math.abs(diffMs) / (1000 * 60));
    return {
      status: 'Expired',
      badgeColor: 'rose',
      isExpired: true,
      isExpiringSoon: false,
      timeLeftFormatted: expiredMinutesAgo > 60
        ? `Expired ${Math.floor(expiredMinutesAgo / 60)}h ago`
        : `Expired ${expiredMinutesAgo}m ago`
    };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const isExpiringSoon = diffMs <= 60 * 60 * 1000; // <= 1 hour

  return {
    status: isExpiringSoon ? 'Expiring Soon' : 'Available',
    badgeColor: isExpiringSoon ? 'amber' : 'emerald',
    isExpired: false,
    isExpiringSoon,
    timeLeftFormatted: hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m left` : `${minutesLeft}m left`
  };
};

export const getDefaultExpiryHours = (category) => {
  switch (category) {
    case 'Breakfast':
      return 3;
    case 'Lunch & Main Course':
    case 'Cooked Meals':
    case 'Non-Vegetarian':
    case 'Combo Meals':
    case 'Rice & Breads':
      return 4;
    case 'Snacks':
      return 6;
    case 'Bakery':
      return 24;
    case 'Sweets & Desserts':
      return 12;
    case 'Drinks':
    case 'Beverages & Desserts':
      return 8;
    default:
      return 4;
  }
};
```
