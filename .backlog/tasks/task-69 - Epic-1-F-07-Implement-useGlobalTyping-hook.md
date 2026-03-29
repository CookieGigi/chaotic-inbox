---
id: TASK-69
title: '[Epic 1] F-07: Implement useGlobalTyping hook'
status: Done
assignee: []
created_date: '2026-03-27 02:59'
updated_date: '2026-03-29 05:38'
labels:
  - phase-1
  - hooks
milestone: m-0
dependencies: []
references:
  - ./backlog/docs/doc-21
documentation:
  - 'backlog://doc/doc-21'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create a custom React hook that listens for global keyboard events and detects when the user types alphanumeric characters (a-z, A-Z, 0-9) with no input focused. The hook should create a draft text item with the first keystroke as initial content, append subsequent keystrokes to existing draft, and ignore typing when inputs are focused or drag overlay is active.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Hook detects alphanumeric keys using regex /^[a-zA-Z0-9]$/
- [x] #2 Checks document.activeElement to skip focused inputs/textareas/contenteditable
- [x] #3 Creates draft item with first character as content
- [x] #4 Appends subsequent keystrokes to existing draft textarea
- [x] #5 Ignores typing when drag overlay CSS class is present on body
- [x] #6 Returns draft item state and setter functions
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Created useGlobalTyping hook that:\n- Listens for global keyboard events\n- Detects alphanumeric keys (a-z, A-Z, 0-9) when no input is focused\n- Creates draft text item with first keystroke\n- Appends subsequent keystrokes to existing draft\n- Ignores typing when inputs are focused or drag overlay is active\n- Provides createDraft, updateDraft, submitDraft, cancelDraft functions\n\nHook includes comprehensive tests (14 passed, 1 skipped due to jsdom limitations).

<!-- SECTION:FINAL_SUMMARY:END -->
