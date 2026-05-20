# Render.com Deployment Guide

> **Last Updated**: 2026-05-09
> **Author**: Principal Software Engineer + DevOps
> **Project**: Biblioteca Virtual — Monorepo

---

## 1. DEPLOYMENT ARCHITECTURE OVERVIEW

### Current Architecture

```
biblioteca-virtual/          (monorepo root — NO package.json)
├── backend/                 → Express.js API + serves frontend static files
├── frontend/                → React + Vite SPA, outputs to frontend/dist/
├── database/                → SQL schema
└── docs/                    → Documentation
```

### Two Deployment Options

| Option | Services | Pros | Cons |
|--------|----------|------|------|
| **A: Combined** | 1 Web Service (backend) | Single service, simpler CORS, same origin | Backend must build frontend |
| **B: Separate** | 1 Static Site (frontend) + 1 Web Service (backend) | Independent scaling, clear separation | CORS config needed, cross-origin auth |

**RECOMMENDATION**: Option **B (Separate)** is more reliable on Render, avoids monorepo build issues, and follows Render's best practices.

---

## 2. OPTION B (RECOMMENDED): SEPARATE SERVICES

### Frontend — Render Static Site

| Setting | Value |
|---------|-------|
| **Service Type** | Static Site |
| **Name** | `biblioteca-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Node Version** | 20 (or latest LTS) |

#### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | `https://biblioteca-backend.onrender.com/api` | API base URL for production |

> ⚠️ Replace `biblioteca-backend` with your actual backend service name

#### Auto-Deploy
- Enable auto-deploy on git push
- Branches: `main` (production)

---

### Backend — Render Web Service

| Setting | Value |
|---------|-------|
| **Service Type** | Web Service |
| **Name** | `biblioteca-backend` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Node Version** | 20 (or latest LTS) |

#### Required Environment Variables

| Variable | Value | Source |
|----------|-------|--------|
| `SUPABASE_URL` | `https://dipgtozhxncwxtpctxsu.supabase.co` | Supabase Dashboard |
| `SUPABASE_SERVICE_KEY` | `sb_secret_...` | Supabase Dashboard (Service Role Key) |
| `JWT_SECRET` | `mi_clave_secreta_super_larga_cambiar_en_produccion_2024` | Change this! Generate a new one |
| `PORT` | `3000` | Render sets this automatically |
| `NODE_ENV` | `production` | Production optimizations |

#### ⚠️ IMPORTANT: Change JWT_SECRET
The current JWT_SECRET in `.env` is a placeholder. Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### CORS Configuration
The current `backend/server.js` CORS whitelist already includes the production frontend URL:
```js
'https://biblioteca-virtual-l4cu.onrender.com'
```
If the frontend URL changes, add the new URL to `allowedOrigins`.

---

## 3. OPTION A (ALTERNATIVE): COMBINED SINGLE SERVICE

If you prefer a single Web Service that serves both API and frontend:

### Backend — Render Web Service

| Setting | Value |
|---------|-------|
| **Service Type** | Web Service |
| **Name** | `biblioteca-virtual` |
| **Root Directory** | `backend` |
| **Build Command** | `cd ../frontend && npm install && npm run build && cd ../backend && npm install` |
| **Start Command** | `npm start` |
| **Node Version** | 20 |

### ⚠️ Limitations of Option A
1. **Monorepo Build Complexity**: The build command is a chained script that navigates between directories
2. **Build Time**: Frontend build runs on every backend deploy (even for API-only changes)
3. **Debugging**: Harder to isolate frontend vs backend build failures
4. **Scaling**: Cannot scale frontend independently

---

## 4. WHY OPTION B IS BETTER

| Concern | Option A (Combined) | Option B (Separate) |
|---------|---------------------|---------------------|
| Setup complexity | Medium | Low |
| Build reliability | Lower (monorepo chaining) | Higher (isolated builds) |
| Debugging | Harder | Easier (separate logs) |
| CORS | Not needed (same origin) | Simple (one config) |
| Auth | Direct cookies work | Tokens work cross-origin |
| Scale independently | No | Yes |
| Render best practice | ❌ | ✅ |

The current project uses **JWT tokens stored in localStorage** (not cookies), so cross-origin auth works flawlessly. CORS is already configured.

---

## 5. PRODUCTION API URL FLOW

### How the Frontend Finds the Backend

In `frontend/src/services/api.js`:

```js
export function getApiBase() {
  const envApi = import.meta.env.VITE_API_URL   // 1. Check env var (Render Static Site)
  if (envApi) return envApi.replace(/\/$/, '')

  const { hostname, port, protocol, origin } = window.location
  if (['3000', '5173', '4173'].includes(port)) return '/api'  // 2. Dev mode: proxy
  if (hostname === 'localhost' || hostname === '127.0.0.1') return '/api'
  if (protocol.startsWith('http')) return `${origin}/api`      // 3. Same-origin
  return RENDER_API                                            // 4. Hardcoded fallback
}
```

**With Option B (separate services):**
1. Set `VITE_API_URL = https://biblioteca-backend.onrender.com/api` in frontend env vars
2. The frontend detects this at build time and embeds it in the JS bundle
3. All API calls go to the backend URL

**With Option A (combined):**
1. Same-origin: `window.location.origin + /api` works automatically
2. No env var needed

