import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { db } from '@/storage/local_db'
import type { RawItem } from '@/models/rawItem'

// Mock the Block component to simplify testing
vi.mock('@/components/Block', () => ({
  Block: ({ item }: { item: RawItem }) => (
    <div data-testid="block" data-item-id={item.id} data-item-type={item.type}>
      {typeof item.raw === 'string' ? item.raw : 'blob-content'}
    </div>
  ),
}))

describe('App - Global Typing Integration', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await db.items.clear()
  })

  afterEach(async () => {
    // Clean up after each test
    await db.items.clear()
  })

  describe('AC #1: Full flow from typing to persisted block', () => {
    it('user types character → draft appears → continues typing → Ctrl+Enter → draft persists as text block', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Initial state: no draft, empty feed
      expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()

      // User types 'a' - draft should appear
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      // Draft block should now be visible
      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      // Draft should have 'a' as initial content
      const textarea = screen.getByTestId('text-block-edit-textarea')
      expect(textarea).toHaveValue('a')

      // User continues typing more content
      await user.type(textarea, 'nd this is a longer message')

      // Content should be updated
      await waitFor(() => {
        expect(textarea).toHaveValue('and this is a longer message')
      })

      // User presses Ctrl+Enter to submit
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Draft should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()
      })

      // Feed should now show the new block
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(1)
        expect(blocks[0]).toHaveTextContent('and this is a longer message')
      })

      // Verify item was persisted in database
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)
      expect(dbItems[0].type).toBe('text')
      expect(dbItems[0].raw).toBe('and this is a longer message')
    })

    it('persists multi-line text correctly', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create draft
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'L' })
        window.dispatchEvent(event)
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')

      // Type multi-line content
      await user.type(textarea, 'ine 1')
      await user.keyboard('{Enter}')
      await user.type(textarea, 'Line 2')
      await user.keyboard('{Enter}')
      await user.type(textarea, 'Line 3')

      // Submit with Ctrl+Enter
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Verify persisted with newlines
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)
      expect(dbItems[0].raw).toBe('Line 1\nLine 2\nLine 3')
    })
  })

  describe('AC #2: Cancel flow removes draft without persistence', () => {
    it('user types character → draft appears → Escape → draft disappears and nothing persisted', async () => {
      const user = userEvent.setup()

      render(<App />)

      // User types 'x' - draft appears
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'x' })
        window.dispatchEvent(event)
      })

      // Draft should be visible
      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      await user.type(textarea, ' canceled content')

      // User presses Escape to cancel
      await user.keyboard('{Escape}')

      // Draft should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()
      })

      // Empty state should be shown
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()

      // Verify nothing was persisted in database
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(0)
    })

    it('cancel works even with content in draft', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create draft with content
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'H' })
        window.dispatchEvent(event)
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      await user.type(textarea, 'ello world this is some content')

      // Cancel
      await user.keyboard('{Escape}')

      // Draft gone, nothing persisted
      await waitFor(() => {
        expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()
      })

      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(0)
    })
  })

  describe('AC #3: Only one draft exists at a time', () => {
    it('typing with existing draft appends to it instead of creating new one', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create first draft via global typing
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'F' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      expect(textarea).toHaveValue('F')

      // Type directly in the focused textarea (normal editing, not global capture)
      await user.type(textarea, 'ir')

      // Content should be appended
      await waitFor(() => {
        expect(textarea).toHaveValue('Fir')
      })

      // Only one draft block should exist
      const draftBlocks = screen.queryAllByTestId('draft-block')
      expect(draftBlocks).toHaveLength(1)
    })

    it('cannot create multiple drafts by rapid typing', async () => {
      render(<App />)

      // Rapidly type multiple characters
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      // Only one draft should exist
      const draftBlocks = screen.queryAllByTestId('draft-block')
      expect(draftBlocks).toHaveLength(1)
    })
  })

  describe('AC #4: Typing in input does not trigger draft', () => {
    it('focused input field prevents global typing capture', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create an input element and focus it
      const input = document.createElement('input')
      input.type = 'text'
      input.setAttribute('data-testid', 'test-input')
      document.body.appendChild(input)
      input.focus()

      // Verify input is focused
      expect(document.activeElement).toBe(input)

      // Typing should NOT create draft
      await user.type(input, 'hello')

      // Draft should not exist
      expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()

      // Clean up
      document.body.removeChild(input)
    })

    it('focused textarea prevents global typing capture', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create a textarea and focus it
      const textarea = document.createElement('textarea')
      textarea.setAttribute('data-testid', 'test-textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      expect(document.activeElement).toBe(textarea)

      // Typing should NOT create draft
      await user.type(textarea, 'world')

      // Draft should not exist
      expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()

      // Clean up
      document.body.removeChild(textarea)
    })

    it('contenteditable element prevents global typing capture', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create contenteditable div - set contentEditable as string attribute
      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      div.setAttribute('data-testid', 'test-contenteditable')
      document.body.appendChild(div)

      // Focus the contenteditable element
      div.focus()
      div.click()

      // Force focus to ensure it's set
      if (document.activeElement !== div) {
        // Fallback: make it focusable and try again
        div.tabIndex = -1
        div.focus()
      }

      expect(document.activeElement).toBe(div)

      // Typing should NOT create draft
      await user.type(div, 'content')

      // Draft should not exist
      expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()

      // Clean up
      document.body.removeChild(div)
    })

    it('unfocusing input allows draft creation again', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create and focus input
      const input = document.createElement('input')
      input.type = 'text'
      document.body.appendChild(input)
      input.focus()

      await user.type(input, 'in input')
      expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()

      // Blur the input
      input.blur()
      document.body.focus()

      // Now typing should create draft
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'N' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      // Clean up
      document.body.removeChild(input)
    })
  })

  describe('AC #5: Draft appears at bottom of feed', () => {
    it('draft renders after existing items in the feed', async () => {
      // Pre-populate the database with some items
      const { createTextItem } = await import('@/models/itemFactories')
      const item1 = createTextItem('First item', { kind: 'plain' })
      const item2 = createTextItem('Second item', { kind: 'plain' })
      await db.items.add(item1)
      await db.items.add(item2)

      render(<App />)

      // Wait for items to load and empty state to disappear
      await waitFor(() => {
        expect(screen.queryByTestId('feed-empty')).not.toBeInTheDocument()
      })

      // Wait for feed list to appear (it only appears when items exist)
      await waitFor(() => {
        expect(screen.getByTestId('feed-list')).toBeInTheDocument()
      })

      // Verify items loaded
      const blocks = screen.getAllByTestId('block')
      expect(blocks).toHaveLength(2)

      // Create draft
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'D' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      // Get all elements in the feed list
      const feedList = screen.getByTestId('feed-list')
      const children = feedList.children

      // Should have 3 children: 2 blocks + 1 draft
      expect(children).toHaveLength(3)

      // Last child should be the draft (DraftBlock is rendered directly)
      expect(children[2]).toHaveAttribute('data-testid', 'draft-block')

      // First two should contain blocks (wrapped in divs by Feed)
      expect(
        children[0].querySelector('[data-testid="block"]')
      ).toBeInTheDocument()
      expect(
        children[1].querySelector('[data-testid="block"]')
      ).toBeInTheDocument()
    })

    it('new blocks appear before draft when submitted', async () => {
      const user = userEvent.setup()

      // Pre-populate with one item
      const { createTextItem } = await import('@/models/itemFactories')
      const existingItem = createTextItem('Existing item', { kind: 'plain' })
      await db.items.add(existingItem)

      render(<App />)

      // Wait for items to load
      await waitFor(() => {
        expect(screen.queryByTestId('feed-empty')).not.toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByTestId('feed-list')).toBeInTheDocument()
      })

      // Create draft via global typing
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'N' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      // Submit the draft
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Wait for submission and items to refresh
      await waitFor(() => {
        expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()
      })

      // Now we should have 2 blocks
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(2)
      })

      // Verify the feed list has 2 blocks
      const feedList = screen.getByTestId('feed-list')
      const children = feedList.children
      expect(children).toHaveLength(2)

      // Both should contain blocks (wrapped in divs by Feed)
      expect(
        children[0].querySelector('[data-testid="block"]')
      ).toBeInTheDocument()
      expect(
        children[1].querySelector('[data-testid="block"]')
      ).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('empty content on Ctrl+Enter does not persist', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create draft
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'T' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')

      // Clear the content
      await user.clear(textarea)

      // Submit empty draft
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Draft should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()
      })

      // Nothing should be persisted
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(0)
    })

    it('whitespace-only content on Ctrl+Enter does not persist', async () => {
      const user = userEvent.setup()

      render(<App />)

      // Create draft
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: ' ' })
        window.dispatchEvent(event)
      })

      // Note: space is not alphanumeric, so draft won't be created that way
      // Let's create via the actual flow
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')

      // Replace with whitespace
      await user.clear(textarea)
      await user.type(textarea, '   \n\t  ')

      // Submit
      await user.keyboard('{Control>}{Enter}{/Control}')

      // Nothing should be persisted (whitespace is trimmed)
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(0)
    })

    it('symbols do not trigger draft creation', async () => {
      render(<App />)

      const symbols = ['-', '=', '@', '#', '$', '%', '^', '&', '*', '(', ')']

      await act(async () => {
        symbols.forEach((symbol) => {
          const event = new KeyboardEvent('keydown', { key: symbol })
          window.dispatchEvent(event)
        })
      })

      // No draft should be created
      expect(screen.queryByTestId('draft-block')).not.toBeInTheDocument()
    })

    it('numbers trigger draft creation', async () => {
      render(<App />)

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: '5' })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      expect(textarea).toHaveValue('5')
    })
  })
})
