# Meal Connect – Backend & Full-Stack Architecture

> **Rescue Food, Reduce Waste, Feed Communities**  
> A production-ready, full-stack platform connecting Hotels/Restaurants with surplus meals to Trusts/NGOs with verified QR code distribution, real-time expiry management, automated nutrition calculations, and an administrative reporting dashboard.

---

## 1. Architecture Overview

- **Backend**: Node.js & Express.js (ES Modules)
- **Database**: MongoDB with Mongoose ODM (Relational referencing, indexing, virtuals, and aggregation)
- **Authentication**: JWT (JSON Web Tokens) with 64-bit secret encryption, `bcryptjs` password hashing (10 salt rounds), and role-based access control (`hotel`, `trust`, `admin`)
- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, jsPDF, QRCode, Canvas-Confetti, Vite
- **Payment Gateway**: Dual-mode payment processing engine supporting zero-cost free food rescue claims and Razorpay gateway with server-side HMAC SHA-256 signature verification and cryptographically signed test mode.

---

## 2. Directory Structure

```
meal connect/
├── .env                       # Active environment configuration
├── .env.example               # Environment template with placeholders
├── package.json               # Unified dependencies and operational scripts
├── vite.config.js             # Vite development server with backend API proxy
├── server/
│   ├── server.js              # Express application entry point & CORS configuration
│   ├── config/
│   │   └── db.js              # Mongoose MongoDB connection manager
│   ├── models/
│   │   ├── User.js            # User model (Hotels, Trusts, Admin)
│   │   ├── FoodItem.js        # Surplus food listing model with dynamic server expiry
│   │   ├── Cart.js            # User shopping cart with quantity tracking
│   │   ├── Order.js           # Orders, timeline, pickup PIN & QR code verification
│   │   ├── Payment.js         # Transaction records with signature logging
│   │   └── Notification.js    # Multi-role alert and notifications system
│   ├── controllers/
│   │   ├── authController.js  # Hotel/Trust/Admin login, registration & verifications
│   │   ├── foodController.js  # Food CRUD, search, filter, and shelf-life tracking
│   │   ├── cartController.js  # Cart item management and validation
│   │   ├── orderController.js # Order lifecycle, server totals & QR handover verification
│   │   ├── paymentController.js# Razorpay integration and test mode verification
│   │   ├── reportController.js# System metrics, nutrition impact & print/PDF dataset
│   │   └── notificationController.js # Read/unread notifications by role
│   ├── middleware/
│   │   ├── authMiddleware.js  # Bearer JWT protection & role authorization guards
│   │   ├── errorHandler.js    # Global error handler with Mongoose error mapping
│   │   └── validateRequest.js # Request payload validation utilities
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/*
│   │   ├── foodRoutes.js      # /api/food/*
│   │   ├── cartRoutes.js      # /api/cart/*
│   │   ├── orderRoutes.js     # /api/orders/*
│   │   ├── paymentRoutes.js   # /api/payments/*
│   │   ├── reportRoutes.js    # /api/reports/*
│   │   └── notificationRoutes.js # /api/notifications/*
│   └── utils/
│       ├── expiryHelper.js    # Server-side shelf-life and countdown calculation
│       └── seedData.js        # Automated seeder for demo hotels, trusts, admin & food
├── scripts/
│   └── test-api.js            # Automated backend endpoint test suite (17/17 tests passing)
└── src/
    ├── services/
    │   └── api.js             # Frontend API client communicating with backend
    └── context/
        └── AppContext.jsx     # Global React context with full backend synchronization
```

---

## 3. Installation & Setup

### Prerequisites
- **Node.js**: v18.x or newer (Tested on Node.js v24)
- **MongoDB**: Local MongoDB service running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection URI.

### Step 1: Install Dependencies
Run the following command in the project root:
```bash
npm install
```

### Step 2: Environment Configuration
Ensure your `.env` file exists with the following configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/meal_connect
JWT_SECRET=meal_connect_jwt_super_secret_key_2026_antigravity_dev
JWT_EXPIRES_IN=7d

# Payment Gateway (Razorpay)
# For production or live Razorpay test keys, replace the placeholders below:
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET

# Frontend API URL
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Running the Application

### Option A: Run Both Backend & Frontend Simultaneously (Recommended)
```bash
npm run dev:all
```
This launches:
- **Backend API Server**: `http://localhost:5000`
- **Frontend Client**: `http://localhost:5173` with automatic API proxying

### Option B: Run Services Separately
1. **Start Backend**:
   ```bash
   npm run server
   ```
