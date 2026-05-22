# Environment

## Backend Required Variables

`backend/config/supabase.js` throws on import if these are missing:

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Server-side service role key |
| `JWT_SECRET` | Yes | JWT signing/verification secret |

## Backend Optional Variables

| Variable | Purpose |
|---|---|
| `PORT` | Express listen port, defaults to 3000 |
| `NODE_ENV` | Production/development behavior in email service |
| `FRONTEND_URL` | Preferred base URL for password reset links |
| `PUBLIC_APP_URL` | Fallback base URL for password reset links |
| `SMTP_HOST` | Enables SMTP delivery |
| `SMTP_PORT` | SMTP port |
| `SMTP_SECURE` | `true` for secure SMTP transport |
| `SMTP_USER` | SMTP auth user |
| `SMTP_PASS` | SMTP auth password |
| `SMTP_FROM` | Email sender display/from value |

## Frontend Variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Build-time API base URL override. Should include `/api` suffix for separate deployment. |

## URL Resolution

`frontend/src/services/api.js` resolves API base in this order:

```text
VITE_API_URL -> /api for local ports/hosts -> current origin + /api -> hardcoded Render fallback
```

## CORS Origins

`backend/server.js` hardcodes allowed origins:

- Local backend/frontend/preview/live-server origins on ports 3000, 5173, 4173, 5500.
- One production frontend URL: `https://biblioteca-frontend-jz0w.onrender.com`.

Update this list whenever production frontend URLs change.

## Environment Warnings

- Never expose `SUPABASE_SERVICE_KEY` to frontend code.
- A missing SMTP config in non-production logs reset links; in production it throws internally but the API still returns a generic message to the user.
- `JWT_SECRET` must be unique and strong in production.
