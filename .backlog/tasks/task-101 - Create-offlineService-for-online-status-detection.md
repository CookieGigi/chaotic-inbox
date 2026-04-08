---
id: TASK-101
title: Create offlineService for online status detection
status: To Do
assignee: []
created_date: '2026-04-08 04:45'
labels:
  - offline
  - service
  - infrastructure
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create a service to detect and monitor browser online/offline status.

**Requirements:**

- Detect online/offline status using `navigator.onLine`
- Listen to `online` and `offline` window events
- Provide subscription API: `onStatusChange(callback)` that returns unsubscribe function
- Export `isOnline()` function for synchronous checks

**Icon indicators (for later use in UI):**

- Use `CloudSlashIcon` when offline
- Use `CloudCheckIcon` when online

**No operation queuing needed** - this is a local-only app.

**Acceptance Criteria:**

- Service correctly detects initial online status
- Event listeners properly update status when network changes
- Subscription callbacks are called on status changes
- Unsubscribe function removes listener correctly
- Unit tests cover all scenarios
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Service correctly detects initial online status on load
- [ ] #2 Event listeners update status when browser goes offline
- [ ] #3 Event listeners update status when browser comes back online
- [ ] #4 onStatusChange() returns working unsubscribe function
- [ ] #5 isOnline() returns current synchronous status
- [ ] #6 Unit tests achieve >80% coverage
<!-- AC:END -->
