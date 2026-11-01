# SmartCart Frontend

SmartCart is a React and Vite e-commerce frontend backed by a Spring Boot REST API. It supports product discovery, category filtering, search, cart management, checkout, Google sign-in, AI-powered product tools, and admin order management.

## Features

- Responsive product catalog with category filtering and product search
- Product details with stock-aware add-to-cart behavior
- Persistent shopping cart using browser storage
- Checkout and order confirmation flow
- User and administrator authentication
- Admin product creation, editing, deletion, and order management
- AI-assisted product descriptions, images, and shopping chat
- Consistent opaque success and error notifications
- Netlify SPA routing support

## Technology

- React 18
- Vite
- React Router
- Axios
- Bootstrap and React Bootstrap
- React Toastify
- Google Identity Services

## Requirements

- Node.js 18 or newer
- npm
- A running instance of the SmartCart Spring Boot backend

Backend repository:

https://github.com/Soumadeep1221/SpringEcommerce_Backend

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and set the values:

```env
VITE_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

`VITE_BASE_URL` should contain the backend origin only. Do not append `/api`; the frontend adds that path automatically.

### 3. Start the development server

```bash
npm run dev
```

The app is available at the local Vite URL, usually:

http://localhost:5173

## Production Build

Run the checks and create the production bundle:

```bash
npm run lint
npm run build
```

Preview the production bundle locally:

```bash
npm run preview
```

The generated files are written to `dist/`.

## Netlify Deployment

Use the following Netlify build settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |

Add these environment variables in **Site configuration → Environment variables**:

| Variable | Description |
|---|---|
| `VITE_BASE_URL` | Production backend origin, without `/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

The `public/_redirects` file is included so React Router routes work correctly after direct navigation or page refresh.

## Repository Commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run preview   # Preview the production build
```

## Related Repository

Frontend repository:

https://github.com/Soumadeep1221/SpringEcommerce_Frontend
