---
id: TASK-18
title: '[Epic 1] F-03: Block type is immutable after capture'
status: To Do
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-03-18 00:25'
labels:
  - phase-2
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f03-user-stories.md
documentation:
  - backlog://doc/doc-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** the type assigned to a block at capture time to remain fixed
**so that** I can trust the feed reflects exactly what I captured and when.

Type is determined once at capture and never changes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Block type is determined once at capture time and stored on the item record
- [ ] #2 No mechanism exists to change the type of an existing block
- [ ] #3 Raw input is stored in full, unmodified, regardless of how it is rendered
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-1-f03-user-stories.md](./specs/epic-1-f03-user-stories.md)
- [Doc: doc-4](backlog://doc/doc-4)
