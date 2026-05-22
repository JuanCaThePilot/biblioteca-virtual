# Biblioteca Virtual — Repository Agent Instructions

This root file is intentionally concise. The detailed, current AI memory system lives in `docs/ai/`.

## Start Here

1. Read `docs/ai/AGENTS.md` for operational project memory.
2. Read `docs/ai/00-index.md` to choose the relevant deep-dive doc.
3. Update the matching `docs/ai/*.md` file whenever code changes alter architecture, routes, auth, schema, env vars, deployment, or major flows.

## Current Architecture Snapshot

- Monorepo with no root `package.json`.
- Frontend: `frontend/` React 19 + Vite 7 + Tailwind + Framer Motion + Three.js.
- Backend: `backend/` Express + Supabase PostgreSQL/Storage + JWT auth.
- Database schema: `database/schema.sql`.
- Backend serves built React output from `frontend/dist`; no legacy `frontend/public` app is served.

## Common Commands

Run commands inside the relevant package:

| Task | Command | Directory |
|---|---|---|
| Frontend dev | `npm run dev` | `frontend` |
| Frontend build | `npm run build` | `frontend` |
| Frontend lint | `npm run lint` | `frontend` |
| Backend dev | `npm run dev` | `backend` |
| Backend start | `npm start` | `backend` |
| Backend smoke API | `npm run smoke:api` | `backend` |

## High-Risk Areas

- Auth/session/reset: `backend/controllers/authController.js`, `backend/middleware/auth.js`, `frontend/src/hooks/useAuth.js`.
- Resource upload/download/moderation: `backend/controllers/recursosController.js`, `backend/controllers/adminController.js`, `frontend/src/hooks/useResources.js`, `frontend/src/hooks/useAdmin.js`.
- API URL/CORS/deployment: `frontend/src/services/api.js`, `backend/server.js`, `docs/ai/18-deployment.md`.
- Schema/table names: `database/schema.sql`, especially `archivo_tamaño`.

## Non-Negotiables

- Keep `SUPABASE_SERVICE_KEY` server-only.
- Keep server-side authorization checks; frontend role checks are only UI gating.
- Do not expose unapproved resources through public endpoints.
- Preserve password reset generic responses and hashed, single-use reset tokens.
- Update `docs/ai` as the durable source of truth after meaningful code changes.
- For responsive frontend work, follow `docs/ai/24-responsive-frontend.md` and keep changes scoped to presentation/layout unless explicitly requested otherwise.