2. **Start Frontend**:
   ```bash
   npm run dev
   ```

---

## 5. Automated Database Seeding & Demo Accounts

On initial startup against an empty database, the backend automatically seeds realistic partner organizations, food listings, demo orders, and notifications.

### Pre-Configured Test Accounts

| Role | Organization / User | Email ID | Password | Access Details |
|---|---|---|---|---|
| **Hotel** | Green Leaf Hotel | `contact@greenleafhotel.com` | `hotel123` | Can post food, edit listings, and scan/verify pickup QRs |
| **Hotel** | Sri Annapoorna Restaurant | `annapoorna@foodrescue.org` | `hotel123` | Can manage breakfast and South Indian meal listings |
| **Hotel** | City Grand Hotel | `food@citygrand.com` | `hotel123` | Can manage cooked meal and bakery listings |
| **Trust / NGO** | Hope Foundation Trust | `hope.trust@ngonetwork.org` | `trust123` | Can claim surplus food, checkout, generate pickup passes |
| **Trust / NGO** | Akshaya Community Care | `contact@akshayacare.org` | `trust123` | Can view order history and track deliveries |
| **Admin** | Master System Administrator | `admin@foodrescue.org` | `admin123` | Can access Admin Dashboard, toggle partner verification, export reports |

> **Security Note**: Public registration for Admin accounts is strictly disabled. The administrator account is securely initialized during seeding or configurable by environment administrator.

---

## 6. Complete REST API Reference

### Authentication & Users (`/api/auth`)
- `POST /api/auth/register-hotel`: Register a new Hotel/Restaurant with contact and location details.
- `POST /api/auth/login-hotel`: Authenticate hotel and receive JWT token.
- `POST /api/auth/register-trust`: Register a new Trust/NGO organization.
- `POST /api/auth/login-trust`: Authenticate trust and receive JWT token.
- `POST /api/auth/login-admin`: Authenticate system administrator (no public register endpoint).
- `GET /api/auth/me`: Retrieve current logged-in profile (Requires Bearer token).
- `GET /api/auth/hotels`: List all registered hotel partners.
- `GET /api/auth/trusts`: List all registered trust partners.
- `PUT /api/auth/hotels/:id/verify`: Toggle hotel verification status (Admin only).
- `PUT /api/auth/trusts/:id/verify`: Toggle trust verification status (Admin only).

### Food Management (`/api/food`)
- `GET /api/food`: Retrieve active food listings. Supports query filters:
  - `search`: Keyword search matching food title, hotel name, or location.
  - `category`: Filter by category (`Breakfast`, `Cooked Meals`, `Bakery`, `Snacks`, etc.).
  - `dietary`: Filter by `Veg` or `Non-Veg`.
  - `priceFilter`: `free` (price = 0) or `paid` (price > 0).
  - `maxDistance`: Max radius in kilometers.
  - `sortBy`: `expiring` (soonest first), `nearest`, `lowest_price`, `highest_qty`.
- `GET /api/food/:id`: Get full food item details and real-time expiry countdown.
- `GET /api/food/my-listings`: List all food items posted by the logged-in hotel.
- `POST /api/food`: Create new food listing (Hotel role required).
- `PUT /api/food/:id`: Update existing listing (Owning hotel or Admin).
- `DELETE /api/food/:id`: Delete listing (Owning hotel or Admin).

### Cart Management (`/api/cart`)
- `GET /api/cart`: Get current user's cart with live item verification.
- `POST /api/cart/add`: Add item to cart with quantity validation.
- `PUT /api/cart/item/:foodId`: Update quantity of item in cart.
- `DELETE /api/cart/item/:foodId`: Remove single item from cart.
- `DELETE /api/cart`: Clear cart.

### Order Management (`/api/orders`)
- `POST /api/orders`: Place food order. Server calculates subtotals, delivery fee (₹45 for delivery, ₹0 for pickup), validates live stock and expiry, generates unique Order ID (`ORD-2026-XXXX`) and Pickup PIN (`MC-XXXX`), creates QR Code, and deducts remaining food quantity.
- `GET /api/orders`: Get orders for the logged-in user (Hotels see incoming orders, Trusts see claimed orders, Admin sees all).
- `GET /api/orders/:id`: Get single order details and lifecycle timeline.
- `PUT /api/orders/:id/status`: Advance order status (`Order Placed` ➔ `Hotel Confirmed` ➔ `Food Ready` ➔ `Picked Up` ➔ `Delivered` ➔ `Completed`).
- `POST /api/orders/verify-pickup`: Handover verification via QR scan or Pickup PIN. Only the owning hotel can verify. Marks order as `Collected`, stamps verification timestamp, and prevents duplicate verification.

