# Debugging Guide

## Backend Will Not Start

Check required env vars first. `backend/config/supabase.js` throws if `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, or `JWT_SECRET` is missing.

Run from `backend`:

```bash
npm start
```

Expected startup logs include server port and frontend build status.

## VS Code CommonJS Hint In Backend

If VS Code suggests that `backend/server.js` can be converted to an ES module, treat it as an editor suggestion, not a runtime error. The backend is intentionally CommonJS across `server.js`, routes, controllers, middleware, and config files.

The workspace disables JavaScript suggestion actions in `.vscode/settings.json` so this hint does not pollute Problems. Do not add `"type": "module"` or convert one backend file unless the entire backend module system is migrated deliberately.

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

## Admin Panel Keeps Reloading

- Check effect dependencies in `App.jsx` and `AdminDashboard.jsx`.
- Effects that call `loadSection()` should depend on the stable `loadSection` callback plus primitive flags such as `page` or `section`.
- Do not depend on the full `admin` object for section-loading effects; admin state changes replace that aggregate object and can trigger repeated API calls.
- `AdminDashboard.jsx` should be the single owner of active admin section loading. Reintroducing an admin preload effect in `App.jsx` can duplicate the first dashboard request.

## Login/Register Shows Console Promise Errors

- Expected credential/validation failures should be caught in `AuthPage.jsx`.
- `useAuth.login()` and `useAuth.register()` intentionally throw after setting `authError`; submit handlers should catch those errors and let the UI render `auth.authError`.

## Reduced Motion Still Animates

- `HologramScene.jsx` should render a static Three.js scene when `usePrefersReducedMotion()` returns true.
- If animation continues for reduced-motion users, inspect the `animate()` loop before changing global motion variants.

## Password Reset Email Not Delivered

- In production, SMTP variables must be configured.
- In development without SMTP, reset URL is logged to the backend console.
- API intentionally returns a generic success message even on failures to avoid email enumeration.
