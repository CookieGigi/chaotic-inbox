---
id: TASK-109
title: Add offline detection with toast notifications
status: Done
assignee: []
created_date: '2026-04-08 04:47'
updated_date: '2026-04-08 05:03'
labels:
  - offline
  - feature
  - toast
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Implement offline/online status detection with toast notifications.

**Requirements:**

- Create `offlineService.ts` to detect online/offline status using `navigator.onLine` and window events
- Create `useOnlineStatus.ts` hook that subscribes to status changes
- Show toast notifications:
  - Warning toast with `CloudSlashIcon` when going offline: "You're offline"
  - Success toast with `CloudCheckIcon` when back online: "Back online"
- Add i18n keys: `offline.status.offline`, `offline.status.online`
- Export from appropriate index files

**Acceptance Criteria:**

- [ ] offlineService correctly detects status and provides subscription API
- [ ] useOnlineStatus hook shows correct toast when going offline/online
- [ ] Translations added for both messages
- [ ] Unit tests cover service and hook
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

✅ TASK-109 Complete: Offline detection with toast notifications

**Files created:**

- `src/services/offlineService.ts` - Service for online status detection
- `src/services/offlineService.test.ts` - Unit tests (9 tests)
- `src/hooks/useOnlineStatus.ts` - React hook with toast notifications
- `src/hooks/useOnlineStatus.test.ts` - Unit tests (11 tests)

**Files modified:**

- `src/services/index.ts` - Added exports for offlineService
- `src/hooks/index.ts` - Added export for useOnlineStatus
- `src/i18n/locales/en/translation.json` - Added offline translations

**Features implemented:**

- `isOnline()` - Returns current online status
- `onStatusChange(callback)` - Subscribe to status changes with unsubscribe
- `useOnlineStatus()` hook - Shows warning toast when going offline, success toast when back online
- Toast messages use i18n: `offline.status.offline` and `offline.status.online`
- Toasts only show on status CHANGES (not on initial mount)

**Test coverage:**

- 20 total tests covering all scenarios
- All 633 tests in suite pass
<!-- SECTION:FINAL_SUMMARY:END -->
