---
id: TASK-5
title: '[Epic 1] F-01: Empty or unsupported clipboard is silently ignored'
status: To Do
assignee: []
created_date: '2026-03-17 23:59'
updated_date: '2026-03-18 00:25'
labels:
  - phase-3a
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f01-user-stories.md
documentation:
  - backlog://doc/doc-2
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
- [ ] #1 Pasting with an empty clipboard → no block is created, no error is shown
- [ ] #2 Pasting with an unsupported clipboard type → no block is created, no error is shown
- [ ] #3 The feed remains unchanged and scrolled to its current position
- [ ] #4 No toast, alert, or visual feedback of any kind is shown
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-1-f01-user-stories.md](./specs/epic-1-f01-user-stories.md)
- [Doc: doc-2](backlog://doc/doc-2)
