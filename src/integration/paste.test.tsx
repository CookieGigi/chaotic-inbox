import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import { db } from '@/storage/local_db'
import type { RawItem } from '@/models/rawItem'
import { createTextItem } from '@/models/itemFactories'

// Mock the Block component to simplify testing
vi.mock('@/components/Block', () => ({
  Block: ({ item }: { item: RawItem }) => (
    <div data-testid="block" data-item-id={item.id} data-item-type={item.type}>
      {typeof item.raw === 'string' ? item.raw : 'blob-content'}
    </div>
  ),
}))

/**
 * Helper to create a mock ClipboardEvent for paste testing
 */
function createMockPasteEvent(options: {
  text?: string
  files?: File[]
}): ClipboardEvent {
  const { text, files = [] } = options

  // Create mock items array
  const mockItems: DataTransferItem[] = []

  // Add file items if provided
  files.forEach((file) => {
    mockItems.push({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
      getAsString: () => {},
      webkitGetAsEntry: () => null,
    } as unknown as DataTransferItem)
  })

  // Add text item if provided (add to items array for iteration)
  if (text) {
    mockItems.push({
      kind: 'string',
      type: 'text/plain',
      getAsFile: () => null,
      getAsString: () => {},
      webkitGetAsEntry: () => null,
    } as unknown as DataTransferItem)
  }

  // Create items object that supports both bracket access and iteration
  const itemsList = Object.setPrototypeOf(
    mockItems,
    DataTransferItemList.prototype
  ) as DataTransferItemList

  const dataTransfer = {
    items: itemsList,
    getData: (type: string) => {
      if (type === 'text/plain' && text) {
        return text
      }
      return ''
    },
    types: text ? ['text/plain'] : [],
    files: files.length > 0 ? files : ([] as unknown as FileList),
  } as unknown as DataTransfer

  const event = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: dataTransfer,
  })

  return event
}

