---
id: TASK-12
title: '[Epic 1] F-02: Dragging URL or text from browser is ignored'
status: To Do
assignee: []
created_date: '2026-03-18 00:00'
updated_date: '2026-03-18 00:14'
labels: []
milestone: m-0
dependencies: []
references:
  - specs/epic-1-f02-user-stories.md
documentation:
  - doc-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** dragging a link or selected text from a browser tab to have no effect on the feed
**so that** accidental drags from the browser don't create unexpected blocks.

Only file drags should trigger the capture flow.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Dragging a link from a browser tab onto the app → no block is created
- [ ] #2 Dragging selected text from a browser onto the app → no block is created
- [ ] #3 No drop overlay is shown for non-file drag types
- [ ] #4 The event is silently ignored with no feedback
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
