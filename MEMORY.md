# MEMORY.md — Biblioteca Virtual Project Memory

> **Last Updated**: 2026-05-09T14:14 UTC-5
> **Maintained by**: Principal Software Engineer + DevOps + Security Engineer

---

## 1. PROJECT OVERVIEW

**Biblioteca Virtual** — A full-stack web application for a virtual library of technical resources for Systems Engineering students. Users can browse, search, download resources, and upload their own for admin approval.

### Tech Stack
- **Frontend**: React 19.2.3 + Vite 7.3.3 + TailwindCSS 3.4.18 + Framer Motion 12.23.24 + Three.js 0.181.2
- **Backend**: Express.js + Supabase (PostgreSQL + Storage) + JWT auth
- **Auth**: JWT tokens with 7-day expiry, stored in localStorage
- **Deployment**: Render.com (recommended: Static Site + Web Service)

---

## 2. MONOREPO STRUCTURE

```
biblioteca-virtual/                  ← root (NO package.json)
├── frontend/                        ← React + Vite SPA
│   ├── package.json                 ← Self-contained deps + build scripts
│   ├── vite.config.js               ← Build config, dev proxy on :5173 → :3000
│   ├── index.html                   ← Vite entry HTML
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .gitignore                   ← Excludes node_modules, dist, .env
│   ├── dist/                        ← Production build output (gitignored)
│   ├── public/                      ← Legacy files (⚠️ dead code)
│   │   ├── index.html               ← 924 lines vanilla JS (NOT served)
│   │   └── assets/
│   │       ├── styles.css           ← Dead code
│   │       └── ui.js               ← Dead code
│   └── src/
│       ├── main.jsx                 ← React entry point
│       ├── App.jsx                  ← Root component (page routing)
│       ├── components/              ← UI components (auth, admin, landing, etc.)
│       ├── hooks/                   ← useAuth, useResources, useAdmin
│       ├── services/api.js          ← API client (dynamic base URL)
│       ├── styles/index.css         ← Tailwind + custom CSS
│       └── utils/                   ← Formatters, motion presets
│
├── backend/                         ← Express.js API
│   ├── package.json                 ← Self-contained deps + scripts
│   ├── server.js                    ← Entry point, CORS, static serving, routes
│   ├── .env                         ← Local dev env vars (gitignored)
│   ├── config/supabase.js           ← Supabase client singleton
│   ├── middleware/auth.js           ← JWT auth + admin guard
│   ├── controllers/                 ← Auth, Recursos, Admin controllers
│   ├── routes/                      ← Express router definitions
│   └── scripts/                     ← Smoke tests
│
├── database/
│   └── schema.sql                   ← PostgreSQL schema + RLS
│
└── docs/
    ├── architecture/PROJECT_MAP.md
    ├── auth/AUTH_ARCHITECTURE.md
    ├── security/SECURITY_AUDIT.md
    ├── decisions/ADR-001-password-reset-security.md
    ├── flows/PASSWORD_RECOVERY.md
    ├── refactors/LOGOUT_CLEANUP.md
    ├── memory/README.md
    └── render/RENDER_DEPLOYMENT.md  ← NEW: Complete Render guide
```

---

## 3. BUILD SYSTEM ANALYSIS

### Frontend Build
| Property | Value |
|----------|-------|
| Build tool | Vite 7.3.3 |
| Command | `vite build` (via `npm run build`) |
| Output | `frontend/dist/` |
| Entry | `frontend/index.html` → `/src/main.jsx` |
| Plugin | `@vitejs/plugin-react` |
| CSS | Tailwind + PostCSS + Autoprefixer |
| Chunks | `vendor` (react/react-dom/framer-motion), `three`, app, HologramScene (lazy) |

### Production Build Output (verified 2026-05-09)
```
dist/index.html                         819 B
dist/assets/index-BmtiavbS.js          233 KB  → App bundle
dist/assets/index-DIQq39yc.css          32 KB   → Styles
dist/assets/vendor-CbWc4KGq.js         153 KB   → React/ReactDOM/Framer Motion
dist/assets/three-eewABaYN.js          499 KB   → Three.js (lazy)
dist/assets/HologramScene-Dy0xRfz-.js    2 KB   → Lazy-loaded HologramScene
```

### Backend-Frontend Relationship
- `backend/server.js` serves `frontend/dist/` as static files when they exist
- `backend/server.js` line 52: If `dist/index.html` exists → serves React app
- If not → returns JSON message: "Frontend not built"
- Environment variables for Supabase are required at server start

