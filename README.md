# SmartCart — Modern Full-Stack E-Commerce Frontend

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![ESLint](https://img.shields.io/badge/ESLint-8.57-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SmartCart** is a production-ready, responsive e-commerce single-page application (SPA) built with **React 18**, **Vite**, and **Bootstrap 5**, integrated with a **Spring Boot REST API** and **AI-powered shopping assistance**. It provides a sleek, modern storefront experience with Google OAuth 2.0 authentication, dynamic inventory management, persistent cart handling, AI product description and image generation, an interactive shopping assistant chatbot, and an administrative order management dashboard.

---

## 📑 Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Available Scripts](#available-scripts)
- [Deployment Guide](#deployment-guide)
  - [Netlify Deployment](#1-netlify-recommended)
  - [Vercel Deployment](#2-vercel)
  - [Docker / Nginx / Static Hosting](#3-nginx--docker--static-hosting)
- [Deployment Readiness Checklist](#deployment-readiness-checklist)
- [Related Repositories & API Reference](#related-repositories--api-reference)

---

## Overview & Architecture

SmartCart adopts a decoupled client-server architecture:
- **Frontend**: Client-side single-page application served as static HTML, JS, and CSS bundles built by Vite.
- **Backend**: Spring Boot REST API handling authentication, product catalog, orders, and AI proxying.
- **Authentication**: Google Identity Services (GIS) on the client, exchanging ID tokens with the backend for a signed JSON Web Token (JWT).
- **AI Integrations**: Proxy endpoints powered by generative AI models for real-time customer Q&A, automatic product descriptions, and automated image generation.

```
┌────────────────────────────────────────────────────────┐
│                   SmartCart Frontend                   │
│         (React 18 + Vite + Bootstrap 5 + Toastify)     │
└────────────┬─────────────────────────────┬─────────────┘
             │ Axios (Bearer JWT)          │ Google Identity
             ▼                             ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│ Spring Boot Backend API   │  │ Google Cloud Platform   │
│ - Auth & RBAC (User/Admin)│  │ (OAuth 2.0 Client ID)   │
│ - Products & Inventory    │  └─────────────────────────┘
│ - Orders & Checkout       │
│ - AI Services Proxy       │
└───────────────────────────┘
```

---

## Key Features

### 🛍️ Customer Experience
- **Curated Storefront**: Browse products with instant category filters (`Laptop`, `Headphone`, `Mobile`, `Electronics`, `Toys`, `Fashion`) and debounced real-time search.
- **Stock-Aware Shopping**: Real-time stock counters, low-stock warnings, and immediate UI feedback that prevents over-purchasing.
- **Persistent Cart**: LocalStorage-backed cart surviving reloads, with quantity increment/decrement and instant pricing updates.
- **Seamless Checkout**: Streamlined checkout modal capturing customer information and validating stock prior to order confirmation.
- **Interactive AI Chatbot**: Built-in floating AI shopping assistant to query product stock, details, pricing, and order status.

### 🛡️ Authentication & Authorization
- **Google One-Tap / OAuth 2.0**: Secure authentication via Google Identity Services without handling sensitive credentials on the client.
- **Role-Based Access Control (RBAC)**: Distinct permissions for standard customers and administrators:
  - Automatic route guards (`RequireAuth`, `RequireAdmin`).
  - Graceful handling of HTTP 401 (automatic sign-out and redirect to `/login`) and HTTP 403 (non-intrusive permission alerts).
- **Token Credit System**: Displays remaining AI credits for regular users with live balance deduction headers (`x-token-balance`), while administrators receive unlimited usage.

### ⚙️ Admin Capabilities
- **Product Management**: Create new products and modify existing listings with image uploads.
- **AI-Assisted Cataloging**: One-click AI generation of product descriptions and photorealistic product images directly from the form.
- **Order Management Dashboard**: View, filter, and inspect detailed breakdowns of customer orders, shipment status, and itemized receipts.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Framework & Core** | React 18, React DOM |
| **Build Tooling** | Vite 5, @vitejs/plugin-react-swc |
| **Routing** | React Router DOM v6 |
| **Styling & Icons** | Bootstrap 5, React Bootstrap, Bootstrap Icons, Custom Design Tokens |
| **HTTP Client** | Axios (configured with interceptors, caching, and custom events) |
| **Authentication** | Google Identity Services (GSI SDK) |
| **Notifications** | React Toastify |
| **Code Quality** | ESLint 8, Prettier-compatible rules |

---

## Project Structure

```
SpringEcommerce_Frontend/
├── .env.example              # Sample environment configuration template
├── .eslintrc.cjs             # ESLint configuration (react, react-hooks)
├── .gitignore                # Git ignore rules (node_modules, .env, dist)
├── index.html                # HTML entry point with CDN fonts & bootstrap resources
├── package.json              # Project dependencies and script definitions
├── vite.config.js            # Vite configuration with SWC React plugin
├── public/
│   ├── _redirects            # Netlify SPA redirect rule (/* /index.html 200)
│   └── vite.svg              # Application favicon
└── src/
    ├── main.jsx              # React DOM root entry point
    ├── App.jsx               # Route definitions, guards, and layout wrapping
    ├── axios.jsx             # Axios instance, interceptors, and base URL config
    ├── assets/               # Static graphics (unplugged fallback, icons)
    ├── components/
    │   ├── AddProduct.jsx    # Admin product creation form with AI generation
    │   ├── Cart.jsx          # Shopping cart page and order summary
    │   ├── ChatBot.jsx       # Floating AI assistant dialog
    │   ├── CheckoutPopup.jsx # Modal for customer details and order submission
    │   ├── Home.jsx          # Hero section, category filter chips, product grid
    │   ├── Login.jsx         # Google Identity authentication screen
    │   ├── Navbar.jsx        # Navigation bar, search dropdown, profile menu
    │   ├── Order.jsx         # Admin order tracking and order inspection
    │   ├── OrderSuccessModal.jsx # Post-purchase confirmation modal
    │   ├── Product.jsx       # Single product detailed view and stock management
    │   └── UpdateProduct.jsx # Admin product editing form
    ├── constants/
    │   └── categories.js     # Single source of truth for product categories
    ├── Context/
    │   ├── AuthContext.jsx   # Authentication state, session check, token costs
    │   └── Context.jsx       # Global product catalog, cart state, in-memory cache
    ├── styles/
    │   └── globals.css       # Core design tokens, theme variables, custom typography
    └── utils/
        ├── ai.js             # AI response token parsing and error handling
        └── formatters.js     # Currency (INR), date (DD/MM/YYYY), debounce utilities
```

---

## Prerequisites

Ensure you have the following installed locally:
- **Node.js**: `v18.0.0` or higher (Node 20+ / 22+ recommended)
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)
- **Backend API**: Running instance of [SpringEcommerce_Backend](https://github.com/Soumadeep1221/SpringEcommerce_Backend)
- **Google Cloud Console Project**: Configured OAuth 2.0 Web Client ID

---

## Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Define the following environment variables:

| Variable | Required | Description | Example (Development) | Example (Production) |
|---|---|---|---|---|
| `VITE_BASE_URL` | **Yes** | Origin URL of your Spring Boot backend (do **not** append `/api`). | `http://localhost:8080` | `https://api.yourdomain.com` |
| `VITE_GOOGLE_CLIENT_ID` | **Yes** | Google Cloud OAuth 2.0 Web Client ID. | `75180...apps.googleusercontent.com` | `75180...apps.googleusercontent.com` |

> ⚠️ **Important:** Do not append `/api` to `VITE_BASE_URL`. The application's Axios configuration (`src/axios.jsx`) automatically appends `/api` to all request paths.

---

## Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/Soumadeep1221/SpringEcommerce_Frontend.git
cd SpringEcommerce_Frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Ensure `.env` contains your backend URL and Google Client ID as shown in the table above.

### 4. Run the development server
```bash
npm run dev
```

The application will start with Hot Module Replacement (HMR) at:
```
http://localhost:5173
```

---

## Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server on port 5173 with HMR. |
| `npm run build` | Compiles and bundles production assets into the `dist/` directory. |
| `npm run lint` | Runs ESLint across all `.js` and `.jsx` files with zero-warning tolerance. |
| `npm run preview` | Spins up a local static server to test the production `dist/` build. |

---

## Deployment Guide

### 1. Netlify (Recommended)
This repository includes a `public/_redirects` file that is copied directly into `dist/_redirects` during build.

1. Connect your repository to Netlify.
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add Environment Variables in **Site configuration → Environment variables**:
   - `VITE_BASE_URL` = `https://your-spring-backend.com`
   - `VITE_GOOGLE_CLIENT_ID` = `your-client-id.apps.googleusercontent.com`
4. Trigger deploy.

### 2. Vercel
1. Import the repository in Vercel.
2. Framework Preset will auto-detect as **Vite**.
3. Set the Environment Variables (`VITE_BASE_URL` and `VITE_GOOGLE_CLIENT_ID`).
4. To ensure SPA client-side routing on page refresh, create a `vercel.json` file in the root if not present:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### 3. Nginx / Docker / Static Hosting
When hosting on standard Nginx, ensure SPA route fallback is enabled in your server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Deployment Readiness Checklist

Before moving this application to production, verify each item on this checklist:

- [x] **Zero Build Errors**: `npm run build` executes cleanly with Vite and generates optimized chunks in `dist/`.
- [x] **Zero Lint Warnings**: `npm run lint` passes without any syntax, style, or hook dependency warnings.
- [x] **SPA Routing Fallback**: `public/_redirects` is present for Netlify/Cloudflare; `vercel.json` or Nginx `try_files` configured for other providers.
- [ ] **Production Backend URL**: `VITE_BASE_URL` is set to an **HTTPS** production endpoint (e.g. `https://api.yourdomain.com`).
- [ ] **HTTPS Mixed Content Protection**: Both frontend and backend must use HTTPS. Browsers will block HTTP API requests from an HTTPS frontend.
- [ ] **Google Cloud OAuth Origins**:
  - Open [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
  - Add your production domain (e.g. `https://smartcart.netlify.app`) to **Authorized JavaScript origins**.
  - Add `https://smartcart.netlify.app` to **Authorized redirect URIs**.
- [ ] **Backend CORS Configuration**: Verify that your Spring Boot backend's `CorsConfiguration` allows requests from your production frontend domain and exposes the `x-token-balance` header.
- [ ] **Secrets & API Keys**: Confirm no production credentials or private keys are committed into version control.

---

## Related Repositories & API Reference

- **Backend Repository**: [SpringEcommerce_Backend](https://github.com/Soumadeep1221/SpringEcommerce_Backend)
- **Frontend Repository**: [SpringEcommerce_Frontend](https://github.com/Soumadeep1221/SpringEcommerce_Frontend)

---

## License

This project is licensed under the [MIT License](LICENSE).
