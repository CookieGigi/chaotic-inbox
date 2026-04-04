---
id: TASK-33
title: '[Epic 1] F-06: Global paste listener doesn''t conflict with OS shortcuts'
status: Done
assignee: []
created_date: '2026-03-18 00:10'
updated_date: '2026-04-04 07:12'
labels:
  - phase-5
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f06-user-stories.md
documentation:
  - 'backlog://doc/doc-7'
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** the app's paste listener to stay out of the way of my OS and other apps
**so that** switching to the app never causes unexpected side effects.

Listener only fires when app window has focus.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The listener only fires when the app window has focus
- [x] #2 No OS-level paste shortcut is intercepted or suppressed outside of the app window
- [x] #3 No conflict arises with OS clipboard manager shortcuts on any supported platform (e.g. `Cmd+Shift+V` on macOS, `Win+V` on Windows)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Tests pass
- [ ] #2 Documentation updated
- [x] #3 No regressions introduced
<!-- DOD:END -->
