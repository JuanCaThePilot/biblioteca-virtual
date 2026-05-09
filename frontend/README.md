# Frontend Architecture

The frontend is now a React + Vite application with Tailwind CSS and Framer Motion.

## Structure

- `src/App.jsx`: SPA shell, page transitions, top-level composition, modal state.
- `src/services/api.js`: API base URL resolution and fetch helpers.
- `src/hooks/`: auth, resources, and admin business logic.
- `src/components/`: reusable UI, layout, landing, auth, resources, and admin components.
- `src/styles/index.css`: Tailwind layers, design tokens, and shared component classes.

## Integration Rules

- Keep API calls routed through `src/services/api.js`.
- Preserve backend endpoints and response contracts.
- Keep backend routes unchanged unless the backend contract intentionally changes.
- Keep data mutations inside hooks instead of UI components.

## Motion

Framer Motion powers route transitions, scroll reveals, hover interactions, parallax, floating cards, and animated counters. Tailwind handles the visual system and responsive behavior.

## Commands

- `npm run dev`: Vite development server on port 5173.
- `npm run build`: production build into `frontend/dist`.
- `npm run preview`: preview built app.

The Express backend serves `frontend/dist` when it exists, and falls back to `frontend/public` for compatibility.
