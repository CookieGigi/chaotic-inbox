---
id: TASK-5
title: '[Epic 1] F-01: Empty or unsupported clipboard is silently ignored'
status: Done
assignee: []
created_date: '2026-03-17 23:59'
updated_date: '2026-03-29 15:57'
labels:
  - phase-3a
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f01-user-stories.md
documentation:
  - 'backlog://doc/doc-2'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** nothing to happen if I press `Cmd+V` / `Ctrl+V` with an empty or unrecognised clipboard
**so that** accidental pastes don't create broken or empty blocks in my feed.

Silently ignore invalid paste attempts without any feedback.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Pasting with an empty clipboard → no block is created, no error is shown
- [x] #2 Pasting with an unsupported clipboard type → no block is created, no error is shown
- [x] #3 The feed remains unchanged and scrolled to its current position
- [x] #4 No toast, alert, or visual feedback of any kind is shown
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Silent handling of empty/unsupported clipboard. Whitespace-only content ignored. Invalid MIME types ignored. No errors, toasts, or visual feedback shown. Tests: 'should silently ignore empty clipboard', 'should silently ignore whitespace-only clipboard', 'should silently ignore unsupported types'

<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
