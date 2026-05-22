# Risk Areas

## Files To Modify Carefully

| File | Risk |
|---|---|
| `backend/config/supabase.js` | Import-time env validation can break server startup |
| `backend/middleware/auth.js` | Auth, role, token_version enforcement for all protected routes |
| `backend/controllers/authController.js` | Password security, reset token lifecycle, audit logs |
| `backend/controllers/recursosController.js` | File upload validation, Storage paths, public downloads |
| `backend/controllers/adminController.js` | Moderation, role changes, Storage cleanup |
| `backend/server.js` | CORS, static serving, global error handling |
| `database/schema.sql` | Source of table/column names, RLS, indexes |
| `frontend/src/services/api.js` | API base URL resolution for every frontend request |
| `frontend/src/hooks/useAuth.js` | Session persistence, cross-tab logout, auth initialization |
| `frontend/src/hooks/useResources.js` | Public resource cache, filtering, upload/download refreshes |
| `frontend/src/hooks/useAdmin.js` | Admin cache invalidation and role-gated actions |
| `frontend/src/App.jsx` | Manual page routing and hook composition |

## Business-Critical Behaviors

- New uploads must remain pending until admin approval.
- Public resource APIs must not expose unapproved resources.
- Admin role checks must remain server-side.
- Password reset must not leak whether an email exists.
- Reset tokens must remain single-use and stored only as hashes.
- Service-role key must never enter frontend bundles.

## Known Fragile Areas

| Area | Why Fragile |
|---|---|
| Storage path derivation | Deletes parse path by splitting public URL at `/archivos/` |
| Accented DB column | `archivo_tamaño` must be referenced exactly |
| CORS whitelist | Production frontend URL changes require code/config update |
| Manual page routing | New pages require explicit `page` state handling |
| Admin refresh fan-out | Mutations refresh many caches; easy to miss one |

## Uncertain

- Actual Supabase Storage bucket privacy/policies cannot be verified from code.
- Actual production CORS frontend URL may differ from the hardcoded value.
