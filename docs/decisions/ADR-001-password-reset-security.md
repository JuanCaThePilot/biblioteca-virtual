# ADR-001: Password Reset Security Model

## Status

Accepted.

## Context

The project uses custom JWT auth over a Supabase PostgreSQL database. A partial reset implementation stored plaintext tokens directly on `usuarios` and returned them to the frontend, which is not acceptable for production.

## Decision

Use a dedicated `password_reset_tokens` table containing only token hashes, expiry, consumption status, request IP, user agent, and creation timestamp. Send the plaintext token only through the reset email link. Consume the token before password update and increment `usuarios.token_version` after successful reset.

## Consequences

- Reset tokens are not recoverable from the DB.
- Reset links are single-use and short-lived.
- Existing JWTs become invalid after reset.
- Production must configure SMTP.
- Tests need to read the development reset link from server logs or use a controlled test-only path; the API must not return the token.
