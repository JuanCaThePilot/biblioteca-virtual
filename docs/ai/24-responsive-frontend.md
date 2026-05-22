# Responsive Frontend System

## Scope

The responsive work preserves the existing React/Vite architecture, manual page state, hooks, API integration, animation identity, and Tailwind design system. It only changes frontend layout and presentation classes.

## Strategy

The app now follows a stricter mobile-first layout strategy:

- Base styles target 320px+ screens.
- `sm:` restores roomier card radii, padding, and button widths.
- `md:` is used for form/filter split layouts.
- `lg:` restores desktop shell layouts such as the admin sidebar and hero two-column grid.
- `xl:` is reserved for the largest hero heading and resource grid density.

## Shared Responsive Conventions

| Pattern | Convention |
|---|---|
| Page shell | Use `.section-shell` for constrained width and responsive horizontal padding |
| Overflow prevention | Add `min-w-0` to grid/flex children that contain text, cards, or tables |
| Touch actions | Primary mobile actions should be full width when stacked, then `sm:w-auto` |
| Tables | Keep table semantics but place wide tables inside local `overflow-x-auto` containers |
| Cards | Use slightly smaller base padding/radius, restore larger glass-card geometry at `sm:` |
| Headings | Use smaller fixed mobile sizes, then step through `sm:`, `lg:`, and `xl:` as needed |
| Horizontal chips | Use local scroll containers with `no-scrollbar` and padding compensation |
| Modals | Use `max-h-[92svh]`, smaller mobile padding, and internal scrolling |

## Modified Layout Behavior

| Area | Mobile Behavior | Larger Screens |
|---|---|---|
| Navbar | Centered fixed shell with icon-sized authenticated actions and constrained width | Full desktop actions at `lg:` |
| Hero | Single-column flow, smaller heading, stacked full-width CTAs, shorter visual preview | Two-column hero at `lg:`, full hero scale at `xl:` |
| Bento features | Reduced mobile padding and heading size | Existing 3-column bento and spans at `lg:` |
| Library stats | Single column until enough width, then 3 stats at `min-[520px]` | Resource grid becomes 2 columns at `md:`, 3 at `xl:` |
| Filters | Search and sort stack by default | Split search/sort at `md:` |
| Category chips | Horizontally scrollable on narrow screens | Natural inline row on wider screens |
| Resource cards | Compact padding and full-width download button | Button returns to inline at `sm:` |
| Admin dashboard | Section tabs become horizontal scroll pills | Sidebar returns at `lg:` |
| Admin tables | Tables scroll inside their panel rather than forcing page overflow | Full-width table display where space allows |
| Auth page | Uses `100svh`, vertical padding, smaller card padding | Larger card padding/radius at `sm:` |
| Upload modal | Compact file zone and stacked actions | Roomier file zone and right-aligned actions at `sm:` |

## Files Changed For Responsiveness

- `frontend/src/styles/index.css`
- `frontend/src/App.jsx`
- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/components/landing/Hero.jsx`
- `frontend/src/components/admin/AdminDashboard.jsx`
- `frontend/src/components/resources/LibrarySection.jsx`
- `frontend/src/components/resources/ResourceCard.jsx`
- `frontend/src/components/resources/UploadModal.jsx`
- `frontend/src/components/auth/AuthPage.jsx`
- `frontend/src/components/ui/Modal.jsx`
- `frontend/src/components/ui/ErrorBoundary.jsx`
- `frontend/src/components/motion/SpotlightCard.jsx`

## Supporting Tooling Changes

- `frontend/eslint.config.js` adds the ESLint 9 flat config used by `npm run lint`.
- `.vscode/settings.json` suppresses editor-only unknown at-rule warnings for Tailwind directives.
- `frontend/src/hooks/useAuth.js` only received hook dependency cleanup so lint can validate without changing authentication behavior.

## Verification

- `npm run build` in `frontend/` passes after the responsive changes.
- `npm run lint` in `frontend/` passes with `frontend/eslint.config.js`.
- VS Code diagnostics for Tailwind `@tailwind` and `@apply` directives are handled through `.vscode/settings.json`.

## Limitations

- Admin tables remain semantic tables and use local horizontal scrolling on very narrow screens.
- The Three.js hero visual is still animation-heavy; this responsiveness pass preserves existing animation behavior.
- No browser automation screenshots were added in this pass.
