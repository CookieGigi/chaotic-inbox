---
id: TASK-65
title: '[Epic 1] F-07: Draft block supports multi-line editing'
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
**I want** to type multiple lines in the draft text block
**so that** I can capture longer thoughts with proper line breaks.

**Notes:**

- Pressing Enter creates a new line (does not submit)
- No character limit enforced
- Plain text only (no formatting)
- Draft can grow vertically as needed
- Visual styling distinguishes draft from read-only blocks
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Pressing Enter creates a newline in the draft textarea
- [ ] #2 Multiple lines can be typed without limit
- [ ] #3 Draft textarea auto-expands to accommodate content
- [ ] #4 No rich text or markdown formatting is applied
- [ ] #5 Draft has visual distinction from read-only TextBlocks
<!-- AC:END -->
