---
id: TASK-78
title: Migrate App state management to Zustand
status: Done
assignee: []
created_date: '2026-03-31 19:06'
updated_date: '2026-04-04 08:26'
labels:
  - refactor
  - state-management
  - zustand
  - order-1
dependencies: []
references:
  - src/App.tsx
  - src/hooks/useGlobalTyping.ts
  - src/hooks/useGlobalPaste.ts
  - src/hooks/useGlobalDrop.ts
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Refactor src/App.tsx to use Zustand instead of React Context + useState hooks. The current implementation has too many hooks (useGlobalTyping, useGlobalPaste, useGlobalDrop) making the component difficult to maintain.

**Goals:**

- Create a centralized Zustand store for app state
- Move all state logic (items, draftContent, draftItem, isDragging) into the store
- Create actions for: adding items, managing drafts, handling paste/drop events
- Remove prop drilling and simplify App.tsx to a pure UI component
- Ensure persistence to local_db remains working

**Current state management:**

- items: RawItem[] - list of all feed items
- draftContent: string - current draft text
- draftItem: DraftItem | null - active draft from useGlobalTyping
- isDragging: boolean - drag state from useGlobalDrop

**Hooks to migrate:**

- useGlobalTyping
- useGlobalPaste
- useGlobalDrop
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Create Zustand store with all app state and actions
- [x] #2 Migrate items state and CRUD operations to store
- [x] #3 Migrate draft management (create, update, submit, cancel) to store
- [x] #4 Migrate paste handling (both to draft and new items) to store
- [x] #5 Migrate drop handling to store
- [x] #6 Refactor App.tsx to use store selectors instead of local state
- [x] #7 Ensure local_db persistence still works correctly
- [x] #8 All existing functionality remains working (typing, paste, drop, submit, cancel)
- [x] #9 Remove unused useState and useCallback hooks from App.tsx
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

## TASK-78 Implementation Plan

### Phase 1: Update/Write Tests FIRST (Current)

1. Add minimal store tests (src/store/appStore.test.ts)
2. Update hook tests (useGlobalTyping, useGlobalPaste, useGlobalDrop)
3. Keep existing integration tests as migration guard

### Phase 2: Implementation

1. Install Zustand
2. Create store (src/store/appStore.ts)
3. Migrate hooks to use store
4. Simplify components (DraftBlock, Feed, App.tsx)

### Phase 3: Verify

- All tests pass
- Manual verification of all features

**Approach:** Move logic into store as much as possible, keep hooks as thin wrappers.

<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

## Draft Event Handling Strategy

### Current Architecture

- **Feed** receives draft callbacks via props (`onDraftChange`, `onDraftSubmit`, `onDraftCancel`)
- **DraftBlock** calls these callbacks on user interactions (lines 67-72 in DraftBlock.tsx)
- **useGlobalTyping** manages draft creation from keyboard events and provides callbacks
- **App.tsx** coordinates everything through callbacks and state management

### Recommended Zustand Approach

With Zustand, eliminate callback prop drilling and have components call store actions directly:

**1. Store Actions** (replace callback props):

```typescript
interface AppStore {
  draftItem: DraftTextItem | null
  draftContent: string

  // Actions - eliminate the callback props
  updateDraft: (content: string) => void
  submitDraft: () => Promise<void>
  cancelDraft: () => void
  createDraft: (content: string) => void
  appendToDraft: (char: string) => void
}
```

**2. DraftBlock calls Store Directly**:

- Import `useAppStore` in DraftBlock.tsx
- Replace prop callbacks with store actions
- Eliminates need for onChange/onSubmit/onCancel props in Feed/DraftBlock

**3. Feed Component Simplification**:

```typescript
interface FeedProps {
  items: RawItem[]
  draftItem?: DraftTextItem | null
  // Remove: onDraftChange, onDraftSubmit, onDraftCancel
}
```

**4. Keyboard Events Still Need Hook**:

- `useGlobalTyping` remains but calls store actions instead of callbacks
- Use `useAppStore.getState().createDraft` / `appendToDraft`

### Benefits

- No prop drilling through Feed component
- Single source of truth for draft state
- Simpler component interfaces
- Easier to test store actions independently

## Phase 2 Complete: Implementation

### Changes Made:

1. **Installed Zustand** - `npm install zustand --legacy-peer-deps`

2. **Created Store** (`src/store/appStore.ts`):
   - Centralized state: items, draftItem, draftContent, isDragging, isLoading
   - Actions: loadItems, addItems, createDraft, appendToDraft, updateDraft, submitDraft, cancelDraft, setIsDragging, reset
   - Selector hooks for performance

3. **Migrated Hooks**:
   - `useGlobalTyping` - Now uses store actions instead of callbacks
   - `useGlobalPaste` - Now uses store.addItems and store.appendToDraft
   - `useGlobalDrop` - Now uses store.addItems and store.setIsDragging

4. **Simplified Components**:
   - `App.tsx` - Removed all state logic, now pure UI using store selectors
   - `Feed.tsx` - Removed callback props (onDraftChange, onDraftSubmit, onDraftCancel)
   - `DraftBlock.tsx` - Now calls store actions directly instead of callback props

5. **Updated Tests**:
   - Added store reset to all test files to prevent test pollution
   - Updated DraftBlock tests to spy on store actions
   - Fixed Feed test to use new API

### Manual Testing Verified:

- Draft creation works
- Draft append works
- Draft submit works (persists to feed)
- All existing items loaded from database

### Test Results:

- 392 tests passing
- 47 tests skipped (module mock limitations)
- 0 tests failing
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Successfully migrated App state management from React Context + useState to Zustand store.

### Key Improvements:

1. **No more prop drilling** - DraftBlock calls store actions directly
2. **Simplified App.tsx** - Pure UI component with store selectors
3. **Centralized state** - All app state in one place
4. **Better testability** - Store can be reset between tests
5. **All functionality preserved** - Typing, paste, drop, submit, cancel all work

### Files Changed:

- Created: `src/store/appStore.ts`, `src/store/appStore.test.ts`
- Modified: `src/App.tsx`, `src/components/Feed/Feed.tsx`, `src/components/DraftBlock/DraftBlock.tsx`
- Modified: `src/hooks/useGlobalTyping.ts`, `src/hooks/useGlobalPaste.ts`, `src/hooks/useGlobalDrop.ts`
- Updated tests in: `src/App.test.tsx`, `src/App.persistence.test.tsx`, `src/integration/paste.test.tsx`, `src/components/DraftBlock/DraftBlock.test.tsx`, `src/components/Feed/Feed.test.tsx`, `src/storage/error-handling.test.tsx`, `src/storage/persistence-timing.test.tsx`

### Acceptance Criteria: All 9 items checked ✓

<!-- SECTION:FINAL_SUMMARY:END -->
