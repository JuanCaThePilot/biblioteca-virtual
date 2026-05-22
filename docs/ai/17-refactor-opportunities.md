# Refactor Opportunities

## Priority 1: Safety And Validation

| Refactor | Why | Candidate Files |
|---|---|---|
| Restrict or scan risky upload types | Current app permits public `.exe`, shell scripts, JS/TS and octet-stream uploads | `recursosController.js`, `UploadModal.jsx` |
| Add backend validation schemas | Avoid oversized/invalid fields and inconsistent API inputs | controllers, possible validation middleware |
| Add security headers | Improve browser hardening | `server.js` |
| Externalize rate limiting | In-memory reset limits are not production-grade | `authController.js`, infrastructure |

## Priority 2: Data Scale

| Refactor | Why | Candidate Files |
|---|---|---|
| Add pagination UI | Backend supports `pagina`, UI does not | `LibrarySection.jsx`, `useResources.js` |
| Paginate admin lists | Avoid loading all users/resources | `adminController.js`, `AdminDashboard.jsx`, `useAdmin.js` |
| Atomic download counter | Avoid lost increments | DB RPC/migration, `recursosController.descargar` |
| Better search | Search descriptions/tags and index appropriately | DB indexes/RPC, `recursosController.listar` |

## Priority 3: Frontend Architecture

| Refactor | Why | Candidate Files |
|---|---|---|
| Add React Router only if page count grows | Current manual state is okay, but deep links are limited | `App.jsx` |
| Lazy-load admin route | Keep main bundle focused for non-admin users | `App.jsx`, `AdminDashboard.jsx` |
| Add shared notification provider | Replace local inline toasts with consistent UX | new UI/context files, admin/auth/upload components |
| Split large components | Easier testing and maintenance | `AuthPage.jsx`, `AdminDashboard.jsx` |

## Priority 4: Tooling And Docs

| Refactor | Why | Candidate Files |
|---|---|---|
| Update root README | Current README still describes legacy public frontend workflow | `README.md` |
| Add CI | Prevent build/lint regressions | `.github/workflows` or platform config |
| Add tests | Smoke scripts exist, but no standard test runner | frontend/backend package scripts |
| Remove unused dependency | `express-session` is not used | `backend/package.json` |
