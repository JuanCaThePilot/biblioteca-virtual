# Security Audit

## Findings Fixed

- Raw reset tokens were stored in `usuarios`; now only token hashes are stored in `password_reset_tokens`.
- Reset token was returned in the API response; now the API always returns a generic message.
- Existing JWTs survived password reset; now `token_version` invalidates them.
- Reset endpoints had no throttling; now request and confirmation attempts are rate-limited in process.
- Auth reset activity had no audit trail; now `auth_audit_logs` captures requested, failed, expired, invalid, replayed, and completed reset events.
- Legacy static frontend duplicated auth/token logic; backend now serves only the built React app.
- Logout did not clear all sensitive client state; now `bv_` persisted keys, auth state, admin cache, upload form state, and cross-tab sessions are cleared.

## Remaining Risks

- Rate limiting is process-local and should move to Redis or infrastructure for horizontal scaling.
- JWTs are still stored in localStorage, which is vulnerable to XSS. A hardened future version should consider httpOnly cookies with CSRF protection or short-lived access tokens plus refresh rotation.
- Supabase service role is used server-side. It must never be exposed to frontend code.
- Public Storage URLs mean approved resource files are public once the URL is known.
- Production password reset depends on SMTP env configuration; missing SMTP causes generic success without actual delivery.

## CSRF

The current API uses Authorization bearer tokens and does not rely on ambient browser cookies for auth, so conventional CSRF risk is limited. If auth is moved to cookies later, CSRF defenses must be added.

## XSS

React escapes rendered text by default. The legacy public app had string-built HTML and is no longer served. A future CSP should be added after validating fonts and Vite assets.

## Supabase RLS

`database/schema.sql` enables RLS for application tables. The backend service-role client bypasses RLS for server operations, but enabling RLS protects against accidental public Data API exposure.
