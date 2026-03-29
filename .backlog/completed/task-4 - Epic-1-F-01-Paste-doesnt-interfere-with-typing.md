---
id: TASK-4
title: "[Epic 1] F-01: Paste doesn't interfere with typing"
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
**I want** normal paste behaviour inside text inputs to be unaffected
**so that** the global listener doesn't double-capture when I'm filling in a form.

The global paste listener must yield to focused editable elements.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Pasting inside an `<input>` or `<textarea>` pastes into that field only
- [x] #2 No duplicate block is created in the feed
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Input focus detection using isInputElement utility. Paste events ignored when input, textarea, or contenteditable is focused. Normal paste behavior preserved for form fields. Tests: 'should NOT capture paste when input is focused', 'should NOT capture paste when textarea is focused'

<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
