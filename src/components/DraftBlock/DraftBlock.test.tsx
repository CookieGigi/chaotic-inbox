import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DraftBlock } from './DraftBlock'
import type { DraftTextItem } from '@/hooks/useGlobalTyping'

describe('DraftBlock', () => {
  const mockDraft: DraftTextItem = {
    id: 'draft',
    type: 'text',
    content: 'Initial draft content',
    capturedAt: '2024-01-01T00:00:00.000Z',
  }

  const mockOnChange = vi.fn()
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  // Store original scrollIntoView
  let originalScrollIntoView: typeof Element.prototype.scrollIntoView

  beforeEach(() => {
    vi.clearAllMocks()
    // Store original before mocking
    originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView
  })

  afterEach(() => {
    // Restore original after each test
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView
  })

  describe('rendering', () => {
    it('renders with draft styling classes', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const draftBlock = screen.getByTestId('draft-block')
      expect(draftBlock).toBeInTheDocument()
      // Check for draft-specific background styling
      expect(draftBlock).toHaveClass('bg-[rgba(30,32,48,0.3)]')
      // Check for draft-specific border styling
      expect(draftBlock).toHaveClass('border')
      expect(draftBlock).toHaveClass('border-[rgba(139,213,202,0.5)]')
      // Check for rounded corners
      expect(draftBlock).toHaveClass('rounded-sm')
      // Check for padding
      expect(draftBlock).toHaveClass('py-3')
      expect(draftBlock).toHaveClass('px-4')
    })

    it('displays hint text below textarea', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const hintElement = screen.getByTestId('draft-block-hint')
      expect(hintElement).toBeInTheDocument()
      expect(hintElement).toHaveTextContent(
        'Ctrl+Enter to save, Escape to cancel'
      )
    })

    it('renders with "Draft" label in header', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const header = screen.getByTestId('draft-block-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveTextContent('Draft')
    })

    it('renders Article icon in header', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const header = screen.getByTestId('draft-block-header')
      const svgIcon = header.querySelector('svg')
      expect(svgIcon).toBeInTheDocument()
    })

    it('renders Timestamp with capturedAt date', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      // Timestamp should be rendered (time element)
      const timeElement = screen
        .getByTestId('draft-block-header')
        .querySelector('time')
      expect(timeElement).toBeInTheDocument()
    })
  })

  describe('focus state', () => {
    it('applies accent border on focus', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const draftBlock = screen.getByTestId('draft-block')
      // Check for focus-within styling classes
      expect(draftBlock).toHaveClass('focus-within:border-[#8bd5ca]')
      expect(draftBlock).toHaveClass(
        'focus-within:shadow-[0_0_0_2px_rgba(139,213,202,0.2)]'
      )
    })

    it('textarea auto-focuses on mount', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const textarea = screen.getByTestId('text-block-edit-textarea')
      expect(document.activeElement).toBe(textarea)
    })
  })

  describe('submission persistence', () => {
    it('calls onSubmit when Ctrl+Enter is pressed', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const textarea = screen.getByTestId('text-block-edit-textarea')
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    it('does not call onSubmit on regular Enter (allows multi-line)', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const textarea = screen.getByTestId('text-block-edit-textarea')
      fireEvent.keyDown(textarea, { key: 'Enter' })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('cancellation', () => {
    it('calls onCancel when Escape is pressed', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const textarea = screen.getByTestId('text-block-edit-textarea')
      fireEvent.keyDown(textarea, { key: 'Escape' })

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('scroll behavior', () => {
    it('scrolls into view on mount', () => {
      const scrollIntoViewMock = vi.fn()
      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'end',
      })
    })
  })

  describe('content editing', () => {
    it('calls onChange when content changes', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const textarea = screen.getByTestId('text-block-edit-textarea')
      fireEvent.change(textarea, { target: { value: 'Updated content' } })

      expect(mockOnChange).toHaveBeenCalledWith('Updated content')
    })

    it('renders with initial draft content', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const textarea = screen.getByTestId('text-block-edit-textarea')
      expect(textarea).toHaveValue('Initial draft content')
    })
  })

  describe('structure', () => {
    it('renders as article element with proper role', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const draftBlock = screen.getByTestId('draft-block')
      expect(draftBlock.tagName).toBe('ARTICLE')
    })

    it('contains header, content, and hint sections', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByTestId('draft-block-header')).toBeInTheDocument()
      expect(screen.getByTestId('draft-block-content')).toBeInTheDocument()
      expect(screen.getByTestId('draft-block-hint')).toBeInTheDocument()
    })

    it('has sr-only text for accessibility', () => {
      render(
        <DraftBlock
          draft={mockDraft}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const srOnlySpan = screen.getByText('Keyboard shortcuts:')
      expect(srOnlySpan).toHaveClass('sr-only')
    })
  })
})