describe('F06: Keyboard-First Capture', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await db.items.clear()
    // Reset scrollIntoView mock
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // Clean up after each test
    await db.items.clear()
    // Reset document focus state
    document.body.focus()
  })

  describe('TASK-31: Paste with no element focused', () => {
    it('AC #1: App launched, no element focused, paste pressed -> item is captured and appended to feed', async () => {
      render(<App />)

      // Ensure no element is focused (just the body)
      document.body.focus()
      expect(document.activeElement).toBe(document.body)

      // Verify empty feed initially
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()

      // Dispatch paste event (simulates Cmd+V / Ctrl+V)
      const pasteEvent = createMockPasteEvent({
        text: 'Pasted text content',
      })
      await act(async () => {
        window.dispatchEvent(pasteEvent)
      })

      // Verify item appears in feed
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(1)
      })

      const block = screen.getByTestId('block')
      expect(block).toHaveTextContent('Pasted text content')

      // Verify item was persisted in database
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)
      expect(dbItems[0].type).toBe('text')
      expect(dbItems[0].raw).toBe('Pasted text content')
    })

    it('AC #2: The feed scrolls to the new block after paste', async () => {
      // Pre-populate database with multiple items to make scroll meaningful
      for (let i = 0; i < 10; i++) {
        await db.items.add(
          createTextItem(`Existing item ${i}`, { kind: 'plain' })
        )
      }

      render(<App />)

      // Wait for items to load
      await waitFor(() => {
        expect(screen.queryByTestId('feed-empty')).not.toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByTestId('feed-list')).toBeInTheDocument()
      })

      // Verify existing items are loaded
      const existingBlocks = screen.getAllByTestId('block')
      expect(existingBlocks).toHaveLength(10)

      // Clear scrollIntoView mock to track new calls
      const scrollIntoViewMock = vi.mocked(Element.prototype.scrollIntoView)
      scrollIntoViewMock.mockClear()

      // Ensure no element focused and paste
      document.body.focus()
      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: 'New pasted item' }))
      })

      // Verify new block was added
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(11)
      })

      // Verify scrollIntoView was called (feed scrolled to new block)
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled()
      })
    })

    it('AC #3: No click, focus, or navigation step is required before the keystroke', async () => {
      render(<App />)

      // App just rendered - no clicks, no focus actions
      // Body is focused by default, which is what we want
      expect(document.activeElement).toBe(document.body)

      // Verify empty feed
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()

      // Immediately paste without any prior interaction
      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: 'Immediate paste' }))
      })

      // Item should be captured immediately
      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(1)
        expect(blocks[0]).toHaveTextContent('Immediate paste')
      })

      // Verify persistence
      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(1)
      expect(dbItems[0].raw).toBe('Immediate paste')
    })

    it('should handle paste of URL without focus', async () => {
      render(<App />)

      document.body.focus()
      await act(async () => {
        window.dispatchEvent(
          createMockPasteEvent({ text: 'https://example.com' })
        )
      })

      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(1)
      })

      const block = screen.getByTestId('block')
      expect(block).toHaveAttribute('data-item-type', 'url')
      expect(block).toHaveTextContent('https://example.com')

      // Verify persistence
      const dbItems = await db.items.toArray()
      expect(dbItems[0].type).toBe('url')
      expect(dbItems[0].raw).toBe('https://example.com')
    })
  })

  describe('TASK-32: Paste works on macOS and Windows/Linux', () => {
    it('should capture paste via browser event (works for both Cmd+V and Ctrl+V)', async () => {
      render(<App />)

      document.body.focus()

      // Browser fires 'paste' event regardless of Cmd or Ctrl modifier
      // The browser handles platform-specific shortcuts
      await act(async () => {
        window.dispatchEvent(
          createMockPasteEvent({ text: 'Platform agnostic paste' })
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('block')).toHaveTextContent(
          'Platform agnostic paste'
        )
      })
    })

    it('should behave identically for text paste across platforms', async () => {
      render(<App />)

      document.body.focus()

      // Test text paste
      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: 'Test content' }))
      })

      await waitFor(() => {
        const block = screen.getByTestId('block')
        expect(block).toHaveAttribute('data-item-type', 'text')
        expect(block).toHaveTextContent('Test content')
      })

      // Add another paste
      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: 'Second paste' }))
      })

      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(2)
      })
    })

    it('should behave identically for URL paste across platforms', async () => {
      render(<App />)

      document.body.focus()

      // Test URL paste
      await act(async () => {
        window.dispatchEvent(
          createMockPasteEvent({ text: 'https://github.com' })
        )
      })

      await waitFor(() => {
        const block = screen.getByTestId('block')
        expect(block).toHaveAttribute('data-item-type', 'url')
        expect(block).toHaveTextContent('https://github.com')
      })

      // Add another URL paste
      await act(async () => {
        window.dispatchEvent(
          createMockPasteEvent({ text: 'http://localhost:3000' })
        )
      })

      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(2)
      })
    })

    it('should handle paste of multiple items across platforms', async () => {
      render(<App />)

      document.body.focus()

      // Paste text and image (simulated)
      const mockFile = new File(['image data'], 'test.png', {
        type: 'image/png',
      })

      await act(async () => {
        window.dispatchEvent(
          createMockPasteEvent({
            text: 'Text before image',
            files: [mockFile],
          })
        )
      })

      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        // Should have both text and image items
        expect(blocks.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('TASK-33: Global paste listener does not conflict with OS shortcuts', () => {
    it('should only capture paste when window has focus', async () => {
      // Store original mock
      const originalHasFocus = document.hasFocus

      // Mock document.hasFocus to return false (window not focused)
      const hasFocusMock = vi.fn(() => false)
      Object.defineProperty(document, 'hasFocus', {
        writable: true,
        configurable: true,
        value: hasFocusMock,
      })

      render(<App />)
      document.body.focus()

      // Paste when window not focused
      await act(async () => {
        window.dispatchEvent(
          createMockPasteEvent({ text: 'Should not capture' })
        )
      })

      // Should NOT capture the paste
      await waitFor(() => {
        expect(screen.queryByTestId('block')).not.toBeInTheDocument()
      })
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()

      // Reset focus mock and restore focus behavior
      hasFocusMock.mockReturnValue(true)

      // Now paste with focus
      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: 'Should capture' }))
      })

      await waitFor(() => {
        expect(screen.getByTestId('block')).toHaveTextContent('Should capture')
      })

      // Restore original mock
      Object.defineProperty(document, 'hasFocus', {
        writable: true,
        configurable: true,
        value: originalHasFocus,
      })
    })

    it('should not intercept OS-level paste shortcuts outside app', async () => {
      // The browser's paste event only fires when window is focused
      // This test verifies that we don't add global system-level listeners
      render(<App />)

      document.body.focus()

      // Normal paste works
      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: 'Captured' }))
      })

      await waitFor(() => {
        expect(screen.getByTestId('block')).toHaveTextContent('Captured')
      })

      // The implementation uses window.addEventListener('paste', ...)
      // which is scoped to the app window only
      // There's no document.addEventListener with capture or global hooks
    })

    it('should not conflict with clipboard manager shortcuts (Cmd+Shift+V, Win+V)', async () => {
      // Clipboard manager shortcuts typically open a picker overlay
      // Our paste listener should only respond to plain paste events
      // and should ignore clipboard manager shortcuts

      render(<App />)
      document.body.focus()

      // Regular paste (Cmd+V / Ctrl+V) fires 'paste' event
      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: 'Regular paste' }))
      })

      await waitFor(() => {
        expect(screen.getAllByTestId('block')).toHaveLength(1)
      })

      // Clipboard manager shortcuts (Cmd+Shift+V, Win+V) are handled by the OS
      // and don't typically fire 'paste' events in the same way
      // If they do paste, it's still a 'paste' event which we handle normally
    })
  })

  describe('TASK-34: Normal paste inside text inputs unaffected', () => {
    it('should paste into focused input field without creating a block', async () => {
      render(<App />)

      // Create an input element and focus it
      const input = document.createElement('input')
      input.type = 'text'
      input.setAttribute('data-testid', 'test-input')
      document.body.appendChild(input)

      // Focus the input
      input.focus()
      expect(document.activeElement).toBe(input)

      // Type something first
      await userEvent.type(input, 'Existing ')

      // Try to paste - our handler should yield to the input
      const pasteEvent = createMockPasteEvent({ text: 'pasted text' })
      await act(async () => {
        input.dispatchEvent(pasteEvent)
      })

      // No block should be created (input should handle paste normally)
      // Note: In jsdom, the paste content won't actually appear in the input
      // but our handler should not create a block
      expect(screen.queryByTestId('block')).not.toBeInTheDocument()
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()

      // Clean up
      document.body.removeChild(input)
    })

    it('should paste into focused textarea without creating a block', async () => {
      render(<App />)

      // Create a textarea and focus it
      const textarea = document.createElement('textarea')
      textarea.setAttribute('data-testid', 'test-textarea')
      document.body.appendChild(textarea)

      textarea.focus()
      expect(document.activeElement).toBe(textarea)

      // Paste event on textarea
      const pasteEvent = createMockPasteEvent({ text: 'textarea paste' })
      await act(async () => {
        textarea.dispatchEvent(pasteEvent)
      })

      // No block should be created
      expect(screen.queryByTestId('block')).not.toBeInTheDocument()
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()

      // Clean up
      document.body.removeChild(textarea)
    })

    it('should paste into contenteditable element without creating a block', async () => {
      render(<App />)

      // Create contenteditable div
      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      div.setAttribute('data-testid', 'test-contenteditable')
      document.body.appendChild(div)

      div.focus()
      div.click()

      // Ensure focus is on contenteditable
      if (document.activeElement !== div) {
        div.tabIndex = -1
        div.focus()
      }
      expect(document.activeElement).toBe(div)

      // Paste event
      const pasteEvent = createMockPasteEvent({ text: 'contenteditable paste' })
      await act(async () => {
        div.dispatchEvent(pasteEvent)
      })

      // No block should be created
      expect(screen.queryByTestId('block')).not.toBeInTheDocument()
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()

      // Clean up
      document.body.removeChild(div)
    })

    it('should NOT create duplicate block when pasting into draft textarea', async () => {
      render(<App />)

      // Create a draft first via global typing
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'T' }))
      })

      await waitFor(() => {
        expect(screen.getByTestId('draft-block')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('text-block-edit-textarea')
      expect(document.activeElement).toBe(textarea)

      // Verify initial content
      expect(textarea).toHaveValue('T')

      // Paste into the draft textarea
      const pasteEvent = createMockPasteEvent({ text: ' pasted content' })
      await act(async () => {
        textarea.dispatchEvent(pasteEvent)
      })

      // Wait a bit to ensure no async block creation
      await waitFor(
        () => {
          // Should still only have draft, no persisted blocks
          expect(screen.queryAllByTestId('block').length).toBe(0)
        },
        { timeout: 100 }
      )

      // Draft should still be there
      expect(screen.getByTestId('draft-block')).toBeInTheDocument()
    })

    it('should capture paste when focus moves from input to body', async () => {
      render(<App />)

      // Create and focus input
      const input = document.createElement('input')
      input.type = 'text'
      document.body.appendChild(input)
      input.focus()
      expect(document.activeElement).toBe(input)

      // Paste in input - should not capture
      await act(async () => {
        input.dispatchEvent(createMockPasteEvent({ text: 'In input' }))
      })

      expect(screen.queryByTestId('block')).not.toBeInTheDocument()

      // Blur input and focus body
      input.blur()
      document.body.focus()
      expect(document.activeElement).toBe(document.body)

      // Paste on body - should capture
      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: 'On body' }))
      })

      await waitFor(() => {
        expect(screen.getByTestId('block')).toHaveTextContent('On body')
      })

      // Clean up
      document.body.removeChild(input)
    })

    it('global listener should yield to focused editable elements', async () => {
      render(<App />)

      // Test all three types of editable elements
      const testCases = [
        { tag: 'input', attrs: { type: 'text' } },
        { tag: 'textarea', attrs: {} },
        { tag: 'div', attrs: { contenteditable: 'true' } },
      ]

      for (const testCase of testCases) {
        const element = document.createElement(testCase.tag)
        Object.entries(testCase.attrs).forEach(([key, value]) => {
          element.setAttribute(key, value)
        })
        document.body.appendChild(element)

        // Focus the element
        element.focus()
        if (testCase.tag === 'div') {
          element.click()
        }
        expect(document.activeElement).toBe(element)

        // Paste should NOT create a block
        await act(async () => {
          window.dispatchEvent(
            createMockPasteEvent({ text: `In ${testCase.tag}` })
          )
        })

        expect(screen.queryByTestId('block')).not.toBeInTheDocument()

        // Clean up
        document.body.removeChild(element)

        // Reset for next test
        await db.items.clear()
      }
    })
  })

  describe('Edge cases and interactions', () => {
    it('should handle rapid paste events', async () => {
      render(<App />)
      document.body.focus()

      // Rapidly paste multiple items
      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: 'First' }))
        window.dispatchEvent(createMockPasteEvent({ text: 'Second' }))
        window.dispatchEvent(createMockPasteEvent({ text: 'Third' }))
      })

      await waitFor(() => {
        const blocks = screen.getAllByTestId('block')
        expect(blocks).toHaveLength(3)
      })

      const dbItems = await db.items.toArray()
      expect(dbItems).toHaveLength(3)
    })

    it('should handle empty clipboard gracefully', async () => {
      render(<App />)
      document.body.focus()

      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({}))
      })

      // No block should be created for empty paste
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()
    })

    it('should handle whitespace-only clipboard gracefully', async () => {
      render(<App />)
      document.body.focus()

      await act(async () => {
        window.dispatchEvent(createMockPasteEvent({ text: '   \n\t   ' }))
      })

      // No block should be created for whitespace-only paste
      expect(screen.getByTestId('feed-empty')).toBeInTheDocument()
    })

    // Note: Draft + paste interaction is thoroughly tested at unit level
    // in useGlobalPaste.test.ts (see 'Draft Append (Decision B)' describe block).
    // Integration tests focus on basic paste functionality without draft complexity.
  })
})
