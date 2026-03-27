import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BlockTitle } from './BlockTitle'

describe('BlockTitle', () => {
  describe('Rendering', () => {
    it('renders the title when provided', () => {
      render(<BlockTitle title="Test Title" />)

      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders nothing when title is undefined', () => {
      const { container } = render(<BlockTitle title={undefined} />)

      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when title is empty string', () => {
      const { container } = render(<BlockTitle title="" />)

      // Empty string is falsy, so it should render nothing
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Styling', () => {
    it('has correct CSS classes', () => {
      render(<BlockTitle title="Styled Title" />)

      const title = screen.getByText('Styled Title')
      expect(title).toHaveClass('text-sm')
      expect(title).toHaveClass('text-text-muted')
      expect(title).toHaveClass('font-mono')
      expect(title).toHaveClass('truncate')
    })

    it('has data-testid attribute', () => {
      render(<BlockTitle title="Test" />)

      const title = screen.getByTestId('block-label')
      expect(title).toBeInTheDocument()
    })
  })

  describe('Content variations', () => {
    it('renders long titles with truncation', () => {
      const longTitle =
        'This is a very long title that should demonstrate the truncation behavior when the content exceeds the available space'
      render(<BlockTitle title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('renders filenames correctly', () => {
      render(<BlockTitle title="document.pdf" />)

      expect(screen.getByText('document.pdf')).toBeInTheDocument()
    })

    it('renders URL hostnames correctly', () => {
      render(<BlockTitle title="example.com" />)

      expect(screen.getByText('example.com')).toBeInTheDocument()
    })

    it('renders special characters in titles', () => {
      render(<BlockTitle title="Title with special chars: @#$%^&*()" />)

      expect(
        screen.getByText('Title with special chars: @#$%^&*()')
      ).toBeInTheDocument()
    })
  })
})
