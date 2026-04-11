---
id: doc-23
title: TASK-100 Implementation Plan - Block Deletion Feature
type: other
created_date: '2026-04-11 07:28'
---

# TASK-100 Implementation Plan: Block Deletion Feature

## Overview

Integrate the already-designed `DeleteButton` and `BlockActionMenu` components into the Block component, add the delete action to the store, and implement an accessible confirmation dialog.

## Files to Modify

### 1. `src/store/appStore.ts`

**Add `deleteItem` action:**

```typescript
// Add to AppActions interface
deleteItem: (id: string) => Promise<void>

// Add to useAppStore implementation
deleteItem: async (id: string) => {
  try {
    // Remove from IndexedDB
    await db.items.delete(id)

    // Update state
    set((state) => ({
      items: state.items.filter((item) => item.id.toString() !== id),
    }))
  } catch (error) {
    console.error('Failed to delete item:', error)
    showError('Failed to delete item. Please try again.')
  }
}

// Add to useItemActions hook
deleteItem: state.deleteItem
```

### 2. `src/components/Block/DeleteConfirmationDialog.tsx` (NEW)

**Accessible confirmation dialog following SettingsModal pattern:**

- Props: `isOpen`, `onConfirm`, `onCancel`, `itemTitle?`
- Focus trap with Cancel/Confirm buttons
- ARIA labels and role="dialog"
- Escape key to cancel
- Focus on Cancel button when opened
- Styling consistent with design system

### 3. `src/components/Block/Block.tsx`

**Integration changes:**

- Import `BlockActionMenu`, `DeleteButton`, `DeleteConfirmationDialog`
- Add local state: `isConfirmOpen`
- Wrap article with `relative group` for hover effect
- Insert `BlockActionMenu` with `DeleteButton` in header area
- Handle delete click: open confirmation dialog
- Handle confirm: call `deleteItem(item.id)`

### 4. `src/components/Block/Block.test.tsx`

**New test cases covering AC #1-9:**

- AC #1: Delete button renders in block header
- AC #2: Clicking delete shows confirmation dialog
- AC #3: Confirming removes block from feed
- AC #4: Item removed from IndexedDB (mock verify)
- AC #5: Empty state shown after deleting last block (integration)
- AC #6: Delete accessible via keyboard (Enter/Space)
- AC #7: Confirmation dialog accessible (ARIA, focus)
- AC #8: Skip (undo not required)
- AC #9: Design system compliance (colors, spacing)

### 5. `src/components/Block/DeleteConfirmationDialog.test.tsx` (NEW)

**Dialog-specific tests:**

- Renders when isOpen=true
- Calls onConfirm when confirm clicked
- Calls onCancel when cancel clicked
- Calls onCancel on Escape key
- Has correct ARIA attributes
- Focus management works correctly

## Implementation Order

1. **Write tests first** (Block.test.tsx additions)
2. **Create DeleteConfirmationDialog component**
3. **Create DeleteConfirmationDialog tests**
4. **Add deleteItem to appStore.ts**
5. **Update Block.tsx to integrate everything**
6. **Run all tests and verify**

## Design System Compliance

- Use existing color tokens: `text-text-faint`, `text-error`, `bg-surface-hover`
- Use existing spacing: consistent with other buttons
- Follow confirmation dialog pattern from SettingsModal
- Maintain keyboard accessibility standards

## Edge Cases to Handle

- Double-clicking delete button (debounce/loading state)
- Deleting while another operation in progress
- Network/DB failure during deletion
- Focus management after deletion

## Testing Strategy

- Unit tests for all new components
- Integration tests for delete flow
- Accessibility tests (keyboard navigation, ARIA)
- Visual regression via Storybook stories (already exists)
