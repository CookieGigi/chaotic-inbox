---
id: TASK-31
title: '[Epic 1] F-06: Paste with no element focused'
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
**I want** to press `Cmd+V` / `Ctrl+V` when no input field is focused
**so that** I can capture from the clipboard the moment I switch to the app, without clicking anything first.

The global paste listener requires no focused input.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 App launched, no element focused, `Cmd+V` / `Ctrl+V` pressed → item is captured and appended to the feed
- [x] #2 The feed scrolls to the new block
- [x] #3 No click, focus, or navigation step is required before the keystroke
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [x] #1 Tests pass
- [ ] #2 Documentation updated
- [x] #3 No regressions introduced
<!-- DOD:END -->
