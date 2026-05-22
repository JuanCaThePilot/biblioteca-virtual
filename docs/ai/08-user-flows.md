# User Flows

## Browse And Search

```mermaid
flowchart TD
  A[Open app] --> B[App initializes auth]
  B --> C[useResources fetches /recursos]
  B --> D[useResources fetches /recursos/estadisticas]
  C --> E[LibrarySection renders ResourceCard list]
  F[User changes search/category/order] --> G[updateFilters]
  G --> H[fetchResources with new filters]
```

## Register/Login

1. User opens auth page from Navbar or upload CTA.
2. `AuthPage` submits to `auth.register()` or `auth.login()`.
3. `useAuth` calls API and stores `bv_token`/`bv_user`.
4. `App` returns to `home` through `onDone()`.
5. Navbar shows user/admin actions based on role.

## Upload Resource

```mermaid
sequenceDiagram
  participant U as User
  participant UI as UploadModal/useResources
  participant API as POST /api/recursos
  participant ST as Supabase Storage
  participant DB as recursos table
  U->>UI: Fill metadata + choose file
  UI->>API: multipart form + Bearer token
  API->>ST: Upload file to archivos/recursos
  API->>DB: Insert metadata with aprobado=false
  API-->>UI: Pending approval message
```

## Download Resource

1. User clicks `Descargar` on `ResourceCard`.
2. `downloadResource(id)` calls `/recursos/:id/descargar`.
3. Backend selects approved resource, increments `descargas`, returns public file URL.
4. Frontend opens URL in a new tab/window.
5. Frontend refreshes resources and public stats.

## Admin Moderation

```mermaid
flowchart TD
  A[Admin opens Panel Admin] --> B[useAdmin.loadSection]
  B --> C{Section}
  C -->|estadisticas| D[GET /admin/estadisticas]
  C -->|pendientes| E[GET /admin/pendientes]
  C -->|recursos| F[GET /admin/recursos]
  C -->|usuarios| G[GET /admin/usuarios]
  E --> H[Approve or reject]
  H --> I[Refresh pending, published, stats, public resources]
```

## Password Reset

1. User opens `¿Olvidaste tu contraseña?` or enters via `/?reset_token=...`.
2. Request step calls `/auth/solicitar-reset` with email.
3. Backend creates hashed token record and sends email if SMTP is configured.
4. Confirm step calls `/auth/confirmar-reset` with token and new password.
5. Backend consumes token, changes password, increments `token_version`.
6. Frontend logs out/clears session and prompts login.

## Logout

Logout clears React auth state, all `bv_` keys in local/session storage, upload/admin state through dependent effects, and broadcasts logout across tabs.
