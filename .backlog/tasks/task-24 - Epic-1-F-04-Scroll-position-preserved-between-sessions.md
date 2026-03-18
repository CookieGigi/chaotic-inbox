---
id: TASK-24
title: '[Epic 1] F-04: Scroll position preserved between sessions'
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
**I want** the feed to remember where I was scrolled when I closed the app
**so that** I can pick up where I left off when nothing new has arrived.

Save and restore scroll position in local storage.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Scroll position is saved to local storage when the app is closed or backgrounded
- [ ] #2 On launch with no new items, the saved scroll position is restored
- [ ] #3 If new items exist since the last session, scroll position is superseded — the feed scrolls to the bottom instead
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
