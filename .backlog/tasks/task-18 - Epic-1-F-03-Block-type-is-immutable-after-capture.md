---
id: TASK-18
title: '[Epic 1] F-03: Block type is immutable after capture'
status: Done
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-03-31 10:22'
labels:
  - phase-2
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f03-user-stories.md
documentation:
  - 'backlog://doc/doc-4'
  - 'backlog://doc/doc-20'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** the type assigned to a block at capture time to remain fixed
**so that** I can trust the feed reflects exactly what I captured and when.

Type is determined once at capture and never changes.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Block type is determined once at capture time and stored on the item record
- [x] #2 No mechanism exists to change the type of an existing block
- [x] #3 Raw input is stored in full, unmodified, regardless of how it is rendered
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

### Implementation Notes

Reference the Item & Metadata Model (doc-20) for block type immutability:

- Type is determined at capture and stored in the `type` field
- Discriminated union pattern ensures type and metadata are always in sync
- Factory functions guarantee correct type assignment at creation
- No mutation methods provided - type is fixed for item lifetime
<!-- SECTION:PLAN:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
