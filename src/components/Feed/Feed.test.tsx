import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { RawItem } from '@/models/rawItem'
import { Feed } from './Feed'

// Mock the Block component to simplify testing
vi.mock('@/components/Block', () => ({
  Block: ({ item }: { item: RawItem }) => (
    <div data-testid="block" data-item-id={item.id} data-item-type={item.type}>
      {typeof item.raw === 'string' ? item.raw : 'blob-content'}
    </div>
  ),
}))

// Mock scrollIntoView for scroll testing
const mockScrollIntoView = vi.fn()
const mockScrollTo = vi.fn()

beforeAll(() => {
  // Replace the setup.ts mock with our spyable mock
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    writable: true,
    configurable: true,
    value: mockScrollIntoView,
  })

  // Mock window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    configurable: true,
    value: mockScrollTo,
  })
})

// Test data factories
const createTextItem = (
  id: string,
  capturedAt: string,
  content: string
): RawItem & { type: 'text' } => ({
  id,
  type: 'text',
  capturedAt: capturedAt as RawItem['capturedAt'],
  raw: content,
  metadata: {
    kind: 'plain',
    wordCount: content.split(' ').length,
  },
})

const createUrlItem = (
  id: string,
  capturedAt: string,
  url: string
): RawItem & { type: 'url' } => ({
  id,
  type: 'url',
  capturedAt: capturedAt as RawItem['capturedAt'],
  raw: url,
  metadata: {
    kind: 'url',
  },
  title: new URL(url).hostname,
})

