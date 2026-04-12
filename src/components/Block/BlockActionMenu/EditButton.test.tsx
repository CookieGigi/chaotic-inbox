import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditButton } from './EditButton'

describe('EditButton', () => {
  it('renders with correct accessibility attributes', () => {
    render(<EditButton onEdit={() => {}} ariaLabel="Edit text block" />)

    const button = screen.getByRole('button', { name: 'Edit text block' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('uses default aria-label when not provided', () => {
    render(<EditButton onEdit={() => {}} />)

    const button = screen.getByRole('button', { name: 'Edit block' })
    expect(button).toBeInTheDocument()
  })

  it('calls onEdit when clicked', async () => {
    const handleEdit = vi.fn()
    render(<EditButton onEdit={handleEdit} />)

    const button = screen.getByRole('button', { name: 'Edit block' })
    await userEvent.click(button)

    expect(handleEdit).toHaveBeenCalledTimes(1)
  })

  it('prevents event propagation when clicked', async () => {
    const handleEdit = vi.fn()
    const handleParentClick = vi.fn()

    render(
      <button type="button" onClick={handleParentClick}>
        <EditButton onEdit={handleEdit} />
      </button>
    )

    const button = screen.getByRole('button', { name: 'Edit block' })
    await userEvent.click(button)

    expect(handleEdit).toHaveBeenCalledTimes(1)
    expect(handleParentClick).not.toHaveBeenCalled()
  })

  it('can be focused via keyboard', async () => {
    render(<EditButton onEdit={() => {}} />)

    const button = screen.getByRole('button', { name: 'Edit block' })
    button.focus()

    expect(button).toHaveFocus()
  })

  it('triggers onEdit when activated via keyboard', async () => {
    const handleEdit = vi.fn()
    render(<EditButton onEdit={handleEdit} />)

    const button = screen.getByRole('button', { name: 'Edit block' })
    button.focus()
    await userEvent.keyboard('{Enter}')

    expect(handleEdit).toHaveBeenCalledTimes(1)
  })

  it('renders with data-testid when provided', () => {
    render(<EditButton onEdit={() => {}} testId="edit-button" />)

    const button = screen.getByTestId('edit-button')
    expect(button).toBeInTheDocument()
  })

  it('follows design system patterns with proper styling classes', () => {
    render(<EditButton onEdit={() => {}} />)

    const button = screen.getByRole('button', { name: 'Edit block' })
    expect(button).toHaveClass('w-8', 'h-8', 'rounded-lg')
    expect(button).toHaveClass('text-text-faint')
    expect(button).toHaveClass('hover:text-accent', 'hover:bg-surface-hover')
    expect(button).toHaveClass('focus-visible:ring-accent')
  })
})
