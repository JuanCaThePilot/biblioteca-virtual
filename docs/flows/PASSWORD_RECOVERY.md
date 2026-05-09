# Password Recovery Flow

## Request Reset

1. User opens "Olvidaste tu contraseña" in `AuthPage`.
2. Frontend calls `POST /api/auth/solicitar-reset` with email.
3. Backend normalizes email and rate-limits by IP plus email.
4. Backend always returns the same generic message to avoid user enumeration.
5. If the user exists, old unconsumed reset tokens are consumed.
6. Backend creates a random token, stores only its SHA-256 hash, and sends a reset link.
7. Audit logs record the event.

## Reset Link

The email link points to the frontend with `?reset_token=<token>`. `App.jsx` captures the token, opens the auth reset screen, and removes the token from the visible URL with `history.replaceState`.

## Confirm Reset

1. User enters a new password.
2. Frontend calls `POST /api/auth/confirmar-reset`.
3. Backend validates password strength.
4. Backend hashes the submitted reset token and looks it up.
5. Token must exist, be unconsumed, and be unexpired.
6. Backend consumes the token before updating the password to block replay.
7. Backend updates bcrypt password hash and increments `token_version`.
8. Old JWTs fail on the next authenticated request.

## Email Configuration

Production requires:

- `FRONTEND_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

In non-production without SMTP, the reset URL is logged to the backend console for local smoke tests. It is never returned in the HTTP response.
