---
id: TASK-28
title: '[Epic 1] F-05: Every item has unique ID and timestamp'
status: To Do
assignee: []
created_date: '2026-03-18 00:02'
updated_date: '2026-03-22 09:19'
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
**I want** each item to carry a stable identifier and an accurate timestamp
**so that** the feed can be ordered reliably and individual items can be referenced unambiguously.

UUID v4 for ID, ISO 8601 for timestamp.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Every stored item has an `id` field containing a UUID v4
- [x] #2 Every stored item has a `capturedAt` field containing an ISO 8601 timestamp set at the moment of capture
- [x] #3 No two items share the same `id`
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

### Implementation Notes

Reference the Item & Metadata Model (doc-20) for the data structure:

- Use `id` field with UUID v4 generation via factory functions
- Use `capturedAt` field with ISO 8601 timestamp set at capture moment
- Ensure uniqueness by using UUID generation (factory functions handle this)
- Type guards and discriminated unions defined in doc-20 ensure type safety
<!-- SECTION:PLAN:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [x] #1 Tests pass
- [ ] #2 Documentation updated
- [x] #3 No regressions introduced
<!-- DOD:END -->
