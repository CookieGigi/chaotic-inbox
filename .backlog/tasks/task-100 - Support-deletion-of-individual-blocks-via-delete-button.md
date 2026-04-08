---
id: TASK-100
title: Support deletion of individual blocks via delete button
status: To Do
assignee: []
created_date: '2026-04-08 04:30'
updated_date: '2026-04-08 04:32'
labels:
  - feature
  - block-management
  - epic-3
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add a delete button to each block that allows users to remove individual blocks from the feed. Each block should have its own delete affordance.

**Context:**

- The app currently only supports adding items, not deleting them
- Items are stored in Dexie (IndexedDB) database
- The store is managed by Zustand in `appStore.ts`
- Each block has a header section with icon, title, and timestamp
- All block types (text, URL, image, file) should be deletable

**User Value:**
Users need the ability to remove individual items they no longer want in their feed. A per-block delete button provides this control without the risk of accidentally deleting everything.

**Scope:**

- Add a delete button to every block's header
- Clicking delete should show a confirmation (to prevent accidents)
- Deletion should remove the item from both the store state and the database
- The feed should update immediately to reflect the deletion
- Handle edge case of deleting the last item (show empty state)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Every block displays a delete button in its header
- [ ] #2 Clicking delete button shows a confirmation dialog
- [ ] #3 Confirming deletion removes the block immediately from the feed
- [ ] #4 Deleted item is removed from IndexedDB
- [ ] #5 Empty state prompt is shown after deleting the last block
- [ ] #6 Delete action is accessible via keyboard
- [ ] #7 Confirmation dialog is accessible (ARIA labels, focus management)
- [ ] #8 Undo is NOT required for MVP (can be added later)
- [ ] #9 Delete button follows existing design system patterns
<!-- AC:END -->
