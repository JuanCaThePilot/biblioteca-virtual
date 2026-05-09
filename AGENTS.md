# BIBLIOTECA VIRTUAL — COMPLETE ARCHITECTURE REPORT

## Project Context
A full-stack web application for a virtual library of technical resources for Systems Engineering students. Users can browse, search, download resources, and upload their own for admin approval. Built with Express.js + Supabase backend and a hybrid frontend architecture.

---

## ═══════════════ PHASE 1 — COMPLETE ANALYSIS ═══════════════

### 1. BACKEND ARCHITECTURE (FINALIZED — No changes needed)

**Tech Stack**: Node.js + Express.js + Supabase (PostgreSQL + Storage)

**Structure**:
- `server.js` — Express entry point, CORS config, global middleware, API routes, error handler
- `config/supabase.js` — Supabase client singleton (validates env vars on import)
- `middleware/auth.js` — `requireAuth` (JWT verification) and `requireAdmin` (role verification)
- `controllers/` — Auth (login/register/profile), Recursos (CRUD + file upload to Supabase Storage), Admin (stats, approve, manage users)
- `routes/` — Express routers mapping to controllers with auth middleware

**API Endpoints**:
```
POST   /api/auth/register          → Register user
POST   /api/auth/login             → Login
GET    /api/auth/perfil             → Get profile [requireAuth]

GET    /api/recursos                → List approved resources (public)
GET    /api/recursos/estadisticas   → Public stats
GET    /api/recursos/:id/descargar  → Download resource (public)
POST   /api/recursos                → Upload resource [requireAuth]
GET    /api/recursos/:id            → Get single resource (public)
DELETE /api/recursos/:id            → Delete resource [requireAuth]

GET    /api/admin/estadisticas      → Admin dashboard stats [requireAdmin]
GET    /api/admin/pendientes        → Pending approvals [requireAdmin]
GET    /api/admin/recursos          → All published [requireAdmin]
PATCH  /api/admin/recursos/:id/aprobar      → Approve [requireAdmin]
PATCH  /api/admin/recursos/:id/descripcion  → Edit desc [requireAdmin]
DELETE /api/admin/recursos/:id              → Delete published [requireAdmin]
DELETE /api/admin/recursos/:id/rechazar     → Reject pending [requireAdmin]
GET    /api/admin/usuarios          → List users [requireAdmin]
PATCH  /api/admin/usuarios/:id/rol → Change user role [requireAdmin]
```

**Authentication**: JWT tokens with 7-day expiry. Token stored in localStorage. Role stored in JWT payload and verified server-side from DB.

**Storage**: Supabase Storage bucket `archivos` for file uploads. Multer in-memory for file processing.

**Environment Variables** (from `backend/.env`):
```
SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, PORT=3000, NODE_ENV
```

**Backend Status**: ✅ COMPLETE — No changes required

---

### 2. FRONTEND ARCHITECTURE (HYBRID — Migration in progress)

**⚠️ CRITICAL FINDING: TWO FRONTENDS EXIST**

#### A) NEW React App (Target Architecture)
- **Location**: `frontend/index.html` + `frontend/src/`
- **Entry**: `frontend/src/main.jsx` → renders `<App />`
- **Build**: Vite with React plugin
- **Status**: ~80% complete architecturally

#### B) LEGACY Vanilla JS App (Still being served!)
- **Location**: `frontend/public/index.html` (924 lines!)
- **Also**: `frontend/public/assets/styles.css`, `frontend/public/assets/ui.js`
- **Issue**: Backend `server.js` checks for `frontend/dist` first, falls back to `frontend/public`
- **Risk**: When no build is done, users get the OLD vanilla app instead of the React app

---

### 3. REACT FRONTEND — COMPLETE COMPONENT HIERARCHY

