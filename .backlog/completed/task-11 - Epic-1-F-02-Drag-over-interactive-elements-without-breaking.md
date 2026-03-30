---
id: TASK-11
title: '[Epic 1] F-02: Drag over interactive elements without breaking'
status: Done
assignee: []
created_date: '2026-03-18 00:00'
updated_date: '2026-03-30 05:24'
labels:
  - phase-3b
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f02-user-stories.md
documentation:
  - 'backlog://doc/doc-3'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** the drop target to remain active even when I drag over a text input or other interactive element
**so that** I can drop files anywhere in the app without hitting dead zones.

The drop overlay stays active even over inputs and buttons.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Dragging a file over an `<input>`, `<textarea>`, or button keeps the full-screen overlay active
- [x] #2 Dropping a file while hovering over an interactive element captures the file normally
- [x] #3 The interactive element does not receive the drop event (no browser default behaviour)
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
