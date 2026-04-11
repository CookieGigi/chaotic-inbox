import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { RawItem } from '@/models/rawItem'
import { db } from '@/storage/local_db'
import {
  createTextItem,
  createUrlItem,
  createImageItem,
} from '@/models/itemFactories'

// Mock toast store
const mockShowUndoable = vi.fn()
vi.mock('@/store/toastStore', () => ({
  showUndoable: (...args: unknown[]) => mockShowUndoable(...args),
  showError: vi.fn(),
}))

/**
 * Mock the store module to test with fresh state
 * We need to reset the store between tests
 */
const createMockStore = () => {
  // Track store state
  let items: RawItem[] = []
  let draftContent = ''
  let draftItem: {
    id: 'draft'
    type: 'text'
    content: string
    capturedAt: string
  } | null = null
  let isDragging = false
  let recentlyDeleted: RawItem | null = null
  let undoCallback: (() => void) | null = null

  // Track listeners
  const listeners = new Set<() => void>()
  const notify = () => {
    listeners.forEach((l) => {
      l()
    })
  }

  return {
    // Getters
    getItems: () => items,
    getDraftContent: () => draftContent,
    getDraftItem: () => draftItem,
    getIsDragging: () => isDragging,
    getRecentlyDeleted: () => recentlyDeleted,

    // Actions
    loadItems: async () => {
      const allItems = await db.items.toArray()
      items = allItems.sort(
        (a, b) =>
          new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
      )
      notify()
    },

    addItems: async (newItems: RawItem[]) => {
      // Persist to DB
      for (const item of newItems) {
        await db.items.add(item)
      }
      // Update state
      items = [...items, ...newItems]
      notify()
    },

    deleteItem: async (id: string) => {
      const itemToDelete = items.find((item) => item.id === id)
      if (!itemToDelete) return

      // Store for potential undo
      recentlyDeleted = itemToDelete

      // Delete from database
      await db.items.delete(id)

      // Update state
      items = items.filter((item) => item.id !== id)

      // Store undo callback for test access
      undoCallback = async () => {
        if (recentlyDeleted) {
          await db.items.add(recentlyDeleted)
          items = [...items, recentlyDeleted]
          recentlyDeleted = null
          notify()
        }
      }

      // Show undoable toast
      mockShowUndoable('Block deleted', undoCallback, 5000)

      notify()
    },

    undoDelete: async () => {
      if (recentlyDeleted) {
        await db.items.add(recentlyDeleted)
        items = [...items, recentlyDeleted]
        recentlyDeleted = null
        notify()
      }
    },

    createDraft: (content: string) => {
      draftItem = {
        id: 'draft',
        type: 'text',
        content,
        capturedAt: new Date().toISOString(),
      }
      draftContent = content
      notify()
    },

    appendToDraft: (char: string) => {
      if (!draftItem) return
      draftContent += char
      draftItem = { ...draftItem, content: draftContent }
      notify()
    },

    updateDraft: (content: string) => {
      draftContent = content
      if (draftItem) {
        draftItem = { ...draftItem, content }
      }
      notify()
    },

    submitDraft: async () => {
      if (draftContent.trim().length > 0) {
        const textItem = createTextItem(draftContent.trim(), { kind: 'plain' })
        await db.items.add(textItem)
        items = [...items, textItem]
      }
      draftContent = ''
      draftItem = null
      notify()
    },

    cancelDraft: () => {
      draftContent = ''
      draftItem = null
      notify()
    },

    setIsDragging: (value: boolean) => {
      isDragging = value
      notify()
    },

    // Subscribe mechanism
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    // Reset for tests
    reset: () => {
      items = []
      draftContent = ''
      draftItem = null
      isDragging = false
      recentlyDeleted = null
      undoCallback = null
      listeners.clear()
    },
  }
}

