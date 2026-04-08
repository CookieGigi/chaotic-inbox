---
id: TASK-103
title: Create useOnlineStatus hook with toast notifications
status: To Do
assignee: []
created_date: '2026-04-08 04:45'
labels:
  - offline
  - hook
  - react
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create React hook that monitors online status and shows toast notifications.

**Requirements:**

- Use offlineService to subscribe to status changes
- Show warning toast with 'CloudSlashIcon' when going offline: "You're offline"
- Show success toast with 'CloudCheckIcon' when back online: "Back online"
- Return `{ isOnline: boolean }` for components to use
- Use existing toast system from `src/store/toastStore` (showWarning, showSuccess)

**Acceptance Criteria:**

- Hook subscribes to offlineService on mount
- Shows correct toast when going offline
- Shows correct toast when coming back online
- Cleans up subscription on unmount
- Returns current online status
- Unit tests verify toast calls
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Subscribes to offlineService on mount
- [ ] #2 Shows warning toast when going offline
- [ ] #3 Shows success toast when coming online
- [ ] #4 Unsubscribes on unmount to prevent memory leaks
- [ ] #5 Returns isOnline boolean
- [ ] #6 Unit tests verify toast notifications
<!-- AC:END -->