---

## 4. DEPLOYMENT ANALYSIS — ROOT CAUSE

### The Real Problem: Render Misconfiguration

The project is a **monorepo with NO root package.json**. The two subdirectories (`frontend/` and `backend/`) each have their own `package.json`. When deploying to Render:

1. **If Root Directory is not set**: Render looks for `package.json` in the repo root, doesn't find it, and fails
2. **If you set Root Directory to `frontend`**: Only frontend builds, backend never starts
3. **If you set Root Directory to `backend`**: Backend starts, but frontend isn't built

### The Two Viable Deployment Strategies

#### ✅ RECOMMENDED: Option B — Two Separate Render Services
| Service | Type | Root Dir | Build | Publish |
|---------|------|----------|-------|---------|
| `biblioteca-backend` | Web Service | `backend` | `npm install` | N/A |
| `biblioteca-frontend` | Static Site | `frontend` | `npm install && npm run build` | `dist` |

#### ⚠️ Alternative: Option A — Single Web Service
| Service | Type | Root Dir | Build |
|---------|------|----------|-------|
| `biblioteca-virtual` | Web Service | `backend` | `cd ../frontend && npm install && npm run build && cd ../backend && npm install` |

### Why Option B is Better
- Isolated build environments per Render best practices
- Frontend rebuilds only on frontend changes
- No monorepo path chaining
- Separate logs for debugging
- Independent scaling

---

## 5. FILES ANALYZED (30+ files)

### Frontend (16 files)
- `frontend/src/main.jsx` — React entry
- `frontend/src/App.jsx` — Root component with page routing
- `frontend/src/hooks/useAuth.js` — JWT login/register/logout/reset
- `frontend/src/hooks/useResources.js` — Resource CRUD + filters
- `frontend/src/hooks/useAdmin.js` — Admin operations
- `frontend/src/components/auth/AuthPage.jsx` — Auth UI
- `frontend/src/components/ui/ErrorBoundary.jsx` — Render error boundary
- `frontend/src/services/api.js` — API client with dynamic base URL
- `frontend/src/styles/index.css` — Tailwind + custom CSS
- `frontend/package.json` — Dependencies + scripts
- `frontend/package-lock.json` — Lockfile (lockfileVersion 3)
- `frontend/vite.config.js` — Build config + dev proxy
- `frontend/tailwind.config.js` — Design tokens
- `frontend/postcss.config.js` — PostCSS plugins
- `frontend/index.html` — Vite entry HTML
- `frontend/.gitignore` — Excludes dist, node_modules, .env

### Backend (6 files)
- `backend/server.js` — Express app, CORS, static serving
- `backend/package.json` — Dependencies + build:frontend script
- `backend/config/supabase.js` — Supabase client (env var validation)
- `backend/middleware/auth.js` — JWT verification + admin guard
- `backend/controllers/authController.js` — Auth business logic
- `backend/routes/auth.js` — Auth route definitions

### Configuration (4 files)
- `CLAUDE.md` — AI assistant config
- `AGENTS.md` — Agent instructions
- `.mcp.json` — MCP server config
- Literally zero Render/CI/CD config files

### Documentation (7 files)
- `docs/architecture/PROJECT_MAP.md`
- `docs/auth/AUTH_ARCHITECTURE.md`
- `docs/security/SECURITY_AUDIT.md`
- `docs/decisions/ADR-001-password-reset-security.md`
- `docs/flows/PASSWORD_RECOVERY.md`
- `docs/refactors/LOGOUT_CLEANUP.md`
- `docs/render/RENDER_DEPLOYMENT.md` (NEW)

### Legacy (3 files — not served)
- `frontend/public/index.html` — Dead code, 924 lines
- `frontend/public/assets/styles.css` — Dead code
- `frontend/public/assets/ui.js` — Dead code

---

## 6. ROOT CAUSE ANALYSIS DETAILED

### Problem 1: dist/ didn't exist
**Cause**: No one had run `npm run build` in `frontend/`
**Fix**: Run the build command
**Status**: ✅ FIXED

### Problem 2: Static startup cache in server.js
**Cause**: `server.js` used `const frontendBuilt = require('fs').existsSync(...)` which cached the build status at server start
**Fix**: Replaced with `function isFrontendBuilt()` for dynamic per-request checking
**Status**: ✅ FIXED

