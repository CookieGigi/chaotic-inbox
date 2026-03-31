import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGlobalPaste } from './useGlobalPaste'
import type { RawItem } from '@/models/rawItem'

describe('useGlobalPaste', () => {
  const mockOnPasteToDraft = vi.fn()
  const mockOnPasteItems = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    document.body.className = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Helper to create a mock ClipboardEvent
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

  describe('Text Paste (TASK-1)', () => {
    it('should create text item when plain text is pasted', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'Hello world',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items).toHaveLength(1)
      expect(items[0].type).toBe('text')
      expect(items[0].raw).toBe('Hello world')
      expect(items[0].metadata).toEqual({ kind: 'plain' })
    })

    it('should trim whitespace from pasted text', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: '  Padded text  ',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items[0].raw).toBe('Padded text')
    })
  })

  describe('URL Paste (TASK-2)', () => {
    it('should create URL item when https URL is pasted', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'https://example.com',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items).toHaveLength(1)
      expect(items[0].type).toBe('url')
      expect(items[0].raw).toBe('https://example.com')
      expect(items[0].title).toBe('example.com')
    })

    it('should create URL item when http URL is pasted', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'http://example.com/path',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('url')
      expect(items[0].raw).toBe('http://example.com/path')
    })

    it('should extract hostname as title for URL items', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'https://www.example.com/path/to/page',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items[0].title).toBe('www.example.com')
    })
  })

  describe('Image Paste (TASK-3)', () => {
    it('should create image item when image is pasted', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const mockFile = new File(['image data'], 'test.png', {
        type: 'image/png',
      })

      const pasteEvent = createMockPasteEvent({
        files: [mockFile],
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items).toHaveLength(1)
      expect(items[0].type).toBe('image')
      expect(items[0].raw).toBeInstanceOf(File)
    })

    it('should handle multiple image types', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const mockFile = new File(['image data'], 'test.jpg', {
        type: 'image/jpeg',
      })

      const pasteEvent = createMockPasteEvent({
        files: [mockFile],
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
    })
  })

  describe('Multiple Items', () => {
    it('should handle multiple images in single paste', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const mockFile1 = new File(['image data 1'], 'test1.png', {
        type: 'image/png',
      })
      const mockFile2 = new File(['image data 2'], 'test2.png', {
        type: 'image/png',
      })

      const pasteEvent = createMockPasteEvent({
        files: [mockFile1, mockFile2],
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items).toHaveLength(2)
      expect(items[0].type).toBe('image')
      expect(items[1].type).toBe('image')
    })
  })

  describe('Draft Append (Decision B)', () => {
    it('should append text to draft when draft is active', () => {
      renderHook(() =>
        useGlobalPaste({
          hasDraft: true,
          onPasteToDraft: mockOnPasteToDraft,
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'appended text',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteToDraft).toHaveBeenCalledTimes(1)
      expect(mockOnPasteToDraft).toHaveBeenCalledWith('appended text')
      expect(mockOnPasteItems).not.toHaveBeenCalled()
    })

    it('should NOT append to draft when image is also pasted', () => {
      renderHook(() =>
        useGlobalPaste({
          hasDraft: true,
          onPasteToDraft: mockOnPasteToDraft,
          onPasteItems: mockOnPasteItems,
        })
      )

      const mockFile = new File(['image data'], 'test.png', {
        type: 'image/png',
      })

      const pasteEvent = createMockPasteEvent({
        text: 'some text',
        files: [mockFile],
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)
      expect(mockOnPasteToDraft).not.toHaveBeenCalled()
      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items.length).toBeGreaterThanOrEqual(1)
    })

    it('should create new item when no draft is active', () => {
      renderHook(() =>
        useGlobalPaste({
          hasDraft: false,
          onPasteToDraft: mockOnPasteToDraft,
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'new text',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)
      expect(mockOnPasteToDraft).not.toHaveBeenCalled()
    })
  })

  describe('Input Focus Detection (TASK-4)', () => {
    it('should NOT capture paste when input is focused', () => {
      // Create and focus an input element
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'should not be captured',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should NOT capture paste when textarea is focused', () => {
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'should not be captured',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('should NOT capture paste when contenteditable is focused', () => {
      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      document.body.appendChild(div)
      div.focus()

      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'should not be captured',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).not.toHaveBeenCalled()

      document.body.removeChild(div)
    })

    it('should capture paste when no input is focused', () => {
      // Ensure nothing is focused
      document.body.focus()

      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'should be captured',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)
    })
  })

  describe('Empty/Unsupported Clipboard (TASK-5)', () => {
    it('should silently ignore empty clipboard', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({})
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).not.toHaveBeenCalled()
    })

    it('should silently ignore whitespace-only clipboard', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: '   \n\t   ',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).not.toHaveBeenCalled()
    })

    it('should silently ignore unsupported types', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      // Create mock event with only unsupported type (no text)
      const pasteEvent = createMockPasteEvent({})
      // Manually add an unsupported type
      Object.defineProperty(pasteEvent.clipboardData, 'items', {
        value: {
          length: 1,
          [Symbol.iterator]: function* () {
            yield {
              type: 'application/pdf',
              getAsFile: () => null,
            } as DataTransferItem
          },
        } as DataTransferItemList,
      })

      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should not capture paste when disabled', () => {
      renderHook(() =>
        useGlobalPaste({
          disabled: true,
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'should not be captured',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).not.toHaveBeenCalled()
    })
  })

  describe('Drag Overlay', () => {
    it('should not capture paste when drag overlay is active', () => {
      document.body.classList.add('drag-overlay-active')

      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'should not be captured',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).not.toHaveBeenCalled()

      document.body.classList.remove('drag-overlay-active')
    })
  })

  describe('TASK-19: Text with embedded URL renders as text block', () => {
    it('should create text item when URL appears within a sentence', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'for NixOS — https://nixos.wiki/ is a great resource',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items).toHaveLength(1)
      expect(items[0].type).toBe('text')
      expect(items[0].metadata).toEqual({ kind: 'plain' })
    })

    it('should treat text with URL in middle as text type, not URL type', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'Check out https://example.com for more info',
      })
      window.dispatchEvent(pasteEvent)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('text')
    })

    it('should only create URL item when entire string is a URL', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      // This should be URL
      const urlEvent = createMockPasteEvent({
        text: 'https://example.com',
      })
      window.dispatchEvent(urlEvent)

      let items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('url')

      mockOnPasteItems.mockClear()

      // This should be text (URL with trailing text)
      const textEvent = createMockPasteEvent({
        text: 'https://example.com check this out',
      })
      window.dispatchEvent(textEvent)

      items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('text')
    })

    it('should preserve full text content including embedded URL', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const fullText = 'Visit https://example.com/path?query=1 for details'
      const pasteEvent = createMockPasteEvent({
        text: fullText,
      })
      window.dispatchEvent(pasteEvent)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('text')
      expect(items[0].raw).toBe(fullText)
    })
  })

  describe('Item Structure', () => {
    it('should create items with correct structure', () => {
      renderHook(() =>
        useGlobalPaste({
          onPasteItems: mockOnPasteItems,
        })
      )

      const pasteEvent = createMockPasteEvent({
        text: 'Test content',
      })
      window.dispatchEvent(pasteEvent)

      expect(mockOnPasteItems).toHaveBeenCalledTimes(1)

      const items = mockOnPasteItems.mock.calls[0][0] as RawItem[]
      const item = items[0]

      // Check all required fields
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('type')
      expect(item).toHaveProperty('raw')
      expect(item).toHaveProperty('capturedAt')
      expect(item).toHaveProperty('metadata')

      // Check ID is a valid UUID-like string
      expect(typeof item.id).toBe('string')
      expect(item.id).toMatch(/^[0-9a-f-]+$/)

      // Check capturedAt is valid ISO timestamp
      expect(typeof item.capturedAt).toBe('string')
      expect(() => new Date(item.capturedAt)).not.toThrow()
    })
  })
})
