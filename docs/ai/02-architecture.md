# Architecture

## High-Level System

The frontend is a Vite-built React SPA. The backend is an Express API that can also serve the built SPA from `frontend/dist`. Data and files live in Supabase PostgreSQL and Supabase Storage.

```mermaid
flowchart LR
  Browser[Browser: React SPA] -->|fetch /api/*| API[Express API]
  API -->|service role client| DB[(Supabase PostgreSQL)]
  API -->|upload/remove/public URL| Storage[(Supabase Storage: archivos)]
  API -->|SMTP optional| Mail[Email service]
  Browser -->|open public URL| Storage
```

## Runtime Boundaries

| Boundary | Location | Responsibility |
|---|---|---|
| React SPA | `frontend/src` | User interface, client state, API calls, animations |
| API server | `backend/server.js` | Middleware, CORS, routing, static serving, error handling |
| Route layer | `backend/routes` | URL to controller mapping and auth middleware wiring |
| Controller layer | `backend/controllers` | Business logic and Supabase operations |
| Supabase client | `backend/config/supabase.js` | Central service-role Supabase client with env validation |
| Database schema | `database/schema.sql` | Tables, indexes, RLS enabled state |

## Request Lifecycle

```mermaid
sequenceDiagram
  participant B as Browser
  participant V as Vite/Static SPA
  participant E as Express
  participant R as Route
  participant M as Auth Middleware
  participant C as Controller
  participant S as Supabase

  B->>V: Load SPA
  B->>E: API request
  E->>R: Match /api/auth, /api/recursos, /api/admin
  opt Protected route
    R->>M: requireAuth / requireAdmin
    M->>S: Fetch user and token_version
  end
  R->>C: Invoke controller
  C->>S: Query table or storage
  C-->>B: JSON response
```

## Service Dependency Map

```mermaid
flowchart TD
  App[frontend/src/App.jsx]
  AuthHook[useAuth]
  ResourcesHook[useResources]
  AdminHook[useAdmin]
  ApiClient[services/api.js]
  Express[backend/server.js]
  AuthRoutes[routes/auth.js]
  RecursosRoutes[routes/recursos.js]
  AdminRoutes[routes/admin.js]
  Controllers[controllers]
  Middleware[middleware/auth.js]
  Supabase[config/supabase.js]

  App --> AuthHook
  App --> ResourcesHook
  App --> AdminHook
  AuthHook --> ApiClient
  ResourcesHook --> ApiClient
  AdminHook --> ApiClient
  ApiClient --> Express
  Express --> AuthRoutes
  Express --> RecursosRoutes
  Express --> AdminRoutes
  AuthRoutes --> Controllers
  RecursosRoutes --> Controllers
  AdminRoutes --> Middleware
  AdminRoutes --> Controllers
  Middleware --> Supabase
  Controllers --> Supabase
```

## Routing Model

Frontend routing is manual state in `App.jsx`, not React Router. Backend routing is Express routers under `/api`.

| Route Type | Implementation |
|---|---|
| Frontend pages | `page` state: `home`, `auth`, `admin` |
| Password reset entry | `reset_token` query param forces `auth` page |
| Backend auth | `/api/auth/*` |
| Backend resources | `/api/recursos/*` |
| Backend admin | `/api/admin/*` |

## Why This Architecture Exists

The application is small enough that manual frontend page state avoids router complexity. The backend remains a conventional Express controller stack, and Supabase handles persistence and file storage without a separate database or object storage service.
