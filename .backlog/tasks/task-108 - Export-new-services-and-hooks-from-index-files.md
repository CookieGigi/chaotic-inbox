---
id: TASK-108
title: Export new services and hooks from index files
status: To Do
assignee: []
created_date: '2026-04-08 04:45'
labels:
  - infrastructure
  - exports
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Update index.ts files to export new modules.

**Files to update:**

- `src/services/index.ts`: Add exports for offlineService and quotaService
- `src/hooks/index.ts`: Add exports for useOnlineStatus and useQuotaMonitor

**Acceptance Criteria:**

- offlineService exported from services/index.ts
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 offlineService exported from services/index.ts
- [ ] #2 quotaService exported from services/index.ts
- [ ] #3 useOnlineStatus exported from hooks/index.ts
- [ ] #4 useQuotaMonitor exported from hooks/index.ts
- [ ] #5 All exports use named export pattern (consistent with existing)
<!-- AC:END -->
