# 07 – Configuration, Environment & Setup Guide

> **Meal Connect (Food Rescue Marketplace)**  
> Technical documentation covering project configurations, dependency manifests, environment variable specifications, build configurations, and step-by-step setup instructions.

---

## 📑 Table of Contents
1. [Environment Variables Specification](#1-environment-variables-specification)
2. [Environment Configuration Templates](#2-environment-configuration-templates)
   - [Root `.env.example`](#root-envexample)
   - [Backend `.env.example`](#backend-envexample)
3. [Configuration Files Source Code](#3-configuration-files-source-code)
   - [`package.json` (Root Workspace)](#packagejson-root-workspace)
   - [`backend/package.json` (Standalone Backend)](#backendpackagejson-standalone-backend)
   - [`vite.config.js` (Frontend Build & Proxy)](#viteconfigjs-frontend-build--proxy)
   - [`index.html` (Application HTML Shell)](#indexhtml-application-html-shell)
4. [Step-by-Step Installation Guide](#4-step-by-step-installation-guide)
   - [Prerequisites](#prerequisites)
   - [Cloning & Dependency Installation](#cloning--dependency-installation)
   - [Database Configuration (Local vs MongoDB Atlas)](#database-configuration-local-vs-mongodb-atlas)
   - [Running the Application](#running-the-application)

---

## 1. Environment Variables Specification

> [!IMPORTANT]
> Never commit active `.env` files containing production secrets, database credentials, or private cryptographic keys to version control. All sensitive keys are loaded via environment variables and preserved in `.gitignore`.

| Variable Name | Required | Default Value | Description |
|---|:---:|---|---|
| `PORT` | Optional | `5000` | Port on which the Express.js backend server listens |
| `NODE_ENV` | Optional | `development` | Environment mode (`development`, `production`, `test`) |
| `MONGODB_URI` | Required | `mongodb://127.0.0.1:27017/meal_connect` | Connection URI for the MongoDB database instance |
| `JWT_SECRET` | Required | *(Custom 64-char string)* | Cryptographic secret key used to sign and verify Bearer JWT tokens |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token expiration duration (`7d`, `24h`, etc.) |
| `RAZORPAY_KEY_ID` | Optional | `your_razorpay_key_id` | Razorpay API key ID (for live payment processing) |
| `RAZORPAY_KEY_SECRET` | Optional | `your_razorpay_key_secret` | Razorpay API key secret for HMAC signature verification |
| `FRONTEND_URL` | Optional | `http://localhost:5173` | Allowed origin for Cross-Origin Resource Sharing (CORS) |
| `VITE_API_URL` | Optional | `http://localhost:5000/api` | Base URL used by the React client to make backend API requests |

---

## 2. Environment Configuration Templates

### Root `.env.example`

```env
# Server Port & Environment
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Local MongoDB Community Server or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/meal_connect

# JWT Secret Key and Expiry
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Payment Simulation & Optional Razorpay Credentials
# By default, mock payment simulation is active without external credentials.
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend Client Origin for CORS
FRONTEND_URL=http://localhost:5173

# Frontend API URL (Used by Vite)
VITE_API_URL=http://localhost:5000/api
```

### Backend `.env.example`

```env
# Server Port & Environment
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Local MongoDB or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/meal_connect

# JWT Secret Key and Expiry
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Payment Simulation & Optional Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend Client Origin for CORS
FRONTEND_URL=http://localhost:5173
```

---

## 3. Configuration Files Source Code

### `package.json` (Root Workspace)

Purpose: Manages dependencies for both the React frontend and unified full-stack scripts, enabling concurrent development via `concurrently`.

```json
{
  "name": "meal-connect",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "server": "node backend/server.js",
    "dev:all": "concurrently -k -p \"[{name}]\" -n \"BACKEND,FRONTEND\" -c \"blue.bold,green.bold\" \"npm run server\" \"npm run dev\"",
    "start": "node backend/server.js",
    "test:api": "node scripts/test-api.js",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "bcryptjs": "^3.0.3",
    "canvas-confetti": "^1.9.4",
    "concurrently": "^10.0.6",
    "cors": "^2.8.6",
    "dotenv": "^18.0.8",
    "express": "^5.3.0",
    "jsonwebtoken": "^9.0.3",
    "jspdf": "^4.2.1",
    "lucide-react": "^1.49.0",
    "mongoose": "^9.11.3",
    "morgan": "^1.12.1",
    "qrcode": "^1.5.4",
    "razorpay": "^2.9.8",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "oxlint": "^1.81.0",
    "vite": "^8.3.0"
  }
}
```

---

### `backend/package.json` (Standalone Backend)

Purpose: Encapsulates backend dependencies so the server can be deployed, containerized, or distributed independently as a standalone Node.js service.

```json
{
  "name": "meal-connect-backend",
  "version": "1.0.0",
  "description": "Backend API server for Meal Connect Food Rescue Marketplace",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^18.0.8",
    "express": "^5.3.0",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.11.3",
    "morgan": "^1.12.1",
    "qrcode": "^1.5.4",
    "razorpay": "^2.9.8"
  },
  "keywords": [
    "food-rescue",
    "sustainability",
    "zero-waste",
    "express",
    "mongodb",
    "nodejs"
  ],
  "author": "Meal Connect Team",
  "license": "MIT"
}
```

---

### `vite.config.js` (Frontend Build & Proxy)

Purpose: Configures the Vite development server on port `5173`, registers React 19 and Tailwind CSS plugins, and establishes an automated reverse proxy forwarding `/api` calls directly to the Express backend on port `5000`.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

### `index.html` (Application HTML Shell)

Purpose: SPA entry HTML file providing viewport meta tags, custom food rescue favicon, Google Fonts (`Inter` and `Plus Jakarta Sans`), and mounts `#root`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍲</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meal Connect | Rescue Food. Reduce Waste. Feed Communities.</title>
    <meta name="description" content="Connecting Hotels & Restaurants with Verified Trusts/NGOs to rescue edible surplus food, reduce food waste, and feed communities." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 4. Step-by-Step Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node.js v20 & v24 LTS)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB Community Server v6+ running on port `27017` or a free MongoDB Atlas cluster connection string.

### Cloning & Dependency Installation
1. Clone the project repository:
   ```bash
   git clone https://github.com/deepikaduraiofficial-code/MealConnect.git
   cd MealConnect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Database Configuration (Local vs MongoDB Atlas)
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. For local MongoDB, verify that the MongoDB service is active:
   ```bash
   # Windows (PowerShell)
   Get-Service MongoDB
   
   # Linux / macOS
   sudo systemctl status mongod
   ```
3. For **MongoDB Atlas**:
   - Create a free Shared Cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
   - In Database Access, create a database user and password.
   - In Network Access, allow IP `0.0.0.0/0` (or your current IP).
   - Copy your connection string into `.env`:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/meal_connect?retryWrites=true&w=majority
     ```

### Running the Application

#### Option 1: Run Full-Stack Concurrently (Recommended)
Launches both the backend server (port `5000`) and the Vite client (port `5173`) in a single terminal:
```bash
npm run dev:all
```

#### Option 2: Run Separately in Two Terminals
```bash
# Terminal 1 - Start Backend Server
npm run server

# Terminal 2 - Start Frontend Dev Server
npm run dev
```

#### Option 3: Run Standalone Backend
```bash
cd backend
npm install
npm start
```
