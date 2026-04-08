---
id: TASK-100
title: Support deletion of all blocks
status: To Do
assignee: []
created_date: '2026-04-08 04:30'
labels:
  - feature
  - block-management
  - epic-3
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add functionality to delete all blocks/clear the entire feed. This provides users with a way to start fresh or clean up their workspace.

**Context:**

- The app currently only supports adding items, not deleting them
- Items are stored in Dexie (IndexedDB) database
- The store is managed by Zustand in `appStore.ts`
- There's a similar pattern in `toastStore.ts` with `clearAll` functionality

**User Value:**
Users may want to clear their entire feed to start fresh, especially after testing or when the feed becomes too cluttered. This is a common "reset" pattern.

**Scope:**

- Add a "Clear All" or "Delete All" action
- Should have a confirmation dialog to prevent accidental deletion
- Should clear all items from both the store state and the database
- Should handle the empty state gracefully (show the existing empty prompt)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 User can trigger a 'Clear All' action from the UI (e.g., button or menu)
- [ ] #2 A confirmation dialog appears before deletion proceeds
- [ ] #3 All items are removed from the feed immediately
- [ ] #4 All items are deleted from IndexedDB
- [ ] #5 The empty state prompt is shown after clearing
- [ ] #6 The action is accessible via keyboard
- [ ] #7 The confirmation dialog is accessible (ARIA labels, focus management)
- [ ] #8 Undo is NOT required for MVP (can be added later)
- [ ] #9 The action works even with a large number of items
<!-- AC:END -->
