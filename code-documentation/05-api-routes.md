# 05 – REST API Routes & Endpoint Specifications

> **Meal Connect (Food Rescue Marketplace)**  
> Complete documentation of the Express.js route definitions, HTTP methods, authorization headers, request bodies, and JSON responses.

---

## 📑 Table of Contents
1. [API Endpoint Directory Table](#1-api-endpoint-directory-table)
2. [Authentication Routes](#2-authentication-routes)
   - [`backend/routes/authRoutes.js`](#backendroutesauthroutesjs)
3. [Food Listing Routes](#3-food-listing-routes)
   - [`backend/routes/foodRoutes.js`](#backendroutesfoodroutesjs)
4. [Shopping Cart Routes](#4-shopping-cart-routes)
   - [`backend/routes/cartRoutes.js`](#backendroutescartroutesjs)
5. [Order Management Routes](#5-order-management-routes)
   - [`backend/routes/orderRoutes.js`](#backendroutesorderroutesjs)
6. [Payment Simulation Routes](#6-payment-simulation-routes)
   - [`backend/routes/paymentRoutes.js`](#backendroutespaymentroutesjs)
7. [Administrative Management Routes](#7-administrative-management-routes)
   - [`backend/routes/adminRoutes.js`](#backendroutesadminroutesjs)
8. [Impact Statistics Routes](#8-impact-statistics-routes)
   - [`backend/routes/impactRoutes.js`](#backendroutesimpactroutesjs)
9. [Notification Alert Routes](#9-notification-alert-routes)
   - [`backend/routes/notificationRoutes.js`](#backendroutesnotificationroutesjs)

---

## 1. API Endpoint Directory Table

| Method | Endpoint | Authorization | Role Required | Description |
|---|---|---|---|---|
| `GET` | `/api/health` | Public | None | System uptime, version, and server health check |
| `POST` | `/api/auth/register-hotel` | Public | None | Register new Hotel organization |
| `POST` | `/api/auth/login-hotel` | Public | None | Hotel login (returns Bearer JWT) |
| `POST` | `/api/auth/register-trust` | Public | None | Register new Trust/NGO organization |
| `POST` | `/api/auth/login-trust` | Public | None | Trust login (returns Bearer JWT) |
| `POST` | `/api/auth/login-admin` | Public | None | System administrator authentication |
| `GET` | `/api/auth/me` | Protected | Any authenticated user | Fetch profile of current session user |
| `GET` | `/api/food` | Public | None | Query surplus food with search, category & radius filters |
| `GET` | `/api/food/my-listings` | Protected | `hotel` | Retrieve listings created by current hotel |
| `POST` | `/api/food` | Protected | `hotel` | Post new surplus food donation or discount item |
| `PUT` | `/api/food/:id` | Protected | `hotel`, `admin` | Update food listing details or quantity |
| `DELETE`| `/api/food/:id` | Protected | `hotel`, `admin` | Delete or deactivate food listing |
| `GET` | `/api/cart` | Protected | `trust` | Fetch current active shopping cart items |
| `POST` | `/api/cart/add` | Protected | `trust` | Add food portions to cart |
| `PUT` | `/api/cart/item/:foodId` | Protected | `trust` | Update portion quantity in cart |
| `DELETE`| `/api/cart/item/:foodId` | Protected | `trust` | Remove item from cart |
| `DELETE`| `/api/cart` | Protected | `trust` | Empty the entire cart |
| `POST` | `/api/orders` | Protected | `trust` | Place order with atomic inventory deduction & PIN/QR generation |
| `GET` | `/api/orders` | Protected | Any authenticated user | List order history for current user's role |
| `GET` | `/api/orders/:id` | Protected | Any authenticated user | Get detailed order timeline and pickup pass |
| `POST` | `/api/orders/verify-pickup`| Protected | `hotel`, `admin` | Verify handover using 6-digit PIN or scanned QR pass |
| `PUT` | `/api/orders/:id/cancel` | Protected | `trust`, `hotel` | Cancel order and restore food stock |
| `POST` | `/api/payments/create-order`| Protected | `trust` | Initialize payment session (free vs mock simulation) |
| `POST` | `/api/payments/verify` | Protected | `trust` | Verify simulated or live payment signature |
| `GET` | `/api/admin/dashboard` | Protected | `admin` | Fetch comprehensive system audit metrics |
| `GET` | `/api/admin/expired-listings`| Protected | `admin` | Audit expired food items across all hotels |
| `GET` | `/api/admin/report` | Protected | `admin` | Export detailed database report dataset for print/PDF |
| `PUT` | `/api/admin/hotels/:id/verify`| Protected | `admin` | Toggle verification approval status for a hotel |
| `PUT` | `/api/admin/trusts/:id/verify`| Protected | `admin` | Toggle verification approval status for a trust |
| `GET` | `/api/impact` | Public | None | Database-calculated public impact statistics |
| `GET` | `/api/notifications` | Protected | Any authenticated user | Fetch notification alerts for user's role |
| `PUT` | `/api/notifications/:id/read`| Protected | Any authenticated user | Mark specific alert as read |

---

## 2. Authentication Routes

### `backend/routes/authRoutes.js`

Purpose: Handles user registration, credentials authentication, session verification, and directory queries.

```javascript
import express from 'express';
import {
  registerHotel,
  loginHotel,
  registerTrust,
  loginTrust,
  loginAdmin,
  getMe,
  getAllHotels,
  getAllTrusts
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register-hotel', registerHotel);
router.post('/login-hotel', loginHotel);
router.post('/register-trust', registerTrust);
router.post('/login-trust', loginTrust);
router.post('/login-admin', loginAdmin); // No public registration endpoint for admin
router.get('/me', protect, getMe);
router.get('/hotels', getAllHotels);
router.get('/trusts', getAllTrusts);

export default router;
```

#### Sample Login Request Body:
```json
{
  "email": "taj@hotel.com",
  "password": "Password123"
}
```

#### Sample Successful Login Response:
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673f8a9e1b2c3d4e5f6a7b8c",
    "name": "The Taj Gateway Hotel",
    "email": "taj@hotel.com",
    "role": "hotel",
    "verified": true,
    "location": "Residency Road, Bengaluru"
  }
}
```

---

## 3. Food Listing Routes

### `backend/routes/foodRoutes.js`

Purpose: Public and authenticated routes for querying and managing surplus food listings.

```javascript
import express from 'express';
import {
  getFoodListings,
  getFoodItemById,
  getMyHotelFoodListings,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem
} from '../controllers/foodController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getFoodListings);
router.get('/my-listings', protect, authorizeRoles('hotel'), getMyHotelFoodListings);
router.get('/:id', getFoodItemById);
router.post('/', protect, authorizeRoles('hotel'), createFoodItem);
router.put('/:id', protect, authorizeRoles('hotel', 'admin'), updateFoodItem);
router.delete('/:id', protect, authorizeRoles('hotel', 'admin'), deleteFoodItem);

export default router;
```

#### Sample Food Creation Request Body (`POST /api/food`):
```json
{
  "name": "Vegetable Biryani & Salan",
  "category": "Cooked Meals",
  "quantity": 25,
  "unit": "portions",
  "price": 0,
  "dietary": "Veg",
  "preparedTime": "2026-10-22T13:30:00.000Z",
  "bestBeforeTime": "2026-10-22T17:30:00.000Z",
  "pickupLocation": "Banquet Kitchen Dispatch Counter",
  "image": "/food-images/vegetable_biryani_salan.jpg"
}
```

---

## 4. Shopping Cart Routes

### `backend/routes/cartRoutes.js`

Purpose: Manages server-side shopping cart sessions for Trusts.

```javascript
import express from 'express';
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:foodId', updateCartQuantity);
router.delete('/item/:foodId', removeFromCart);
router.delete('/', clearCart);

export default router;
```

---

## 5. Order Management Routes

### `backend/routes/orderRoutes.js`

Purpose: Manages order placement, status tracking, handover QR/PIN verification, and cancellations.

```javascript
import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  verifyPickup,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', getOrders);
router.post('/verify-pickup', authorizeRoles('hotel', 'admin'), verifyPickup);
router.get('/:id', getOrderById);
router.put('/:id/status', authorizeRoles('hotel', 'admin'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
```

#### Sample Order Placement Request (`POST /api/orders`):
```json
{
  "foodId": "673f8a9e1b2c3d4e5f6a7b8e",
  "quantity": 5,
  "fulfillmentType": "pickup",
  "paymentMethod": "UPI",
  "notes": "Trust driver arrives at 4:30 PM with thermal containers"
}
```

#### Sample Handover Verification Request (`POST /api/orders/verify-pickup`):
```json
{
  "orderIdOrPin": "MC-8578"
}
```

---

## 6. Payment Simulation Routes

### `backend/routes/paymentRoutes.js`

Purpose: College mock payment simulation gateway and Razorpay verification endpoints.

```javascript
import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/', getPaymentHistory);

export default router;
```

#### Sample Mock Payment Simulation Request (`POST /api/payments/create-order`):
```json
{
  "foodId": "673f8a9e1b2c3d4e5f6a7b8e",
  "quantity": 2,
  "fulfillmentType": "delivery",
  "simulateOutcome": "success"
}
```

#### Sample Simulation Response:
```json
{
  "success": true,
  "isFree": false,
  "isMockSimulation": true,
  "simulationNotice": "College Project Demonstration: Mock payment simulation active. No real funds debited.",
  "testOrderId": "SIM_ORDER_1761141440000_4821",
  "simulationToken": "a4f89d31...",
  "amount": 95,
  "currency": "INR",
  "selectedOutcome": "success"
}
```

---

## 7. Administrative Management Routes

### `backend/routes/adminRoutes.js`

Purpose: Administrative dashboard metrics, partner verification approvals, listings audits, and reporting.

```javascript
import express from 'express';
import {
  getAdminStats,
  toggleHotelVerification,
  toggleTrustVerification,
  getExpiredListings,
  generateSummaryReport
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/dashboard', getAdminStats);
router.get('/stats', getAdminStats);
router.get('/expired-listings', getExpiredListings);
router.get('/report', generateSummaryReport);
router.put('/hotels/:id/verify', toggleHotelVerification);
router.put('/trusts/:id/verify', toggleTrustVerification);

export default router;
```

---

## 8. Impact Statistics Routes

### `backend/routes/impactRoutes.js`

Purpose: Public endpoint returning real-time environmental metrics calculated from live database orders.

```javascript
import express from 'express';
import { getImpactStatistics } from '../controllers/impactController.js';

const router = express.Router();

router.get('/', getImpactStatistics);

export default router;
```

#### Sample Impact Response (`GET /api/impact`):
```json
{
  "success": true,
  "data": {
    "totalMealsRescued": 1325,
    "totalKgRescued": 596,
    "totalCo2SavedKg": 1490,
    "completedOrders": 6,
    "peopleServed": 2650,
    "verifiedHotels": 4,
    "verifiedTrusts": 3,
    "calculationStandard": {
      "kgPerMeal": 0.45,
      "peopleServedPerMeal": 2,
      "co2SavedPerKg": 2.5
    }
  }
}
```

---

## 9. Notification Alert Routes

### `backend/routes/notificationRoutes.js`

Purpose: Delivers real-time notifications for new orders, pickup verifications, and food availability.

```javascript
import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
```
