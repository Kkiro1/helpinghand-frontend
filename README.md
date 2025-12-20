# HelpingHand Frontend (React)

HelpingHand is a donation platform UI that connects donors with campaigns. This repository contains the **frontend** (React) that talks to the Django/DRF backend via `/api/*` endpoints.

Start Now: [https://helping-hand-project.netlify.app/](https://helping-hand-project.netlify.app/)

---

## Features (Current)

- **Auth**

  - Login + Signup with role selection (donor / recipient / organization)
  - Stores JWT tokens in `localStorage`
  - Auto-refreshes access token when it expires (via `authFetch`)

- **Donor flow**

  - Donor Dashboard (totals + recent donations)
  - Browse Campaigns (search + category filter)
  - Campaign details + Donate flow
  - Donation History (filter by status)

- **Organization**

  - Basic Organization Dashboard route (WIP UI)

> Note: Recipient/Organization flows currently route to donor-style pages in some cases (placeholders).

---

## Tech Stack

- React 18
- React Router v6
- Create React App (CRA)
- Fetch API + `authFetch` helper for authenticated requests

---

## Project Structure

```
src/
  components/
    ProtectedRoute.js
  pages/
    Home.js
    Login.js
    Signup.js
    DonorHome.js
    Campaigns.js
    Donate.js
    DonationHistory.js
  utils/
    authFetch.js
  App.js
```

---

## Prerequisites

- Node.js **18+** (recommended)
- npm (comes with Node)

---

## Setup & Run (Development)

### 1) Install dependencies

```bash
npm install
```

### 2) Make sure the backend is running

The frontend is configured to send API requests to the backend in development via a CRA proxy:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`

Start your backend (example):

```bash
python manage.py runserver 127.0.0.1:8000
```

### 3) Start the frontend

```bash
npm start
```

---

## API Proxy (Important)

This repo uses CRA’s `proxy` field so the frontend can call the backend like this:

- `fetch("/api/campaigns/")`
  instead of:
- `fetch("http://127.0.0.1:8000/api/campaigns/")`

In `package.json` (already included):

```json
"proxy": "http://127.0.0.1:8000"
```

---

## Routes

- `/` → Home
- `/login` → Login
- `/signup` → Signup
- `/donor-home` → Donor dashboard (protected)
- `/campaigns` → Browse campaigns (protected)
- `/donate/:campaignId` → Donate to campaign (protected)
- `/donation-history` → Donation history (protected)
- `/organization` → Organization dashboard (protected)

Protected routing is handled by:

- `src/components/ProtectedRoute.js`

---

## Authentication & Local Storage Keys

### Tokens / session

Stored in `localStorage`:

- `auth:access` → JWT access token
- `auth:refresh` → JWT refresh token
- `auth:user` → user object (JSON)
- `userData` → frontend compatibility object used by some UI pages (JSON)

### Auto token refresh

All authenticated API calls should use:

- `src/utils/authFetch.js`

It automatically:

- Adds `Authorization: Bearer <access>`
- If it gets `401`, it tries `POST /api/auth/refresh/` using the refresh token
- Retries the original request with the new access token

---

## Backend Endpoints Used (Frontend Calls)

### Auth

- `POST /api/auth/login/`
- `POST /api/auth/register/`
- `POST /api/auth/refresh/`
- `GET  /api/auth/me/` (used by `ProtectedRoute`)

### Campaigns

- `GET /api/campaigns/`
- `GET /api/campaigns/<id>/`

### Donations

- `POST /api/donations/`
- `GET  /api/donations/`

**Donation payload (current frontend)**

```json
{
  "campaign": 1,
  "amount": 50,
  "paymentMethod": "card",
  "isAnonymous": false,
  "status": "Completed"
}
```

---

## Common Dev Issues

### “I’m logged in but still redirected to /login”

- Check `localStorage` has `auth:access`
- If access expired and refresh is missing/invalid, you’ll get redirected
- Fix: login again, or clear storage:

  - DevTools → Application → Local Storage → Clear

### CORS / Network errors

In development, you should **NOT** hit CORS if you use `/api/...` + proxy.
If you used full backend URLs manually, switch back to relative `/api/...`.

---

## Scripts

```bash
npm start      # run dev server
npm test       # run tests (CRA default)
npm run build  # production build
```

---

## Production Note (Proxy does NOT work in build)

CRA’s `"proxy"` is **dev-only**. For production you must:

- Serve frontend and backend under the same domain, **or**
- Update `authFetch` (and any direct `fetch`) to use a real API base URL (e.g. env var like `REACT_APP_API_BASE`).

---

## Quick Manual Test Flow

1. Run backend on `127.0.0.1:8000`
2. `npm start`
3. Signup → Login
4. Go to Campaigns → open a campaign → donate
5. Verify:

   - Donation History shows the donation
   - DonorHome dashboard totals update based on `/api/donations/`
