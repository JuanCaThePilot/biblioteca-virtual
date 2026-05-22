# Frontend

## Entry Points

| File | Role |
|---|---|
| `frontend/index.html` | Vite HTML entry, font preload, root div |
| `frontend/src/main.jsx` | Creates React root and renders `<App />` in `StrictMode` |
| `frontend/src/App.jsx` | Root composition, manual page state, auth init loading, modals |
| `frontend/src/styles/index.css` | Tailwind layers, design system classes, background effects |

## Application Shell

`App.jsx` owns the top-level page state:

- `home`: renders `Hero`, `BentoFeatures`, `LibrarySection`.
- `auth`: renders `AuthPage` and password reset UI.
- `admin`: renders `AdminDashboard` only when `auth.isAdmin` is true.

`ErrorBoundary` wraps the app after auth initialization. `AmbientBackground` is present for both loading and main app states.

## Component Areas

| Folder | Purpose |
|---|---|
| `components/admin` | Admin dashboard, stats, pending/published/user tables |
| `components/auth` | Login, register, forgot/reset password forms |
| `components/landing` | Hero and metrics preview |
| `components/layout` | Navbar and ambient animated background |
| `components/motion` | Reusable Framer Motion wrappers and pointer effects |
| `components/resources` | Resource library, cards, upload modal |
| `components/three` | Lazy-loaded Three.js hologram scene |
| `components/ui` | Button, card, modal, skeleton, counter, error boundary |

## Styling System

Tailwind is configured in `frontend/tailwind.config.js` with custom tokens:

| Token | Value | Purpose |
|---|---|---|
| `ink` | `#05070d` | Main background |
| `panel` | `rgba(15, 18, 30, 0.72)` | Glass panels |
| `line` | `rgba(255,255,255,0.12)` | Borders |
| `violet` | `#7c5cff` | Primary gradient start |
| `cyan` | `#00d1ff` | Primary gradient end |

Global component classes include `.glass`, `.glass-strong`, `.btn`, `.btn-primary`, `.btn-danger`, `.btn-success`, `.field`, and `.section-shell`.

## Responsive System

The frontend uses mobile-first Tailwind utilities and preserves the existing glassmorphism identity. See `24-responsive-frontend.md` for the detailed responsive map.

Current conventions:

- `.section-shell` is the page-level width and padding primitive.
- Components that sit inside flex/grid layouts use `min-w-0` to prevent text and cards from forcing horizontal overflow.
- Mobile action groups stack with full-width buttons, then return to inline actions at `sm:`.
- Large page headings start smaller on mobile and step up at `sm:`, `lg:`, and `xl:`.
- Admin tables remain semantic tables and scroll inside their panel on narrow screens.
- Horizontal chip groups use local `overflow-x-auto` instead of page overflow.
- Modals use `max-h-[92svh]`, compact mobile padding, and internal scrolling.

## Client API Access

All HTTP calls go through `frontend/src/services/api.js`. `getApiBase()` resolves the API base in this order:

1. `import.meta.env.VITE_API_URL`, trimmed of trailing slash.
2. `/api` for local ports `3000`, `5173`, or `4173`.
3. `/api` for localhost/127.0.0.1.
4. `${window.location.origin}/api` for HTTP origins.
5. Hardcoded Render fallback.

## Frontend Risks

| Risk | Location | Notes |
|---|---|---|
| No URL routes | `App.jsx` | Browser navigation/bookmarks do not map to pages except password reset query param |
| JWT in localStorage | `useAuth.js` | Exposes session to XSS; accepted current tradeoff |
| Large animation surface | layout/motion/three components | More GPU/CPU work, especially on low-power devices |
| Manual inline feedback | `AdminDashboard`, `AuthPage`, `UploadModal` | No shared toast system; messages are local to components |
