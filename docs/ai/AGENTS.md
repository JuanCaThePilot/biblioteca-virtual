# AGENTS.md — Biblioteca Virtual AI Memory

Use this file as the quick operational context for future Codex sessions. For details, read `docs/ai/00-index.md` and the relevant numbered doc.

## Project Purpose

Biblioteca Virtual is a full-stack virtual library for Systems Engineering technical resources. Visitors browse/search/download approved resources. Authenticated users upload resources. Admins approve/reject/edit/delete resources. Superadmins can change non-superadmin user roles.

## Main Architecture

- Monorepo with no root `package.json`.
- Frontend: `frontend/` React 19 + Vite 7 + Tailwind + Framer Motion + Three.js.
- Backend: `backend/` Express + Supabase PostgreSQL/Storage + JWT auth.
- Database schema: `database/schema.sql`.
- Storage bucket expected by code: `archivos`.
- Built frontend output: `frontend/dist`; backend serves this if present.

## Entry Points

| Area | Entry Point |
|---|---|
| Frontend HTML | `frontend/index.html` |
| React root | `frontend/src/main.jsx` |
| App shell | `frontend/src/App.jsx` |
| API client | `frontend/src/services/api.js` |
| Backend server | `backend/server.js` |
| Supabase client | `backend/config/supabase.js` |
| Auth middleware | `backend/middleware/auth.js` |

## Critical Flows

- Auth: `AuthPage` -> `useAuth` -> `/api/auth/*` -> `authController` -> `usuarios`.
- Resource browse: `LibrarySection` -> `useResources` -> `/api/recursos`.
- Upload: `UploadModal` -> multipart `/api/recursos` -> Supabase Storage -> `recursos.aprobado=false`.
- Download: `ResourceCard` -> `/api/recursos/:id/descargar` -> increments `descargas` -> opens public URL.
- Admin: `AdminDashboard` -> `useAdmin` -> `/api/admin/*` guarded by `requireAdmin`.
- Password reset: token hash in `password_reset_tokens`; successful reset increments `usuarios.token_version`.

## Auth And State

- JWT expires in 7 days and is stored as `bv_token` in localStorage.
- Cached user is `bv_user`.
- Logout removes all `bv_` keys from localStorage/sessionStorage and broadcasts cross-tab logout.
- Server does not trust JWT role alone; `requireAuth` fetches current user and token version from DB.
- Admin roles are `admin` and `superadmin`; role changes require `superadmin`.

## Commands

Run commands inside the package directory.

| Task | Command | Directory |
|---|---|---|
| Frontend dev | `npm run dev` | `frontend` |
| Frontend build | `npm run build` | `frontend` |
| Frontend lint | `npm run lint` | `frontend` |
| Backend dev | `npm run dev` | `backend` |
| Backend start | `npm start` | `backend` |
| Backend smoke API | `npm run smoke:api` | `backend` |
| Backend smoke auth security | `npm run smoke:auth-security` | `backend` |

## Environment Requirements

Backend required at import time: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`. Optional but important: `PORT`, `NODE_ENV`, `FRONTEND_URL`/`PUBLIC_APP_URL`, SMTP variables. Frontend optional production variable: `VITE_API_URL` including `/api` for separate deployment.

## High-Risk Files

Modify carefully:

- `backend/controllers/authController.js`
- `backend/controllers/recursosController.js`
- `backend/controllers/adminController.js`
- `backend/middleware/auth.js`
- `backend/config/supabase.js`
- `backend/server.js`
- `database/schema.sql`
- `frontend/src/services/api.js`
- `frontend/src/hooks/useAuth.js`
- `frontend/src/hooks/useResources.js`
- `frontend/src/hooks/useAdmin.js`
- `frontend/src/App.jsx`

## Current Technical Debt

- Risky public upload types are allowed, including executables and scripts.
- JWTs are stored in localStorage.
- Reset rate limiting is process-local.
- No standard automated test suite is configured.
- No pagination UI despite backend pagination support.
- Search fires on every keystroke and searches resource names only.
- Admin lists are unpaginated.
- No Helmet/CSP security headers.
- `express-session` appears installed but unused.
- `README.md` contains stale legacy frontend instructions.

## Coding Standards

- Keep user-facing text Spanish.
- Keep API calls centralized in `frontend/src/services/api.js`.
- Keep server-side role checks even when frontend hides admin UI.
- Keep service-role Supabase key server-only.
- Preserve exact DB names, especially `archivo_tamaño`.
- Update `docs/ai` when changing routes, schema, auth, env vars, deployment, or major flows.
- For frontend responsiveness, follow `docs/ai/24-responsive-frontend.md`: mobile-first Tailwind, `.section-shell`, `min-w-0`, stacked mobile actions, local table/chip scrolling, and breakpoint steps through `sm:`, `md:`, `lg:`, `xl:`.

## Refactor Priorities

1. Harden upload file policy and validation.
2. Add backend validation schemas and tests.
3. Add pagination/debounced search.
4. Add security headers/CSP and external rate limiting.
5. Update stale root README and keep `docs/ai` as the source of truth.

## Important Warnings

- Do not reintroduce `frontend/public` as the served app; current backend serves `frontend/dist` only.
- Do not expose `SUPABASE_SERVICE_KEY` or backend `.env` values in frontend code.
- Do not rely on frontend role checks for authorization.
- Do not change Storage path conventions without updating deletion code that parses public URLs.
- Treat runtime Supabase policies, bucket privacy, and production env values as uncertain unless verified externally.
- Do not fix responsive issues by changing backend data flow, API contracts, auth behavior, or route architecture.
