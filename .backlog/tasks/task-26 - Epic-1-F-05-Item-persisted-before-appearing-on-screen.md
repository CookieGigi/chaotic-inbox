---
id: TASK-26
title: '[Epic 1] F-05: Item persisted before appearing on screen'
status: To Do
assignee: []
created_date: '2026-03-18 00:02'
updated_date: '2026-03-22 09:03'
labels:
  - phase-1
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
**I want** my captured item to be written to local storage before any UI update is rendered
**so that** I can trust the item is safe even if the app crashes immediately after I paste or drop.

Persistence must complete synchronously before UI updates.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Write to local storage completes synchronously with the capture event, before the block is rendered in the feed
- [ ] #2 Force-quitting the app immediately after paste or drop → the item is present on next launch
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

### Implementation Notes

Reference the Item & Metadata Model (doc-20) for persistence integration:

- Use factory functions to create RawItem with complete metadata
- Persist to Dexie/IndexedDB before any UI updates
- Storage layer integration described in doc-16 (referenced by doc-20)
- RawItem structure from doc-20 maps directly to Dexie schema
<!-- SECTION:PLAN:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
