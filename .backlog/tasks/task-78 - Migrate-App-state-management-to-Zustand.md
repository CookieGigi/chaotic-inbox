---
id: TASK-78
title: Migrate App state management to Zustand
status: To Do
assignee: []
created_date: '2026-03-31 19:06'
labels:
  - refactor
  - state-management
  - zustand
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

- [ ] #1 Create Zustand store with all app state and actions
- [ ] #2 Migrate items state and CRUD operations to store
- [ ] #3 Migrate draft management (create, update, submit, cancel) to store
- [ ] #4 Migrate paste handling (both to draft and new items) to store
- [ ] #5 Migrate drop handling to store
- [ ] #6 Refactor App.tsx to use store selectors instead of local state
- [ ] #7 Ensure local_db persistence still works correctly
- [ ] #8 All existing functionality remains working (typing, paste, drop, submit, cancel)
- [ ] #9 Remove unused useState and useCallback hooks from App.tsx
<!-- AC:END -->
