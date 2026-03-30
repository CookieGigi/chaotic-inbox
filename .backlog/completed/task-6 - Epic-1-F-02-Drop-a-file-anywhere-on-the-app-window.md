---
id: TASK-6
title: '[Epic 1] F-02: Drop a file anywhere on the app window'
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
**I want** to drag a file from my filesystem and drop it anywhere on the app window
**so that** it is saved instantly without navigating to a specific drop zone.

The entire app window acts as the drop target.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 The entire app window acts as a drop target
- [x] #2 A dropped file is captured and appended as a block at the bottom of the feed
- [x] #3 The feed scrolls to the new block
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
