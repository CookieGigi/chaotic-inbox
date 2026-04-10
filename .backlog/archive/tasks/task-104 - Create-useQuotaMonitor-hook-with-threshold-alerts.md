---
id: TASK-104
title: Create useQuotaMonitor hook with threshold alerts
status: To Do
assignee: []
created_date: '2026-04-08 04:45'
labels:
  - quota
  - hook
  - react
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create React hook that monitors quota and shows toast alerts at thresholds.

**Requirements:**

- Check quota on app load (mount)
- Re-check every 60 seconds (use interval)
- Show warning toast at 80%: "Storage 80% full"
- Show warning toast at 90%: "Storage 90% full - consider cleaning up"
- Show error toast at 95%: "Storage 95% full - clean up now"
- Show error toast at 99%: "Storage almost full - clean up immediately"
- **Only show toast when crossing a threshold** (not every check)
- Return `{ usage, percent, status }` for UI components
- Use existing toast system from `src/store/toastStore`

**Acceptance Criteria:**

- Checks quota on mount
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Checks quota on mount
- [ ] #2 Checks quota every 60 seconds
- [ ] #3 Shows warning toast at 80% threshold
- [ ] #4 Shows warning toast at 90% threshold
- [ ] #5 Shows error toast at 95% threshold
- [ ] #6 Shows error toast at 99% threshold
- [ ] #7 Only alerts when crossing threshold, not every check
- [ ] #8 Returns current usage data
- [ ] #9 Cleans up interval on unmount
- [ ] #10 Unit tests verify alert logic
<!-- AC:END -->