### Payment Integration (`/api/payments`)
- `POST /api/payments/create-order`: Calculates order total on server. If free food with pickup (total = ₹0), confirms free order directly. For paid orders, creates Razorpay gateway order or cryptographically signed test token.
- `POST /api/payments/verify`: Verifies Razorpay HMAC SHA-256 signature or validated test token.
- `GET /api/payments`: View payment transaction history.

### Admin Dashboard & Reports (`/api/reports`)
- `GET /api/reports/dashboard`: Retrieves real-time administrative metrics:
  - Total registered hotels & trusts
  - Total food listings, available count, and expired count
  - Total orders and completed pickups
  - **People Nourished Calculation**: Calculated using the standard formula `totalMealsRescued * 2` beneficiaries.
  - **Environmental Metrics**: Food saved (`totalMealsRescued * 0.45` kg) and CO2 emission reduction (`kgRescued * 2.5` kg CO2e).
  - Financial summary (total revenue, breakdown of free vs paid orders).
- `GET /api/reports/generate`: Generates complete database audit dataset ready for frontend printing and PDF export.

### Notifications (`/api/notifications`)
- `GET /api/notifications`: Retrieve in-app notifications targeted to the logged-in user or role.
- `PUT /api/notifications/:id/read`: Mark notification as read.
- `PUT /api/notifications/read-all`: Mark all notifications as read.

---

## 7. Automated Testing Suite

The project includes an end-to-end automated testing script that exercises all core workflows against the live MongoDB database:
```bash
npm run test:api
```

### Verified Test Cases (17/17 Passing)
1. System health check endpoint
2. Hotel authentication & JWT token generation
3. Trust / NGO authentication & JWT token generation
4. Admin authentication & SuperAdmin authorization
5. Public food marketplace retrieval & dynamic expiry calculations
6. Category and dietary filtering
7. Hotel food listing creation with image and shelf-life parameters
8. Cart item addition and retrieval
9. Server-side price calculation and order creation
10. Automatic stock deduction upon order placement
11. Unique Order ID & Pickup PIN generation
12. Hotel QR / PIN pickup verification and handover record creation
13. Duplicate pickup verification prevention
14. Admin dashboard statistics computation
15. Admin audit and print report dataset generation
16. Automatic database seeding
17. Cleanup of test artifacts

---

## 8. Implementation Status & External Credentials

| Module | Feature | Implementation Status | Notes |
|---|---|---|---|
| **Auth** | Hotel Registration & Login | ✅ Fully Implemented | Bcrypt hashing, JWT tokens |
| **Auth** | Trust / NGO Registration & Login | ✅ Fully Implemented | Role-based authentication |
| **Auth** | Admin Login & Protection | ✅ Fully Implemented | No public register endpoint |
| **Food** | Hotel Food CRUD | ✅ Fully Implemented | Image support, location, dietary |
| **Food** | Real-time Dynamic Expiry | ✅ Fully Implemented | Server time based (not default expired) |
| **Food** | Marketplace Search & Filters | ✅ Fully Implemented | Category, distance, veg/non-veg, price |
| **Cart** | Cart Management | ✅ Fully Implemented | Live expiry & stock validation |
| **Orders** | Server-calculated Totals | ✅ Fully Implemented | Client values never trusted |
| **Orders** | QR Code & Pickup PIN | ✅ Fully Implemented | Server-generated QR data URL |
| **Orders** | Pickup Handover Verification | ✅ Fully Implemented | Duplicate scan prevention |
| **Orders** | Order Lifecycle Progression | ✅ Fully Implemented | Status timeline updates |
| **Payment**| Zero-cost Free Food Orders | ✅ Fully Implemented | Direct confirmation without payment |
| **Payment**| Test Mode Payment Engine | ✅ Fully Implemented | HMAC SHA-256 signed test token |
| **Payment**| Razorpay Gateway (Live) | ⚙️ Configurable | Provide `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` in `.env` |
| **Admin** | Dashboard & Metrics | ✅ Fully Implemented | Dynamic nutrition & carbon stats |
| **Admin** | Audit Reports (Print/PDF) | ✅ Fully Implemented | Real database export |
| **Notifs** | Multi-Role Alerts | ✅ Fully Implemented | Order & status notifications |
#   M e a l C o n n e c t  
 