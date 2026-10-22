# Meal Connect – Backend System Architecture & Implementation

> **Mini-Project Coding Appendix: Backend Source Code & API Reference**  
> **Course / Project Title**: Food Rescue Marketplace (Meal Connect)  
> **Backend Stack**: Node.js, Express.js, MongoDB, Mongoose ODM

---

## 1. Directory Structure

```
backend/
├── config/
│   └── database.js            # MongoDB database connection configuration
├── controllers/
│   ├── authController.js      # Hotel, Trust, and Admin authentication & verifications
│   ├── foodController.js      # Food listing CRUD, shelf-life and marketplace filters
│   ├── orderController.js     # Order placement, status lifecycle, QR code & inventory
│   ├── paymentController.js   # Mock payment simulation and Razorpay integration
│   ├── adminController.js     # Admin verification queues, statistics & audit reports
│   ├── notificationController.js # Multi-role alert notifications
│   └── impactController.js    # Database-backed food rescue and environmental metrics
├── middleware/
│   ├── auth.js                # JWT Bearer protection and role authorization guards
│   └── errorHandler.js        # Global HTTP and Mongoose error handling
├── models/
│   ├── User.js                # Mongoose schema for Hotels, Trusts, and Admin
│   ├── Food.js                # Food listing schema with text search and shelf-life
│   ├── Order.js               # Orders with timeline, pickup PIN & QR code verification
│   ├── Payment.js             # Transaction ledger with simulation tracking
│   ├── Notification.js        # In-app notifications schema
│   └── Cart.js                # Shopping cart schema
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── foodRoutes.js          # /api/food
│   ├── orderRoutes.js         # /api/orders
│   ├── paymentRoutes.js       # /api/payments
│   ├── adminRoutes.js         # /api/admin
│   ├── notificationRoutes.js  # /api/notifications
│   └── impactRoutes.js        # /api/impact
├── utils/
│   ├── expiryHelper.js        # Dynamic server-side shelf-life calculator
│   └── seedData.js            # Automated demo data seeder
├── .env.example               # Environment variables template
├── package.json               # Backend dependencies and scripts
├── server.js                  # Express application entry point
└── README.md                  # This documentation file
```

---

## 2. API Endpoints

### System Health
- `GET /api/health`: Check server online status and API version.

### Authentication (`/api/auth`)
- `POST /api/auth/register-hotel`: Hotel partner registration.
- `POST /api/auth/login-hotel`: Hotel authentication.
- `POST /api/auth/register-trust`: Trust / NGO partner registration.
- `POST /api/auth/login-trust`: Trust / NGO authentication.
- `POST /api/auth/login-admin`: Admin authentication (Public registration disabled).
- `GET /api/auth/me`: Profile of authenticated user.
- `GET /api/auth/hotels`: List partner hotels.
- `GET /api/auth/trusts`: List partner trusts.

### Food Management (`/api/food`)
- `GET /api/food`: Browse active food listings with filters (`category`, `dietary`, `priceFilter`, `maxDistance`, `sortBy`).
- `GET /api/food/:id`: Single food item details with live countdown.
- `GET /api/food/my-listings`: Food listings belonging to authenticated hotel.
- `POST /api/food`: Create new food listing (Hotel only).
- `PUT /api/food/:id`: Update listing (Owning hotel or Admin).
- `DELETE /api/food/:id`: Remove food listing (Owning hotel or Admin).

### Order Management (`/api/orders`)
- `POST /api/orders`: Place food order. Calculates totals, verifies expiry, deducts stock, generates `ORD-2026-XXXX` and `MC-XXXX` pickup PIN.
- `GET /api/orders`: Get orders for authenticated user (Hotel, Trust, or Admin).
- `GET /api/orders/:id`: Single order details.
- `PUT /api/orders/:id/status`: Advance order lifecycle status (`Order Placed` → `Hotel Confirmed` → `Food Ready` → `Picked Up` → `Delivered` → `Completed`).
- `POST /api/orders/verify-pickup`: Verify food collection via QR code or Pickup PIN.
- `PUT /api/orders/:id/cancel`: Cancel order and restore food inventory.

### Payment Management (`/api/payments`)
- `POST /api/payments/create-order`: Free order auto-approval or simulated payment session.
- `POST /api/payments/verify`: Signature / token verification.
- `GET /api/payments`: View payment transaction history.

### Admin Dashboard & Audits (`/api/admin`)
- `GET /api/admin/dashboard`: Metrics for registered users, food listings, orders, and rescue impact.
- `GET /api/admin/expired-listings`: Audit expired food items.
- `GET /api/admin/report`: Full audit data formatted for reports.
- `PUT /api/admin/hotels/:id/verify`: Toggle hotel verification.
- `PUT /api/admin/trusts/:id/verify`: Toggle trust verification.

### Impact Metrics (`/api/impact`)
- `GET /api/impact`: Returns database-calculated impact statistics:
  - Total food rescued (kg) = `totalMealsRescued * 0.45` kg
  - People served = `totalMealsRescued * 2` beneficiaries
  - Carbon emissions reduced (kg CO2e) = `totalKgRescued * 2.5`
  - Monthly food rescue distribution

### Notifications (`/api/notifications`)
- `GET /api/notifications`: Retrieve in-app alerts for user or role.
- `PUT /api/notifications/:id/read`: Mark notification as read.
- `PUT /api/notifications/read-all`: Mark all notifications as read.

---

## 3. Setup & Execution

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root or `backend/` directory:
```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/meal_connect
JWT_SECRET=meal_connect_jwt_super_secret_key_2026_antigravity_dev
JWT_EXPIRES_IN=7d
```

### 2. Start Backend Server
```bash
cd backend
npm start
```
Or from root:
```bash
npm run server
```

The server connects to MongoDB, seeds initial demo accounts if empty, and listens on `http://localhost:5000`.
