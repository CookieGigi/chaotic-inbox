# Plan: Support Editing of Text and URL Blocks (TASK-99)

## Overview

Add an edit button to text and URL blocks that allows users to modify the content of individual blocks inline.

---

## Current State Analysis

### Existing Components to Leverage

- **`TextBlockEdit`** (`src/components/TextBlock/TextBlockEdit.tsx`): Already implemented with:
  - Textarea with auto-expanding height
  - Ctrl+Enter to submit, Escape to cancel
  - Auto-focus with cursor at end
  - Clean styling matching design system

- **`BlockActionMenu`** (`src/components/Block/BlockActionMenu/`): Currently only has `DeleteButton`, ready for `EditButton`

- **`DeleteButton`** (`src/components/Block/BlockActionMenu/DeleteButton.tsx`): Perfect reference pattern for new `EditButton`

### State Management

- **Zustand store** (`src/store/appStore.ts`): Missing `updateItem` action - needs to be added
- **Dexie** (`src/storage/local_db.ts`): `db.items.update(id, updates)` API available

### Block Architecture

- **`Block.tsx`**: Main wrapper with header (icon, title, timestamp) and content area
- **Type guards**: `isTextItem()`, `isUrlItem()` available in `src/models/metadata.ts`
- **Content renderers**: `TextBlock`, `UrlBlock` components already exist

---

## Implementation Plan

### Phase 1: State Management (1 file)

#### 1.1 Add `updateItem` action to appStore.ts

**File**: `src/store/appStore.ts`

```typescript
// Add to AppState interface
updateItem: (id: string, updates: Partial<RawItem>) => Promise<void>

// Add to store implementation
updateItem: async (id: string, updates: Partial<RawItem>) => {
  const { items } = get()
  const itemToUpdate = items.find((item) => item.id === id)
  if (!itemToUpdate) return

  try {
    // Update in Dexie
    await db.items.update(id, updates)

    // Update in Zustand state
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
  } catch (error) {
    console.error('Failed to update item:', error)
    showError('Failed to update block. Please try again.')
  }
}

// Add to useItemActions selector
export const useItemActions = () =>
  useAppStore((state) => ({
    loadItems: state.loadItems,
    addItems: state.addItems,
    deleteItem: state.deleteItem,
    undoDelete: state.undoDelete,
    updateItem: state.updateItem, // Add this
  }))
```

---

### Phase 2: UI Components (2 new files, 1 modified)

#### 2.1 Create EditButton Component

**File**: `src/components/Block/BlockActionMenu/EditButton.tsx` (NEW)

Follow `DeleteButton.tsx` pattern:

- Use `Pencil` icon from `@phosphor-icons/react`
- 16px icon size
- `w-8 h-8 rounded-lg` dimensions
- `hover:text-accent hover:bg-surface-hover` styling
- Focus ring for accessibility
- `event.stopPropagation()` to prevent block click

#### 2.2 Create UrlBlockEdit Component (Optional Reference)

**File**: `src/components/UrlBlock/UrlBlockEdit.tsx` (NEW)

Similar to `TextBlockEdit` but with input field:

- Single-line text input (not textarea)
- Same keyboard shortcuts (Ctrl+Enter, Escape)
- URL validation could be added but not required
- Auto-focus on mount

**Decision**: Could reuse `TextBlockEdit` for both types (simpler) OR create dedicated `UrlBlockEdit` (cleaner UX). **Recommendation**: Create dedicated component for semantic clarity.

#### 2.3 Update Block.tsx with Edit Mode

**File**: `src/components/Block/Block.tsx` (MODIFY)

Changes needed:

1. Add `isEditing` local state: `const [isEditing, setIsEditing] = useState(false)`
2. Add `updateItem` from store
3. Create `handleEdit` function to enter edit mode
4. Create `handleSave` function to persist changes and exit edit mode
5. Create `handleCancel` function to exit edit mode without saving
6. Conditionally render edit UI vs. content:
   - If `isEditing && isTextItem(item)`: show `TextBlockEdit`
   - If `isEditing && isUrlItem(item)`: show `UrlBlockEdit` (or input)
   - Otherwise: show `renderBlockContent(item)`
