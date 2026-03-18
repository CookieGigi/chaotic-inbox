---
id: TASK-9
title: '[Epic 1] F-02: Drop a non-image file and see its metadata'
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
**I want** a dropped non-image file to appear with its filename, size, and a type-specific icon
**so that** I can identify what I captured at a glance without opening it.

Non-image files show type-specific icons (PDF, zip, binary).

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Dropping a `.pdf` → file block with `FilePdf` icon, filename, and file size
- [ ] #2 Dropping a `.zip` → file block with `FileZip` icon, filename, and file size
- [ ] #3 Dropping an unknown binary → file block with `FileBinary` icon, filename, and file size
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
