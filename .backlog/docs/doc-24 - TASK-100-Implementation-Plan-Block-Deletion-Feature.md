---
id: doc-24
title: TASK-100 Implementation Plan - Block Deletion Feature
type: other
created_date: '2026-04-11 07:32'
---

# TASK-100 Implementation Plan: Block Deletion Feature

## Current State

The UI components are already designed and ready:

- ✅ `BlockActionMenu` - Sticky action menu container
- ✅ `DeleteButton` - Destructive action button with trash icon
- ✅ `Toast` - Extended with undo action support
- ✅ `showUndoable` helper - For future undo functionality

## Remaining Work

### 1. Create `DeleteConfirmationDialog` Component

**File:** `src/components/Block/DeleteConfirmationDialog.tsx`

A modal dialog that asks users to confirm deletion before proceeding.

**Props Interface:**

```typescript
interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  itemTitle?: string // Optional context about what's being deleted
}
```

**Accessibility Requirements (AC #7):**

- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` pointing to dialog title
- Focus trap (Tab cycles between Cancel and Confirm buttons)
- Escape key closes dialog (calls onCancel)
- Focus starts on Cancel button when opened
- Visible focus rings on both buttons

**Styling:**

- Backdrop: semi-transparent dark overlay
- Dialog: centered, white background, rounded corners
- Title: "Delete Block?" in heading style
- Message: "This action cannot be undone."
- Cancel button: secondary style (outline)
- Confirm button: destructive style (red bg)

---

### 2. Add `deleteItem` Action to Store

**File:** `src/store/appStore.ts`

**Add to AppActions interface:**

```typescript
deleteItem: (id: string) => Promise<void>
```

**Implementation:**

```typescript
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
```

**Add to useItemActions hook:**

```typescript
export const useItemActions = () =>
  useAppStore((state) => ({
    loadItems: state.loadItems,
    addItems: state.addItems,
    deleteItem: state.deleteItem, // Add this
  }))
```

---

### 3. Integrate Delete Flow into Block Component

**File:** `src/components/Block/Block.tsx`

**Changes needed:**

1. **Import new components:**

```typescript
import { BlockActionMenu } from './BlockActionMenu'
import { DeleteButton } from './BlockActionMenu/DeleteButton'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { useItemActions } from '@/store/appStore'
```

2. **Add local state:**

```typescript
const [isConfirmOpen, setIsConfirmOpen] = useState(false)
```

3. **Get delete action:**

```typescript
const { deleteItem } = useItemActions()
```

4. **Wrap article with group class for hover:**

```typescript
<article className="bg-transparent py-3 px-4 border-b border-border hover:border-border-subtle group relative">
```

5. **Add BlockActionMenu with DeleteButton in header:**

```typescript
<header className="flex items-baseline justify-between mb-2" data-testid="block-header">
  <div className="flex items-center gap-2 min-w-0 flex-1">
    <BlockIcon item={item} />
    <BlockTitle title={item.title} />
  </div>

  {/* Timestamp and Action Menu */}
  <div className="flex items-center gap-2">
    <Timestamp value={item.capturedAt} />
    <BlockActionMenu>
      <DeleteButton
        onDelete={() => setIsConfirmOpen(true)}
        ariaLabel={`Delete ${item.title || item.type} block`}
        testId="delete-button"
      />
    </BlockActionMenu>
  </div>
</header>
```

6. **Add confirmation dialog:**

```typescript
<DeleteConfirmationDialog
  isOpen={isConfirmOpen}
  onConfirm={() => {
    deleteItem(item.id.toString())
    setIsConfirmOpen(false)
  }}
  onCancel={() => setIsConfirmOpen(false)}
  itemTitle={item.title}
/>
```

---

### 4. Test Coverage

#### Block.test.tsx Additions

**AC #1: Delete button renders in block header**

```typescript
it('renders delete button in block header', () => {
  const item = createTextItem()
  render(<Block item={item} />)

  expect(screen.getByTestId('delete-button')).toBeInTheDocument()
})

it('renders delete button for all block types', () => {
  const types = [
    createTextItem(),
    createUrlItem(),
    createImageItem(),
    createFileItem()
  ]

  types.forEach(item => {
    const { unmount } = render(<Block item={item} />)
    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
    unmount()
  })
})
```

**AC #2: Clicking delete shows confirmation dialog**

```typescript
it('opens confirmation dialog when delete button is clicked', async () => {
  const item = createTextItem()
  render(<Block item={item} />)

  await userEvent.click(screen.getByTestId('delete-button'))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText('Delete Block?')).toBeInTheDocument()
})
```

**AC #6: Delete accessible via keyboard**

```typescript
it('delete button is keyboard accessible', async () => {
  const item = createTextItem()
  render(<Block item={item} />)

  const deleteButton = screen.getByTestId('delete-button')
  deleteButton.focus()

  await userEvent.keyboard('{Enter}')
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

it('delete button has correct ARIA attributes', () => {
  const item = createTextItem({ title: 'Test Item' })
  render(<Block item={item} />)

  const deleteButton = screen.getByTestId('delete-button')
  expect(deleteButton).toHaveAttribute('aria-label', 'Delete Test Item block')
  expect(deleteButton).toHaveAttribute('type', 'button')
})
```

#### DeleteConfirmationDialog.test.tsx (New File)

**AC #7: Confirmation dialog accessibility**

```typescript
describe('DeleteConfirmationDialog', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    itemTitle: 'Test Block'
  }

  it('renders when isOpen is true', () => {
    render(<DeleteConfirmationDialog {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<DeleteConfirmationDialog {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('has correct ARIA attributes', () => {
    render(<DeleteConfirmationDialog {...defaultProps} />)
    const dialog = screen.getByRole('dialog')

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

    await userEvent.click(screen.getByTestId('confirm-delete-button'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn()
    render(<DeleteConfirmationDialog {...defaultProps} onCancel={onCancel} />)

    await userEvent.click(screen.getByTestId('cancel-delete-button'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Escape key pressed', async () => {
    const onCancel = vi.fn()
    render(<DeleteConfirmationDialog {...defaultProps} onCancel={onCancel} />)

    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('focuses cancel button when opened', () => {
    render(<DeleteConfirmationDialog {...defaultProps} />)
    expect(screen.getByTestId('cancel-delete-button')).toHaveFocus()
  })

  it('implements focus trap (Tab cycles between buttons)', async () => {
    render(<DeleteConfirmationDialog {...defaultProps} />)

    const cancelButton = screen.getByTestId('cancel-delete-button')
    const confirmButton = screen.getByTestId('confirm-delete-button')

    // Start on cancel
    expect(cancelButton).toHaveFocus()

    // Tab to confirm
    await userEvent.tab()
    expect(confirmButton).toHaveFocus()

    // Tab cycles back to cancel
    await userEvent.tab()
    expect(cancelButton).toHaveFocus()
  })
})
```

**Integration Tests (AC #3, #4, #5):**

```typescript
describe('Delete flow integration', () => {
  // These would be in a separate integration test file
  // or use MSW/mock Dexie for unit testing

  it('removes block from feed after confirmation', async () => {
    // Test with Feed component and mocked store
  })

  it('removes item from IndexedDB after confirmation', async () => {
    // Mock db.items.delete and verify it's called
  })

  it('shows empty state after deleting last block', async () => {
    // Integration test with Feed component
  })
})
```

---

### 5. Design System Compliance (AC #9)

**Color tokens to use:**

- Delete button: `text-text-faint` → `text-error` on hover
- Delete button bg: transparent → `bg-surface-hover` on hover
- Confirm button: `bg-error` or `bg-error/90`
- Cancel button: `border-border` with `text-text`
- Dialog backdrop: `bg-black/50` or similar

**Spacing:**

- Consistent with existing buttons (32x32px touch target)
- Dialog padding: consistent with SettingsModal
- BlockActionMenu positioning: already designed

**Typography:**

- Dialog title: same as other modal titles
- Dialog message: `text-text-muted` or `text-text`
- Button text: consistent with other buttons

---

## Implementation Order

1. **Create DeleteConfirmationDialog component** with full accessibility
2. **Write DeleteConfirmationDialog.test.tsx** (AC #7 tests)
3. **Add deleteItem to appStore.ts** with error handling
4. **Update Block.tsx** to integrate everything
5. **Add tests to Block.test.tsx** (AC #1, #2, #6, #9)
6. **Run all tests** and ensure 100% pass rate
7. **Manual verification** of keyboard navigation and screen reader

---

## Edge Cases to Handle

1. **Double-clicking delete** - Disable buttons during deletion
2. **Deleting while other operations pending** - Queue or show loading state
3. **DB failure** - Already handled in deleteItem with error toast
4. **Focus management after deletion** - Browser/Feed handles naturally
5. **Very long item titles** - Truncate or handle gracefully in dialog

---

## Estimated Effort

- DeleteConfirmationDialog: 30 min
- Dialog tests: 20 min
- Store integration: 10 min
- Block.tsx integration: 15 min
- Block tests: 20 min
- **Total: ~1.5 hours**
