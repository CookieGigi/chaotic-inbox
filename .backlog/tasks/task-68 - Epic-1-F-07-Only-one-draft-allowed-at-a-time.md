---
id: TASK-68
title: '[Epic 1] F-07: Only one draft allowed at a time'
status: Done
assignee: []
created_date: '2026-03-27 02:51'
updated_date: '2026-03-29 05:36'
labels: []
milestone: m-0
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

As a user, I want to have only one draft block active at a time so that I don't accidentally create multiple incomplete blocks while typing. Notes: While a draft exists, typing more characters appends to the existing draft. The existing draft is focused and scrolled into view. Starting a new draft requires submitting or canceling the current one. Draft is NOT persisted — lost on page refresh.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 When draft exists, typing appends to existing draft (doesn't create new one)
- [x] #2 Existing draft is focused when typing continues
- [x] #3 Draft scrolls into view when typing resumes
- [x] #4 Only one draft can exist at a time
- [x] #5 Draft is lost on page refresh (not persisted)
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Fully implemented and verified:

✅ AC#1: Typing appends to existing draft - useGlobalTyping.ts lines 152-154 checks hasDraft and calls onDraftAppend instead of createDraft - Test: useGlobalTyping.test.ts lines 189-205
✅ AC#2: Existing draft focused when typing continues - TextBlockEdit auto-focuses on mount, draft is re-rendered with new content
✅ AC#3: Draft scrolls into view when typing resumes - DraftBlock.tsx lines 37-41 useEffect calls scrollIntoView on mount
✅ AC#4: Only one draft exists at a time - useGlobalTyping uses single draftItem state, hasDraft prevents creating multiple
✅ AC#5: Draft lost on page refresh - Draft has temporary 'draft' ID, never persisted to storage (only submitted items are persisted)

All acceptance criteria verified through implementation review. AC#1 and AC#4 have explicit test coverage.

<!-- SECTION:FINAL_SUMMARY:END -->
