---
id: TASK-80
title: 'Refactor: Extract scroll logic from Feed component'
status: Done
assignee: []
created_date: '2026-03-31 19:39'
updated_date: '2026-04-05 09:05'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Move the scroll orchestration logic out of Feed.tsx into a dedicated hook `useFeedScroll` that coordinates with `useScrollPosition`. This will make Feed.tsx purely presentational and improve separation of concerns.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Create new hook `useFeedScroll` that handles all scroll effects currently in Feed.tsx
- [ ] #2 Feed.tsx uses the new hook and only receives `newestItemRef` and scroll state
- [ ] #3 All existing scroll behavior preserved (initial scroll, new items detection, position restoration)
- [ ] #4 Remove scroll-related useEffects from Feed.tsx
- [ ] #5 Hook is properly typed and documented
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

## Summary

Successfully refactored Feed.tsx to extract scroll logic into a dedicated `useFeedScroll` hook.

### Changes Made

1. **Created `src/hooks/useFeedScroll.ts`** (83 lines)
   - Encapsulates all scroll orchestration logic
   - Coordinates with `useScrollPosition` internally (Option A)
   - Handles: initial scroll, position restoration, new item detection, draft suppression
   - Fully typed with `UseFeedScrollOptions` and `UseFeedScrollReturn` interfaces
   - Comprehensive JSDoc documentation

2. **Created `src/hooks/useFeedScroll.test.ts`** (12 tests)
   - Tests for ref return values
   - Tests for scroll restoration behavior
   - Tests for draft item suppression
   - Tests for history.scrollRestoration
   - Tests for cleanup/unmount

3. **Updated `src/hooks/index.ts`**
   - Added export for `useFeedScroll` and its types

4. **Refactored `src/components/Feed/Feed.tsx`**
   - Reduced from 148 lines to 88 lines (40% reduction)
   - Removed all scroll-related useEffects (3 effects removed)
   - Removed all scroll-related refs (3 refs removed)
   - Now purely presentational - only receives `newestItemRef` from hook
   - All existing scroll behavior preserved

### Test Results

- All 450 tests pass
- All 27 Feed component tests pass
- All 12 useFeedScroll hook tests pass
- 1 pre-existing skipped test (unrelated)

### Acceptance Criteria Status

- [x] #1 Create new hook `useFeedScroll` that handles all scroll effects currently in Feed.tsx
- [x] #2 Feed.tsx uses the new hook and only receives `newestItemRef` and scroll state
- [x] #3 All existing scroll behavior preserved (initial scroll, new items detection, position restoration)
- [x] #4 Remove scroll-related useEffects from Feed.tsx
- [x] #5 Hook is properly typed and documented
<!-- SECTION:FINAL_SUMMARY:END -->
