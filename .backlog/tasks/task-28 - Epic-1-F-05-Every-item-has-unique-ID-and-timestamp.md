---
id: TASK-28
title: '[Epic 1] F-05: Every item has unique ID and timestamp'
status: To Do
assignee: []
created_date: '2026-03-18 00:02'
updated_date: '2026-03-22 08:42'
labels:
  - phase-1
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f05-user-stories.md
documentation:
  - 'backlog://doc/doc-6'
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

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
