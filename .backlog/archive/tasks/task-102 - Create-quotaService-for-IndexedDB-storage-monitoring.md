---
id: TASK-102
title: Create quotaService for IndexedDB storage monitoring
status: To Do
assignee: []
created_date: '2026-04-08 04:45'
labels:
  - quota
  - storage
  - service
  - infrastructure
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create a service to monitor IndexedDB storage usage and quota.

**Requirements:**

- Use `navigator.storage.estimate()` API to get storage info
- Calculate usage percentage: `(used / quota) * 100`
- Handle browsers that don't support the API (return null gracefully)
- Return structured data: `{ used, quota, percent, itemCount }`
- Provide `checkThresholds()` function that returns which thresholds (80/90/95/99%) have been crossed

**Acceptance Criteria:**

- Correctly retrieves storage estimate from browser API
- Calculates usage percentage accurately
- Returns item count from IndexedDB
- Returns null/empty object for unsupported browsers without throwing
- checkThresholds() returns array of crossed thresholds
- Unit tests with mocked storage API
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Retrieves storage estimate using navigator.storage.estimate()
- [ ] #2 Calculates percent usage correctly
- [ ] #3 Returns item count from db.items.count()
- [ ] #4 Gracefully handles unsupported browsers
- [ ] #5 checkThresholds([80,90,95,99]) returns crossed thresholds only
- [ ] #6 Unit tests cover all code paths
<!-- AC:END -->
