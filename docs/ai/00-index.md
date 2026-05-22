# AI Documentation Index

This directory is the persistent AI-readable memory system for Biblioteca Virtual. It is based on repository code, not intended architecture alone.

## How To Use

Start with `AGENTS.md` for high-signal operating context, then open the numbered file that matches the task.

| File | Purpose |
|---|---|
| `01-project-overview.md` | Product purpose, users, capabilities, repository shape |
| `02-architecture.md` | System architecture, service boundaries, maps |
| `03-frontend.md` | React/Vite app, components, styling, routing state |
| `04-backend.md` | Express app, controllers, middleware, storage |
| `05-api-contracts.md` | Endpoints, auth requirements, request/response shapes |
| `06-auth-system.md` | JWT, roles, reset flow, session storage |
| `07-database.md` | Tables, relationships, RLS state, indexes |
| `08-user-flows.md` | Browse, upload, download, admin, password reset |
| `09-components-map.md` | Component hierarchy and dependencies |
| `10-state-management.md` | Hooks, state owners, refresh patterns |
| `11-business-logic.md` | Rules enforced by backend/frontend |
| `12-dependencies.md` | Runtime and dev dependencies by package |
| `13-environment.md` | Environment variables and URL resolution |
| `14-security.md` | Current controls and risks |
| `15-performance.md` | Bottlenecks and optimization notes |
| `16-technical-debt.md` | Known issues and debt inventory |
| `17-refactor-opportunities.md` | Prioritized refactor plan |
| `18-deployment.md` | Render and local deployment model |
| `19-testing.md` | Current verification scripts and gaps |
| `20-debugging-guide.md` | Practical debugging playbooks |
| `21-conventions.md` | Naming, style, local patterns |
| `22-risk-areas.md` | Files and flows to modify carefully |
| `23-recommended-next-steps.md` | Development priority list |
| `24-responsive-frontend.md` | Responsive frontend strategy, breakpoints, and modified layout behavior |
| `AGENTS.md` | Future Codex operating memory |

## Context Preservation Rules

- Keep this directory as the single detailed AI memory source.
- Update the relevant numbered file whenever code changes.
- Prefer linking to sibling docs over duplicating large explanations.
- Mark unverifiable runtime facts as `Uncertain`.
- Keep route names, table names, storage bucket names, and localStorage keys stable unless code changes them.
