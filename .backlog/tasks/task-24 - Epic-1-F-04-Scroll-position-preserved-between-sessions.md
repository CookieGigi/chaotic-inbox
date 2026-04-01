---
id: TASK-24
title: '[Epic 1] F-04: Scroll position preserved between sessions'
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
**I want** the feed to remember where I was scrolled when I stopped scrolling
**so that** I can pick up exactly where I left off when I return.

Save scroll position in local storage when user stops scrolling (debounced).

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Scroll position is saved to local storage when the user stops scrolling (debounced, not throttled)
- [ ] #2 On launch, the saved scroll position is restored
- [ ] #3 If no saved position exists (first launch), no restoration occurs (defaults to bottom)
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
