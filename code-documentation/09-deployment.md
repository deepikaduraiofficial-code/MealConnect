# 09 – Deployment & Production Architecture

> **Meal Connect (Food Rescue Marketplace)**  
> Production deployment architecture, containerization with Docker, cloud database hosting on MongoDB Atlas, environment hardening, and security checklists.

---

## 📑 Table of Contents
1. [Deployment Architecture Options](#1-deployment-architecture-options)
2. [Option A: Decoupled Cloud Deployment (Recommended)](#2-option-a-decoupled-cloud-deployment-recommended)
   - [Frontend Hosting (Vercel / Netlify)](#frontend-hosting-vercel--netlify)
   - [Backend Hosting (Render / Railway / AWS EC2)](#backend-hosting-render--railway--aws-ec2)
3. [Option B: Unified Full-Stack Node.js Deployment](#3-option-b-unified-full-stack-nodejs-deployment)
4. [Option C: Docker Containerization](#4-option-c-docker-containerization)
   - [`Dockerfile` (Backend Service)](#dockerfile-backend-service)
   - [`docker-compose.yml` (Full-Stack Composition)](#docker-composeyml-full-stack-composition)
5. [Cloud Database Setup (MongoDB Atlas)](#5-cloud-database-setup-mongodb-atlas)
6. [Production Security Checklist](#6-production-security-checklist)
7. [Post-Deployment Verification](#7-post-deployment-verification)

---

## 1. Deployment Architecture Options

Meal Connect can be deployed in three supported production configurations:

```mermaid
flowchart TD
    subgraph OptionA["Option A: Decoupled Cloud Deployment"]
        ClientA["React SPA<br/>(Vercel / Netlify CDN)"]
        ServerA["Node.js / Express API<br/>(Render / Railway / Fly.io)"]
        AtlasA[("MongoDB Atlas<br/>(Cloud Cluster)")]
        ClientA -->|HTTPS / JSON API| ServerA
        ServerA -->|Mongoose Connection Pool| AtlasA
    end

    subgraph OptionB["Option B: Unified Monolithic Deployment"]
        Monolith["Node.js Server<br/>(Express serves API + Vite dist/ build)"]
        AtlasB[("MongoDB Atlas / Local DB")]
        Monolith --> AtlasB
    end

    subgraph OptionC["Option C: Dockerized Deployment"]
        DockerFE["Frontend Container<br/>(Nginx)"]
        DockerBE["Backend Container<br/>(Node.js)"]
        DockerDB[("MongoDB Container<br/>(Persistent Volume)")]
        DockerFE --> DockerBE
        DockerBE --> DockerDB
    end
```

---

## 2. Option A: Decoupled Cloud Deployment (Recommended)

### Frontend Hosting (Vercel / Netlify)
1. Push your repository to GitHub.
2. In Vercel or Netlify, import the repository.
3. Configure the build parameters:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set the Environment Variable:
   - `VITE_API_URL`: `https://api.yourdomain.com/api` (or your Render/Railway backend URL).
5. For Single Page App (SPA) client-side routing on Netlify, add a `public/_redirects` file:
   ```text
   /*    /index.html   200
   ```
   Or for Vercel, a `vercel.json` file:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```

### Backend Hosting (Render / Railway / AWS EC2)
1. In Render or Railway, create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Root Directory**: `.` (or `backend`)
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
4. Configure production environment variables in the dashboard:
   - `PORT`: `5000` (or leave default for auto-assigned ports)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/meal_connect?retryWrites=true&w=majority`
   - `JWT_SECRET`: *(A secure 64-character random string)*
   - `FRONTEND_URL`: `https://your-frontend.vercel.app`

---

## 3. Option B: Unified Full-Stack Node.js Deployment

In this configuration, Express serves both the REST API and the compiled Vite static assets:

1. Build the frontend production bundle:
   ```bash
   npm run build
   ```
2. Serve the `dist/` directory from `backend/server.js`:
   ```javascript
   // Serve compiled frontend build
   app.use(express.static(path.join(__dirname, '../dist')));

   // All remaining requests fallback to index.html (SPA client routing)
   app.get('*', (req, res) => {
     res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
   });
   ```
3. Start the application:
   ```bash
   npm start
   ```

---

## 4. Option C: Docker Containerization

### `Dockerfile` (Backend Service)

```dockerfile
# Multi-stage production build for Node.js Express Backend
FROM node:20-alpine AS base

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY backend ./backend
COPY public ./public

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

### `docker-compose.yml` (Full-Stack Composition)

```yaml
version: '3.8'

services:
  database:
    image: mongo:6-jammy
    container_name: meal_connect_db
    restart: always
    environment:
      MONGO_INITDB_DATABASE: meal_connect
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: meal_connect_api
    restart: always
    environment:
      - PORT=5000
      - NODE_ENV=production
      - MONGODB_URI=mongodb://database:27017/meal_connect
      - JWT_SECRET=production_super_secret_jwt_key_meal_connect_2026
      - FRONTEND_URL=http://localhost:5173
    ports:
      - "5000:5000"
    depends_on:
      - database

volumes:
  mongo_data:
```

Launch the containerized stack:
```bash
docker-compose up -d --build
```

---

## 5. Cloud Database Setup (MongoDB Atlas)

1. **Create an Account**: Register at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Build a Cluster**: Select the **M0 Free Tier** (512 MB storage, shared RAM) hosted in your target region.
3. **Database User**: Navigate to **Database Access** -> **Add New Database User**. Use password-based authentication.
4. **Network Access**: Navigate to **Network Access** -> **Add IP Address**. For cloud hosting (Render/Vercel), select `Allow Access from Anywhere` (`0.0.0.0/0`).
5. **Connection String**: Click **Connect** -> **Drivers** -> **Node.js** and copy the URI into your `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://admin_user:YourSecurePassword123@mealconnect.abcde.mongodb.net/meal_connect?retryWrites=true&w=majority
   ```

---

## 6. Production Security Checklist

- [ ] **HTTPS Enforced**: Ensure all traffic is encrypted with TLS/SSL.
- [ ] **Secret Isolation**: Confirm no passwords, JWT secrets, or connection strings are present in code files.
- [ ] **Restricted CORS**: Update `FRONTEND_URL` from wildcard to your production domain (`https://mealconnect.org`).
- [ ] **Rate Limiting**: Attach `express-rate-limit` to public authentication routes (`/api/auth/*`) to prevent brute-force attacks.
- [ ] **Payload Sanitization**: Ensure Mongoose schema casting and payload limits protect against NoSQL injection.
- [ ] **Error Stack Suppression**: Verify `NODE_ENV=production` suppresses stack traces in HTTP responses.

---

## 7. Post-Deployment Verification

After deploying your application, run these validation checks:

```bash
# 1. Verify API Health Endpoint
curl -i https://your-backend-domain.com/api/health

# Expected HTTP 200 OK Response:
# {"status":"online","system":"Meal Connect Food Rescue Backend API","version":"1.0.0"}

# 2. Verify Impact Statistics Endpoint
curl -i https://your-backend-domain.com/api/impact

# 3. Test Automated Suite against Production Endpoint
TEST_API_URL=https://your-backend-domain.com/api node scripts/test-api.js
```