7. Add `EditButton` to `BlockActionMenu` (only for editable types)

```typescript
// Pseudocode for conditional rendering
<div data-testid="block-content">
  {isEditing && isTextItem(item) ? (
    <TextBlockEdit
      initialContent={item.raw as string}
      onChange={(content) => setEditContent(content)}
      onSubmit={handleSave}
      onCancel={handleCancel}
    />
  ) : isEditing && isUrlItem(item) ? (
    <UrlBlockEdit
      initialUrl={item.raw as string}
      onChange={(url) => setEditContent(url)}
      onSubmit={handleSave}
      onCancel={handleCancel}
    />
  ) : (
    renderBlockContent(item)
  )}
</div>
```

---

### Phase 3: Storybook Stories (2 files)

#### 3.1 EditButton Stories

**File**: `src/components/Block/BlockActionMenu/EditButton.stories.tsx` (NEW)

Stories to create:

- Default: Basic edit button
- With Custom Label: Different aria-label
- In Action Menu: Within BlockActionMenu context

#### 3.2 UrlBlockEdit Stories

**File**: `src/components/UrlBlock/UrlBlockEdit.stories.tsx` (NEW)

Stories to create:

- Default: Basic URL editing
- With Long URL: Long text handling
- In Block: Within a block context

### Phase 4: Testing (3 test files)

All 11 Acceptance Criteria must have test coverage:

#### 4.1 Unit Tests for EditButton

**File**: `src/components/Block/BlockActionMenu/EditButton.test.tsx` (NEW)

