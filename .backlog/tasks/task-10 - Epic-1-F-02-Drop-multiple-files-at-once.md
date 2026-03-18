---
id: TASK-10
title: '[Epic 1] F-02: Drop multiple files at once'
status: To Do
assignee: []
created_date: '2026-03-18 00:00'
updated_date: '2026-03-18 00:25'
labels:
  - phase-3b
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f02-user-stories.md
documentation:
  - backlog://doc/doc-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** to drop several files simultaneously
**so that** they are all captured in one gesture without repeating the action.

Multi-file drops create multiple blocks in order.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Each file in a multi-file drop produces its own block
- [ ] #2 Blocks are appended in drop order
- [ ] #3 Each block renders according to its own type (image vs. file)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-1-f02-user-stories.md](./specs/epic-1-f02-user-stories.md)
- [Doc: doc-3](backlog://doc/doc-3)
