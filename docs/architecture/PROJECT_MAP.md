# Project Map

## Purpose

Biblioteca Virtual is a web application for publishing, moderating, browsing, and downloading technical resources. Users can register, authenticate, upload resources, and download approved resources. Administrators approve, reject, edit, delete resources, and manage user roles.

## Backend

- `backend/server.js`: Express app, CORS, JSON/body parsing, static React build serving, route mounting, and global error handling.
- `backend/config/supabase.js`: Singleton Supabase service-role client; validates required env vars on import.
- `backend/middleware/auth.js`: JWT verification, DB-backed user lookup, token-version invalidation, and admin guard.
- `backend/controllers/authController.js`: Register, login, profile, forgot password, reset password.
- `backend/controllers/recursosController.js`: Public listing/stats/download plus authenticated resource upload/delete.
- `backend/controllers/adminController.js`: Admin stats, moderation, resource management, and user role changes.
- `backend/routes/*.js`: Thin Express routers mapping paths to controllers.
- `backend/scripts/*.js`: Smoke tests for Supabase, API, render deployment, admin flows, and auth security.

## Frontend

- `frontend/src/main.jsx`: React root.
- `frontend/src/App.jsx`: SPA page state, auth/resource/admin hook composition, reset-token URL capture, upload modal ownership.
- `frontend/src/services/api.js`: API base resolution and fetch helpers.
- `frontend/src/hooks/useAuth.js`: Session state, localStorage persistence, profile refresh, reset calls, logout cleanup.
- `frontend/src/hooks/useResources.js`: Public resource state, filters, upload/download.
- `frontend/src/hooks/useAdmin.js`: Admin-only data and mutations; clears cached admin data when no longer admin.
- `frontend/src/components/auth/AuthPage.jsx`: Login/register/forgot/reset UI.
- `frontend/src/components/resources/*`: Library, cards, upload modal.
- `frontend/src/components/admin/AdminDashboard.jsx`: Admin console.

## Persistence

- `usuarios`: user identity, password hash, role, token version, legacy reset columns.
- `recursos`: resource metadata, storage URL, owner, downloads, approval state.
- `password_reset_tokens`: hashed one-time reset tokens with expiry and consumption timestamp.
- `auth_audit_logs`: auth and reset event audit trail.
- Supabase Storage bucket `archivos`: uploaded files.

## High-Impact Files

Repo graph and reference analysis showed frontend coupling around `App.jsx`, `AuthPage.jsx`, `useAuth.js`, `api.js`, and `AdminDashboard.jsx`. Backend security coupling is centered on `authController.js`, `middleware/auth.js`, and `schema.sql`.
