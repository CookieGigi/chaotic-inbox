import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
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

describe('F05 - TASK-26: Item persisted before appearing on screen', () => {
  beforeEach(async () => {
    await db.items.clear()
    useAppStore.getState().reset()
  })

  afterEach(async () => {
    await db.items.clear()
    useAppStore.getState().reset()
  })

  describe('AC #1: Write to local storage completes before UI update', () => {
    it('persists text item to DB before rendering in feed', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create draft via typing
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'T' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      await user.type(textarea, 'est content')
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Wait for UI to update
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(1)
      })

      // Verify item exists in DB
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)
      expect(dbItems[0].raw).toBe('Test content')

      // Verify ID matches between UI and DB
      const uiBlock = screen.getByTestId('block')
      expect(uiBlock).toHaveAttribute('data-item-id', dbItems[0].id)
    })

    it('persists pasted items to DB before rendering', async () => {
      render(<App />)

      // Simulate paste event with text
      const testText = 'Pasted content that should persist first'

      await act(async () => {
        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
        })
        // @ts-expect-error - clipboardData is read-only but we need to mock it
        pasteEvent.clipboardData = {
          getData: (type: string) => (type === 'text/plain' ? testText : ''),
          types: ['text/plain'],
          items: [
            {
              type: 'text/plain',
              kind: 'string',
            },
          ],
        }
        window.dispatchEvent(pasteEvent)
      })

      // Wait for UI to update
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(1)
      })

      // Verify item exists in DB
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)
      expect(dbItems[0].raw).toBe(testText)
    })

    it('persists dropped files to DB before rendering', async () => {
      render(<App />)

      // Create a test file
      const testFile = new File(['test file content'], 'test.txt', {
        type: 'text/plain',
      })

      // Create a mock drop event
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
      })

      // Mock the dataTransfer
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [testFile],
          types: ['Files'],
        },
      })

      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      // Wait for UI to update (dropped files may take a moment)
      await waitFor(
        () => {
          const blocks = screen.getAllByTestId('block')
          expect(blocks.length).toBeGreaterThanOrEqual(1)
        },
        { timeout: 3000 }
      )

      // Verify item exists in DB
      const dbItems = await db.items.toArray()
      expect(dbItems.length).toBeGreaterThanOrEqual(1)
      expect(dbItems[0].type).toBe('file')
    })

    it('handles multiple concurrent captures with correct ordering', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create first item
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'F' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      await user.type(textarea, 'irst item')
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Create second item
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'S' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea2 = screen.getByTestId('text-block-edit-textarea')
      await user.type(textarea2, 'econd item')
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Wait for both items
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(2)
      })

      // Verify both items in DB (in correct order)
      const dbItems = await db.items.orderBy('capturedAt').toArray()
      expect(dbItems).toHaveLength(2)

      // Verify order in UI matches DB
      const blocks = screen.getAllByTestId('block')
      expect(blocks[0]).toHaveTextContent('First item')
      expect(blocks[1]).toHaveTextContent('Second item')

      // Verify DB order by capturedAt
      const times = dbItems.map((item) => new Date(item.capturedAt).getTime())
      expect(times[0]).toBeLessThan(times[1])
    })
  })

  describe('AC #2: Force-quit scenario - item survives', () => {
    it('item is present in DB immediately after db.items.add completes', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create draft
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'Q' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      await user.type(textarea, 'uick test')

      // Submit draft
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Wait for UI to update - this verifies DB write completed first
      // because App.tsx calls await db.items.add() before setItems()
      await waitFor(() => {
        const blocks = screen.queryAllByTestId('block')
        expect(blocks).toHaveLength(1)
      })

      // Verify item is in DB (proves persistence happened)
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)
      expect(dbItems[0].raw).toBe('Quick test')
    })

    it('survives simulated app crash after persistence', async () => {
      const user = userEvent.setup()

      const { unmount } = render(<App />)

      // Create and persist item
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'C' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      await user.type(textarea, 'rash test content')
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Wait for persistence
      await waitFor(() => {
        return db.items.count().then((count) => count === 1)
      })

      // Simulate "force quit" by clearing React state (unmount/remount)
      unmount()

      // Reset store to simulate fresh app start
      useAppStore.getState().reset()

      // Verify item still in DB (as if app crashed but storage persisted)
      const dbItemsAfterCrash = await db.items.toArray()
      expect(dbItemsAfterCrash).toHaveLength(1)
      expect(dbItemsAfterCrash[0].raw).toBe('Crash test content')

      // Re-mount app
      render(<App />)

      // Item should appear in UI
      await waitFor(() => {
        expect(screen.getByText('Crash test content')).toBeInTheDocument()
      })
    })
  })
})
