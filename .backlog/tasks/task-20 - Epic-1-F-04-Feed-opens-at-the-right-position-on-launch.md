---
id: TASK-20
title: '[Epic 1] F-04: Feed opens at the right position on launch'
status: To Do
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-03-18 00:25'
labels:
  - phase-4
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
**I want** the feed to open at the most recent block if anything is new, or where I left off if nothing has changed,
**so that** I always land in the most useful position without any manual scrolling.

Smart positioning based on new items vs. previous session.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On launch, if any items were captured since the last session → scroll to the most recent block
- [ ] #2 On launch, if no new items since the last session → restore the previous scroll position
- [ ] #3 If there is no previous scroll position (first launch, or no items) → scroll to bottom
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
