---
id: TASK-22
title: '[Epic 1] F-04: Items always in capture-time order'
status: To Do
assignee: []
created_date: '2026-03-18 00:01'
labels: []
milestone: m-0
dependencies: []
references:
  - specs/epic-1-f04-user-stories.md
documentation:
  - doc-5
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** the feed to display items in the order I captured them
**so that** I can orient myself by time and trust the feed is a faithful log.

Strict chronological ordering with no sorting options.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Items are ordered ascending by `capturedAt` — oldest at top, newest at bottom
- [ ] #2 No sort control or reorder mechanism is present
- [ ] #3 The order cannot be changed by any user action
<!-- AC:END -->
