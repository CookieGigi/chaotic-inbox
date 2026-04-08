---
id: TASK-109
title: Add offline detection with toast notifications
status: To Do
assignee: []
created_date: '2026-04-08 04:47'
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
