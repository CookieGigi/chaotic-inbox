---
id: TASK-20
title: '[Epic 1] F-04: Feed opens at the right position on launch'
status: Done
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-04-01 16:21'
labels:
  - phase-4
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f04-user-stories.md
documentation:
  - 'backlog://doc/doc-5'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** the feed to open at my last scroll position,
**so that** I always land exactly where I left off without any manual scrolling.

Always restore the previous scroll position on launch.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 On launch, restore the previous scroll position from localStorage
- [ ] #2 If there is no previous scroll position (first launch), scroll to bottom
- [ ] #3 Position is restored smoothly with behavior: 'smooth'
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
