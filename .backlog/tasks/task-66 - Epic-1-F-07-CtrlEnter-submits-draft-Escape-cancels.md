---
id: TASK-66
title: '[Epic 1] F-07: Ctrl+Enter submits draft, Escape cancels'
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
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** to submit my draft with Ctrl+Enter or cancel with Escape
**so that** I have clear control over when to save or discard my text.

**Notes:**

- Ctrl+Enter persists the draft as a text item
- Escape removes the draft without saving
- After submission, draft transitions to read-only TextBlock
- Feed scrolls to show the newly persisted block
- Empty content on Ctrl+Enter removes draft without persistence
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Ctrl+Enter submits the draft and creates a persisted text item
- [ ] #2 Escape removes the draft without persistence
- [ ] #3 After submission, the block appears as a read-only TextBlock
- [ ] #4 Empty content on Ctrl+Enter removes draft without creating item
- [ ] #5 Feed scrolls to show the newly created block after submission
<!-- AC:END -->
