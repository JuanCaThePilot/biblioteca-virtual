# Backend

## Entry Point

`backend/server.js` creates the Express app, configures CORS/body parsers/static serving, mounts routers, and starts listening on `process.env.PORT || 3000`.

## Middleware

| Middleware | Location | Role |
|---|---|---|
| CORS | `server.js` | Allows configured local/dev/production origins with credentials |
| JSON/body parser | `server.js` | Parses JSON and URL-encoded request bodies |
| Static serving | `server.js` | Serves `frontend/dist` if built |
| Error handler | `server.js` | Handles Multer errors, disallowed file type, generic 500s |
| `requireAuth` | `middleware/auth.js` | Verifies JWT and checks user/token version in DB |
| `requireAdmin` | `middleware/auth.js` | Allows `admin` and `superadmin` roles |
| `requireSuperAdmin` | `middleware/auth.js` | Allows only `superadmin`; used after admin router guard |

## Controllers

| Controller | Main Responsibilities |
|---|---|
| `authController.js` | Register, login, profile, password reset request/confirm, auth audit logs |
| `recursosController.js` | Public resource listing/stats/detail/download, authenticated upload/delete |
| `adminController.js` | Pending moderation, resource publishing/edit/delete, user listing/role change, stats |

## Supabase Integration

`backend/config/supabase.js` validates `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `JWT_SECRET` at import time, then creates one service-role Supabase client. Controllers use this client directly.

## File Upload

`recursosController.js` configures Multer memory storage with a 50 MB limit. Allowed upload types are checked by MIME type or filename extension. Files upload to Supabase Storage bucket `archivos` under `recursos/{timestamp}_{userId}_{safeOriginalName}`.

## Static Frontend Serving

`server.js` sets `frontendPath` to `../frontend/dist`. It serves static assets from that path, and `/` returns `index.html` only when the build exists. If not built, `/` returns JSON instructions to run `cd frontend && npm run build`.

## Backend Risks

| Risk | Location | Notes |
|---|---|---|
| Service-role client bypasses RLS | `config/supabase.js` | Correct for trusted server, dangerous if exposed |
| Process-local reset rate limits | `authController.js` | Not shared across instances/restarts |
| Download counter race | `recursosController.descargar` | Read-modify-write can lose increments under concurrency |
| Owner delete excludes superadmin | `recursosController.eliminar` | Allows owner or `admin`, but not explicitly `superadmin` |
| Public file URLs | Storage flow | Approved files remain public by URL |
