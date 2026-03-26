import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { RawItem } from '@/models/rawItem'
import { Block } from './Block'

// Mock URL.createObjectURL for image blocks
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

// @ts-expect-error - Mocking global URL
global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
}

// Mock window methods for URL blocks and TextBlock resize listener
const mockOpen = vi.fn()
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

// @ts-expect-error - Mocking global window
global.window = {
  ...window,
  open: mockOpen,
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
}

// Test data factory
const createTextItem = (
  overrides?: Partial<RawItem & { type: 'text' }>
): RawItem & { type: 'text' } => ({
  id: 'test-text-id',
  type: 'text',
  capturedAt: '2026-03-24T10:00:00.000Z' as RawItem['capturedAt'],
  raw: 'This is test text content',
  metadata: {
    kind: 'plain',
    wordCount: 5,
  },
  ...overrides,
})

const createUrlItem = (
  overrides?: Partial<RawItem & { type: 'url' }>
): RawItem & { type: 'url' } => ({
  id: 'test-url-id',
  type: 'url',
  capturedAt: '2026-03-24T10:00:00.000Z' as RawItem['capturedAt'],
  raw: 'https://example.com/path',
  metadata: {
    kind: 'url',
    title: 'Example Page',
    favicon: 'https://example.com/favicon.ico',
  },
  title: 'example.com',
  ...overrides,
})

const createImageItem = (
  overrides?: Partial<RawItem & { type: 'image' }>
): RawItem & { type: 'image' } => ({
  id: 'test-image-id',
  type: 'image',
  capturedAt: '2026-03-24T10:00:00.000Z' as RawItem['capturedAt'],
  raw: new Blob(['test'], { type: 'image/png' }),
  metadata: {
    kind: 'image',
    width: 800,
    height: 600,
  },
  ...overrides,
})

const createFileItem = (
  overrides?: Partial<RawItem & { type: 'file' }>
): RawItem & { type: 'file' } => ({
  id: 'test-file-id',
  type: 'file',
  capturedAt: '2026-03-24T10:00:00.000Z' as RawItem['capturedAt'],
  raw: new Blob(['test'], { type: 'application/pdf' }),
  metadata: {
    kind: 'pdf',
    filename: 'document.pdf',
    filesize: 1024,
    mimetype: 'application/pdf',
  },
  title: 'document.pdf',
  ...overrides,
})

describe('Block', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AC #6: Block dispatcher routes items to correct component by type', () => {
    it('dispatches text items to TextBlock', () => {
      const item = createTextItem()
      render(<Block item={item} />)

      expect(screen.getByText('This is test text content')).toBeInTheDocument()
    })

    it('dispatches URL items to UrlBlock', () => {
      const item = createUrlItem()
      render(<Block item={item} />)

      expect(screen.getByText('https://example.com/path')).toBeInTheDocument()
    })

    it('dispatches image items to ImageBlock', () => {
      const item = createImageItem()
      render(<Block item={item} />)

      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
    })

    it('dispatches file items to FileBlock', () => {
      const item = createFileItem()
      render(<Block item={item} />)

      // FileBlock shows filename and size
      const filenameElements = screen.getAllByText('document.pdf')
      expect(filenameElements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('1 KB')).toBeInTheDocument()
    })
  })

  describe('Block header structure', () => {
    it('renders timestamp in header for text items', () => {
      const item = createTextItem()
      render(<Block item={item} />)

      // Timestamp is formatted in local timezone (e.g., "Mar 24 · 11:00" in Europe/Paris)
      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toBeInTheDocument()
    })

    it('renders timestamp in header for URL items', () => {
      const item = createUrlItem()
      render(<Block item={item} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toBeInTheDocument()
    })

    it('renders timestamp in header for image items', () => {
      const item = createImageItem()
      render(<Block item={item} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toBeInTheDocument()
    })

    it('renders timestamp in header for file items', () => {
      const item = createFileItem()
      render(<Block item={item} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toBeInTheDocument()
    })
  })

  describe('Block header labels', () => {
    it('text blocks show no label', () => {
      const item = createTextItem()
      render(<Block item={item} />)

      const header = screen.getByTestId('block-header')
      const label = header.querySelector('[data-testid="block-label"]')
      expect(label).toBeNull()
    })

    it('URL blocks show hostname as label', () => {
      const item = createUrlItem({
        raw: 'https://example.com/path',
        title: 'example.com',
      })
      render(<Block item={item} />)

      expect(screen.getByText('example.com')).toBeInTheDocument()
    })

    it('image blocks show no label when no alt text', () => {
      const item = createImageItem()
      render(<Block item={item} />)

      const header = screen.getByTestId('block-header')
      const label = header.querySelector('[data-testid="block-label"]')
      expect(label).toBeNull()
    })

    it('image blocks show alt text as label when available', () => {
      const item = createImageItem({
        metadata: {
          kind: 'image',
          width: 800,
          height: 600,
          alt: 'Test image alt',
        },
        title: 'Test image alt',
      })
      render(<Block item={item} />)

      expect(screen.getByText('Test image alt')).toBeInTheDocument()
    })

    it('file blocks show filename as label', () => {
      const item = createFileItem({
        metadata: {
          kind: 'pdf',
          filename: 'document.pdf',
          filesize: 1024,
          mimetype: 'application/pdf',
        },
      })
      render(<Block item={item} />)

      // Filename appears in both header label and FileBlock content
      expect(screen.getAllByText('document.pdf').length).toBeGreaterThanOrEqual(
        1
      )
    })
  })

  describe('Design system compliance', () => {
    it('uses correct padding', () => {
      const item = createTextItem()
      const { container } = render(<Block item={item} />)

      const block = container.firstChild
      expect(block).toHaveClass('py-3')
      expect(block).toHaveClass('px-4')
    })

    it('block has transparent background', () => {
      const item = createTextItem()
      const { container } = render(<Block item={item} />)

      const block = container.firstChild
      expect(block).toHaveClass('bg-transparent')
    })

    it('timestamp uses text-sm and text-muted styling', () => {
      const item = createTextItem()
      render(<Block item={item} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toHaveClass('text-sm')
      expect(timeElement).toHaveClass('text-text-muted')
    })
  })

  describe('Block structure', () => {
    it('has header row with icon and timestamp', () => {
      const item = createTextItem()
      render(<Block item={item} />)

      const header = screen.getByTestId('block-header')
      expect(header).toBeInTheDocument()
    })

    it('has content area below header', () => {
      const item = createTextItem()
      render(<Block item={item} />)

      const content = screen.getByTestId('block-content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has semantic article element for block', () => {
      const item = createTextItem()
      const { container } = render(<Block item={item} />)

      const article = container.querySelector('article')
      expect(article).toBeInTheDocument()
    })

    it('timestamp has datetime attribute', () => {
      const item = createTextItem({
        capturedAt: '2026-03-24T10:30:00.000Z' as RawItem['capturedAt'],
      })
      render(<Block item={item} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toHaveAttribute(
        'datetime',
        '2026-03-24T10:30:00.000Z'
      )
    })
  })
})
