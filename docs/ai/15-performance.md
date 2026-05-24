# Performance

## Frontend

| Area | Current State | Risk/Opportunity |
|---|---|---|
| Bundle splitting | Vite manual chunks: `vendor`, `three`; `HologramScene` lazy-loaded | Good baseline; admin route is not lazy-loaded |
| Animations | Extensive Framer Motion plus desktop-only Three.js scene | Still watch low-end desktop GPU cost |
| Reduced motion | Hook and CSS media query exist | Three.js renders a static frame in reduced-motion mode |
| Resource loading | Fetch on mount and filter changes | Search input is debounced before API calls |
| API caching | None | Repeated stats/resources fetches after actions can duplicate work |
| Images/assets | No large raster assets in source scan | Good for bundle size |

## Backend

| Area | Current State | Risk/Opportunity |
|---|---|---|
| Resource list | Paginates 12 per page and uses DB range | UI lacks pagination controls, only first page visible |
| Search | `ilike` on `nombre` | May become slow without text/trigram indexes |
| Download count | Read-modify-write update | Race condition under concurrent downloads |
| Stats | Counts and downloads sum across approved resources | Total downloads fetches all approved `descargas`; may need aggregate SQL/RPC later |
| Storage upload | In-memory Multer | 50 MB files consume server memory per upload |
| Admin lists | Fetch all matching rows | Add pagination when data grows |

## Suggested Optimizations

1. Add pagination controls wired to backend `pagina`.
2. Replace download increment with a database RPC or atomic SQL update.
3. Move public stats aggregation into SQL/RPC for large datasets.
4. Lazy-load `AdminDashboard` if admin UI grows.
5. Consider delaying non-critical ambient animations on very low-power devices.

## Recent Frontend Optimizations

- `Hero.jsx` only mounts the lazy `HologramScene` at `lg` and above. Mobile/tablet users get the lightweight glow fallback and avoid loading the large Three.js chunk during initial browsing.
- `LibrarySection.jsx` keeps the search input responsive locally and debounces backend filter requests by 280 ms.
- `App.jsx` Bento cards no longer pass delayed `transition` props into `SpotlightCard`, so hover response is immediate on every card.
