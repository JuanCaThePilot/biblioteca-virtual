# Project Overview

## Purpose

Biblioteca Virtual is a full-stack web application for Systems Engineering students to browse, search, download, and contribute technical resources. Uploaded resources are not public immediately; administrators review and approve them first.

## Primary Users

| User | Capabilities |
|---|---|
| Visitor | Browse approved resources, search/filter, view public stats, trigger downloads |
| Authenticated user | Visitor capabilities plus upload resources for approval and delete owned resources through API |
| Admin | Moderate pending resources, edit descriptions, delete resources, view users and dashboard stats |
| Superadmin | Admin capabilities plus role changes for non-superadmin users |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 3, Framer Motion, Lucide React, Three.js |
| Backend | Node.js, Express 4, Supabase JS client, Multer, bcryptjs, jsonwebtoken |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage bucket `archivos` |
| Email | Nodemailer, configured through SMTP env vars |
| Deployment docs | Render separate frontend static site and backend web service recommended |

## Repository Shape

This is a monorepo with no root `package.json`. `frontend/` and `backend/` are independent Node packages.

```text
biblioteca-virtual/
├── backend/      Express API, Supabase client, routes/controllers, smoke scripts
├── frontend/     React + Vite SPA
├── database/     Supabase/Postgres schema
├── docs/         Human documentation
└── docs/ai/      Persistent AI memory system
```

## Current Migration State

The active frontend is the React app in `frontend/src`. The legacy `frontend/public` tree is absent in the current repository scan, and `backend/server.js` serves only `frontend/dist` when built. Some older root memory files still mention legacy public files; treat this `docs/ai` directory as the current source of truth.

## Uncertain

- Production environment values are not fully knowable from the repository.
- The actual Supabase project data and bucket policies cannot be verified from static code alone.
- No CI configuration was found during repository analysis.
