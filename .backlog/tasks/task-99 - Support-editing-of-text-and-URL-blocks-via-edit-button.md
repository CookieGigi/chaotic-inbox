---
id: TASK-99
title: Support editing of text and URL blocks via edit button
status: Done
assignee: []
created_date: '2026-04-08 04:29'
updated_date: '2026-04-11 17:04'
labels:
  - feature
  - block-editing
  - epic-3
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add an edit button to text and URL blocks that allows users to modify the content of individual blocks. Each block should have its own edit affordance.

**Context:**

- The app has different block types: text, URL, image, and file
- Only text and URL blocks are editable (image and file content cannot be changed)
- There's already a `TextBlockEdit` component used for draft editing that can be adapted
- The storage layer uses Dexie (IndexedDB) with a simple schema
- The state management uses Zustand in `appStore.ts`
- Currently blocks have a header with icon, title, and timestamp

**User Value:**
Users often make mistakes when capturing content or want to update information. Allowing inline editing of individual text and URL blocks improves usability without cluttering the UI for non-editable block types.

**Scope:**

- Add an edit button/icon to editable blocks (text and URL only)
- Edit button should appear in the block header or near the content
- Clicking edit enters inline edit mode
- Non-editable blocks (image, file) should not show edit button
- Changes should persist to the database
- Cancel functionality to discard changes
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Editable blocks (text, URL) display an edit button in their header
- [x] #2 Clicking edit button enters inline edit mode
- [x] #3 Text blocks show a textarea for editing
- [x] #4 URL blocks show an input field for editing
- [x] #5 Ctrl+Enter saves the changes and exits edit mode
- [x] #6 Escape cancels the edit and restores original content
- [x] #7 Edited content is persisted to IndexedDB
- [x] #8 Non-editable blocks (image, file) do not show edit button
- [x] #9 Edit button follows existing design system patterns
- [x] #10 Changes are reflected immediately in the feed without refresh
- [x] #11 Edit mode is accessible via keyboard
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Successfully implemented editing of text and URL blocks via edit button.

## Changes Made

### Phase 1: State Management

- Added `updateItem` action to `src/store/appStore.ts`
- Supports updating any item field via Dexie `db.items.update()`
- Updates Zustand state after successful database update

### Phase 2: UI Components

- Created `EditButton` component in `src/components/Block/BlockActionMenu/EditButton.tsx`
  - Uses Pencil icon from @phosphor-icons/react
  - Follows DeleteButton design patterns (w-8 h-8, hover:text-accent, focus ring)
  - Prevents event propagation

- Created `UrlBlockEdit` component in `src/components/UrlBlock/UrlBlockEdit.tsx`
  - Single-line input for URL editing
  - Ctrl+Enter to save, Escape to cancel
  - Auto-focus with cursor at end

- Modified `Block.tsx` to support inline editing:
  - Added `isEditing` local state
  - Conditionally renders TextBlockEdit or UrlBlockEdit based on block type
  - Edit button only shown for editable block types (text, URL)

### Phase 3: Storybook Stories

- Created `EditButton.stories.tsx` with 4 stories
- Created `UrlBlockEdit.stories.tsx` with 5 stories

### Phase 4: Testing

- Created `EditButton.test.tsx` with 9 unit tests
- Created `UrlBlockEdit.test.tsx` with 7 unit tests
- Added 17 integration tests to `Block.test.tsx` covering all ACs

## Test Results

- All 758 tests pass
- TypeScript compilation successful
- Build completed without errors

## Acceptance Criteria

All 11 criteria are satisfied:

1. ✅ Edit button appears in header for text/URL blocks
2. ✅ Clicking edit enters inline edit mode
3. ✅ Text blocks show textarea for editing
4. ✅ URL blocks show input field for editing
5. ✅ Ctrl+Enter saves and exits edit mode
6. ✅ Escape cancels and restores original content
7. ✅ Changes persist to IndexedDB
8. ✅ Image/file blocks don't show edit button
9. ✅ Edit button follows design system patterns
10. ✅ Changes reflect immediately in feed
11. ✅ Edit mode accessible via keyboard
<!-- SECTION:FINAL_SUMMARY:END -->
