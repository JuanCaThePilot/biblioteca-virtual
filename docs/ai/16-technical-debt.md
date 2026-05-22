# Technical Debt

## Current Debt Inventory

| Priority | Debt | Location | Impact |
|---|---|---|---|
| High | Dangerous file types allowed for upload | `recursosController.js`, `UploadModal.jsx` | Public executable/script distribution risk |
| High | No automated test suite wired into standard scripts | frontend/backend package scripts | Regressions rely on manual/smoke testing |
| Medium | JWT stored in localStorage | `useAuth.js` | XSS session theft risk |
| Medium | Search fires on every keystroke | `LibrarySection.jsx` | Extra API load and UI churn |
| Medium | No pagination UI | `LibrarySection.jsx` | Users only see first 12 resources despite backend pagination support |
| Medium | Admin/users/resource lists are unpaginated | `adminController.js`, `AdminDashboard.jsx` | Poor scaling for larger libraries |
| Medium | Reset rate limit in process memory | `authController.js` | Not reliable across instances/restarts |
| Medium | No Helmet/CSP/security headers | `server.js` | Weaker browser hardening |
| Medium | Hand-written API client lacks cancellation/retry | `services/api.js`, hooks | Race/UX issues during fast interactions |
| Low | No React Router | `App.jsx` | Limited deep linking/history |
| Low | `express-session` installed but unused | `backend/package.json` | Dependency clutter |
| Low | Root README is partly outdated | `README.md` | Mentions old frontend/public flow |

## Already Resolved From Older Memory

- Backend no longer serves `frontend/public` fallback.
- `frontend/public/**/*` files were not present in current scan.
- Vite `/api` proxy exists.
- `ErrorBoundary` exists and wraps the app.
- `useResources` stale closure is fixed with `filtersRef`.
- `useAuth` has auth initialization/loading state.

## Documentation Debt

Older `README.md`, `MEMORY.md`, and root `AGENTS.md` contained stale migration notes. This `docs/ai` system should now be treated as the current architecture memory, and root `AGENTS.md` should point future agents here.
