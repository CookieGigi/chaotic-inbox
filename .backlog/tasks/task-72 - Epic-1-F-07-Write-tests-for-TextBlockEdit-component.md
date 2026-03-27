---
id: TASK-72
title: '[Epic 1] F-07: Write tests for TextBlockEdit component'
status: To Do
assignee: []
created_date: '2026-03-27 02:59'
labels:
  - phase-4
  - testing
milestone: m-0
dependencies: []
references:
  - ./backlog/docs/doc-21
documentation:
  - 'backlog://doc/doc-21'
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Write unit tests for the TextBlockEdit component. Tests should cover: rendering with initial content, Enter creates newline, Ctrl+Enter triggers onSubmit, Escape triggers onCancel, auto-focus on mount, cursor positioned at end on mount, and textarea auto-expands with content.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Test: renders with initialContent in textarea
- [ ] #2 Test: pressing Enter creates newline
- [ ] #3 Test: Ctrl+Enter calls onSubmit callback
- [ ] #4 Test: Escape key calls onCancel callback
- [ ] #5 Test: textarea auto-focuses on mount
- [ ] #6 Test: cursor positioned at end of content on mount
<!-- AC:END -->