```
App.jsx (root)
├── AmbientBackground       → Animated gradient + pointer spotlight + floating orbs
├── Navbar                   → Fixed glassmorphism nav with responsive mobile menu
├── AnimatePresence (page transitions)
│   ├── page='auth' → AuthPage        → Login/Register tabs with forms
│   ├── page='admin' → AdminDashboard → Stats, Pending, Published, Users tables
│   └── page='home' →
│       ├── Hero                      → Landing section + HologramScene (lazy) + TiltCard
│       ├── BentoFeatures             → Feature grid with SpotlightCards
│       └── LibrarySection            → Search, filters, category pills, resource grid
│           ├── ResourceCard[]        → Each resource with download button
│           └── ResourceSkeleton[]    → Loading state
└── UploadModal              → File upload form with drag/click zone
```

**Custom Hooks**:
| Hook | Purpose |
|------|---------|
| `useAuth` | Token/user state, login, register, logout, profile refresh |
| `useResources` | Fetch/list resources, stats, filters, upload, download |
| `useAdmin` | Admin stats, pending, published, users, approve/reject/edit role |
| `usePrefersReducedMotion` | Accessibility detection for reduced motion |

**Directory Structure**:
```
src/
├── main.jsx              ← React 19 entry
├── App.jsx               ← Root with page routing
├── components/
│   ├── admin/            ← AdminDashboard
│   ├── auth/             ← AuthPage
│   ├── landing/          ← Hero
│   ├── layout/           ← Navbar, AmbientBackground
│   ├── motion/           ← MotionSection, SpotlightCard, TiltCard, Magnetic
│   ├── resources/        ← LibrarySection, ResourceCard, UploadModal
│   ├── three/            ← HologramScene (Three.js)
│   └── ui/               ← Button, Card, Modal, Skeleton, AnimatedCounter
├── hooks/                ← useAuth, useResources, useAdmin, usePrefersReducedMotion
├── services/
│   └── api.js            ← API client (getApiBase, apiGet/Post/Patch/Delete/Upload)
├── styles/
│   └── index.css         ← Tailwind + glassmorphism + aurora background + shimmer
└── utils/
    ├── formatters.js     ← formatDate, formatSize, fileBadgeClass
    └── motion.js         ← fadeUp, stagger, slideRight, pageTransition, etc.
```

---

### 4. DESIGN SYSTEM ANALYSIS

**Colors** (tailwind.config.js):
- `ink: #05070d` (background)
- `panel: rgba(15,18,30,0.72)` (glass panels)
- `line: rgba(255,255,255,0.12)` (borders)
- `violet: #7c5cff` (primary gradient start)
- `cyan: #00d1ff` (primary gradient end)

**CSS Classes** (index.css):
- `.glass` — border + white/10 + bg-white/[0.07] + backdrop-blur-2xl + shadow-glass
- `.glass-strong` — border + white/15 + bg-slate-950/70 + backdrop-blur-2xl
- `.btn` — Pill button with glass styling
- `.btn-primary` — Gradient from violet to cyan with glow shadow
- `.btn-danger` — Rose tinted
- `.btn-success` — Emerald tinted
- `.field` — Input with glass styling
- `.section-shell` — Centered max-w-7xl container
- `.aurora` — Multi-radial-gradient background
- `.mesh-grid::before` — Grid overlay with mask
- `.shimmer` — Loading skeleton animation

---

### 5. ISSUES DETECTED

