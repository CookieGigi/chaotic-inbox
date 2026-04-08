---
id: TASK-110
title: Add quota monitoring with threshold alerts
status: To Do
assignee: []
created_date: '2026-04-08 04:47'
labels:
  - quota
  - storage
  - feature
  - toast
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Implement IndexedDB quota monitoring with toast alerts at storage thresholds.

**Requirements:**

- Create `quotaService.ts` using `navigator.storage.estimate()` API
- Create `useQuotaMonitor.ts` hook that checks quota on mount and every 60 seconds
- Show toast notifications at thresholds:
  - 80%: Warning "Storage 80% full"
  - 90%: Warning "Storage 90% full - consider cleaning up"
  - 95%: Error "Storage 95% full - clean up now"
  - 99%: Error "Storage almost full - clean up immediately"
- Only alert when crossing a threshold, not on every check
- Add i18n keys: `quota.percent80`, `quota.percent90`, `quota.percent95`, `quota.percent99`
- Export from appropriate index files

**Acceptance Criteria:**

- [ ] quotaService retrieves storage estimate and calculates usage percentage
- [ ] useQuotaMonitor checks every 60s and shows toasts at correct thresholds
- [ ] Only shows toast when crossing threshold, not every check
- [ ] Translations added for all 4 messages
- [ ] Unit tests cover service and hook
<!-- SECTION:DESCRIPTION:END -->
