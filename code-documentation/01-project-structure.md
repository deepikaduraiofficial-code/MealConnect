# 01 – Project Architecture & Directory Structure

> **Meal Connect (Food Rescue Marketplace)**  
> Comprehensive overview of the project file tree, structural organization, role of every file and folder, and architectural patterns.

---

## 📑 Table of Contents
1. [Full Directory Tree](#full-directory-tree)
2. [Architectural Layers](#architectural-layers)
3. [Folder Breakdown & Roles](#folder-breakdown--roles)
4. [File Mapping & Descriptions](#file-mapping--descriptions)
5. [Dependency Breakdown](#dependency-breakdown)

---

## 1. Full Directory Tree

```
MealConnect/
├── .env.example                               # Active root environment variables template
├── .gitignore                                 # Git ignore definitions (ignores .env, node_modules, dist)
├── index.html                                 # Single-Page Application (SPA) HTML entry point
├── package.json                               # Unified root dependencies and automation scripts
├── vite.config.js                             # Vite dev server configuration and API proxy rules
│
├── backend/                                   # Dedicated Backend Architecture (Node.js + Express + Mongoose)
│   ├── .env.example                           # Backend environment variables template
│   ├── package.json                           # Backend dependencies and standalone scripts
│   ├── README.md                              # Backend architectural manual and API appendix
│   ├── server.js                              # Express application entry, CORS, and route mounting
│   ├── config/
│   │   └── database.js                        # Mongoose MongoDB connection manager
│   ├── controllers/
│   │   ├── adminController.js                 # Admin management, verifications, audits & reports
│   │   ├── authController.js                  # User registration, authentication, JWT issuing
│   │   ├── cartController.js                  # Trust shopping cart operations and quantity limits
│   │   ├── foodController.js                  # Surplus food CRUD, dynamic shelf-life & filters
│   │   ├── impactController.js                # Database-calculated environmental & food metrics
│   │   ├── notificationController.js          # Multi-role notification alerts and read status
│   │   ├── orderController.js                 # Order lifecycle, inventory updates & PIN/QR verification
│   │   └── paymentController.js               # Mock payment simulation & Razorpay gateway handler
│   ├── middleware/
│   │   ├── auth.js                            # Bearer JWT verification & role-based guards
│   │   └── errorHandler.js                    # Centralized HTTP and Mongoose error handler
│   ├── models/
│   │   ├── Cart.js                            # Trust shopping cart schema
│   │   ├── Food.js                            # Surplus food listings schema with indexes
│   │   ├── Notification.js                    # Multi-role alert schema
│   │   ├── Order.js                           # Order lifecycle, timeline, QR & PIN schema
│   │   ├── Payment.js                         # Financial transaction & simulation audit schema
│   │   └── User.js                            # User schema (Hotel, Trust, Admin) with bcrypt hashing
│   ├── routes/
│   │   ├── adminRoutes.js                     # /api/admin/* endpoints
│   │   ├── authRoutes.js                      # /api/auth/* endpoints
│   │   ├── cartRoutes.js                      # /api/cart/* endpoints
│   │   ├── foodRoutes.js                      # /api/food/* endpoints
│   │   ├── impactRoutes.js                    # /api/impact/* endpoints
│   │   ├── notificationRoutes.js              # /api/notifications/* endpoints
│   │   ├── orderRoutes.js                     # /api/orders/* endpoints
│   │   └── paymentRoutes.js                   # /api/payments/* endpoints
│   └── utils/
│       ├── expiryHelper.js                    # Server-side dynamic shelf-life calculation
│       └── seedData.js                        # Automated database seeder with demo accounts & food
│
├── public/                                    # Public Static Assets
│   ├── favicon.svg                            # Application favicon
│   ├── icons.svg                              # SVG symbol definitions
│   └── food-images/                           # Real food photographs (South Indian meals, biryani, dosas, etc.)
│
├── scripts/
│   └── test-api.js                            # Automated backend integration test suite (21 test cases)
│
└── src/                                       # Frontend Client Application (React 19 + Tailwind CSS)
    ├── App.css                                # Global CSS transitions, badges, and layout utilities
    ├── App.jsx                                # Main application router, modal containers & route views
    ├── index.css                              # Tailwind CSS v4 styling rules & design variables
    ├── main.jsx                               # React DOM root render tree
    ├── assets/                                # Frontend UI graphics and logos
    ├── components/                            # Reusable UI Components & Modals
    │   ├── AdminReportModal.jsx               # Modal for previewing and downloading audit reports
    │   ├── AuthModal.jsx                      # Reusable quick login modal
    │   ├── CartDrawer.jsx                     # Interactive slide-over cart drawer
    │   ├── DeleteConfirmationModal.jsx        # Deletion confirmation dialog for hotel food listings
    │   ├── EditFoodModal.jsx                  # Modal for updating food items, quantities, and prices
    │   ├── FoodCard.jsx                       # Marketplace food listing card with countdown badge
    │   ├── FoodDetailsModal.jsx               # Deep-dive view of food nutrition, hotel info & pickup
    │   ├── Footer.jsx                         # Site footer with platform links and mission statement
    │   ├── MapModal.jsx                       # Interactive modal for viewing hotel location
    │   ├── Navbar.jsx                         # Top navigation bar with role switcher & notifications
    │   ├── NearbyRescueMap.jsx                # Geographic distance visualization component
    │   ├── NotificationDropdown.jsx           # Real-time notification menu
    │   ├── QrVerificationModal.jsx            # Hotel QR code scanner and manual PIN input modal
    │   ├── ReceiptModal.jsx                   # Downloadable payment and rescue claim receipt
    │   └── Toast.jsx                          # Non-intrusive UI feedback alerts
    ├── context/
    │   └── AppContext.jsx                     # Centralized React Context with backend API synchronization
    ├── data/
    │   └── mockData.js                        # Client fallback datasets for offline demonstration
    ├── services/
    │   └── api.js                             # Centralized HTTP API client with auth token management
    ├── utils/
    │   ├── dateUtils.js                       # Date formatting and countdown utilities
    │   ├── expiryUtils.js                     # Dynamic shelf-life calculation helpers
    │   ├── foodImageResolver.js               # Resolves food names to corresponding local image assets
    │   ├── pdfReportGenerator.js              # Client-side PDF generation using jsPDF & autoTable
    │   └── qrUtils.js                         # QR code string generation and decryption helpers
    └── views/                                 # Page-level View Components
        ├── AdminDashboard.jsx                 # Admin control panel: verifications, listings & metrics
        ├── AdminLoginPage.jsx                 # Secure login interface for system administrators
        ├── CheckoutPage.jsx                   # Trust checkout, summary, and mock payment portal
        ├── HotelAuthPage.jsx                  # Hotel registration and login portal
        ├── HotelDashboard.jsx                 # Hotel portal: add food, manage listings, verify QR
        ├── ImpactPage.jsx                     # Public impact metrics (meals rescued, CO2 avoided)
        ├── LandingPage.jsx                    # Hero landing page with features and testimonials
        ├── MarketplacePage.jsx                # Main surplus food marketplace with filters & search
        ├── OrderHistoryPage.jsx               # Complete order logs with statuses and receipt access
        ├── OrderTrackingPage.jsx              # Real-time order progress timeline and pickup PIN/QR
        ├── PaymentHistoryPage.jsx             # Financial & mock transaction ledger
        ├── PaymentSuccessPage.jsx             # Post-checkout confirmation and receipt download
        ├── RoleSelectPage.jsx                 # Portal selection screen (Hotel, Trust, Admin)
        ├── TrustAuthPage.jsx                  # Trust/NGO registration and login portal
        └── TrustDashboard.jsx                 # Trust portal: active rescues, cart, orders & history
```

---

## 2. Architectural Layers

Meal Connect is built as a modernized **MERN (MongoDB, Express.js, React, Node.js)** full-stack application structured into three decoupled layers:

### Presentation Layer (`src/`)
- Built with **React 19** using functional components, standard hooks (`useState`, `useEffect`, `useMemo`, `useCallback`), and the React Context API (`AppContext.jsx`).
- Handles presentation, responsiveness, user input validation, client-side filtering, interactive modals, and real-time countdown clocks.
- Communicates with the backend exclusively via an asynchronous API service client (`src/services/api.js`).

### Application & API Layer (`backend/`)
- Built with **Node.js** and **Express.js**.
- Encapsulates RESTful API routing, JWT authentication, role-based authorization guards, request sanitization, dynamic shelf-life calculation, and error translation.
- Provides robust database transactions, atomic inventory management, QR/PIN verification routines, and simulated mock payment gateways.

### Data Layer (`MongoDB`)
- Utilizes **MongoDB** managed via **Mongoose v9**.
- Enforces relational schemas with document references (`ref: 'User'`, `ref: 'Food'`), timestamping, composite indexes (e.g., text search on food items), and aggregation pipelines for reporting and environmental impact calculation.

---

## 3. Folder Breakdown & Roles

### `backend/config/`
Houses database connection setup and environment configurations. The `database.js` module implements resilient connection pooling with auto-reconnection logic.

### `backend/models/`
Defines strict Mongoose schemas for all entities in the platform. Each model defines fields, types, required constraints, default values, references, and pre-save hooks (such as bcrypt password hashing on `User.js`).

### `backend/controllers/`
Encapsulates all core business logic. Controllers receive incoming Express requests, validate input parameters, query the database, enforce role rules, and return standardized JSON responses.

### `backend/middleware/`
Contains reusable Express middleware:
- `auth.js`: Extracts Bearer tokens from incoming HTTP `Authorization` headers, verifies JWT authenticity, attaches the authenticated user record to `req.user`, and blocks unauthorized roles.
- `errorHandler.js`: Intercepts unhandled exceptions and Mongoose validation errors, transforming them into clean, predictable HTTP error responses (`{ success: false, error: "..." }`).

### `backend/routes/`
Defines the REST API endpoints and binds HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) to corresponding controller functions and middleware guards.

### `backend/utils/`
Contains reusable backend helpers:
- `expiryHelper.js`: Standardizes dynamic shelf-life calculation so foods prepared earlier retain positive time remaining.
- `seedData.js`: Seeds sample hotels, trusts, administrators, and food listings if the database is initially empty.

### `src/components/`
Modular UI components used across multiple pages, including navigation bars, footers, search inputs, modal dialogs, and toast notifications.

### `src/views/`
Page-level components that assemble smaller components into complete user workflows, such as Dashboards, Marketplaces, Checkouts, and Authentication pages.

### `src/services/`
Contains `api.js`, which encapsulates all HTTP interactions with the backend server. It handles base URLs, token persistence in `localStorage`, request headers, and standardized error parsing.

---

## 4. Dependency Breakdown

### Root `package.json`
- **React & DOM (`react`, `react-dom`)**: UI components and virtual DOM rendering.
- **Lucide React (`lucide-react`)**: High-performance SVG icon components.
- **jsPDF & html2canvas (`jspdf`, `jspdf-autotable`, `html2canvas`)**: Client-side PDF generation for administrative audit reports and pickup receipts.
- **QRCode (`qrcode`)**: Generates verification QR codes for order handover.
- **Canvas Confetti (`canvas-confetti`)**: Celebratory micro-animations upon successful food rescue checkout.
- **Concurrently (`concurrently`)**: Enables running both backend and frontend dev servers concurrently with `npm run dev:all`.

### Backend `package.json`
- **Express (`express`)**: HTTP web framework.
- **Mongoose (`mongoose`)**: MongoDB object modeling and validation.
- **JSONWebToken (`jsonwebtoken`)**: Stateless user session security.
- **BcryptJS (`bcryptjs`)**: Cryptographic hashing of passwords.
- **CORS (`cors`)**: Cross-Origin Resource Sharing middleware.
- **Dotenv (`dotenv`)**: Loads configuration variables from `.env`.
- **Morgan (`morgan`)**: HTTP request logging for development and debugging.
- **Razorpay (`razorpay`)**: Optional production payment gateway integration SDK.
