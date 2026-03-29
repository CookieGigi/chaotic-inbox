---
id: TASK-1
title: '[Epic 1] F-01: Paste text anywhere in the app'
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
**I want** to press `Cmd+V` / `Ctrl+V` anywhere in the app
**so that** my clipboard text is saved instantly without clicking into any field.

This is the primary capture flow - paste anywhere without focus requirement.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Clipboard text is captured with no input focused
- [x] #2 A new text block appears at the bottom of the feed
- [x] #3 The feed scrolls to the new block
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Implemented useGlobalPaste hook that captures clipboard text with global paste event listener. Text blocks are created and appended to feed. Feed auto-scrolls to show new blocks. Tests: 'should create text item when plain text is pasted', 'should trim whitespace from pasted text'

<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
