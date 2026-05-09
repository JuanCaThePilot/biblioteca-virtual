# Auth Architecture

## Login And Register

1. Frontend submits credentials through `useAuth`.
2. `apiPost` sends JSON to `/api/auth/login` or `/api/auth/register`.
3. Backend reads `usuarios`, validates bcrypt password hash, and signs a JWT.
4. JWT payload includes user id, email, role, name, and `tokenVersion`.
5. Frontend stores `bv_token` and `bv_user` in localStorage.
6. On app mount, `useAuth.refreshProfile` validates the token through `/api/auth/perfil`.

## Authenticated Requests

`requireAuth` verifies the JWT signature and then reads the current user from Supabase. The DB read is intentional: it ensures deleted users, changed roles, and incremented token versions are reflected without waiting for the JWT to expire.

## Admin Requests

`requireAdmin` uses the DB-backed role placed on `req.user` by `requireAuth`. Admin role changes become effective immediately for existing JWTs as long as `token_version` has not changed.

## Logout

Logout clears React auth state, all `bv_` keys in localStorage/sessionStorage, auth errors, and broadcasts logout to other tabs through `BroadcastChannel` plus the `storage` event fallback.

## Password Reset

Reset tokens are random, single-use, short-lived values. Only a SHA-256 hash is stored in `password_reset_tokens`; the plaintext token exists only in the email reset link. Reset completion increments `usuarios.token_version`, invalidating existing JWTs.