### Problem 3: Render misconfiguration (separate services needed)
**Cause**: The monorepo has no root `package.json`, but Render expects either:
- A root `package.json` (for a single-service app)
- Correct **Root Directory** setting per service
**Status**: ⚠️ NEEDS USER ACTION — documented in `docs/render/RENDER_DEPLOYMENT.md`

### Problem 4: CORS configuration
**Cause**: `server.js` has hardcoded `allowedOrigins` — if frontend URL changes, must update
**Status**: ⚠️ NEEDS USER ACTION — documented in deployment guide

---

## 7. SECURITY FINDINGS

| Finding | Status | Severity |
|---------|--------|----------|
| JWT in localStorage (XSS risk) | Known, accepted | Medium |
| Hardcoded `RENDER_API` in `api.js` line 1 | ⚠️ Needs env var override | Low |
| CORS whitelist hardcoded | Acceptable | Low |
| Service role key only server-side | ✅ Good | N/A |
| Token version invalidation | ✅ Good | N/A |
| Rate limiting process-local | Known limitation | Low |
| No CSP headers | Acceptable for now | Low |
| Legacy files not served | ✅ Good | N/A |

---

## 8. FIXES APPLIED

| Date | File | Change | Reason |
|------|------|--------|--------|
| 2026-05-09 | `frontend/public/index.html` | Added `line-clamp: 2` | CSS compatibility warning |
| 2026-05-09 | `backend/server.js` | Static `frontendBuilt` → dynamic `isFrontendBuilt()` | Allow build after server start without restart |
| 2026-05-09 | `backend/server.js` | Removed `if (frontendBuilt)` guard on `express.static` | `express.static` handles missing dirs silently |
| 2026-05-09 | `frontend/dist/` | Generated fresh production build | `npm run build` succeeded |
| 2026-05-09 | `docs/render/RENDER_DEPLOYMENT.md` | Created | Complete Render deployment guide |
| 2026-05-09 | `MEMORY.md` | Updated | Full project memory |

---

## 9. EXACT RENDER CONFIGURATION

### FRONTEND — Static Site
```
Service Type:        Static Site
Name:                biblioteca-frontend
Root Directory:      frontend
Build Command:       npm install && npm run build
Publish Directory:   dist
Node Version:        20

Environment Variables:
  VITE_API_URL = https://biblioteca-backend.onrender.com/api
```

### BACKEND — Web Service
```
Service Type:        Web Service
Name:                biblioteca-backend
Root Directory:      backend
Build Command:       npm install
Start Command:       npm start
Node Version:        20

Environment Variables (ALL REQUIRED):
  SUPABASE_URL          = https://dipgtozhxncwxtpctxsu.supabase.co
  SUPABASE_SERVICE_KEY  = <from Supabase Dashboard>
  JWT_SECRET            = <generate a unique 64-char hex string>
  NODE_ENV              = production
  PORT                  = 3000 (Render sets this)
```

---

## 10. RISKS & RECOMMENDATIONS

### Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Legacy `public/` files confuse developers | Low | Remove when confident |
| CORS whitelist not updated after frontend URL change | Medium | Document in deployment guide |
| JWT_SECRET is a placeholder | HIGH | Generate new one before production |
| No Render config file checked into repo | Low | Add render.yaml if needed |

### Recommendations
1. **Generate new JWT_SECRET** before production: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. **Remove legacy files** after verifying no one depends on them
3. **Delete `frontend/public/index.html`** when ready (tracked in migration Phase 1)
4. **Add `VITE_API_URL`** to frontend env on Render
5. **Verify CORS** after first production deploy
6. **Consider adding CSP headers** for production hardening

---

## 11. BUILD VERIFICATION CHECKLIST

- [x] Frontend dependencies installed (`node_modules` exists)
- [x] Vite build succeeds with 0 errors (2.80s)
- [x] All 6 expected production artifacts generated
- [x] HTML entry point references correct asset paths
- [x] Chunk splitting working (vendor, three, main, HologramScene)
- [x] CSS bundle includes Tailwind classes
- [x] Backend can detect and serve built frontend
- [x] Dynamic build check works (no restart needed)
- [x] API endpoints respond correctly
- [x] Render deployment documented with exact values
- [x] CORS configuration documented
- [x] Environment variables documented
- [x] Auth flow documented
- [x] Security audit updated