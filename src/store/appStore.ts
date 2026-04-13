import { create } from 'zustand'
import { db } from '@/storage/local_db'
import type { RawItem } from '@/models/rawItem'
import { createTextItem } from '@/models/itemFactories'
import { showError, showUndoable } from '@/store/toastStore'
import i18n from '@/i18n/config'
import { markStart, markEnd, PerformanceMarkers } from '@/utils/performance'

/**
 * Threshold for triggering immediate quota check (1MB in bytes)
 */
const LARGE_FILE_THRESHOLD = 1_000_000

/**
 * Check if an item exceeds the large file threshold
 */
function isLargeFile(item: RawItem): boolean {
  if (item.type === 'image' || item.type === 'file') {
    const blob = item.raw as Blob
    return blob.size > LARGE_FILE_THRESHOLD
  }
  return false
}

/**
 * Draft item type for in-progress text capture
 * Temporary ID, not persisted until submitted
 */
export interface DraftTextItem {
  id: 'draft'
  type: 'text'
  content: string
  capturedAt: string
}

/**
 * App state interface
 */
interface AppState {
  // State
  items: RawItem[]
  draftItem: DraftTextItem | null
  draftContent: string
  isDragging: boolean
  isLoading: boolean
  recentlyDeleted: RawItem | null
}

/**
 * App actions interface
 */
