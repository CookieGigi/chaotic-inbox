import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UrlBlockEdit } from './UrlBlockEdit'

describe('UrlBlockEdit', () => {
  it('renders with initial URL', () => {
    render(
      <UrlBlockEdit
        initialUrl="https://example.com"
        onChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    )

    const input = screen.getByTestId('url-block-edit-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('https://example.com')
  })

  it('calls onChange when input value changes', async () => {
    const handleChange = vi.fn()
    render(
      <UrlBlockEdit
        initialUrl="https://example.com"
        onChange={handleChange}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    )

    const input = screen.getByTestId('url-block-edit-input')

    // Use fireEvent to directly change the input value
    fireEvent.change(input, { target: { value: 'new-url.com' } })

    expect(handleChange).toHaveBeenCalledWith('new-url.com')
  })

  it('calls onSubmit when Ctrl+Enter is pressed', async () => {
    const handleSubmit = vi.fn()
    render(
      <UrlBlockEdit
        initialUrl="https://example.com"
        onChange={() => {}}
        onSubmit={handleSubmit}
        onCancel={() => {}}
      />
    )

    const input = screen.getByTestId('url-block-edit-input')
    input.focus()
    await userEvent.keyboard('{Control>}{Enter}{/Control}')

    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Escape is pressed', async () => {
    const handleCancel = vi.fn()
    render(
      <UrlBlockEdit
        initialUrl="https://example.com"
        onChange={() => {}}
        onSubmit={() => {}}
        onCancel={handleCancel}
      />
    )

    const input = screen.getByTestId('url-block-edit-input')
    input.focus()
    await userEvent.keyboard('{Escape}')

    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('auto-focuses on mount', () => {
    render(
      <UrlBlockEdit
        initialUrl="https://example.com"
        onChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    )

    const input = screen.getByTestId('url-block-edit-input')
    expect(input).toHaveFocus()
  })

  it('positions cursor at end of URL on mount', () => {
    const url = 'https://example.com'
    render(
      <UrlBlockEdit
        initialUrl={url}
        onChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    )

    const input = screen.getByTestId('url-block-edit-input') as HTMLInputElement
    expect(input.selectionStart).toBe(url.length)
    expect(input.selectionEnd).toBe(url.length)
  })

  it('uses correct input type', () => {
    render(
      <UrlBlockEdit
        initialUrl="https://example.com"
        onChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    )

    const input = screen.getByTestId('url-block-edit-input')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders with accent text color styling', () => {
    render(
      <UrlBlockEdit
        initialUrl="https://example.com"
        onChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    )

    const input = screen.getByTestId('url-block-edit-input')
    expect(input).toHaveClass('text-accent')
  })
})
