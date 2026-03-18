---
id: TASK-37
title: '[Epic 2] F-07: URL enrichment retries automatically on transient failure'
status: To Do
assignee: []
created_date: '2026-03-18 00:10'
updated_date: '2026-03-18 00:14'
labels: []
milestone: m-1
dependencies: []
references:
  - ./specs/epic-2-enrichment-user-stories-1.md
documentation:
  - backlog://doc/doc-9
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** the app to retry a failed URL enrichment automatically,
**so that** a brief network blip doesn't permanently leave a block unenriched.

Up to 3 automatic retries with exponential backoff.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 On fetch failure, the enrichment is retried up to 3 times with exponential backoff
- [ ] #2 The loading indicator remains visible during retries
- [ ] #3 The retry count is not surfaced to the user during automatic retries — only the loading state is shown
- [ ] #4 After 3 failed attempts, automatic retries stop and `enrichmentStatus` is set to `failed`
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-2-enrichment-user-stories-1.md](./specs/epic-2-enrichment-user-stories-1.md)
- [Doc: doc-9](backlog://doc/doc-9)
