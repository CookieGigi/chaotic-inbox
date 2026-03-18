---
id: TASK-10
title: '[Epic 1] F-02: Drop multiple files at once'
status: To Do
assignee: []
created_date: '2026-03-18 00:00'
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
