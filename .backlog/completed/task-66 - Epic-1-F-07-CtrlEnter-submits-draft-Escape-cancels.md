---
id: TASK-66
title: '[Epic 1] F-07: Ctrl+Enter submits draft, Escape cancels'
status: Done
assignee: []
created_date: '2026-03-27 02:49'
updated_date: '2026-03-29 05:36'
labels: []
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f07-user-stories.md
  - ./backlog/docs/doc-21
documentation:
  - 'backlog://doc/doc-21'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** to submit my draft with Ctrl+Enter or cancel with Escape
**so that** I have clear control over when to save or discard my text.

**Notes:**

- Ctrl+Enter persists the draft as a text item
- Escape removes the draft without saving
- After submission, draft transitions to read-only TextBlock
- Feed scrolls to show the newly persisted block
- Empty content on Ctrl+Enter removes draft without persistence
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Ctrl+Enter submits the draft and creates a persisted text item
- [x] #2 Escape removes the draft without persistence
- [x] #3 After submission, the block appears as a read-only TextBlock
- [x] #4 Empty content on Ctrl+Enter removes draft without creating item
- [x] #5 Feed scrolls to show the newly created block after submission
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Fully implemented and verified:

✅ AC#1: Ctrl+Enter submits and persists - App.tsx lines 54-77 creates text item via createTextItem() and persists to IndexedDB
✅ AC#2: Escape removes draft without persistence - App.tsx lines 80-83 calls cancelDraft() and clears draft state
✅ AC#3: Becomes read-only TextBlock - Feed.tsx lines 82-93 renders Block component for persisted items, DraftBlock for draft
✅ AC#4: Empty content removes draft - App.tsx lines 56-61 checks draftContent.trim().length === 0 and cancels without creating item
✅ AC#5: Feed scrolls to new block - Feed.tsx lines 39-43 uses useEffect with scrollIntoView when items change

All acceptance criteria verified through implementation review and integration testing.

<!-- SECTION:FINAL_SUMMARY:END -->
