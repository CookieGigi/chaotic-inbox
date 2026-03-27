---
id: TASK-67
title: '[Epic 1] F-07: Draft respects focus state and drag overlay'
status: To Do
assignee: []
created_date: '2026-03-27 02:49'
labels: []
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f07-user-stories.md
  - ./backlog/docs/doc-21
documentation:
  - 'backlog://doc/doc-21'
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** the global typing capture to not interfere with normal input behavior
**so that** I can type in forms and other inputs without triggering draft creation.

**Notes:**

- Typing in focused inputs/textareas/contenteditable works normally
- Draft creation only triggers when NO input is focused
- Drag overlay active → typing ignored (prevent conflict with drag-and-drop)
- Backspace on empty draft keeps the draft (doesn't auto-delete)
- Clicking outside draft keeps it visible (doesn't auto-cancel)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Typing in a focused input/textarea does NOT create draft
- [ ] #2 Typing when contenteditable element is focused does NOT create draft
- [ ] #3 Draft creation is disabled when drag overlay is active
- [ ] #4 Backspace on empty draft content keeps the draft visible
- [ ] #5 Clicking outside the draft block keeps it visible (doesn't cancel)
- [ ] #6 Focus returns to normal after draft is submitted or cancelled
<!-- AC:END -->
