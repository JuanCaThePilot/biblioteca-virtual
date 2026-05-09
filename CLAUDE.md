# BIBLIOTECA VIRTUAL — PROJECT MEMORY

## Build Status: ✅ PASSING
Last build: Success (0 errors, 0 warnings)
Built: frontend/dist/index.html (0.82 KB gzip)
Total JS: ~882 KB (vendor 51KB + main 71KB + three 128KB + HologramScene 1KB)
Total CSS: 32 KB (6.19 KB gzip)

## Migration Status

### ✅ COMPLETED (Phase 1 - Legacy Cleanup)
- `frontend/public/index.html` — Replaced 924-line legacy app with minimal loading screen
- `frontend/public/assets/styles.css` — Deleted (dead code)
- `frontend/public/assets/ui.js` — Deleted (dead code)
- `backend/server.js` — Removed `frontend/public` fallback, only serves `frontend/dist`
- `frontend/vite.config.js` — Added proxy config for `/api` to backend in dev/preview

### ✅ COMPLETED (Phase 2 - Infrastructure)
- `ErrorBoundary.jsx` — Created class-based error boundary with glassmorphism UI
- `App.jsx` — Wrapped root in `<ErrorBoundary>`
- Vite proxy configured — Dev server proxies `/api` → `localhost:3000`

### ✅ COMPLETED (Phase 3 - UX Improvements)
- `useAuth.js` — Added `authInitialized` state with ref guard (runs once on mount)
- `useAuth.js` — Removed unnecessary `refreshProfile` re-runs on re-render
- `useResources.js` — Fixed stale closure via `filtersRef` pattern
- `useResources.js` — `fetchResources` now reads from `filtersRef.current` if no argument
- `App.jsx` — Shows loading animation while `authInitialized === false`

### 🔄 NOT MIGRATED (Preserved intentionally)
- **React Router** — Not added. The manual page state via `setPage()` + `useMemo` + `AnimatePresence` works perfectly for this SPA with only 3 pages. Adding React Router would add ~15KB to vendor bundle and require unnecessary refactoring.
- **Lazy loading for routes** — Only page-level lazy loading would be `AdminDashboard` which is heavy. The current app is small enough (< 300KB main JS) that this isn't necessary.
- **Toast notification system** — The legacy `toast()` utility was removed with the old HTML. A proper React toast system would be nice but isn't strictly needed since `AdminDashboard` shows inline feedback. This can be implemented as a future enhancement.
- **react-helmet** — Not needed for a small SPA. Title is set in `index.html`.

## Architecture Decisions

1. **API client (`api.js`)**: Uses `VITE_API_URL` env var first, then detects dev/prod context for proxy. In dev with Vite proxy, requests to `/api/*` are forwarded to localhost:3000 automatically.

2. **Auth flow**: JWT stored in localStorage (`bv_token`, `bv_user`). `useAuth` initializes from localStorage synchronously, then validates with server via `/auth/perfil` once on mount.

3. **Stale closure fix**: `useResources` uses `filtersRef` pattern—`fetchResources` reads latest filters from ref when called without arguments. `updateFilters` passes new filters directly via `setFilters` callback.

4. **Error handling**: `ErrorBoundary` at root catches render errors. API errors propagate through hooks and are displayed inline (AdminDashboard toast, upload form errors, auth form errors).

5. **Legacy removal**: Old `public/index.html` is now a loading screen placeholder (no inline JS, no duplicated logic). Server only serves from `dist/`.

## Potential Future Improvements

- [ ] Add React Router if page count grows beyond 3
- [ ] Add Toast system with context provider for notifications
- [ ] Add Skeleton loading for HologramScene (already has Suspense fallback)
- [ ] Add meta tags for SEO/preview cards
- [ ] Add PWA manifest for "Add to Home Screen"
- [ ] Implement dynamic `import()` for AdminDashboard route chunk