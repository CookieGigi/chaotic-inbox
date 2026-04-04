import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { db } from '@/storage/local_db'
import { useAppStore } from '@/store/appStore'
import type { RawItem } from '@/models/rawItem'

// Mock the Block component to simplify testing
vi.mock('@/components/Block', () => ({
  Block: ({ item }: { item: RawItem }) => (
    <div data-testid="block" data-item-id={item.id} data-item-type={item.type}>
      {typeof item.raw === 'string' ? item.raw : 'blob-content'}
    </div>
  ),
}))

describe('F05 - TASK-29: Items survive app restart', () => {
  beforeEach(async () => {
    await db.items.clear()
    useAppStore.getState().reset()
  })

  afterEach(async () => {
    await db.items.clear()
    useAppStore.getState().reset()
  })

  describe('AC #1: All items from previous sessions load on launch', () => {
    it('loads all persisted items when app mounts', async () => {
      // Pre-populate database with multiple items
      const { createTextItem, createUrlItem } =
        await import('@/models/itemFactories')
      const item1 = createTextItem('First item', { kind: 'plain' })
      const item2 = createUrlItem('https://example.com', { kind: 'url' })
      const item3 = createTextItem('Third item', { kind: 'plain' })

      await db.items.add(item1)
      await db.items.add(item2)
      await db.items.add(item3)

      // Render App (simulates app restart/launch)
      render(<App />)

      // Wait for items to load
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(3)
      })

      // Verify all content is present
      expect(screen.getByText('First item')).toBeInTheDocument()
      expect(screen.getByText('https://example.com')).toBeInTheDocument()
      expect(screen.getByText('Third item')).toBeInTheDocument()
    })

    it('shows empty state when no previous items exist', async () => {
      render(<App />)

      // Should show empty state immediately
      await waitFor(() => {
        expect(screen.getByTestId('feed-empty')).toBeInTheDocument()
      })

      // No blocks should exist
      expect(screen.queryAllByTestId('block')).toHaveLength(0)
    })

    it('handles large number of items on load (1000 items)', async () => {
      const { createTextItem } = await import('@/models/itemFactories')

      // Create 1000 items
      const items: RawItem[] = []
      for (let i = 0; i < 1000; i++) {
        const item = createTextItem(`Item ${i}`, { kind: 'plain' })
        items.push(item)
      }

      // Add all items to DB
      for (const item of items) {
        await db.items.add(item)
      }

      // Render App
      const startTime = performance.now()
      render(<App />)

      // Wait for items to load
      await waitFor(
        () => {
          const blocks = screen.getAllByTestId('block')
          expect(blocks).toHaveLength(1000)
        },
        { timeout: 10000 }
      )

      const endTime = performance.now()
      const loadTime = endTime - startTime

      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(5000)
    })
  })

  describe('AC #2: Items appear in capture-time order', () => {
    it('orders items by capturedAt timestamp ascending', async () => {
      const { createTextItem } = await import('@/models/itemFactories')

      // Create items with explicit timestamps
      const item1 = {
        ...createTextItem('Oldest', { kind: 'plain' }),
        capturedAt: '2026-01-01T10:00:00.000Z' as RawItem['capturedAt'],
      }
      const item2 = {
        ...createTextItem('Middle', { kind: 'plain' }),
        capturedAt: '2026-01-02T10:00:00.000Z' as RawItem['capturedAt'],
      }
      const item3 = {
        ...createTextItem('Newest', { kind: 'plain' }),
        capturedAt: '2026-01-03T10:00:00.000Z' as RawItem['capturedAt'],
      }

      // Add in reverse order to test sorting
      await db.items.add(item3)
      await db.items.add(item1)
      await db.items.add(item2)

      render(<App />)

      // Wait for items to load
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(3)
      })

      // Get feed list and verify order
      const feedList = screen.getByTestId('feed-list')
      const children = feedList.children

      // Items should appear in capturedAt order: Oldest, Middle, Newest
      expect(children[0]).toHaveTextContent('Oldest')
      expect(children[1]).toHaveTextContent('Middle')
      expect(children[2]).toHaveTextContent('Newest')
    })

    it('maintains order after app restart with mixed types', async () => {
      const { createTextItem, createUrlItem, createImageItem } =
        await import('@/models/itemFactories')

      // Create items with explicit timestamps
      const textItem = {
        ...createTextItem('Text content', { kind: 'plain' }),
        capturedAt: '2026-01-01T08:00:00.000Z' as RawItem['capturedAt'],
      }
      const urlItem = {
        ...createUrlItem('https://example.com', { kind: 'url' }),
        capturedAt: '2026-01-01T09:00:00.000Z' as RawItem['capturedAt'],
      }
      const imageItem = {
        ...createImageItem(new Blob(['image']), { kind: 'image' }),
        capturedAt: '2026-01-01T07:00:00.000Z' as RawItem['capturedAt'],
      }

      // Add in random order
      await db.items.add(urlItem)
      await db.items.add(imageItem)
      await db.items.add(textItem)

      render(<App />)

      // Wait for items to load
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(3)
      })

      // Verify order: Image (07:00), Text (08:00), URL (09:00)
      const blocks = screen.getAllByTestId('block')

      expect(blocks[0]).toHaveAttribute('data-item-type', 'image')
      expect(blocks[1]).toHaveAttribute('data-item-type', 'text')
      expect(blocks[2]).toHaveAttribute('data-item-type', 'url')
    })
  })

  describe('AC #3: No items missing or corrupted after close-reopen', () => {
    it('preserves all item data after simulated restart', async () => {
      const { createTextItem } = await import('@/models/itemFactories')

      const item = createTextItem('Original content with unicode: 世界 🌍', {
        kind: 'plain',
      })
      await db.items.add(item)

      // First render (first session)
      const { unmount } = render(<App />)

      await waitFor(() => {
        expect(
          screen.getByText('Original content with unicode: 世界 🌍')
        ).toBeInTheDocument()
      })

      // Unmount (simulate close)
      unmount()

      // Re-mount (simulate reopen)
      render(<App />)

      // Verify content is still there
      await waitFor(() => {
        expect(
          screen.getByText('Original content with unicode: 世界 🌍')
        ).toBeInTheDocument()
      })

      // Verify item ID and metadata preserved
      const blocks = screen.getAllByTestId('block')
      expect(blocks[0]).toHaveAttribute('data-item-id', item.id)
      expect(blocks[0]).toHaveAttribute('data-item-type', 'text')
    })

    it('newly captured items appear in correct order with existing items', async () => {
      const user = userEvent.setup()
      const { createTextItem } = await import('@/models/itemFactories')

      // Pre-populate with existing item
      const existingItem = {
        ...createTextItem('Existing item', { kind: 'plain' }),
        capturedAt: '2026-01-01T10:00:00.000Z' as RawItem['capturedAt'],
      }
      await db.items.add(existingItem)

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Existing item')).toBeInTheDocument()
      })

      // Create new item via typing
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'N' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      await user.type(textarea, 'ew item after restart')
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Wait for new item to appear
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(2)
      })

      // Verify both items present
      expect(screen.getByText('Existing item')).toBeInTheDocument()
      expect(screen.getByText('New item after restart')).toBeInTheDocument()

      // New item should be after existing item
      const feedList = screen.getByTestId('feed-list')
      const children = feedList.children
      expect(children[0]).toHaveTextContent('Existing item')
      expect(children[1]).toHaveTextContent('New item after restart')
    })
  })

  describe('Edge cases', () => {
    it('handles empty database gracefully', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('feed-empty')).toBeInTheDocument()
      })

      // Should not throw or crash
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })

    it('handles corrupted item gracefully', async () => {
      // Manually add an item with missing fields to simulate corruption
      await db.items.add({
        id: 'corrupted-id',
        type: 'text',
        capturedAt: new Date().toISOString(),
        raw: '',
        metadata: { kind: 'plain' },
      } as RawItem)

      // Should not crash
      render(<App />)

      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(1)
      })
    })
  })
})
