---
id: TASK-64.1
title: '[Epic 1] F-07: Typing alphanumeric creates draft text block'
status: To Do
assignee: []
created_date: '2026-03-27 02:51'
labels: []
milestone: m-0
dependencies: []
parent_task_id: TASK-64
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

As a user, I want to start typing any letter or number anywhere in the app so that a new text block is created instantly for me to capture my thought. This is the primary typing capture flow — no button, no modal, just start typing. Notes: Only alphanumeric keys (a-z, A-Z, 0-9) trigger draft creation. Symbols and special keys are ignored to prevent accidental triggers. First keystroke is captured as the initial content. Draft appears at bottom of feed in edit mode.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Typing 'a' with no input focused creates a draft text block with 'a' as content
- [ ] #2 Typing 'A' or '5' also creates a draft with that character
- [ ] #3 Typing symbols like '-', '=', '@' does NOT create a draft
- [ ] #4 Draft appears at the bottom of the feed
- [ ] #5 Draft is auto-focused for continued typing
- [ ] #6 Focus is stolen from any previously focused element
<!-- AC:END -->
