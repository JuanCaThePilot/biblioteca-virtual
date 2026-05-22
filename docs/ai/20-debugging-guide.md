# Debugging Guide

## Backend Will Not Start

Check required env vars first. `backend/config/supabase.js` throws if `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, or `JWT_SECRET` is missing.

Run from `backend`:

```bash
npm start
```

Expected startup logs include server port and frontend build status.

## Frontend Shows API Errors

1. Verify backend is running on port 3000.
2. In dev, confirm Vite proxy exists in `frontend/vite.config.js`.
3. Check `VITE_API_URL` if deployed separately.
4. Check CORS allowed origins in `backend/server.js`.

## Login Fails

- Confirm `usuarios` table exists and contains the user.
- Confirm email normalization: backend lowercases and trims email.
- Confirm bcrypt hash exists in `password_hash`.
- Confirm `JWT_SECRET` is stable between login and protected requests.

## Session Expires Immediately

- `requireAuth` compares JWT `tokenVersion` with `usuarios.token_version`.
- If schema lacks `token_version`, middleware has a fallback to `0`, but the schema should be updated.
- Password reset increments `token_version`, invalidating old tokens by design.

## Upload Fails

- File must be <= 50 MB.
- File MIME or extension must pass the allowlist in `recursosController.js`.
- Supabase Storage bucket must be named `archivos`.
- Backend must use service role key with Storage permissions.

## Download Does Not Open

- `/recursos/:id/descargar` only finds approved resources.
- The returned `archivo_url` must be a valid public URL.
- Browser popup blocking can affect `window.open` if call timing changes.

## Admin Panel Missing

- User role must be `admin` or `superadmin` in `usuarios.rol`.
- `useAuth.refreshProfile()` updates the cached role from the backend once on mount.
- Existing JWT role is not trusted alone; middleware reads the current DB user.

## Password Reset Email Not Delivered

- In production, SMTP variables must be configured.
- In development without SMTP, reset URL is logged to the backend console.
- API intentionally returns a generic success message even on failures to avoid email enumeration.
