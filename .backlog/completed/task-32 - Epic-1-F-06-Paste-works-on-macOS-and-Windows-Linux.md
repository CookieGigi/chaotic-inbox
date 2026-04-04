---
id: TASK-32
title: '[Epic 1] F-06: Paste works on macOS and Windows/Linux'
status: Done
assignee: []
created_date: '2026-03-18 00:09'
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
**I want** the global paste shortcut to work on whichever OS I am running
**so that** I do not have to think about which modifier key to use.

Platform-aware keyboard shortcuts.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 `Cmd+V` on macOS captures the clipboard contents as a new block
- [x] #2 `Ctrl+V` on Windows and Linux captures the clipboard contents as a new block
- [x] #3 Behaviour is otherwise identical across platforms
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [x] #1 Tests pass
- [ ] #2 Documentation updated
- [x] #3 No regressions introduced
<!-- DOD:END -->
