---
id: TASK-77
title: '[Epic 1] F-07: Create TextBlockEdit component'
status: To Do
assignee: []
created_date: '2026-03-27 03:02'
labels:
  - phase-2
  - components
milestone: m-0
dependencies: []
references:
  - ./backlog/docs/doc-21
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create editable TextBlock variant using textarea. Supports multi-line editing with Enter for newlines, auto-expands vertically, handles Ctrl+Enter to submit and Escape to cancel, auto-focuses on mount with cursor at end.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Uses textarea with transparent background
- [ ] #2 Auto-expands vertically as user types
- [ ] #3 Enter creates newline
- [ ] #4 Ctrl+Enter triggers onSubmit
- [ ] #5 Escape triggers onCancel
- [ ] #6 Auto-focuses on mount with cursor at end
<!-- AC:END -->
