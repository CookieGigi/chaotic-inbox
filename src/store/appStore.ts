import { create } from 'zustand'
import { db } from '@/storage/local_db'
import type { RawItem } from '@/models/rawItem'
import { createTextItem } from '@/models/itemFactories'
import { showError } from '@/store/toastStore'

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
}

/**
 * App actions interface
 */
interface AppActions {
  // Item actions
  loadItems: () => Promise<void>
  addItems: (items: RawItem[]) => Promise<void>

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
    set({ isLoading: true })
    try {
      const allItems = await db.items.orderBy('capturedAt').toArray()
      set({ items: allItems, isLoading: false })
    } catch (error) {
      console.error('Failed to load items:', error)
      showError('Failed to load items. Please refresh the page to try again.')
      set({ isLoading: false })
    }
  },

  /**
   * Add items to state and persist to database
   */
  addItems: async (newItems: RawItem[]) => {
    if (newItems.length === 0) return

    try {
      // Persist to database
      for (const item of newItems) {
        await db.items.add(item)
      }

      // Update state
      set((state) => ({
        items: [...state.items, ...newItems],
      }))
    } catch (error) {
      console.error('Failed to add items:', error)
      showError('Failed to save items. Please try again.')
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
  }))

export const useDragActions = () =>
  useAppStore((state) => ({
    setIsDragging: state.setIsDragging,
  }))
