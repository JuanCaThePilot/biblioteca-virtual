# Biblioteca Virtual - Technical Memory

## Current Understanding

Biblioteca Virtual is a full-stack academic resource library for Systems Engineering students. The backend is Express.js with Supabase PostgreSQL and Storage. The frontend target is a React 19 + Vite SPA, while `frontend/public/index.html` was a legacy vanilla app that duplicated auth and resource logic.

## Architecture Map

- Backend entry: `backend/server.js`
- Supabase client: `backend/config/supabase.js`
- Auth middleware: `backend/middleware/auth.js`
- Auth controller: `backend/controllers/authController.js`
- Resource controller: `backend/controllers/recursosController.js`
- Admin controller: `backend/controllers/adminController.js`
- React entry: `frontend/src/main.jsx`
- SPA shell: `frontend/src/App.jsx`
- API client: `frontend/src/services/api.js`
- State hooks: `frontend/src/hooks/useAuth.js`, `useResources.js`, `useAdmin.js`
- Persistence: Supabase tables in `database/schema.sql`; frontend stores session in `localStorage` keys with `bv_` prefix.

## Files Analyzed

All repository source/config files outside dependency folders were inspected, including backend controllers, middleware, routes, scripts, frontend components/hooks/services/styles/config, schema, documentation, git history/blame, VS Code graph output, semantic search, and grep results. Dependency lockfiles were reviewed at dependency level; generated `dist`, `.git`, `node_modules`, and GraphRepo model cache are not source of truth.

## Auth Discoveries

- JWTs are issued by the custom backend, not Supabase Auth.
- Tokens are stored in `localStorage` as `bv_token`; user profile cache is `bv_user`.
- Admin authorization rechecks role from DB.
- Before this pass, password reset code existed only as partial local changes and stored raw reset tokens on `usuarios`.
- Before this pass, logout only removed two localStorage keys and did not clear admin/upload in-memory state or coordinate other tabs.

## Security Findings

- Raw password reset tokens in `usuarios` were replayable if leaked from DB.
- Reset token was returned in API response, which is unsafe outside local debugging.
- Existing JWTs remained valid after password reset.
- No reset rate limit or audit trail existed.
- Legacy `frontend/public/index.html` duplicated token handling and could be served by backend fallback.
- Browser/autofill and mounted React state could retain email/password/reset form characters after auth transitions.
- Supabase tables are in public schema; RLS should be enabled as defense in depth because backend uses service role.

## Decisions Made

- Preserve existing Spanish endpoints and add English aliases: `/solicitar-reset` and `/forgot-password`, `/confirmar-reset` and `/reset-password`.
- Store only SHA-256 reset token hashes in `password_reset_tokens`; send plaintext only in email link.
- Invalidate existing JWTs with `usuarios.token_version` after password reset.
- Use in-memory per-process rate limiting for reset endpoints as a minimal dependency approach.
- Add SMTP email service via `nodemailer`; in development without SMTP it logs the reset link for smoke tests, but the API never returns it.
- Remove backend serving fallback to legacy frontend; serve only `frontend/dist`.

## Completed Tasks

- Added secure password reset model and audit tables to schema.
- Added password reset email service.
- Updated auth middleware to enforce token version and current DB role.
- Updated frontend reset flow to use email links and clear URL token after capture.
- Added cross-tab logout cleanup and sensitive storage clearing.
- Cleared admin and upload in-memory state on logout/session changes.
- Replaced legacy public HTML with a static build notice.
- Added `backend/scripts/smokeAuthSecurity.js`.
- Ran `node --check` on changed backend files.
- Ran `frontend npm run build` successfully.
- Ran `backend npm run smoke:supabase` successfully.

## Pending Tasks

- Apply `database/schema.sql` to the live Supabase project before using the new password reset endpoints.
- Configure SMTP env vars for production: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `FRONTEND_URL`.
- Run smoke tests against the target Supabase project after schema migration.
- `backend npm run smoke:auth-security` currently stops because the remote Supabase schema does not yet have `password_reset_tokens` and `auth_audit_logs`.

## Regression Risks

- `requireAuth` now queries Supabase on every authenticated request, improving invalidation but adding DB dependency and latency.
- Old JWTs without `tokenVersion` remain valid only while the user's DB `token_version` is `0`.
- If SMTP is missing in production, reset requests still return the generic response but no email is delivered; audit logs capture failures.
- Existing databases need new tables/columns before reset confirmation can succeed.

## Future Recommendations

- Move rate limiting to Redis or a managed edge/WAF layer for multi-instance deployments.
- Add a real test runner instead of only smoke scripts.
- Consider shorter JWT lifetimes with refresh-token rotation if the app becomes higher risk.
- Add CSP headers after confirming Vite asset loading and font requirements.
