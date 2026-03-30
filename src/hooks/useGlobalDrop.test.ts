import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGlobalDrop } from './useGlobalDrop'
import type { RawItem } from '@/models/rawItem'

describe('useGlobalDrop', () => {
  const mockOnDropItems = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    document.body.className = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

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

  describe('TASK-6: Drop a file anywhere on the app window', () => {
    it('should create item when a file is dropped', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['test content'], 'document.txt', {
        type: 'text/plain',
      })

      const dropEvent = createMockDropEvent({
        files: [mockFile],
      })

      window.dispatchEvent(dropEvent)

      expect(mockOnDropItems).toHaveBeenCalledTimes(1)
      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items).toHaveLength(1)
      expect(items[0].type).toBe('file')
    })

    it('should prevent default drop behavior', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })
      const preventDefaultSpy = vi.spyOn(dropEvent, 'preventDefault')

      window.dispatchEvent(dropEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('TASK-7: See a visual cue while dragging', () => {
    it('should show overlay on dragenter with files', () => {
      const { result } = renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      expect(result.current.isDragging).toBe(false)

      act(() => {
        const dragEnterEvent = createMockDragEvent('dragenter')
        window.dispatchEvent(dragEnterEvent)
      })

      expect(result.current.isDragging).toBe(true)
    })

    it('should hide overlay on dragleave', () => {
      const { result } = renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      // First enter
      act(() => {
        const dragEnterEvent = createMockDragEvent('dragenter')
        window.dispatchEvent(dragEnterEvent)
      })

      expect(result.current.isDragging).toBe(true)

      // Then leave
      act(() => {
        const dragLeaveEvent = createMockDragEvent('dragleave')
        window.dispatchEvent(dragLeaveEvent)
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('should hide overlay immediately on drop', () => {
      const { result } = renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      // Enter drag
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragenter'))
      })

      expect(result.current.isDragging).toBe(true)

      // Drop file
      act(() => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
        window.dispatchEvent(createMockDropEvent({ files: [mockFile] }))
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('should prevent default on dragover', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const dragOverEvent = createMockDragEvent('dragover')
      const preventDefaultSpy = vi.spyOn(dragOverEvent, 'preventDefault')

      window.dispatchEvent(dragOverEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('TASK-8: Drop an image file and see it rendered inline', () => {
    it('should create image item for .png file', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['image data'], 'photo.png', {
        type: 'image/png',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      expect(mockOnDropItems).toHaveBeenCalledTimes(1)
      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
    })

    it('should create image item for .jpg file', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['image data'], 'photo.jpg', {
        type: 'image/jpeg',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
    })

    it('should create image item for .gif file', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['image data'], 'animation.gif', {
        type: 'image/gif',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
    })

    it('should create image item for .webp file', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['image data'], 'photo.webp', {
        type: 'image/webp',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
    })

    it('should include image blob in raw field', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['image data'], 'photo.png', {
        type: 'image/png',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items[0].raw).toBeInstanceOf(Blob)
    })
  })

  describe('TASK-9: Drop a non-image file and see its metadata', () => {
    it('should create file item with pdf subtype for .pdf', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['pdf content'], 'document.pdf', {
        type: 'application/pdf',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('file')
      expect(items[0].metadata.kind).toBe('pdf')
    })

    it('should create file item with zip subtype for .zip', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['zip content'], 'archive.zip', {
        type: 'application/zip',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('file')
      expect(items[0].metadata.kind).toBe('zip')
    })

    it('should create file item with other subtype for unknown binary', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['binary data'], 'data.bin', {
        type: 'application/octet-stream',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('file')
      expect(items[0].metadata.kind).toBe('other')
    })

    it('should include filename in metadata', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['content'], 'my-document.pdf', {
        type: 'application/pdf',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect((items[0].metadata as { filename: string }).filename).toBe(
        'my-document.pdf'
      )
      expect(items[0].title).toBe('my-document.pdf')
    })

    it('should include filesize in metadata', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const content = 'x'.repeat(2048)
      const mockFile = new File([content], 'document.txt', {
        type: 'text/plain',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect((items[0].metadata as { filesize: number }).filesize).toBe(2048)
    })

    it('should include mimetype in metadata', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['content'], 'doc.pdf', {
        type: 'application/pdf',
      })

      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect((items[0].metadata as { mimetype: string }).mimetype).toBe(
        'application/pdf'
      )
    })
  })

  describe('TASK-10: Drop multiple files at once', () => {
    it('should create multiple items for multiple files', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const files = [
        new File(['image1'], 'photo1.png', { type: 'image/png' }),
        new File(['image2'], 'photo2.jpg', { type: 'image/jpeg' }),
        new File(['text'], 'notes.txt', { type: 'text/plain' }),
      ]

      const dropEvent = createMockDropEvent({ files })
      window.dispatchEvent(dropEvent)

      expect(mockOnDropItems).toHaveBeenCalledTimes(1)
      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items).toHaveLength(3)
    })

    it('should create items in drop order', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const files = [
        new File(['1'], 'first.pdf', { type: 'application/pdf' }),
        new File(['2'], 'second.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
        new File(['3'], 'third.zip', { type: 'application/zip' }),
      ]

      const dropEvent = createMockDropEvent({ files })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
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

    it('should render each block according to its own type', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const files = [
        new File(['img'], 'photo.png', { type: 'image/png' }),
        new File(['pdf'], 'doc.pdf', { type: 'application/pdf' }),
      ]

      const dropEvent = createMockDropEvent({ files })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
      expect(items[0].type).toBe('image')
      expect(items[1].type).toBe('file')
      expect(items[1].metadata.kind).toBe('pdf')
    })
  })

  describe('TASK-11: Drag over interactive elements without breaking', () => {
    it('should keep overlay active when dragging over input', () => {
      const { result } = renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      // Create input and append to body
      const input = document.createElement('input')
      document.body.appendChild(input)

      // Start drag
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragenter'))
      })

      expect(result.current.isDragging).toBe(true)

      // Drag over input
      const dragOverEvent = createMockDragEvent('dragover')
      input.dispatchEvent(dragOverEvent)

      expect(result.current.isDragging).toBe(true)

      document.body.removeChild(input)
    })

    it('should capture file when dropped on interactive element', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const input = document.createElement('input')
      document.body.appendChild(input)

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })

      input.dispatchEvent(dropEvent)

      expect(mockOnDropItems).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it('should prevent default on drop over interactive element', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const button = document.createElement('button')
      document.body.appendChild(button)

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })
      const preventDefaultSpy = vi.spyOn(dropEvent, 'preventDefault')

      button.dispatchEvent(dropEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()

      document.body.removeChild(button)
    })
  })

  describe('TASK-12: Dragging URL or text from browser is ignored', () => {
    it('should NOT show overlay for text/URL drag', () => {
      const { result } = renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const dragEnterEvent = createMockDragEvent('dragenter', {
        types: ['text/plain', 'text/uri-list'],
      })
      window.dispatchEvent(dragEnterEvent)

      expect(result.current.isDragging).toBe(false)
    })

    it('should NOT create items for text drop', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const dragEvent = createMockDragEvent('drop', {
        types: ['text/plain'],
      })
      window.dispatchEvent(dragEvent)

      expect(mockOnDropItems).not.toHaveBeenCalled()
    })

    it('should NOT create items for URL drop', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const dragEvent = createMockDragEvent('drop', {
        types: ['text/uri-list'],
      })
      window.dispatchEvent(dragEvent)

      expect(mockOnDropItems).not.toHaveBeenCalled()
    })

    it('should show overlay only for file drags', () => {
      const { result } = renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      // Text drag - no overlay
      act(() => {
        window.dispatchEvent(
          createMockDragEvent('dragenter', {
            types: ['text/plain'],
          })
        )
      })
      expect(result.current.isDragging).toBe(false)

      // URL drag - no overlay
      act(() => {
        window.dispatchEvent(
          createMockDragEvent('dragenter', {
            types: ['text/uri-list'],
          })
        )
      })
      expect(result.current.isDragging).toBe(false)

      // File drag - show overlay
      act(() => {
        window.dispatchEvent(
          createMockDragEvent('dragenter', {
            types: ['Files'],
          })
        )
      })
      expect(result.current.isDragging).toBe(true)
    })
  })

  describe('Disabled state', () => {
    it('should not respond to drag events when disabled', () => {
      const { result } = renderHook(() =>
        useGlobalDrop({
          disabled: true,
          onDropItems: mockOnDropItems,
        })
      )

      const dragEnterEvent = createMockDragEvent('dragenter')
      window.dispatchEvent(dragEnterEvent)

      expect(result.current.isDragging).toBe(false)
    })

    it('should not process drops when disabled', () => {
      renderHook(() =>
        useGlobalDrop({
          disabled: true,
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      expect(mockOnDropItems).not.toHaveBeenCalled()
    })
  })

  describe('Item structure', () => {
    it('should create items with correct structure', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const mockFile = new File(['content'], 'doc.txt', { type: 'text/plain' })
      const dropEvent = createMockDropEvent({ files: [mockFile] })
      window.dispatchEvent(dropEvent)

      const items = mockOnDropItems.mock.calls[0][0] as RawItem[]
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
    it('should handle empty file list gracefully', () => {
      renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      const dropEvent = createMockDropEvent({ files: [] })
      window.dispatchEvent(dropEvent)

      expect(mockOnDropItems).not.toHaveBeenCalled()
    })

    it('should handle dragleave correctly with nested dragenters', () => {
      const { result } = renderHook(() =>
        useGlobalDrop({
          onDropItems: mockOnDropItems,
        })
      )

      // Multiple enters (simulating child elements)
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragenter'))
        window.dispatchEvent(createMockDragEvent('dragenter'))
      })

      expect(result.current.isDragging).toBe(true)

      // One leave shouldn't hide yet
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragleave'))
      })

      expect(result.current.isDragging).toBe(true)

      // Second leave should hide
      act(() => {
        window.dispatchEvent(createMockDragEvent('dragleave'))
      })

      expect(result.current.isDragging).toBe(false)
    })
  })
})
