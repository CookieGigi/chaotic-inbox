---
id: TASK-106
title: Integrate offline and quota hooks into App.tsx
status: To Do
assignee: []
created_date: '2026-04-08 04:45'
labels:
  - integration
  - app
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Wire up useOnlineStatus and useQuotaMonitor hooks in the main App component.

**Requirements:**

- Import and call useOnlineStatus() in App.tsx
- Import and call useQuotaMonitor() in App.tsx
- Pass isOnline and quotaPercent to SettingsMenu component
- No visual changes to App itself - hooks work via toasts

**Acceptance Criteria:**

- useOnlineStatus() called in App component
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 useOnlineStatus() called in App component
- [ ] #2 useQuotaMonitor() called in App component
- [ ] #3 isOnline passed to SettingsMenu
- [ ] #4 quotaPercent passed to SettingsMenu
- [ ] #5 No visual regressions in App
- [ ] #6 App tests still pass
<!-- AC:END -->
