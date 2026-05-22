# Conventions

## Language And Naming

- User-facing text is Spanish.
- Database table/column names are Spanish: `usuarios`, `recursos`, `descripcion`, `categoria`, `archivo_tamaño`.
- Backend route names are Spanish: `/perfil`, `/estadisticas`, `/pendientes`, `/aprobar`, `/rechazar`.
- React component names use PascalCase.
- Hooks use `useX` naming.
- API helper functions use `apiGet`, `apiPost`, `apiPatch`, `apiDelete`, `apiUpload`.

## Frontend Patterns

| Pattern | Example |
|---|---|
| Named component exports | `export function Navbar(...)` |
| Root default export only | `App.jsx` |
| Local controlled form state | `AuthPage`, `UploadModal` |
| Tailwind utility classes | Most JSX |
| Shared design classes | `.glass`, `.btn`, `.field`, `.section-shell` |
| Motion variants | `utils/motion.js` |
| API through service layer | Hooks import from `services/api.js` |

## Responsive Frontend Conventions

| Pattern | Convention |
|---|---|
| Mobile first | Base classes must work at 320px before adding breakpoint overrides |
| Breakpoints | Prefer `sm:`, `md:`, `lg:`, `xl:` and only use arbitrary breakpoints for narrow component-specific thresholds |
| Overflow | Use `min-w-0` on grid/flex children and local `overflow-x-auto` for tables/chip rows |
| Touch targets | Keep interactive controls at least `min-h-10`; stack major actions with `w-full sm:w-auto` |
| Cards/modals | Use compact mobile padding/radius, then restore larger glass-card shape at `sm:` |
| Typography | Use fixed breakpoint steps; do not use viewport-width font scaling |
| Admin tables | Preserve table semantics and contain narrow-screen overflow inside the panel |

## Backend Patterns

| Pattern | Example |
|---|---|
| CommonJS modules | `require`, `module.exports` |
| Router/controller split | `routes/*.js` to `controllers/*.js` |
| Middleware guards at route layer | `requireAuth`, `requireAdmin` |
| Supabase direct queries | Controllers call `supabase.from(...)` |
| JSON error body | `{ error: '...' }` |
| JSON success message | `{ mensaje: '...' }` |

## Documentation Rules

- Update `docs/ai` whenever architecture, routes, env vars, auth, schema, or flows change.
- Keep `docs/ai/00-index.md` aligned with created files.
- Keep root `AGENTS.md` concise and link to `docs/ai/AGENTS.md` to avoid duplicated memory.
- Mark unverified runtime facts as `Uncertain`.

## Coding Standards To Preserve

- Keep service-role Supabase usage server-side only.
- Keep frontend API calls centralized in `services/api.js`.
- Keep role checks server-side even if frontend hides UI.
- Keep auth cleanup clearing all `bv_` storage keys unless key naming changes intentionally.