| # | Issue | Severity | Impact | Location |
|---|-------|----------|--------|----------|
| 1 | **Legacy frontend still served** | HIGH | Users see old UI when dist not built | `public/index.html`, `server.js:11` |
| 2 | **`public/index.html` dead code** | HIGH | 924 lines of duplicated logic, security risk | `frontend/public/index.html` |
| 3 | **Duplicated CSS** | MEDIUM | `public/assets/styles.css` is unused new code | `frontend/public/assets/` |
| 4 | **Duplicated JS** | MEDIUM | `public/assets/ui.js` is unused legacy code | `frontend/public/assets/` |
| 5 | **No React Router** | LOW | Manual page state works but no URL routes | `App.jsx:18` |
| 6 | **No lazy loading for routes** | LOW | Only HologramScene is lazy-loaded | `App.jsx` |
| 7 | **No error boundaries** | MEDIUM | Full app crash on render error | Missing |
| 8 | **`useResources` has stale closure in `fetchResources`** | MEDIUM | Uses `filters` from closure, custom fetchResources called from `updateFilters` | `useResources.js:13,42-48` |
| 9 | **`refreshProfile` runs on every mount** | LOW | Could optimize, minor | `useAuth.js:48-50` |
| 10 | **API base URL logic duplicated** | LOW | Both `api.js` and `public/index.html` have same logic | `services/api.js`, `public/index.html:466-471` |
| 11 | **No loading state on initial render** | MEDIUM | Flash of empty content before auth resolves | `App.jsx` |
| 12 | **Missing auto-closing on toast** | LOW | Toast only in legacy, React has no toast system | Missing from React app |
| 13 | **No Helmet/head management** | LOW | Title hardcoded in html | `index.html` |
| 14 | **No vite proxy for dev** | LOW | No proxy config in vite.config.js, uses full URL | `vite.config.js` |

---

### 6. WHAT WORKS WELL (Already Good)

✅ React 19 with Vite 7 — Modern tooling
✅ Framer Motion — Comprehensive animation system
✅ Tailwind CSS — Custom design tokens (violet, cyan, glass, glow)
✅ Three.js hologram — Premium 3D visual
✅ Code splitting — Vendor + Three.js chunks
✅ Responsive design — Mobile hamburger menu, responsive grids
✅ Accessibility — prefers-reduced-motion support
✅ Glassmorphism design system — Consistent UI
✅ Custom hooks pattern — Clean state management
✅ API service layer — Centralized fetch logic
✅ Supabase integration — Auth + Storage + DB
✅ JWT authentication flow — Login/Register/Profile
✅ Admin panel — Full CRUD for resources and users
✅ File upload — Multer + Supabase Storage
✅ Scroll animations — Intersection Observer via Framer Motion
✅ Route transitions — AnimatePresence with page transitions

---

### 7. MIGRATION ROADMAP (Ordered by Priority)

```
Phase 1: Clean Legacy Files
  [ ] Remove dead code: public/assets/styles.css, public/assets/ui.js
  [ ] Replace public/index.html with minimal redirection
  [ ] Update server.js to prioritize dist over public properly

Phase 2: Add Missing Infrastructure
  [ ] Add React Router for proper URL-based navigation
  [ ] Add error boundaries
  [ ] Add lazy loading for route pages
  [ ] Add vite proxy config for dev API requests

Phase 3: UX Improvements
  [ ] Add Toast notification system
  [ ] Add React Helmet for dynamic page titles
  [ ] Add loading states on auth initialization
  [ ] Fix stale closure in useResources

Phase 4: Polish & Optimization
  [ ] Add PropTypes or migrate to JSDoc types
  [ ] Add meta tags for SEO
  [ ] Add PWA support (manifest)
  [ ] Performance audit
  [ ] Final build verification
```

---

## ═══════════════ PHASE 2 — BEGIN MIGRATION ═══════════════

Starting with **Step 1: Clean Legacy Files** as the highest priority.

Migration files tracking:
- [ ] frontend/public/index.html → Replace
- [ ] frontend/public/assets/styles.css → Delete
- [ ] frontend/public/assets/ui.js → Delete
- [ ] backend/server.js → Update fallback logic
- [ ] frontend/vite.config.js → Add proxy
- [ ] Add Toast Notification System (React)
- [ ] Fix stale closure in useResources
- [ ] Fix refreshProfile runs on every mount
- [ ] Update App.jsx with AuthLoading state
- [ ] Install react-router-dom
- [ ] Add React Router for proper URL-based navigation
- [ ] Add error boundaries
- [ ] Add lazy loading for route pages
- [ ] Build verification