interface AppActions {
  // Item actions
  loadItems: () => Promise<void>
  addItems: (items: RawItem[]) => Promise<void>
  updateItem: (id: string, updates: Partial<RawItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  undoDelete: () => Promise<void>

  // Draft actions
  createDraft: (content: string) => void
  appendToDraft: (char: string) => void
  updateDraft: (content: string) => void
  submitDraft: () => Promise<void>
  cancelDraft: () => void

  // Drag state
  setIsDragging: (value: boolean) => void

  // Reset (for testing)
  reset: () => void
}

/**
 * Combined store interface
 */
type AppStore = AppState & AppActions

/**
 * Initial state factory
 */
export const createInitialState = (): AppState => ({
  items: [],
  draftItem: null,
  draftContent: '',
  isDragging: false,
  isLoading: false,
  recentlyDeleted: null,
})

/**
 * Zustand store for app state management
 *
 * Features:
 * - Centralized state for items, draft, and UI state
 * - Actions for all state mutations
 * - Automatic persistence to local_db
 */
export const useAppStore = create<AppStore>((set, get) => ({
  ...createInitialState(),

  /**
   * Load items from database on app mount
   */
  loadItems: async () => {
    markStart(PerformanceMarkers.STORE_LOAD_ITEMS)
    set({ isLoading: true })
    try {
      const allItems = await db.items.orderBy('capturedAt').toArray()
      set({ items: allItems, isLoading: false })
    } catch (error) {
      console.error('Failed to load items:', error)
      showError('Failed to load items. Please refresh the page to try again.')
      set({ isLoading: false })
    } finally {
      markEnd(PerformanceMarkers.STORE_LOAD_ITEMS)
    }
  },

  /**
   * Add items to state and persist to database
   */
  addItems: async (newItems: RawItem[]) => {
    if (newItems.length === 0) return

    markStart(PerformanceMarkers.STORE_ADD_ITEMS)
    try {
      // Persist to database
      markStart(PerformanceMarkers.DB_ADD)
      for (const item of newItems) {
        await db.items.add(item)
      }
      markEnd(PerformanceMarkers.DB_ADD)

      // Update state
      set((state) => ({
        items: [...state.items, ...newItems],
      }))

      // Trigger quota check if any item is large (>1MB)
      const hasLargeFile = newItems.some(isLargeFile)
      if (hasLargeFile) {
        // Dispatch custom event for quota monitor to pick up
        window.dispatchEvent(new CustomEvent('quotacheck:trigger'))
      }
    } catch (error) {
      console.error('Failed to add items:', error)
      showError('Failed to save items. Please try again.')
    } finally {
      markEnd(PerformanceMarkers.STORE_ADD_ITEMS)
    }
  },

  /**
   * Update an item in state and database
   */
  updateItem: async (id: string, updates: Partial<RawItem>) => {
    const { items } = get()
    const itemToUpdate = items.find((item) => item.id === id)

    if (!itemToUpdate) return

    markStart(PerformanceMarkers.STORE_UPDATE_ITEM)
    try {
      // Update in database
      markStart(PerformanceMarkers.DB_UPDATE)
      await db.items.update(id, updates)
      markEnd(PerformanceMarkers.DB_UPDATE)

      // Update in state
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? ({ ...item, ...updates } as RawItem) : item
        ),
      }))
    } catch (error) {
      console.error('Failed to update item:', error)
      showError('Failed to update block. Please try again.')
    } finally {
      markEnd(PerformanceMarkers.STORE_UPDATE_ITEM)
    }
  },

  /**
   * Delete an item from state and database with undo support
   */
  deleteItem: async (id: string) => {
    const { items } = get()
    const itemToDelete = items.find((item) => item.id === id)

    if (!itemToDelete) return

    markStart(PerformanceMarkers.STORE_DELETE_ITEM)
    try {
      // Store for potential undo
      set({ recentlyDeleted: itemToDelete })

      // Delete from database
      markStart(PerformanceMarkers.DB_DELETE)
      await db.items.delete(id)
      markEnd(PerformanceMarkers.DB_DELETE)

      // Update state
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }))

      // Show undoable toast
      showUndoable(i18n.t('toast.blockDeleted'), () => {
        get().undoDelete()
      })
    } catch (error) {
      console.error('Failed to delete item:', error)
      showError('Failed to delete block. Please try again.')
    } finally {
      markEnd(PerformanceMarkers.STORE_DELETE_ITEM)
    }
  },

  /**
   * Undo the last delete operation
   */
  undoDelete: async () => {
    const { recentlyDeleted } = get()

    if (!recentlyDeleted) return

    markStart(PerformanceMarkers.STORE_DELETE_ITEM)
    try {
      // Re-add to database
      await db.items.add(recentlyDeleted)

      // Update state
      set((state) => ({
        items: [...state.items, recentlyDeleted],
        recentlyDeleted: null,
      }))
    } catch (error) {
      console.error('Failed to undo delete:', error)
      showError('Failed to restore block. Please try again.')
    } finally {
      markEnd(PerformanceMarkers.STORE_DELETE_ITEM)
    }
  },

  /**
   * Create a new draft with initial content
   */
  createDraft: (content: string) => {
    const newDraft: DraftTextItem = {
      id: 'draft',
      type: 'text',
      content,
      capturedAt: new Date().toISOString(),
    }
    set({
      draftItem: newDraft,
      draftContent: content,
    })
  },

  /**
   * Append character to existing draft
   */
  appendToDraft: (char: string) => {
    const { draftItem } = get()
    if (!draftItem) return

    const newContent = draftItem.content + char
    set({
      draftContent: newContent,
      draftItem: { ...draftItem, content: newContent },
    })
  },

  /**
   * Update draft content completely
   */
  updateDraft: (content: string) => {
    const { draftItem } = get()
    if (!draftItem) return

    set({
      draftContent: content,
      draftItem: { ...draftItem, content },
    })
  },

  /**
   * Submit draft - persist to database and clear draft
   */
  submitDraft: async () => {
    const { draftContent, items } = get()

    // Don't persist empty or whitespace-only content
    if (draftContent.trim().length === 0) {
      set({
        draftItem: null,
        draftContent: '',
      })
      return
    }

    markStart(PerformanceMarkers.DRAFT_SUBMIT)
    try {
      // Create text item and persist
      const textItem = createTextItem(draftContent.trim(), { kind: 'plain' })
      await db.items.add(textItem)

      // Update state
      set({
        items: [...items, textItem],
        draftItem: null,
        draftContent: '',
      })
    } catch (error) {
      console.error('Failed to submit draft:', error)
      showError(
        'Failed to save draft. Your content is preserved - please try again.'
      )
      // Note: draftItem and draftContent are preserved so user can retry
    } finally {
      markEnd(PerformanceMarkers.DRAFT_SUBMIT)
    }
  },

  /**
   * Cancel draft - clear without persisting
   */
  cancelDraft: () => {
    set({
      draftItem: null,
      draftContent: '',
    })
  },

  /**
   * Set drag overlay state
   */
  setIsDragging: (value: boolean) => {
    set({ isDragging: value })
  },

  /**
   * Reset store to initial state (for testing)
   */
  reset: () => {
    set(createInitialState())
  },
}))

/**
 * Selector hooks for common state slices
 * These provide better performance by only subscribing to specific state
 */
export const useItems = () => useAppStore((state) => state.items)
export const useDraftItem = () => useAppStore((state) => state.draftItem)
export const useDraftContent = () => useAppStore((state) => state.draftContent)
export const useIsDragging = () => useAppStore((state) => state.isDragging)
export const useIsLoading = () => useAppStore((state) => state.isLoading)

/**
 * Action hooks for common operations
 */
export const useDraftActions = () =>
  useAppStore((state) => ({
    createDraft: state.createDraft,
    appendToDraft: state.appendToDraft,
    updateDraft: state.updateDraft,
    submitDraft: state.submitDraft,
    cancelDraft: state.cancelDraft,
  }))

export const useItemActions = () =>
  useAppStore((state) => ({
    loadItems: state.loadItems,
    addItems: state.addItems,
    updateItem: state.updateItem,
    deleteItem: state.deleteItem,
    undoDelete: state.undoDelete,
  }))

export const useDragActions = () =>
  useAppStore((state) => ({
    setIsDragging: state.setIsDragging,
  }))
