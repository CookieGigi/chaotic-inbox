import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGlobalDrop } from './useGlobalDrop'
import type { RawItem } from '@/models/rawItem'
import { db } from '@/storage/local_db'
import { useAppStore } from '@/store/appStore'

/**
 * Magic numbers for testing file content (hex → decimal)
 * Providing more complete file signatures for reliable detection
 */
const MAGIC_NUMBERS = {
  // PNG: 89 50 4E 47 0D 0A 1A 0A + IHDR chunk (minimum viable PNG)
  PNG: [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52,
  ],
  // JPEG: FF D8 FF + JFIF marker
  JPEG: [
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ],
  // GIF: 47 49 46 38 + version
  GIF: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00],
  // WEBP: 52 49 46 46 + size + WEBP
  WEBP: [
    0x52, 0x49, 0x46, 0x46, 0x1e, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    0x56, 0x50, 0x38, 0x20,
  ],
  // PDF: 25 50 44 46 + version
  PDF: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xc0, 0xc0],
  // ZIP: 50 4B 03 04 + version
  ZIP: [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
}

describe('useGlobalDrop', () => {
  // Store spies
  let addItemsSpy: ReturnType<typeof vi.spyOn>
  let setIsDraggingSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    // Clear all mocks first
    vi.clearAllMocks()

    // Clear database and reset store
    await db.items.clear()
    useAppStore.getState().reset()

    // Setup spies on store actions (after reset)
    addItemsSpy = vi.spyOn(useAppStore.getState(), 'addItems')
    setIsDraggingSpy = vi.spyOn(useAppStore.getState(), 'setIsDragging')

    // Reset DOM
    document.body.innerHTML = ''
    document.body.className = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * Helper to create a mock File with specific byte content
   */
  function createMockFile(
    name: string,
    bytes: number[] | Uint8Array,
    mimeType = 'application/octet-stream'
  ): File {
    const blob = new Blob([new Uint8Array(bytes)], { type: mimeType })
    return new File([blob], name, { type: mimeType })
  }

  /**
   * Helper to create a mock DragEvent with files
   */
  function createMockDropEvent(options: {
    files?: File[]
    types?: string[]
  }): DragEvent {
    const { files = [], types = ['Files'] } = options

    const dataTransfer = {
      files: files.length > 0 ? files : ([] as unknown as FileList),
      types,
      getData: () => '',
    } as unknown as DataTransfer

    const event = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    })

    return event
  }

  /**
   * Helper to create a mock DragEvent for dragenter/dragover/dragleave
   */
  function createMockDragEvent(
    type: 'dragenter' | 'dragover' | 'dragleave' | 'drop',
    options: {
      types?: string[]
      files?: File[]
    } = {}
  ): DragEvent {
    const { types = ['Files'], files = [] } = options

    const dataTransfer = {
      types,
      files: files.length > 0 ? files : ([] as unknown as FileList),
      getData: () => '',
    } as unknown as DataTransfer

    const event = new DragEvent(type, {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    })

    return event
  }

  describe('Drop a file anywhere on the app window', () => {
    it('should create item when a file is dropped', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = new File(['test content'], 'document.txt', {
        type: 'text/plain',
      })

      const dropEvent = createMockDropEvent({
        files: [mockFile],
      })

      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items).toHaveLength(1)
      expect(items[0].type).toBe('file')
    })

    it('should prevent default drop behavior', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })
      const preventDefaultSpy = vi.spyOn(dropEvent, 'preventDefault')

      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Visual cue while dragging (calls store.setIsDragging)', () => {
    it('should call setIsDragging(true) on dragenter with files', () => {
      renderHook(() => useGlobalDrop())

      expect(useAppStore.getState().isDragging).toBe(false)

      act(() => {
        const dragEnterEvent = createMockDragEvent('dragenter')
        window.dispatchEvent(dragEnterEvent)
      })

      expect(setIsDraggingSpy).toHaveBeenCalledWith(true)
    })

    it('should call setIsDragging(false) on dragleave', () => {
      renderHook(() => useGlobalDrop())

      // First enter
      act(() => {
        const dragEnterEvent = createMockDragEvent('dragenter')
        window.dispatchEvent(dragEnterEvent)
      })

      expect(setIsDraggingSpy).toHaveBeenLastCalledWith(true)

      // Then leave
      act(() => {
        const dragLeaveEvent = createMockDragEvent('dragleave')
        window.dispatchEvent(dragLeaveEvent)
      })

      expect(setIsDraggingSpy).toHaveBeenLastCalledWith(false)
    })

    it('should call setIsDragging(false) on drop', async () => {
      renderHook(() => useGlobalDrop())

      // Enter drag
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragenter'))
      })

      // Drop file
      await act(async () => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
        window.dispatchEvent(createMockDropEvent({ files: [mockFile] }))
      })

      expect(setIsDraggingSpy).toHaveBeenLastCalledWith(false)
    })

    it('should prevent default on dragover', () => {
      renderHook(() => useGlobalDrop())

      const dragOverEvent = createMockDragEvent('dragover')
      const preventDefaultSpy = vi.spyOn(dragOverEvent, 'preventDefault')

      window.dispatchEvent(dragOverEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Drop an image file and see it rendered inline', () => {
    it('should create image item for .png file with correct magic numbers', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = createMockFile(
        'photo.png',
        MAGIC_NUMBERS.PNG,
        'image/png'
      )

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
    })

    it('should create image item for .jpg file with correct magic numbers', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = createMockFile(
        'photo.jpg',
        MAGIC_NUMBERS.JPEG,
        'image/jpeg'
      )

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
    })

    it('should create image item for .gif file with correct magic numbers', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = createMockFile(
        'animation.gif',
        MAGIC_NUMBERS.GIF,
        'image/gif'
      )

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
    })

    it('should create image item for .webp file with correct magic numbers', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = createMockFile(
        'photo.webp',
        MAGIC_NUMBERS.WEBP,
        'image/webp'
      )

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
    })

    it('should include image blob in raw field', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = createMockFile(
        'photo.png',
        MAGIC_NUMBERS.PNG,
        'image/png'
      )

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].raw).toBeInstanceOf(Blob)
    })
  })

  describe('Drop a non-image file and see its metadata', () => {
    it('should create file item with pdf subtype for .pdf with magic numbers', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = createMockFile(
        'document.pdf',
        MAGIC_NUMBERS.PDF,
        'application/pdf'
      )

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('file')
      expect(items[0].metadata.kind).toBe('pdf')
    })

    it('should create file item with zip subtype for .zip with magic numbers', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = createMockFile(
        'archive.zip',
        MAGIC_NUMBERS.ZIP,
        'application/zip'
      )

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('file')
      expect(items[0].metadata.kind).toBe('zip')
    })

    it('should create file item with md subtype for .md', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = new File(['# Markdown'], 'README.md', {
        type: 'text/markdown',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('file')
      expect(items[0].metadata.kind).toBe('md')
    })

    it('should create file item with other subtype for unknown binary', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = new File(['binary data'], 'data.bin', {
        type: 'application/octet-stream',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('file')
      expect(items[0].metadata.kind).toBe('other')
    })

    it('should include filename in metadata', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = new File(['content'], 'my-document.pdf', {
        type: 'application/pdf',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect((items[0].metadata as { filename: string }).filename).toBe(
        'my-document.pdf'
      )
      expect(items[0].title).toBe('my-document.pdf')
    })

    it('should include filesize in metadata', async () => {
      renderHook(() => useGlobalDrop())

      const content = 'x'.repeat(2048)
      const mockFile = new File([content], 'document.txt', {
        type: 'text/plain',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect((items[0].metadata as { filesize: number }).filesize).toBe(2048)
    })

    it('should include mimetype in metadata', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = new File(['content'], 'doc.pdf', {
        type: 'application/pdf',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect((items[0].metadata as { mimetype: string }).mimetype).toBe(
        'application/pdf'
      )
    })
  })

  describe('Magic number detection security', () => {
    it('should detect actual file type despite spoofed extension (PNG content with .txt)', async () => {
      renderHook(() => useGlobalDrop())

      // File has PNG magic numbers but .txt extension
      const mockFile = createMockFile(
        'spoofed.txt',
        MAGIC_NUMBERS.PNG,
        'text/plain'
      )

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      // Magic numbers should win - it's actually an image
      expect(items[0].type).toBe('image')
    })

    it('should detect actual file type despite spoofed extension (PDF content with .png)', async () => {
      renderHook(() => useGlobalDrop())

      // File has PDF magic numbers but .png extension
      const mockFile = createMockFile(
        'spoofed.png',
        MAGIC_NUMBERS.PDF,
        'image/png'
      )

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      // Magic numbers should win - it's actually a PDF
      expect(items[0].type).toBe('file')
      expect(items[0].metadata.kind).toBe('pdf')
    })
  })

  describe('Drop multiple files at once', () => {
    it('should create multiple items for multiple files', async () => {
      renderHook(() => useGlobalDrop())

      const files = [
        createMockFile('photo1.png', MAGIC_NUMBERS.PNG, 'image/png'),
        createMockFile('photo2.jpg', MAGIC_NUMBERS.JPEG, 'image/jpeg'),
        new File(['text'], 'notes.txt', { type: 'text/plain' }),
      ]

      const dropEvent = createMockDropEvent({ files })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items).toHaveLength(3)
    })

    it('should create items in drop order', async () => {
      renderHook(() => useGlobalDrop())

      const files = [
        new File(['1'], 'first.pdf', { type: 'application/pdf' }),
        new File(['2'], 'second.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
        new File(['3'], 'third.zip', { type: 'application/zip' }),
      ]

      const dropEvent = createMockDropEvent({ files })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect((items[0].metadata as { filename: string }).filename).toBe(
        'first.pdf'
      )
      expect((items[1].metadata as { filename: string }).filename).toBe(
        'second.docx'
      )
      expect((items[2].metadata as { filename: string }).filename).toBe(
        'third.zip'
      )
    })

    it('should render each block according to its own type', async () => {
      renderHook(() => useGlobalDrop())

      const files = [
        createMockFile('photo.png', MAGIC_NUMBERS.PNG, 'image/png'),
        createMockFile('doc.pdf', MAGIC_NUMBERS.PDF, 'application/pdf'),
      ]

      const dropEvent = createMockDropEvent({ files })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
      expect(items[1].type).toBe('file')
      expect(items[1].metadata.kind).toBe('pdf')
    })
  })

  describe('Drag over interactive elements without breaking', () => {
    it('should keep overlay active when dragging over input', () => {
      renderHook(() => useGlobalDrop())

      // Create input and append to body
      const input = document.createElement('input')
      document.body.appendChild(input)

      // Start drag
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragenter'))
      })

      expect(setIsDraggingSpy).toHaveBeenLastCalledWith(true)

      // Drag over input
      const dragOverEvent = createMockDragEvent('dragover')
      input.dispatchEvent(dragOverEvent)

      // Should still be dragging
      expect(setIsDraggingSpy).toHaveBeenCalledWith(true)

      document.body.removeChild(input)
    })

    it('should capture file when dropped on interactive element', async () => {
      renderHook(() => useGlobalDrop())

      const input = document.createElement('input')
      document.body.appendChild(input)

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })

      await act(async () => {
        input.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      document.body.removeChild(input)
    })

    it('should prevent default on drop over interactive element', async () => {
      renderHook(() => useGlobalDrop())

      const button = document.createElement('button')
      document.body.appendChild(button)

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })
      const preventDefaultSpy = vi.spyOn(dropEvent, 'preventDefault')

      await act(async () => {
        button.dispatchEvent(dropEvent)
      })

      expect(preventDefaultSpy).toHaveBeenCalled()

      document.body.removeChild(button)
    })
  })

  describe('Dragging URL or text from browser is ignored', () => {
    it('should NOT show overlay for text/URL drag', () => {
      renderHook(() => useGlobalDrop())

      const dragEnterEvent = createMockDragEvent('dragenter', {
        types: ['text/plain', 'text/uri-list'],
      })
      window.dispatchEvent(dragEnterEvent)

      expect(setIsDraggingSpy).not.toHaveBeenCalledWith(true)
    })

    it('should NOT create items for text drop', async () => {
      renderHook(() => useGlobalDrop())

      const dragEvent = createMockDragEvent('drop', {
        types: ['text/plain'],
      })
      await act(async () => {
        window.dispatchEvent(dragEvent)
      })

      // Wait a bit to ensure async operations complete
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(addItemsSpy).not.toHaveBeenCalled()
    })

    it('should NOT create items for URL drop', async () => {
      renderHook(() => useGlobalDrop())

      const dragEvent = createMockDragEvent('drop', {
        types: ['text/uri-list'],
      })
      await act(async () => {
        window.dispatchEvent(dragEvent)
      })

      // Wait a bit to ensure async operations complete
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(addItemsSpy).not.toHaveBeenCalled()
    })

    it('should show overlay only for file drags', () => {
      renderHook(() => useGlobalDrop())

      // Text drag - no overlay
      act(() => {
        window.dispatchEvent(
          createMockDragEvent('dragenter', {
            types: ['text/plain'],
          })
        )
      })
      expect(setIsDraggingSpy).not.toHaveBeenCalledWith(true)

      vi.clearAllMocks()

      // URL drag - no overlay
      act(() => {
        window.dispatchEvent(
          createMockDragEvent('dragenter', {
            types: ['text/uri-list'],
          })
        )
      })
      expect(setIsDraggingSpy).not.toHaveBeenCalledWith(true)

      vi.clearAllMocks()

      // File drag - show overlay
      act(() => {
        window.dispatchEvent(
          createMockDragEvent('dragenter', {
            types: ['Files'],
          })
        )
      })
      expect(setIsDraggingSpy).toHaveBeenCalledWith(true)
    })
  })

  describe('Disabled state', () => {
    it('should not respond to drag events when disabled', () => {
      renderHook(() => useGlobalDrop({ disabled: true }))

      const dragEnterEvent = createMockDragEvent('dragenter')
      window.dispatchEvent(dragEnterEvent)

      expect(setIsDraggingSpy).not.toHaveBeenCalled()
    })

    it('should not process drops when disabled', async () => {
      renderHook(() => useGlobalDrop({ disabled: true }))

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      // Wait a bit to ensure async operations would have completed
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(addItemsSpy).not.toHaveBeenCalled()
    })
  })

  describe('Item structure', () => {
    it('should create items with correct structure', async () => {
      renderHook(() => useGlobalDrop())

      const mockFile = new File(['content'], 'doc.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      await waitFor(() => {
        expect(addItemsSpy).toHaveBeenCalledTimes(1)
      })

      const items = addItemsSpy.mock.calls[0][0] as RawItem[]
      const item = items[0]

      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('type')
      expect(item).toHaveProperty('raw')
      expect(item).toHaveProperty('capturedAt')
      expect(item).toHaveProperty('metadata')

      expect(typeof item.id).toBe('string')
      expect(typeof item.capturedAt).toBe('string')
      expect(() => new Date(item.capturedAt)).not.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty file list gracefully', async () => {
      renderHook(() => useGlobalDrop())

      const dropEvent = createMockDropEvent({ files: [] })
      await act(async () => {
        window.dispatchEvent(dropEvent)
      })

      // Wait a bit to ensure async operations would have completed
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(addItemsSpy).not.toHaveBeenCalled()
    })

    it('should handle dragleave correctly with nested dragenters', () => {
      renderHook(() => useGlobalDrop())

      // Multiple enters (simulating child elements)
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragenter'))
        window.dispatchEvent(createMockDragEvent('dragenter'))
      })

      expect(setIsDraggingSpy).toHaveBeenLastCalledWith(true)

      // One leave shouldn't hide yet
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragleave'))
      })

      // Still called once with true, no change yet

      // Second leave should hide
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragleave'))
      })

      expect(setIsDraggingSpy).toHaveBeenLastCalledWith(false)
    })
  })
})