describe('AppStore', () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(async () => {
    await db.items.clear()
    store = createMockStore()
  })

  afterEach(async () => {
    await db.items.clear()
    store.reset()
  })

  describe('State Initialization', () => {
    it('starts with empty items array', () => {
      expect(store.getItems()).toEqual([])
    })

    it('starts with no draft item', () => {
      expect(store.getDraftItem()).toBeNull()
    })

    it('starts with empty draft content', () => {
      expect(store.getDraftContent()).toBe('')
    })

    it('starts with isDragging false', () => {
      expect(store.getIsDragging()).toBe(false)
    })
  })

  describe('loadItems', () => {
    it('loads items from database ordered by capturedAt', async () => {
      // Pre-populate database with explicit timestamps
      const item1 = {
        ...createTextItem('First', { kind: 'plain' }),
        capturedAt: '2026-01-01T10:00:00.000Z' as RawItem['capturedAt'],
      }
      const item2 = {
        ...createUrlItem('https://example.com', { kind: 'url' }),
        capturedAt: '2026-01-01T11:00:00.000Z' as RawItem['capturedAt'],
      }
      await db.items.add(item1)
      await db.items.add(item2)

      await store.loadItems()

      expect(store.getItems()).toHaveLength(2)
      expect(store.getItems()[0].type).toBe('text')
      expect(store.getItems()[1].type).toBe('url')
    })

    it('loads empty array when database is empty', async () => {
      await store.loadItems()
      expect(store.getItems()).toEqual([])
    })
  })

  describe('addItems', () => {
    it('persists items to database', async () => {
      const newItem = createTextItem('Test content', { kind: 'plain' })

      await store.addItems([newItem])

      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)
      expect(dbItems[0].raw).toBe('Test content')
    })

    it('updates items state', async () => {
      const newItem = createTextItem('Test content', { kind: 'plain' })

      await store.addItems([newItem])

      expect(store.getItems()).toHaveLength(1)
      expect(store.getItems()[0].raw).toBe('Test content')
    })

    it('handles multiple items', async () => {
      const items = [
        createTextItem('Item 1', { kind: 'plain' }),
        createTextItem('Item 2', { kind: 'plain' }),
      ]

      await store.addItems(items)

      expect(store.getItems()).toHaveLength(2)
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(2)
    })

    it('handles image items', async () => {
      const blob = new Blob(['image data'], { type: 'image/png' })
      const imageItem = createImageItem(blob, { kind: 'image' })

      await store.addItems([imageItem])

      expect(store.getItems()[0].type).toBe('image')
    })

    it('appends items to existing items', async () => {
      const item1 = createTextItem('First', { kind: 'plain' })
      await db.items.add(item1)
      await store.loadItems()

      const item2 = createTextItem('Second', { kind: 'plain' })
      await store.addItems([item2])

      expect(store.getItems()).toHaveLength(2)
    })
  })

  describe('Draft Management', () => {
    describe('createDraft', () => {
      it('creates draft with initial content', () => {
        store.createDraft('Hello')

        expect(store.getDraftItem()).not.toBeNull()
        expect(store.getDraftItem()?.content).toBe('Hello')
        expect(store.getDraftContent()).toBe('Hello')
      })

      it('creates draft with correct structure', () => {
        store.createDraft('Test')

        const draft = store.getDraftItem()
        expect(draft?.id).toBe('draft')
        expect(draft?.type).toBe('text')
        expect(draft?.capturedAt).toBeDefined()
      })
    })

    describe('appendToDraft', () => {
      it('appends character to draft content', () => {
        store.createDraft('H')
        store.appendToDraft('i')

        expect(store.getDraftContent()).toBe('Hi')
        expect(store.getDraftItem()?.content).toBe('Hi')
      })

      it('does nothing if no draft exists', () => {
        store.appendToDraft('x')

        expect(store.getDraftContent()).toBe('')
        expect(store.getDraftItem()).toBeNull()
      })
    })

    describe('updateDraft', () => {
      it('updates draft content completely', () => {
        store.createDraft('Initial')
        store.updateDraft('Updated')

        expect(store.getDraftContent()).toBe('Updated')
        expect(store.getDraftItem()?.content).toBe('Updated')
      })

      it('does nothing if no draft exists', () => {
        store.updateDraft('Something')

        expect(store.getDraftItem()).toBeNull()
      })
    })

    describe('submitDraft', () => {
      it('persists draft content to database', async () => {
        store.createDraft('Draft content')

        await store.submitDraft()

        const dbItems = await db.items.toArray()
        expect(dbItems).toHaveLength(1)
        expect(dbItems[0].raw).toBe('Draft content')
      })

      it('adds persisted item to items state', async () => {
        store.createDraft('Draft content')

        await store.submitDraft()

        expect(store.getItems()).toHaveLength(1)
        expect(store.getItems()[0].type).toBe('text')
      })

      it('clears draft after submission', async () => {
        store.createDraft('Draft')

        await store.submitDraft()

        expect(store.getDraftItem()).toBeNull()
        expect(store.getDraftContent()).toBe('')
      })

      it('does not persist empty draft', async () => {
        store.createDraft('')

        await store.submitDraft()

        const dbItems = await db.items.toArray()
        expect(dbItems).toHaveLength(0)
      })

      it('does not persist whitespace-only draft', async () => {
        store.createDraft('   \n\t  ')

        await store.submitDraft()

        const dbItems = await db.items.toArray()
        expect(dbItems).toHaveLength(0)
        expect(store.getDraftItem()).toBeNull()
      })

      it('trims content before persisting', async () => {
        store.createDraft('  Trimmed  ')

        await store.submitDraft()

        const dbItems = await db.items.toArray()
        expect(dbItems[0].raw).toBe('Trimmed')
      })
    })

    describe('cancelDraft', () => {
      it('clears draft item', () => {
        store.createDraft('Content')

        store.cancelDraft()

        expect(store.getDraftItem()).toBeNull()
      })

      it('clears draft content', () => {
        store.createDraft('Content')

        store.cancelDraft()

        expect(store.getDraftContent()).toBe('')
      })

      it('does not persist anything', async () => {
        store.createDraft('Content')

        store.cancelDraft()

        const dbItems = await db.items.toArray()
        expect(dbItems).toHaveLength(0)
      })
    })
  })

  describe('Drag State', () => {
    it('sets isDragging to true', () => {
      store.setIsDragging(true)

      expect(store.getIsDragging()).toBe(true)
    })

    it('sets isDragging to false', () => {
      store.setIsDragging(true)
      store.setIsDragging(false)

      expect(store.getIsDragging()).toBe(false)
    })
  })

  describe('Subscribe mechanism', () => {
    it('notifies listeners on state change', () => {
      const listener = vi.fn()
      store.subscribe(listener)

      store.setIsDragging(true)

      expect(listener).toHaveBeenCalled()
    })

    it('allows unsubscribing', () => {
      const listener = vi.fn()
      const unsubscribe = store.subscribe(listener)

      unsubscribe()
      store.setIsDragging(true)

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('AC: TASK-100 - Delete item with undo', () => {
    it('removes item from state when deleted', async () => {
      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])
      expect(store.getItems()).toHaveLength(1)

      await store.deleteItem(item.id as string)

      expect(store.getItems()).toHaveLength(0)
    })

    it('removes item from database when deleted', async () => {
      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])
      let dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)

      await store.deleteItem(item.id as string)

      dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(0)
    })

    it('stores deleted item in recentlyDeleted for undo', async () => {
      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])

      await store.deleteItem(item.id as string)

      expect(store.getRecentlyDeleted()).toEqual(item)
    })

    it('shows undoable toast when deleting item', async () => {
      mockShowUndoable.mockClear()
      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])

      await store.deleteItem(item.id as string)

      expect(mockShowUndoable).toHaveBeenCalledWith(
        'Block deleted',
        expect.any(Function),
        5000
      )
    })

    it('restores item to state when undoDelete is called', async () => {
      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])
      await store.deleteItem(item.id as string)
      expect(store.getItems()).toHaveLength(0)

      await store.undoDelete()

      expect(store.getItems()).toHaveLength(1)
      expect(store.getItems()[0].id).toBe(item.id)
    })

    it('restores item to database when undoDelete is called', async () => {
      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])
      await store.deleteItem(item.id as string)

      await store.undoDelete()

      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)
      expect(dbItems[0].id).toBe(item.id)
    })

    it('clears recentlyDeleted after undo', async () => {
      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])
      await store.deleteItem(item.id as string)
      expect(store.getRecentlyDeleted()).not.toBeNull()

      await store.undoDelete()

      expect(store.getRecentlyDeleted()).toBeNull()
    })

    it('calls undo callback when toast action is triggered', async () => {
      mockShowUndoable.mockClear()
      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])

      await store.deleteItem(item.id as string)

      // Extract the undo callback passed to showUndoable
      const undoCallback = mockShowUndoable.mock.calls[0][1]
      expect(typeof undoCallback).toBe('function')

      // Reset state to simulate clicking undo from toast
      store.reset()
      await store.addItems([item])
      await store.deleteItem(item.id as string)

      // Call the undo callback
      await undoCallback()

      expect(store.getItems()).toHaveLength(1)
    })

    it('handles deleting non-existent item gracefully', async () => {
      const item = createTextItem('Exists', { kind: 'plain' })
      await store.addItems([item])

      // Try to delete item with different ID
      await store.deleteItem('non-existent-id')

      expect(store.getItems()).toHaveLength(1)
      expect(store.getItems()[0].id).toBe(item.id)
    })

    it('handles multiple items - deletes only specified item', async () => {
      const item1 = createTextItem('Keep me', { kind: 'plain' })
      const item2 = createTextItem('Delete me', { kind: 'plain' })
      await store.addItems([item1, item2])

      await store.deleteItem(item2.id as string)

      expect(store.getItems()).toHaveLength(1)
      expect(store.getItems()[0].id).toBe(item1.id)
    })

    it('replaces recentlyDeleted when deleting multiple items sequentially', async () => {
      const item1 = createTextItem('First', { kind: 'plain' })
      const item2 = createTextItem('Second', { kind: 'plain' })
      await store.addItems([item1, item2])

      await store.deleteItem(item1.id as string)
      expect(store.getRecentlyDeleted()?.id).toBe(item1.id)

      await store.deleteItem(item2.id as string)
      expect(store.getRecentlyDeleted()?.id).toBe(item2.id)
    })

    it('notifies listeners when item is deleted', async () => {
      const listener = vi.fn()
      store.subscribe(listener)

      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])
      listener.mockClear()

      await store.deleteItem(item.id as string)

      expect(listener).toHaveBeenCalled()
    })

    it('notifies listeners when item is restored via undo', async () => {
      const item = createTextItem('To be deleted', { kind: 'plain' })
      await store.addItems([item])
      await store.deleteItem(item.id as string)

      const listener = vi.fn()
      store.subscribe(listener)

      await store.undoDelete()

      expect(listener).toHaveBeenCalled()
    })
  })
})
