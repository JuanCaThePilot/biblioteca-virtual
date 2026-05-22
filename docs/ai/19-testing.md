# Testing

## Current Test/Verification Surface

No unit/integration test runner is configured in `package.json` files. The backend includes smoke scripts.

## Backend Smoke Scripts

Source: `backend/package.json` and `backend/scripts`.

| Script | Command | Purpose |
|---|---|---|
| `smoke:supabase` | `node scripts/smokeSupabase.js` | Supabase connectivity/schema smoke |
| `smoke:api` | `node scripts/smokeApi.js` | API smoke |
| `smoke:render` | `node scripts/smokeRender.js` | Render deployment smoke |
| `smoke:admin-role` | `node scripts/smokeAdminRole.js` | Admin role behavior smoke |
| `smoke:admin-resources` | `node scripts/smokeAdminResources.js` | Admin resource behavior smoke |
| `smoke:auth-security` | `node scripts/smokeAuthSecurity.js` | Auth/reset security smoke |

## Frontend Verification

| Script | Command |
|---|---|
| Build | `cd frontend && npm run build` |
| Lint | `cd frontend && npm run lint` using `frontend/eslint.config.js` |
| Preview | `cd frontend && npm run preview` |

## Important Missing Tests

| Area | Suggested Tests |
|---|---|
| Auth | Register/login/logout, token_version invalidation, role checks |
| Password reset | Token hash storage, generic response, replay prevention, expiry |
| Resources | Upload validation, approval lifecycle, owner/admin delete permissions |
| Admin | Superadmin-only role changes, reject/delete storage cleanup |
| Frontend hooks | `useResources` filter behavior, `useAuth` storage cleanup |
| UI | Auth reset URL flow, upload modal, admin section actions |

## Recommended Test Stack

- Backend: Jest or Vitest + Supertest for Express routes.
- Frontend: Vitest + React Testing Library for hooks/components.
- E2E: Playwright for browse/login/upload/admin happy paths.

## Verification Notes

For documentation-only changes, run at least `frontend npm run build` if tooling is available. For backend behavior changes, add or run targeted smoke scripts.

Responsive frontend changes should run both `cd frontend && npm run lint` and `cd frontend && npm run build`. Tailwind editor diagnostics are suppressed through `.vscode/settings.json`; do not replace Tailwind directives with plain CSS to satisfy the editor.
