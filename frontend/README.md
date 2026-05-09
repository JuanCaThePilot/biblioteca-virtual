# Frontend Architecture

The frontend is a static vanilla HTML/CSS/JS application served from `frontend/public`.

## Structure

- `public/index.html`: semantic markup, existing IDs, inline event hooks, and business logic for auth, resources, uploads, admin actions, and API calls.
- `public/assets/styles.css`: premium SaaS visual system, responsive layout, glassmorphism, hero/dashboard styling, animations, and accessibility states.
- `public/assets/ui.js`: non-business UI behavior such as sticky navbar state, scroll reveal, and animated counters.

## Integration Rules

- Keep API calls routed through the existing `API` constant in `index.html`.
- Preserve IDs used by JavaScript handlers, forms, modals, and admin tables.
- Keep backend routes unchanged unless the backend contract intentionally changes.
- Add purely visual behavior in `assets/ui.js` instead of mixing it with data or auth logic.

## Motion

This project does not currently use React or a frontend build pipeline, so React-only animation libraries such as Framer Motion are not installed here. Motion-style behavior is implemented with performant CSS animations, IntersectionObserver, and requestAnimationFrame while preserving the static deployment model.
