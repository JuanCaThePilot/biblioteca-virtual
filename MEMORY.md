# MEMORY.md — Biblioteca Virtual Project Memory

> **Last Updated**: 2026-05-09T17:27 UTC-5
> **Maintained by**: Principal Frontend Engineer + Full Stack Architect

---

## 1. PROJECT OVERVIEW

**Biblioteca Virtual** — A full-stack web application for a virtual library of technical resources for Systems Engineering students. Users can browse, search, download resources, and upload their own for admin approval.

### Tech Stack
- **Frontend**: React 19.2.3 + Vite 7.3.3 + TailwindCSS 3.4.18 + Framer Motion 12.23.24 + Three.js 0.181.2
- **Backend**: Express.js + Supabase (PostgreSQL + Storage)
- **Auth**: JWT tokens with 7-day expiry
- **Deployment**: Render.com (Node.js)

---

## 2. BUILD SYSTEM ANALYSIS

### Frontend Build Pipeline
| Property | Value |
|----------|-------|
| Build tool | Vite 7.3.3 |
| Build command | `vite build` |
| Output directory | `frontend/dist/` |
| Entry point | `frontend/index.html` → `/src/main.jsx` |
| Plugin | `@vitejs/plugin-react` |
| CSS | TailwindCSS + PostCSS + Autoprefixer |
| Chunk strategy | Manual: `vendor` (react, react-dom, framer-motion), `three` (three.js) |
| Dev server | Port 5173 with `/api` proxy to localhost:3000 |

### Build Output (verified 2026-05-09)
```
dist/index.html                         819 B
dist/assets/index-BmtiavbS.js          233 KB  → Main app bundle
dist/assets/index-DIQq39yc.css          32 KB   → Styles
dist/assets/vendor-CbWc4KGq.js         153 KB   → React/ReactDOM/Framer Motion
dist/assets/three-eewABaYN.js          499 KB   → Three.js
dist/assets/HologramScene-Dy0xRfz-.js    2 KB   → Lazy-loaded HologramScene
```

### Backend-Frontend Integration
- `backend/server.js` checks `frontend/dist/index.html` existence (`frontendBuilt`)
- If built: serves static files from `frontend/dist/`, sends `index.html` on `GET /`
- If not built: returns JSON message directing user to run build
- `backend/package.json` script `build:frontend`: `cd ../frontend && npm install && npm run build`

### Build Status History
| Date | Status | Notes |
|------|--------|-------|
| 2026-05-09 | ✅ SUCCESS | v2.0.0 build produced all expected artifacts |

---

## 3. FILES ANALYZED (Complete Inventory)

### Frontend Source (`frontend/src/`)
| File | Purpose | Key Observations |
|------|---------|-----------------|
| `main.jsx` | React entry point | Creates root, renders `<App />` |
| `App.jsx` | Root component | Page routing (home/auth/admin), error boundary, auth loading state |
| `hooks/useAuth.js` | Auth hook | Login, register, logout, profile refresh, password reset |
| `hooks/useResources.js` | Resources hook | CRUD operations, filters via ref pattern (stale closure fixed) |
| `hooks/useAdmin.js` | Admin hook | Stats, pending, published, users, approve/reject/role management |
| `services/api.js` | API client | Dynamic base URL detection, get/post/patch/delete/upload |
| `styles/index.css` | Tailwind + custom | Aurora background, glass morphism, shimmer animations |

### Frontend Configuration
| File | Status | Notes |
|------|--------|-------|
| `package.json` | ✅ Healthy | All deps resolved, correct versions |
| `package-lock.json` | ✅ Locked | lockfileVersion 3 |
| `vite.config.js` | ✅ Correct | Proxy, chunk splitting, build config |
| `tailwind.config.js` | ✅ Correct | Custom colors (ink, violet, cyan), fonts, shadows |
| `postcss.config.js` | ✅ Correct | Tailwind + Autoprefixer |
| `index.html` | ✅ Correct | Vite entry point |
| `.gitignore` | ✅ Correct | Excludes `node_modules`, `dist`, `.env` |

### Backend (`backend/`)
| File | Status | Notes |
|------|--------|-------|
| `server.js` | ✅ Correct | Express with CORS, static serving, error handling |
| `package.json` | ✅ Correct | Includes `build:frontend` script |

### Legacy Files
| File | Status | Notes |
|------|--------|-------|
| `frontend/public/index.html` | ⚠️ Legacy | 924 lines vanilla JS app, no longer served |
| `frontend/public/assets/styles.css` | ⚠️ Dead code | Legacy styles, can be removed |
| `frontend/public/assets/ui.js` | ⚠️ Dead code | Legacy JS, can be removed |

---

## 4. ROOT CAUSE ANALYSIS: "Frontend not built"

### Original Error
The error "Frontend not built" is emitted by `backend/server.js` line 55:
```js
res.json({ mensaje: 'API Biblioteca Virtual funcionando. El frontend debe construirse con: cd frontend && npm run build' });
```

