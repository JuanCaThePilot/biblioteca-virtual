# Deployment

## Current Build Model

This monorepo has separate packages:

- `frontend`: Vite SPA, build output `frontend/dist`.
- `backend`: Express API, can serve `frontend/dist` as static files.

There is no root `package.json`.

## Local Development

| Task | Command | Directory |
|---|---|---|
| Backend dev server | `npm run dev` | `backend` |
| Backend production start | `npm start` | `backend` |
| Frontend dev server | `npm run dev` | `frontend` |
| Frontend build | `npm run build` | `frontend` |
| Frontend preview | `npm run preview` | `frontend` |
| Frontend lint | `npm run lint` | `frontend` |

Vite proxies `/api` to `http://localhost:3000` in dev and preview.

## Combined Deployment

Build frontend first, then start backend. `backend/server.js` serves `../frontend/dist` if present.

```text
cd frontend && npm install && npm run build
cd ../backend && npm install && npm start
```

The backend root `/` returns JSON instead of HTML when `frontend/dist/index.html` is missing.

## Render Recommended Deployment

Existing docs recommend separate services:

| Service | Render Type | Root Directory | Build/Start |
|---|---|---|---|
| Frontend | Static Site | `frontend` | Build `npm install && npm run build`, publish `dist` |
| Backend | Web Service | `backend` | Build `npm install`, start `npm start` |

For separate deployment, set frontend `VITE_API_URL` to the backend API URL ending with `/api` and ensure backend CORS allows the frontend URL.

## Deployment Risks

- CORS allowed origins are hardcoded in `backend/server.js`.
- If using combined deployment, frontend build must exist before requests to `/` serve HTML.
- Production SMTP must be configured for password reset emails to be delivered.
- Production `JWT_SECRET` must be strong and environment-specific.

## Related Docs

- `docs/render/RENDER_DEPLOYMENT.md` contains a more detailed Render guide.