---

## 6. PRODUCTION AUTH FLOW

```
FRONTEND (Static Site)                  BACKEND (Web Service)
│                                       │
│ POST /api/auth/login ─────────────────→│ Verifies credentials
│                                       │ Signs JWT with user data
│ ←────── { token, usuario } ──────────│
│                                       │
│ Stores in localStorage:               │
│   bv_token = JWT                      │
│   bv_user = { id, nombre, role }      │
│                                       │
│ GET /api/auth/perfil ────────────────→│ Verifies JWT via middleware
│   Authorization: Bearer <token>       │ Checks DB for user validity
│ ←────── { usuario } ─────────────────│ Token version check
│                                       │
│ Requests:                             │
│   Authorization: Bearer <token>       │
```

### Cross-Origin Auth State
- ✅ `localStorage` is served-scoped, so cross-origin is fine
- ✅ JWT is sent via `Authorization` header, not cookies
- ✅ No CSRF risk
- ✅ No CORS preflight for GET requests (simple headers)
- ✅ CORS preflight handled for POST/PATCH/DELETE

---

## 7. ENVIRONMENT VARIABLES CHECKLIST

### Backend (Required)

| Variable | Required | Production Value |
|----------|----------|------------------|
| `SUPABASE_URL` | ✅ Yes | From Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_KEY` | ✅ Yes | From Supabase Dashboard > Settings > API (service_role key) |
| `JWT_SECRET` | ✅ Yes | Generate unique random string |
| `PORT` | ✅ Yes | Render sets this automatically |
| `NODE_ENV` | ✅ Yes | Set to `production` |

### Frontend (Required for Separate Deploy)

| Variable | Required | Production Value |
|----------|----------|------------------|
| `VITE_API_URL` | ✅ Yes (Option B) | `https://biblioteca-backend.onrender.com/api` |

---

## 8. VERIFICATION CHECKLIST

### Before Deploying
- [ ] Frontend builds locally: `cd frontend && npm run build`
- [ ] Backend starts locally: `cd backend && node server.js`
- [ ] API responds: `curl http://localhost:3000/api/recursos/estadisticas`
- [ ] Frontend loads: `curl http://localhost:3000/` returns HTML
- [ ] CORS allows frontend origin
- [ ] JWT_SECRET is changed from default
- [ ] Supabase credentials are valid

### After Deploying to Render
- [ ] Frontend Static Site deploys successfully
- [ ] Backend Web Service starts without errors
- [ ] Frontend loads in browser
- [ ] Login/register works
- [ ] Resource listing works
- [ ] Resource upload works
- [ ] Admin panel loads
- [ ] No CORS errors in browser console
- [ ] No 404s on API calls

---

## 9. TROUBLESHOOTING

### "Frontend not built"
**Cause**: `frontend/dist/index.html` doesn't exist
**Fix**: Run `cd frontend && npm run build` or configure Render to build frontend

### "CORS: Origin not allowed"
**Cause**: Frontend URL not in `allowedOrigins` in `backend/server.js`
**Fix**: Add the frontend's Render URL to the `allowedOrigins` array

### `SUPABASE_URL` or `SUPABASE_SERVICE_KEY` not set
**Cause**: Environment variables not configured in Render dashboard
**Fix**: Add them in Render Web Service > Environment

### Blank page in production
**Cause**: `VITE_API_URL` not set, or frontend cannot reach backend
**Fix**: 
1. Check browser console for network errors
2. Set `VITE_API_URL` in frontend Static Site env vars
3. Verify CORS allows the request

---

## 10. STEP-BY-STEP RENDER SETUP

### Step 1: Create Backend Web Service
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name**: `biblioteca-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid)
5. Click **Advanced** → **Add Environment Variable**:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `NODE_ENV=production`
6. Click **Create Web Service**

### Step 2: Create Frontend Static Site
1. Click **New +** → **Static Site**
2. Connect your GitHub repo (same repo)
3. Settings:
   - **Name**: `biblioteca-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Click **Advanced** → **Add Environment Variable**:
   - `VITE_API_URL = https://biblioteca-backend.onrender.com/api`
5. Click **Create Static Site**

### Step 3: Verify
1. Wait for both deployments to finish
2. Open the frontend URL
3. Test login, browse resources, upload
4. Check browser console for errors

---

## 11. MONOREPO STRUCTURE SUMMARY

```
biblioteca-virtual/
│
├── frontend/                    # React + Vite SPA
│   ├── package.json             # Has its own dependencies
│   ├── vite.config.js           # Build config with dev proxy
│   ├── index.html               # Vite entry point
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       ├── hooks/
│       ├── services/
│       │   └── api.js           # API URL resolution logic
│       └── styles/
│
├── backend/                     # Express.js API
│   ├── package.json             # Has its own dependencies
│   ├── server.js                # Entry point + static serving
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   └── routes/
│
├── database/
│   └── schema.sql
│
└── docs/                        # Documentation
    └── render/
        └── RENDER_DEPLOYMENT.md # THIS FILE
```

**Key point**: There is NO `package.json` at the repo root. Each subdirectory (`frontend/`, `backend/`) has its own `package.json`. Render's **Root Directory** setting tells Render which subdirectory to use.