Test cases (covers AC #9, #11):

- Renders with correct accessibility attributes
- Calls onEdit when clicked
- Prevents event propagation
- Has focus ring for keyboard navigation
- Follows design system patterns (styling matches DeleteButton)

#### 4.2 Unit Tests for UrlBlockEdit

**File**: `src/components/UrlBlock/UrlBlockEdit.test.tsx` (NEW)

Test cases (covers AC #4, #5, #6, #11):

- Renders with initial URL
- Calls onChange when input changes
- Calls onSubmit on Ctrl+Enter
- Calls onCancel on Escape
- Auto-focuses on mount
- Keyboard accessible

#### 4.3 Integration Tests for Block Editing

**File**: `src/components/Block/Block.test.tsx` (MODIFY)

Test cases (covers all ACs):

- **AC #1**: Edit button appears in header for text and URL blocks
- **AC #2**: Clicking edit button enters inline edit mode
- **AC #3**: Text blocks show a textarea for editing
- **AC #4**: URL blocks show an input field for editing
- **AC #5**: Ctrl+Enter saves the changes and exits edit mode
- **AC #6**: Escape cancels the edit and restores original content
- **AC #7**: Edited content is persisted to IndexedDB (mock store action called)
- **AC #8**: Non-editable blocks (image, file) do not show edit button
- **AC #10**: Changes are reflected immediately in the feed without refresh
- **AC #11**: Edit mode is accessible via keyboard

---

## File Changes Summary

| File                                                          | Action | Lines           |
| ------------------------------------------------------------- | ------ | --------------- |
| `src/store/appStore.ts`                                       | Modify | ~30 lines added |
| `src/components/Block/BlockActionMenu/EditButton.tsx`         | Create | ~60 lines       |
| `src/components/UrlBlock/UrlBlockEdit.tsx`                    | Create | ~80 lines       |
| `src/components/Block/Block.tsx`                              | Modify | ~50 lines       |
| `src/components/Block/BlockActionMenu/EditButton.stories.tsx` | Create | ~40 lines       |
| `src/components/UrlBlock/UrlBlockEdit.stories.tsx`            | Create | ~40 lines       |
| `src/components/Block/BlockActionMenu/EditButton.test.tsx`    | Create | ~50 lines       |
| `src/components/UrlBlock/UrlBlockEdit.test.tsx`               | Create | ~60 lines       |
| `src/components/Block/Block.test.tsx`                         | Modify | ~100 lines      |

**Total**: ~510 lines across 9 files

---

## Acceptance Criteria Mapping

| AC                                 | Implementation                                             |
| ---------------------------------- | ---------------------------------------------------------- |
| #1 Edit button in header           | Add `EditButton` to `BlockActionMenu` in `Block.tsx`       |
| #2 Click enters edit mode          | `setIsEditing(true)` on EditButton click                   |
| #3 Text blocks use textarea        | `TextBlockEdit` component (already exists)                 |
| #4 URL blocks use input            | Create `UrlBlockEdit` or adapt `TextBlockEdit`             |
| #5 Ctrl+Enter saves                | Handled by edit components                                 |
| #6 Escape cancels                  | Handled by edit components                                 |
| #7 Persist to IndexedDB            | `updateItem` store action using `db.items.update()`        |
| #8 Non-editable blocks hide button | Conditional: `isEditable && <EditButton />`                |
| #9 Follow design patterns          | Match `DeleteButton` styling                               |
| #10 Immediate UI update            | Zustand state update in `updateItem`                       |
| #11 Keyboard accessible            | Focus rings, keyboard shortcuts already in edit components |

---

## Design Decisions

### 1. Edit Button Placement

**Decision**: Place in `BlockActionMenu` alongside DeleteButton.

**Rationale**:

- Consistent with existing UX pattern
- Non-intrusive (only visible on hover)
- Already sticky/scrolling behavior
- Natural grouping of block actions

### 2. Inline vs. Modal Editing

**Decision**: Inline editing within the block content area.

**Rationale**:

- Keeps context visible
- Follows existing `DraftBlock` pattern
- No additional overlays or complexity
- Immediate visual feedback

### 3. URL Block Edit Component

**Decision**: Create dedicated `UrlBlockEdit` component.

**Rationale**:

- Semantic clarity (URL ≠ text)
- Future-proof for URL validation
- Cleaner component API
- Consistent with separate block type architecture

### 4. Optimistic vs. Pessimistic Updates

**Decision**: Pessimistic (wait for Dexie success before updating UI).

**Rationale**:

- IndexedDB is local - fast enough
- Avoids rollback complexity
- Error handling is cleaner
- Consistent with `deleteItem` pattern

---

## Risk Assessment

| Risk                                   | Mitigation                                    |
| -------------------------------------- | --------------------------------------------- |
| Breaking existing delete functionality | Keep DeleteButton as-is, just add EditButton  |
| Focus management issues                | TextBlockEdit already handles auto-focus      |
| State synchronization bugs             | Use existing Zustand patterns from deleteItem |
| Keyboard navigation conflicts          | Test thoroughly, use stopPropagation          |

---

## Testing Strategy

1. **Unit tests** for new components (EditButton, UrlBlockEdit)
2. **Integration tests** in Block.test.tsx for full edit flow
3. **Manual testing** checklist:
   - [ ] Edit text block, save with Ctrl+Enter
   - [ ] Edit text block, cancel with Escape
   - [ ] Edit URL block, verify input field
   - [ ] Verify image/file blocks have NO edit button
   - [ ] Tab through edit button with keyboard
   - [ ] Screen reader announces edit button correctly

---

## Open Questions (Resolved)

1. **Visual indication during edit mode?** → Use same styling as `TextBlockEdit` (clean, minimal, no extra borders)
2. **URL format validation?** → Not required for v1. User can enter any text, browser will handle on click
3. **Loading state during save?** → Same as `TextBlockEdit` - no loading state. IndexedDB is local and fast enough

---

## Implementation Order

1. ✅ Add `updateItem` to store (foundation)
2. ✅ Create `EditButton` component (UI building block)
3. ✅ Create `UrlBlockEdit` component
4. ✅ Modify `Block.tsx` with edit mode (integration)
5. ✅ Create Storybook stories (documentation)
6. ✅ Write unit and integration tests (quality assurance)
7. ✅ Manual testing (validation)

**Estimated effort**: 2-3 hours for implementation + 1 hour for testing and stories
