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

## Animation System

- `src/utils/motion.js`: shared variants for fade, slide, scale, stagger, spring, viewport, and page transitions.
- `components/motion/MotionSection.jsx`: reusable scroll reveal and stagger orchestration.
- `components/motion/SpotlightCard.jsx`: mouse-reactive hover lighting for cards.
- `components/motion/TiltCard.jsx`: pointer-based 3D tilt for premium panels.
- `components/motion/Magnetic.jsx`: magnetic CTA/button microinteraction.
- `components/layout/AmbientBackground.jsx`: animated aurora background, cursor glow, and layered gradient motion.
- `components/three/HologramScene.jsx`: lazy-loaded Three.js hologram in the hero.
- `components/ui/AnimatedCounter.jsx`: count-up metrics for landing and dashboard stats.

Performance notes:

- Three.js is code-split into a separate Vite chunk.
- Motion honors `prefers-reduced-motion` through CSS and interactive helpers.
- Heavy visual effects are GPU-friendly transforms, opacity, blur, and gradients.
- Skeleton loading uses a CSS shimmer instead of generic loading text.

## Commands

- `npm run dev`: Vite development server on port 5173.
- `npm run build`: production build into `frontend/dist`.
- `npm run preview`: preview built app.

The Express backend serves `frontend/dist`. `frontend/public/index.html` is only a static build notice and no longer contains application/auth logic.
