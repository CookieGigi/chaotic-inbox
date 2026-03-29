import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextBlockEdit } from './TextBlockEdit'

describe('TextBlockEdit', () => {
  const mockOnChange = vi.fn()
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with initial content', () => {
    render(
      <TextBlockEdit
        initialContent="Hello World"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByTestId('text-block-edit-textarea')
    expect(textarea).toHaveValue('Hello World')
  })

  it('calls onChange when content changes', () => {
    render(
      <TextBlockEdit
        initialContent=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByTestId('text-block-edit-textarea')
    fireEvent.change(textarea, { target: { value: 'New content' } })

    expect(mockOnChange).toHaveBeenCalledWith('New content')
  })

  it('calls onSubmit when Ctrl+Enter is pressed', () => {
    render(
      <TextBlockEdit
        initialContent="Test content"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByTestId('text-block-edit-textarea')
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('calls onCancel when Escape is pressed', () => {
    render(
      <TextBlockEdit
        initialContent="Test content"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByTestId('text-block-edit-textarea')
    fireEvent.keyDown(textarea, { key: 'Escape' })

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('does not call onSubmit when only Enter is pressed', () => {
    render(
      <TextBlockEdit
        initialContent="Test content"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByTestId('text-block-edit-textarea')
    fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('auto-focuses on mount', () => {
    render(
      <TextBlockEdit
        initialContent="Test content"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByTestId('text-block-edit-textarea')
    expect(document.activeElement).toBe(textarea)
  })

  it('has correct styling classes', () => {
    render(
      <TextBlockEdit
        initialContent="Test content"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByTestId('text-block-edit-textarea')
    expect(textarea).toHaveClass(
      'w-full',
      'bg-transparent',
      'border-0',
      'text-base',
      'text-text'
    )
  })
})