describe('Feed', () => {
  const mockOnDeleteItem = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockScrollIntoView.mockClear()
    mockScrollTo.mockClear()
    mockOnDeleteItem.mockClear()
  })

  describe('AC: Items in chronological order (oldest top, newest bottom)', () => {
    it('renders items sorted by capturedAt ascending', () => {
      const items: RawItem[] = [
        createTextItem(
          'item-3',
          '2026-03-27T14:00:00.000Z',
          'Third item (newest)'
        ),
        createTextItem(
          'item-1',
          '2026-03-27T10:00:00.000Z',
          'First item (oldest)'
        ),
        createTextItem('item-2', '2026-03-27T12:00:00.000Z', 'Second item'),
      ]

      render(<Feed items={items} onDeleteItem={mockOnDeleteItem} />)

      const blocks = screen.getAllByTestId('block')
      expect(blocks).toHaveLength(3)

      // Should be sorted: item-1 (oldest), item-2, item-3 (newest)
      expect(blocks[0]).toHaveAttribute('data-item-id', 'item-1')
      expect(blocks[1]).toHaveAttribute('data-item-id', 'item-2')
      expect(blocks[2]).toHaveAttribute('data-item-id', 'item-3')
    })

    it('renders single item correctly', () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'Only item'),
      ]

      render(<Feed items={items} onDeleteItem={mockOnDeleteItem} />)

      const blocks = screen.getAllByTestId('block')
      expect(blocks).toHaveLength(1)
      expect(blocks[0]).toHaveAttribute('data-item-id', 'item-1')
    })
  })

  describe('AC: Auto-scroll to newest item on mount and updates', () => {
    it('scrolls to newest item on initial mount', async () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'First'),
        createTextItem('item-2', '2026-03-27T11:00:00.000Z', 'Second'),
      ]

      render(<Feed items={items} onDeleteItem={mockOnDeleteItem} />)

      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalled()
      })
    })

    it('scrolls to newest item when items prop changes', async () => {
      const initialItems: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'First'),
      ]

      const { rerender } = render(
        <Feed items={initialItems} onDeleteItem={mockOnDeleteItem} />
      )

      // Wait for initial scroll
      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalled()
      })

      mockScrollIntoView.mockClear()

      // Add a new item
      const updatedItems: RawItem[] = [
        ...initialItems,
        createTextItem('item-2', '2026-03-27T11:00:00.000Z', 'Second'),
      ]

      rerender(<Feed items={updatedItems} onDeleteItem={mockOnDeleteItem} />)

      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalled()
      })
    })
  })

  describe('AC: Empty state with prompt', () => {
    it('displays empty state when no items', () => {
      render(<Feed items={[]} onDeleteItem={mockOnDeleteItem} />)

      expect(
        screen.getByText(
          'Start by pasting text, URLs, images, or dropping files'
        )
      ).toBeInTheDocument()
    })

    it('does not display empty state when items exist', () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'Content'),
      ]

      render(<Feed items={items} onDeleteItem={mockOnDeleteItem} />)

      expect(
        screen.queryByText(
          'Start by pasting text, URLs, images, or dropping files'
        )
      ).not.toBeInTheDocument()
    })

    it('does not render blocks in empty state', () => {
      render(<Feed items={[]} onDeleteItem={mockOnDeleteItem} />)

      expect(screen.queryByTestId('block')).not.toBeInTheDocument()
    })
  })

  describe('AC: Renders correct number of Block components', () => {
    it('renders one Block per item', () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'Text item'),
        createUrlItem(
          'item-2',
          '2026-03-27T11:00:00.000Z',
          'https://example.com'
        ),
        createTextItem('item-3', '2026-03-27T12:00:00.000Z', 'Another text'),
      ]

      render(<Feed items={items} onDeleteItem={mockOnDeleteItem} />)

      const blocks = screen.getAllByTestId('block')
      expect(blocks).toHaveLength(3)
    })

    it('renders mixed item types correctly', () => {
      const items: RawItem[] = [
        createTextItem('text-1', '2026-03-27T10:00:00.000Z', 'Text content'),
        createUrlItem(
          'url-1',
          '2026-03-27T11:00:00.000Z',
          'https://example.com'
        ),
      ]

      render(<Feed items={items} onDeleteItem={mockOnDeleteItem} />)

      const blocks = screen.getAllByTestId('block')
      expect(blocks[0]).toHaveAttribute('data-item-type', 'text')
      expect(blocks[1]).toHaveAttribute('data-item-type', 'url')
    })
  })

  describe('Design System Compliance', () => {
    it('has correct container layout (max-width, centered)', () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'Content'),
      ]

      const { container } = render(
        <Feed items={items} onDeleteItem={mockOnDeleteItem} />
      )

      const feedContainer = container.querySelector('[data-testid="feed"]')
      expect(feedContainer).toHaveClass('max-w-[720px]')
      expect(feedContainer).toHaveClass('mx-auto')
    })

    it('has correct horizontal padding (16px)', () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'Content'),
      ]

      const { container } = render(
        <Feed items={items} onDeleteItem={mockOnDeleteItem} />
      )

      const feedContainer = container.querySelector('[data-testid="feed"]')
      expect(feedContainer).toHaveClass('px-4')
    })

    it('has correct vertical padding (24px)', () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'Content'),
      ]

      const { container } = render(
        <Feed items={items} onDeleteItem={mockOnDeleteItem} />
      )

      const feedContainer = container.querySelector('[data-testid="feed"]')
      expect(feedContainer).toHaveClass('py-6')
    })

    it('uses 1px dividers between blocks', () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'First'),
        createTextItem('item-2', '2026-03-27T11:00:00.000Z', 'Second'),
      ]

      const { container } = render(
        <Feed items={items} onDeleteItem={mockOnDeleteItem} />
      )

      const listElement = container.querySelector('[data-testid="feed-list"]')
      expect(listElement).toHaveClass('divide-y')
      expect(listElement).toHaveClass('divide-border')
    })

    it('empty state uses correct text styling', () => {
      render(<Feed items={[]} onDeleteItem={mockOnDeleteItem} />)

      const emptyMessage = screen.getByText(
        'Start by pasting text, URLs, images, or dropping files'
      )
      expect(emptyMessage).toHaveClass('text-base')
      expect(emptyMessage).toHaveClass('text-text-faint')
      expect(emptyMessage).toHaveClass('text-center')
    })

    it('empty state is vertically and horizontally centered', () => {
      const { container } = render(
        <Feed items={[]} onDeleteItem={mockOnDeleteItem} />
      )

      const emptyContainer = container.querySelector(
        '[data-testid="feed-empty"]'
      )
      expect(emptyContainer).toHaveClass('flex')
      expect(emptyContainer).toHaveClass('items-center')
      expect(emptyContainer).toHaveClass('justify-center')
    })
  })

  describe('Accessibility', () => {
    it('feed has aria-label for screen readers', () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'Content'),
      ]

      const { container } = render(
        <Feed items={items} onDeleteItem={mockOnDeleteItem} />
      )

      const feedContainer = container.querySelector('[data-testid="feed"]')
      expect(feedContainer).toHaveAttribute('aria-label', 'Chronological feed')
    })

    it('empty state has appropriate aria-live for dynamic content', () => {
      const { container } = render(
        <Feed items={[]} onDeleteItem={mockOnDeleteItem} />
      )

      const emptyContainer = container.querySelector(
        '[data-testid="feed-empty"]'
      )
      expect(emptyContainer).toHaveAttribute('aria-live', 'polite')
    })

    it('feed list has role="feed" for semantic structure', () => {
      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'Content'),
      ]

      const { container } = render(
        <Feed items={items} onDeleteItem={mockOnDeleteItem} />
      )

      const listElement = container.querySelector('[data-testid="feed-list"]')
      expect(listElement).toHaveAttribute('role', 'feed')
    })
  })

  describe('AC: Scroll position restoration on mount', () => {
    it('restores saved scroll position on mount', async () => {
      // Mock localStorage to have a saved position
      const localStorageMock: Record<string, string> = {
        'vault:scroll-position': '500',
      }
      vi.mocked(localStorage.getItem).mockImplementation(
        (key) => localStorageMock[key] ?? null
      )

      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'First'),
        createTextItem('item-2', '2026-03-27T11:00:00.000Z', 'Second'),
      ]

      render(<Feed items={items} onDeleteItem={mockOnDeleteItem} />)

      await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalledWith({
          top: 500,
          behavior: 'instant',
        })
      })
    })

    it('scrolls to bottom when no saved position exists (first launch)', async () => {
      // Mock localStorage to have no saved position
      vi.mocked(localStorage.getItem).mockImplementation(() => null)

      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'First'),
        createTextItem('item-2', '2026-03-27T11:00:00.000Z', 'Second'),
      ]

      render(<Feed items={items} onDeleteItem={mockOnDeleteItem} />)

      await waitFor(() => {
        // Should scroll to newest item instead of restoring position
        expect(mockScrollIntoView).toHaveBeenCalled()
      })

      // Should NOT call scrollTo (position restoration)
      expect(mockScrollTo).not.toHaveBeenCalled()
    })
  })

  describe('AC: Auto-scroll to newest on new items', () => {
    it('scrolls to newest item when items are added after mount', async () => {
      // No saved position
      vi.mocked(localStorage.getItem).mockImplementation(() => null)

      const initialItems: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'First'),
      ]

      const { rerender } = render(
        <Feed items={initialItems} onDeleteItem={mockOnDeleteItem} />
      )

      // Wait for initial mount scroll
      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalled()
      })

      mockScrollIntoView.mockClear()

      // Add a new item
      const updatedItems: RawItem[] = [
        ...initialItems,
        createTextItem('item-2', '2026-03-27T11:00:00.000Z', 'Second'),
      ]

      rerender(<Feed items={updatedItems} onDeleteItem={mockOnDeleteItem} />)

      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalled()
      })
    })

    it.skip('does not scroll when draft item is active on mount', async () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => null)

      // Use a fresh mock spy for this test only
      const freshScrollIntoViewSpy = vi.fn()
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        writable: true,
        configurable: true,
        value: freshScrollIntoViewSpy,
      })
      const freshScrollToSpy = vi.fn()
      Object.defineProperty(window, 'scrollTo', {
        writable: true,
        configurable: true,
        value: freshScrollToSpy,
      })

      const items: RawItem[] = [
        createTextItem('item-1', '2026-03-27T10:00:00.000Z', 'First'),
      ]

      const draftItem = {
        id: 'draft' as const,
        type: 'text' as const,
        content: 'Draft content',
        capturedAt: new Date().toISOString(),
      }

      render(
        <Feed
          items={items}
          draftItem={draftItem}
          onDeleteItem={mockOnDeleteItem}
        />
      )

      // Should not auto-scroll when draft is active
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(freshScrollIntoViewSpy).not.toHaveBeenCalled()
      expect(freshScrollToSpy).not.toHaveBeenCalled()
    })
  })
})
