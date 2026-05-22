# Security Audit

## Current Controls

| Control | Location | Notes |
|---|---|---|
| bcrypt password hashing | `authController.js` | 10 salt rounds |
| JWT signature verification | `middleware/auth.js` | Uses `JWT_SECRET` |
| DB-backed token validation | `middleware/auth.js` | Fetches user and checks `token_version` |
| Role normalization | Auth middleware/controllers | Lowercases and trims role values |
| Password reset token hashing | `authController.js` | Stores SHA-256 hash, not plaintext |
| Single-use reset tokens | `authController.confirmarReset` | Atomic-ish consume using `is('consumed_at', null)` |
| Reset audit logs | `auth_audit_logs` | Best-effort insert, logs errors only |
| File size limit | Multer config | 50 MB |
| File type filter | Multer config | MIME or extension allowlist |
| RLS enabled | `schema.sql` | Service-role backend bypasses RLS |

## High And Medium Risks

| Severity | Risk | Details | Suggested Fix |
|---|---|---|---|
| High | Public executable uploads | `.exe`, `.bat`, `.sh`, JS/TS and octet-stream are allowed and served by public URL | Restrict file types or add malware scanning and signed/private downloads |
| Medium | JWT in localStorage | XSS can steal tokens | Add CSP, sanitize rich content, consider httpOnly cookies or short-lived tokens |
| Medium | Service-role key centralizes power | Any backend compromise gets broad DB/storage access | Keep key server-only; rotate on exposure; consider RPC/policies for least privilege |
| Medium | Process-local rate limits | Reset throttles reset on restart and do not scale horizontally | Move to Redis/infrastructure limiter |
| Medium | No security headers middleware | No Helmet/CSP configured | Add `helmet` and a tested CSP |
| Medium | Public Storage URLs | Approved resources are public if URL known | Use signed URLs if access control becomes required |

## Validation Gaps

- Email format relies mostly on frontend input type and DB uniqueness; backend does not robustly validate email syntax.
- Resource fields have no max lengths in backend or DB schema.
- `tags` are split from a comma string without count/length limits.
- Upload MIME/extension checks are not content inspection.
- Admin delete/reject ignores some storage deletion errors.

## Positive Notes

- Password reset no longer returns reset tokens in API responses.
- Password reset completion invalidates existing JWTs through `token_version`.
- `requireAdmin` verifies current DB role instead of trusting only JWT role.
