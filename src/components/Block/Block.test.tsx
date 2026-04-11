import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
      render(<Block item={item} onDelete={vi.fn()} />)

      expect(screen.getByText('This is test text content')).toBeInTheDocument()
    })

    it('dispatches URL items to UrlBlock', () => {
      const item = createUrlItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      expect(screen.getByText('https://example.com/path')).toBeInTheDocument()
    })

    it('dispatches image items to ImageBlock', () => {
      const item = createImageItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
    })

    it('dispatches file items to FileBlock', () => {
      const item = createFileItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      // FileBlock shows size only (filename shown in header)
      expect(screen.getByText(/Size:/)).toBeInTheDocument()
      expect(screen.getByText(/1 KB/)).toBeInTheDocument()
    })

    it('TASK-19: dispatches text with embedded URL to TextBlock, not UrlBlock', () => {
      const item = createTextItem({
        raw: 'Check out https://example.com for more info',
      })
      render(<Block item={item} onDelete={vi.fn()} />)

      // Should render as text block (body font), not as clickable URL button
      const textElement = screen.getByText(/Check out/)
      expect(textElement).toBeInTheDocument()
      expect(textElement).toHaveClass('text-base')
      expect(textElement).toHaveClass('leading-relaxed')

      // Should NOT have a URL link button (UrlBlock uses button role for the whole URL)
      // The delete button is expected now, so we check the content area doesn't have URL buttons
      const content = screen.getByTestId('block-content')
      const urlButton = content.querySelector('[role="button"]')
      expect(urlButton).not.toBeInTheDocument()
    })

    it('TASK-19: renders embedded URL as plain text in body font', () => {
      const item = createTextItem({
        raw: 'Visit https://example.com/path?query=1 for details',
      })
      render(<Block item={item} onDelete={vi.fn()} />)

      const content = screen.getByTestId('block-content')
      expect(content.textContent).toContain('https://example.com/path?query=1')

      // Should be in body font, not link styling
      const textElement = screen.getByTestId('text-block-content')
      expect(textElement).toHaveClass('text-text') // Body text color
      expect(textElement).not.toHaveClass('text-accent') // Not link color
    })
  })

  describe('Block header structure', () => {
    it('renders timestamp in header for text items', () => {
      const item = createTextItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      // Timestamp is formatted in local timezone (e.g., "Mar 24 · 11:00" in Europe/Paris)
      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toBeInTheDocument()
    })

    it('renders timestamp in header for URL items', () => {
      const item = createUrlItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toBeInTheDocument()
    })

    it('renders timestamp in header for image items', () => {
      const item = createImageItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toBeInTheDocument()
    })

    it('renders timestamp in header for file items', () => {
      const item = createFileItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toBeInTheDocument()
    })
  })

  describe('Block header labels', () => {
    it('text blocks show no label', () => {
      const item = createTextItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      const header = screen.getByTestId('block-header')
      const label = header.querySelector('[data-testid="block-label"]')
      expect(label).toBeNull()
    })

    it('URL blocks show hostname as label', () => {
      const item = createUrlItem({
        raw: 'https://example.com/path',
        title: 'example.com',
      })
      render(<Block item={item} onDelete={vi.fn()} />)

      expect(screen.getByText('example.com')).toBeInTheDocument()
    })

    it('image blocks show no label when no alt text', () => {
      const item = createImageItem()
      render(<Block item={item} onDelete={vi.fn()} />)

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
      render(<Block item={item} onDelete={vi.fn()} />)

      expect(screen.getByText('Test image alt')).toBeInTheDocument()
    })

    it('file blocks show filename as label in header only', () => {
      const item = createFileItem({
        metadata: {
          kind: 'pdf',
          filename: 'document.pdf',
          filesize: 1024,
          mimetype: 'application/pdf',
        },
      })
      render(<Block item={item} onDelete={vi.fn()} />)

      // Filename appears in header label only (not in FileBlock content)
      const header = screen.getByTestId('block-header')
      expect(header.textContent).toContain('document.pdf')
    })
  })

  describe('Design system compliance', () => {
    it('uses correct padding', () => {
      const item = createTextItem()
      const { container } = render(<Block item={item} onDelete={vi.fn()} />)

      const block = container.firstChild
      expect(block).toHaveClass('py-3')
      expect(block).toHaveClass('px-4')
    })

    it('block has transparent background', () => {
      const item = createTextItem()
      const { container } = render(<Block item={item} onDelete={vi.fn()} />)

      const block = container.firstChild
      expect(block).toHaveClass('bg-transparent')
    })

    it('timestamp uses text-sm and text-muted styling', () => {
      const item = createTextItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toHaveClass('text-sm')
      expect(timeElement).toHaveClass('text-text-muted')
    })

    it('header uses baseline alignment for better text rhythm', () => {
      const item = createTextItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      const header = screen.getByTestId('block-header')
      expect(header).toHaveClass('items-baseline')
    })
  })

  describe('Block structure', () => {
    it('has header row with icon and timestamp', () => {
      const item = createTextItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      const header = screen.getByTestId('block-header')
      expect(header).toBeInTheDocument()
    })

    it('has content area below header', () => {
      const item = createTextItem()
      render(<Block item={item} onDelete={vi.fn()} />)

      const content = screen.getByTestId('block-content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has semantic article element for block', () => {
      const item = createTextItem()
      const { container } = render(<Block item={item} onDelete={vi.fn()} />)

      const article = container.querySelector('article')
      expect(article).toBeInTheDocument()
    })

    it('timestamp has datetime attribute', () => {
      const item = createTextItem({
        capturedAt: '2026-03-24T10:30:00.000Z' as RawItem['capturedAt'],
      })
      render(<Block item={item} onDelete={vi.fn()} />)

      const timeElement = screen
        .getByTestId('block-header')
        .querySelector('time')
      expect(timeElement).toHaveAttribute(
        'datetime',
        '2026-03-24T10:30:00.000Z'
      )
    })
  })

  describe('AC: TASK-100 - Delete button integration', () => {
    it('renders delete button in action menu for text blocks', () => {
      const item = createTextItem()
      const mockOnDelete = vi.fn()
      render(<Block item={item} onDelete={mockOnDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete block/i })
      expect(deleteButton).toBeInTheDocument()
    })

    it('renders delete button in action menu for URL blocks', () => {
      const item = createUrlItem()
      const mockOnDelete = vi.fn()
      render(<Block item={item} onDelete={mockOnDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete block/i })
      expect(deleteButton).toBeInTheDocument()
    })

    it('renders delete button in action menu for image blocks', () => {
      const item = createImageItem()
      const mockOnDelete = vi.fn()
      render(<Block item={item} onDelete={mockOnDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete block/i })
      expect(deleteButton).toBeInTheDocument()
    })

    it('renders delete button in action menu for file blocks', () => {
      const item = createFileItem()
      const mockOnDelete = vi.fn()
      render(<Block item={item} onDelete={mockOnDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete block/i })
      expect(deleteButton).toBeInTheDocument()
    })

    it('calls onDelete with item ID when delete button is clicked', () => {
      const item = createTextItem({ id: 'block-to-delete' })
      const mockOnDelete = vi.fn()
      render(<Block item={item} onDelete={mockOnDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete block/i })
      fireEvent.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledWith('block-to-delete')
      expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    it('does not propagate click event when delete button is clicked', () => {
      const item = createTextItem()
      const mockOnDelete = vi.fn()
      const { container } = render(
        <Block item={item} onDelete={mockOnDelete} />
      )

      // Get the inner content div, not the article (which has flex layout now)
      const contentDiv = container.querySelector(
        '[data-testid="block-content"]'
      )
      const clickHandler = vi.fn()
      contentDiv?.addEventListener('click', clickHandler)

      const deleteButton = screen.getByRole('button', { name: /delete block/i })
      fireEvent.click(deleteButton)

      expect(clickHandler).not.toHaveBeenCalled()
      contentDiv?.removeEventListener('click', clickHandler)
    })

    it('block container has group class for hover behavior', () => {
      const item = createTextItem()
      const mockOnDelete = vi.fn()
      const { container } = render(
        <Block item={item} onDelete={mockOnDelete} />
      )

      const block = container.firstChild
      expect(block).toHaveClass('group')
    })

    it('action menu has opacity-0 by default and group-hover:opacity-100', () => {
      const item = createTextItem()
      const mockOnDelete = vi.fn()
      const { container } = render(
        <Block item={item} onDelete={mockOnDelete} />
      )

      const actionMenu = container.querySelector(
        '[data-testid="block-action-menu"]'
      )
      expect(actionMenu).toHaveClass('opacity-0')
      expect(actionMenu).toHaveClass('group-hover:opacity-100')
    })

    it('delete button has accessible label', () => {
      const item = createTextItem()
      const mockOnDelete = vi.fn()
      render(<Block item={item} onDelete={mockOnDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete block/i })
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete block')
    })

    it('delete button uses Trash icon', () => {
      const item = createTextItem()
      const mockOnDelete = vi.fn()
      render(<Block item={item} onDelete={mockOnDelete} />)

      // Trash icon is rendered as an SVG within the button
      const deleteButton = screen.getByRole('button', { name: /delete block/i })
      const svg = deleteButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
