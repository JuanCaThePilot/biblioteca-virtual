# Dependencies

## Backend Package

Source: `backend/package.json`.

| Dependency | Role |
|---|---|
| `@supabase/supabase-js` | PostgreSQL and Storage access |
| `bcryptjs` | Password hashing and verification |
| `cors` | CORS middleware |
| `dotenv` | Loads `.env` in backend runtime |
| `express` | HTTP API server |
| `express-session` | Installed but not used in current source scan |
| `jsonwebtoken` | JWT signing and verification |
| `multer` | Multipart upload parsing and file limits |
| `nodemailer` | SMTP password reset email delivery |
| `nodemon` | Development server restart tool |

## Frontend Package

Source: `frontend/package.json`.

| Dependency | Role |
|---|---|
| `react`, `react-dom` | UI framework |
| `vite` | Dev server and build system |
| `@vitejs/plugin-react` | React transform for Vite |
| `tailwindcss`, `postcss`, `autoprefixer` | CSS build pipeline |
| `framer-motion` | Page transitions, counters, pointer effects |
| `lucide-react` | Icons |
| `three` | Hologram scene rendering |
| `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | Lint tooling |

## Potential Unused Or Questionable Dependencies

| Package | Evidence | Recommendation |
|---|---|---|
| `backend/express-session` | No `require('express-session')` found in source read | Remove if not planned for cookie sessions |
| `frontend/@vitejs/plugin-react` in `dependencies` | Build plugin is usually devDependency | Move to devDependencies when convenient |
| `frontend/vite` in `dependencies` | Build tool is usually devDependency | Move to devDependencies when deployment supports dev deps |

## Lockfiles

Both frontend and backend have `package-lock.json` files, so use `npm install` or `npm ci` consistently per package. No root lockfile/package was found.
