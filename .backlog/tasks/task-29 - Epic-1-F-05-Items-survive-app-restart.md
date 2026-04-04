---
id: TASK-29
title: '[Epic 1] F-05: Items survive app restart'
status: Done
assignee: []
created_date: '2026-03-18 00:02'
updated_date: '2026-04-04 05:46'
labels:
  - phase-5
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f05-user-stories.md
documentation:
  - 'backlog://doc/doc-6'
  - 'backlog://doc/doc-20'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** all my captured items to still be there when I reopen the app
**so that** the vault is a reliable record I can return to at any time.

All persisted items load on app launch.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 All items captured in previous sessions are loaded and rendered in the feed on launch
- [x] #2 Items appear in the same capture-time order as when they were saved
- [x] #3 No items are missing or corrupted after a normal close-and-reopen cycle
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

### Implementation Notes

Reference the Item & Metadata Model (doc-20) for data persistence:

- Items stored with complete RawItem structure survive restarts
- Storage layer (doc-16) persists the model defined in doc-20
- UUID and timestamp preserved in storage
- Metadata dictionary ensures all item data is retained
<!-- SECTION:PLAN:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [x] #1 Tests pass
- [x] #2 Documentation updated
- [x] #3 No regressions introduced
<!-- DOD:END -->
