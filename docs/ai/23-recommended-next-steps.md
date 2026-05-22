# Recommended Next Steps

## Highest Priority

1. Harden upload policy.
   - Decide whether executable/script uploads are required for the business case.
   - If they are required, add scanning, stronger review controls, and possibly private signed downloads.
   - If not required, remove `.exe`, `.bat`, `.sh`, `.js`, `.ts`, `application/octet-stream` from frontend/backend allowlists.

2. Add backend validation.
   - Validate email format, max lengths, category values, tags length/count, and file metadata.
   - Keep frontend validation as UX, not as security.

3. Add automated tests.
   - Start with backend auth/resource/admin route tests.
   - Add frontend hook tests for auth/resource state.

4. Update stale human docs.
   - `README.md` still describes an older `frontend/public` workflow.
   - Root docs should point to React/Vite as the active frontend.

## Near-Term Product Improvements

| Improvement | Why |
|---|---|
| Pagination UI | Backend supports pages but users only see first page |
| Debounced search | Reduces unnecessary API calls |
| Shared toast/notification system | Consistent feedback across auth/upload/admin |
| Admin pagination/filtering | Supports larger user/resource counts |
| SEO/meta cleanup | Better previews and clearer page metadata |

## Security Roadmap

1. Add `helmet` and a tested CSP.
2. Review localStorage JWT tradeoff; consider short-lived tokens or httpOnly cookies if threat model requires it.
3. Move rate limiting out of process memory.
4. Add audit events for admin moderation/role changes.
5. Consider signed Storage URLs if resource access must be controlled.

## Scalability Roadmap

1. Replace total downloads aggregation with SQL aggregate/RPC.
2. Replace download increment with atomic DB operation.
3. Add DB indexes for search strategy if searching grows beyond `nombre`.
4. Add pagination to admin endpoints.
5. Consider background processing for upload scanning or previews.

## Documentation Maintenance

- Update the specific `docs/ai` file whenever code changes.
- Keep `docs/ai/AGENTS.md` as the future-agent quickstart.
- Add decision records for major auth, storage, or deployment changes.
