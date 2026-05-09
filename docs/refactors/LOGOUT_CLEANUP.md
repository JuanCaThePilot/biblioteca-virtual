# Logout Cleanup Refactor

## Problem

Sensitive characters could remain after login/logout because logout only removed `bv_token` and `bv_user`. React form state, upload modal state, admin data, browser persisted fields, and other `bv_` keys were not centrally cleared.

## Root Cause

Auth state lived in `useAuth`, while form/admin/upload state lived in separate components and hooks. There was no session version or logout event that downstream state could use to reset itself.

## Change

- `useAuth.logout` now clears all localStorage/sessionStorage keys with the `bv_` prefix.
- `useAuth` increments `sessionVersion` on login/logout/reset.
- `AuthPage` remounts and clears login/register/reset forms across session changes.
- `UploadModal` clears form/file/messages on session changes.
- `useAdmin` clears users/resources/stats when the session is no longer admin.
- Logout broadcasts across tabs with `BroadcastChannel` and listens for storage removal fallback.

## Regression Risk

Low to medium. Public resources remain cached because they are not sensitive. Admin data is cleared when admin state is lost. If future non-sensitive `bv_` keys are added, they will also be cleared on logout and should use a different prefix if persistence is intended.
