# Performance

## Frontend

| Area | Current State | Risk/Opportunity |
|---|---|---|
| Bundle splitting | Vite manual chunks: `vendor`, `three`; `HologramScene` lazy-loaded | Good baseline; admin route is not lazy-loaded |
| Animations | Extensive Framer Motion plus Three.js scene | Can be heavy on low-end/mobile devices |
| Reduced motion | Hook and CSS media query exist | Three.js loop still schedules every frame; reduced mode does not actually lower RAF frequency |
| Resource loading | Fetch on mount and filter changes | Search input triggers request on every keystroke; add debounce |
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

1. Debounce frontend search requests by 250-400 ms.
2. Add pagination controls wired to backend `pagina`.
3. Replace download increment with a database RPC or atomic SQL update.
4. Move public stats aggregation into SQL/RPC for large datasets.
5. Lazy-load `AdminDashboard` if admin UI grows.
6. Make Three.js reduced-motion mode render a static frame or slower loop.
