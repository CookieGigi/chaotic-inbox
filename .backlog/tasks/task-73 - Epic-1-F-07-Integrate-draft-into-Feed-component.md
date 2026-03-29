---
id: TASK-73
title: '[Epic 1] F-07: Integrate draft into Feed component'
status: Done
assignee: []
created_date: '2026-03-27 03:00'
updated_date: '2026-03-29 05:28'
labels:
  - phase-3
  - integration
milestone: m-0
dependencies: []
references:
  - ./backlog/docs/doc-21
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Update Feed component to accept and render a draft item. Renders DraftBlock after existing items, auto-scrolls to draft on creation, handles submission persistence, and handles cancellation.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Accepts optional draftItem prop
- [ ] #2 Renders DraftBlock after existing items
- [ ] #3 Auto-scrolls to draft when created
- [ ] #4 On submit: persists and scrolls to new block
- [ ] #5 On cancel: removes draft without persistence
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Updated Feed component to:\n- Accept optional draftItem prop\n- Render DraftBlock after existing items at bottom of feed\n- Auto-scroll to draft when created\n- Handle submission via onDraftSubmit callback\n- Handle cancellation via onDraftCancel callback\n- Maintain existing Feed functionality and accessibility\n\nAll existing Feed tests continue to pass (18 tests).

<!-- SECTION:FINAL_SUMMARY:END -->