### Root Cause
The `frontend/dist/` directory was **missing** or **incomplete**, causing `frontendBuilt` to be `false`. This means no one had run `cd frontend && npm run build` in the deployment environment or local development environment.

### Why It Occurred
1. The `frontend/.gitignore` file explicitly excludes `dist/` from version control
2. On Render.com deployment, the backend's `build:frontend` script must run during build phase
3. If the deployment pipeline skips the frontend build step, `dist/` won't exist
4. Locally, developers must run `npm run build` in `frontend/` before starting the backend

### Fix Applied (2026-05-09)
1. ✅ **Built the frontend**: `cd frontend; npm run build` — succeeded in 2.80s, generated all 6 production artifacts
2. ✅ **Fixed `server.js` dynamic detection**: Changed `const frontendBuilt` (cached at startup) → `function isFrontendBuilt()` (checked per-request)
   - This means the frontend can be built while the server is running without requiring a restart
   - `express.static()` is now applied unconditionally (it fails silently if directory doesn't exist)
   - Root route `GET /` now uses the dynamic check to decide whether to send the HTML or the JSON message
3. ✅ **Verified**: Backend serves React app at `localhost:3000/` and API endpoints still work

### Key Files Changed
| File | Change | Reason |
|------|--------|--------|
| `backend/server.js` | Static `frontendBuilt` → dynamic `isFrontendBuilt()` | Allow build after server start |
| `backend/server.js` | Removed `if (frontendBuilt)` guard on express.static | express.static handles missing dirs silently |

### Prevention
1. Ensure Render.com build command runs: `cd frontend && npm install && npm run build`
2. If server was already running before the build, no restart is needed (dynamic check)
3. Document that backend expects `frontend/dist/` to exist

---

## 5. SECURITY FINDINGS

### ✅ Good Practices
- JWT stored in localStorage (industry-standard for SPAs)
- CORS whitelist of known origins
- Input escaping in API error messages
- `api.js` properly handles authorization headers

### ⚠️ Observations
- `api.js` line 10: Falls back to `RENDER_API` constant hardcoded in source — okay for production but should use env var
- No CSP headers configured (acceptable for current stage)
- No XSS risk in React app (React escapes JSX by default)

---

## 6. RISKS & RECOMMENDATIONS

### Immediate Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Legacy `public/index.html` exists but unused | Low | Remove to avoid confusion |
| No automated build verification in CI | Medium | Add smoke test that checks `dist/` exists |

### Recommended Improvements
1. **Add build validation script** — Verify `dist/index.html` exists after build
2. **Auto-build on backend start** — Have `server.js` auto-trigger frontend build if `dist/` missing
3. **Remove legacy files** — Delete `frontend/public/index.html`, `styles.css`, `ui.js` (tracked in ARCHITECTURE.md issue #1/#2)
4. **Add Render.yaml or Dockerfile** — Explicit deployment configuration

---

## 7. ARCHITECTURE MAP

```
biblioteca-virtual/
├── backend/                    # Express.js API
│   ├── server.js               # Entry point
│   ├── config/supabase.js      # Supabase client
│   ├── middleware/auth.js      # JWT verification
│   ├── controllers/            # Route handlers
│   ├── routes/                 # Express routers
│   └── scripts/                # Smoke tests
│
├── frontend/                   # React + Vite
│   ├── index.html              # Vite entry HTML
│   ├── vite.config.js          # Build config + proxy
│   ├── tailwind.config.js      # Design tokens
│   ├── dist/                   # Production build (gitignored)
│   ├── src/
│   │   ├── main.jsx            # React entry
│   │   ├── App.jsx             # Root component
│   │   ├── components/         # UI components
│   │   │   ├── admin/          # AdminDashboard
│   │   │   ├── auth/           # AuthPage
│   │   │   ├── landing/        # Hero
│   │   │   ├── layout/         # Navbar, AmbientBackground
│   │   │   ├── motion/         # SpotlightCard, TiltCard, etc.
│   │   │   ├── resources/      # LibrarySection, ResourceCard, UploadModal
│   │   │   ├── three/          # HologramScene (lazy)
│   │   │   └── ui/             # Button, Card, ErrorBoundary, etc.
│   │   ├── hooks/              # useAuth, useResources, useAdmin
│   │   ├── services/api.js     # API client
│   │   └── styles/index.css    # Tailwind + custom CSS
│   └── public/                 # ⚠️ Legacy files (not served)
│
├── database/
│   └── schema.sql
│
├── docs/                       # Generated documentation
├── CLAUDE.md                   # AI assistant instructions
├── AGENTS.md                   # Agent instructions
└── MEMORY.md                   # This file
```

---

## 8. BUILD VERIFICATION CHECKLIST

- [x] Frontend dependencies installed (`node_modules` exists)
- [x] Vite build succeeds with 0 errors
- [x] All 6 expected output artifacts generated
- [x] HTML entry point references correct asset paths
- [x] Chunk splitting working (vendor, three, main, HologramScene)
- [x] CSS bundle includes Tailwind classes
- [x] Backend can detect and serve built frontend
- [x] Build completed in acceptable time (3.00s)