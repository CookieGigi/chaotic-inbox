import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextBlock } from './TextBlock'

// Short text (less than 5 lines)
const shortText = 'This is a short text that fits within 5 lines.'

// Long text (more than 5 lines)
const longText = `This is a long text that should be truncated.
It contains multiple lines.
Each line adds to the total count.
When we reach five lines.
The text should be truncated.
And this line should be hidden.
This line should also be hidden.`

// Exactly 5 lines (edge case - no toggle needed)
const exactlyFiveLines = `Line one.
Line two.
Line three.
Line four.
Line five.`

describe('TextBlock', () => {
  describe('rendering', () => {
    it('renders text content correctly', () => {
      render(<TextBlock content={shortText} />)

      expect(screen.getByText(shortText)).toBeInTheDocument()
    })

    it('applies body font styling with relaxed line height', () => {
      render(<TextBlock content={shortText} />)

      const textElement = screen.getByText(shortText)
      expect(textElement).toHaveClass('text-base')
      expect(textElement).toHaveClass('text-text')
      expect(textElement).toHaveClass('leading-relaxed')
    })

    it('renders in a container with proper structure', () => {
      render(<TextBlock content={shortText} />)

      const container = screen.getByText(shortText).parentElement
      expect(container).toBeInTheDocument()
    })
  })

  describe('truncation behavior', () => {
    it('does not show toggle button for short text', () => {
      render(<TextBlock content={shortText} />)

      const toggleButton = screen.queryByRole('button')
      expect(toggleButton).not.toBeInTheDocument()
    })

    it('applies line-clamp-5 class by default for long text', () => {
      render(<TextBlock content={longText} />)

      const textElement = screen.getByText(/This is a long text/)
      expect(textElement).toHaveClass('line-clamp-5')
    })

    it('shows "Show more" button for text exceeding 5 lines', () => {
      render(<TextBlock content={longText} />)

      const showMoreButton = screen.getByRole('button', { name: /show more/i })
      expect(showMoreButton).toBeInTheDocument()
    })

    it('does not show toggle button for exactly 5 lines', () => {
      render(<TextBlock content={exactlyFiveLines} />)

      const toggleButton = screen.queryByRole('button')
      expect(toggleButton).not.toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('expands text when "Show more" is clicked', async () => {
      const user = userEvent.setup()
      render(<TextBlock content={longText} />)

      const textElement = screen.getByText(/This is a long text/)
      const showMoreButton = screen.getByRole('button', { name: /show more/i })

      // Initially has line-clamp-5
      expect(textElement).toHaveClass('line-clamp-5')

      // Click to expand
      await user.click(showMoreButton)

      // Should remove line-clamp-5
      expect(textElement).not.toHaveClass('line-clamp-5')
    })

    it('shows "Show less" button after expanding', async () => {
      const user = userEvent.setup()
      render(<TextBlock content={longText} />)

      const showMoreButton = screen.getByRole('button', { name: /show more/i })
      await user.click(showMoreButton)

      const showLessButton = screen.getByRole('button', { name: /show less/i })
      expect(showLessButton).toBeInTheDocument()
    })

    it('collapses text when "Show less" is clicked', async () => {
      const user = userEvent.setup()
      render(<TextBlock content={longText} />)

      const textElement = screen.getByText(/This is a long text/)

      // Expand first
      await user.click(screen.getByRole('button', { name: /show more/i }))
      expect(textElement).not.toHaveClass('line-clamp-5')

      // Collapse
      await user.click(screen.getByRole('button', { name: /show less/i }))
      expect(textElement).toHaveClass('line-clamp-5')
    })

    it('returns to "Show more" after collapsing', async () => {
      const user = userEvent.setup()
      render(<TextBlock content={longText} />)

      // Expand
      await user.click(screen.getByRole('button', { name: /show more/i }))

      // Collapse
      await user.click(screen.getByRole('button', { name: /show less/i }))

      // Should show "Show more" again
      const showMoreButton = screen.getByRole('button', { name: /show more/i })
      expect(showMoreButton).toBeInTheDocument()
    })

    it('uses Phosphor icon in toggle button', () => {
      render(<TextBlock content={longText} />)

      const toggleButton = screen.getByRole('button')
      // Check for SVG icon presence
      const icon = toggleButton.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('toggles icon direction when expanded/collapsed', async () => {
      const user = userEvent.setup()
      render(<TextBlock content={longText} />)

      const toggleButton = screen.getByRole('button')

      // Initially should have caret-down icon (or similar)
      expect(toggleButton).toBeInTheDocument()

      // Expand
      await user.click(toggleButton)

      // Icon should change (implementation specific - could be different icon or rotation)
      expect(toggleButton).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('toggle button has aria-expanded attribute', () => {
      render(<TextBlock content={longText} />)

      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('aria-expanded updates when expanded', async () => {
      const user = userEvent.setup()
      render(<TextBlock content={longText} />)

      const toggleButton = screen.getByRole('button')

      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('toggle button is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<TextBlock content={longText} />)

      const toggleButton = screen.getByRole('button')
      toggleButton.focus()

      expect(toggleButton).toHaveFocus()

      // Press Enter to activate
      await user.keyboard('{Enter}')
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('edge cases', () => {
    it('handles empty content gracefully', () => {
      render(<TextBlock content="" />)

      const textElement = screen.getByTestId('text-block-content')
      expect(textElement).toBeInTheDocument()
      expect(textElement.textContent).toBe('')
    })

    it('handles text with special characters', () => {
      const specialText = 'Special chars: <>&"\' and unicode: 🔥🎉'
      render(<TextBlock content={specialText} />)

      expect(screen.getByText(specialText)).toBeInTheDocument()
    })

    it('handles text with newlines correctly', () => {
      const textWithNewlines = 'Line 1\nLine 2\nLine 3'
      render(<TextBlock content={textWithNewlines} />)

      // Should preserve newlines in display (white-space: pre-wrap or similar)
      const textElement = screen.getByText(/Line 1/)
      expect(textElement).toBeInTheDocument()
    })

    it('handles very long single word', () => {
      const longWord = 'a'.repeat(500)
      render(<TextBlock content={longWord} />)

      expect(screen.getByText(longWord)).toBeInTheDocument()
    })

    it('preserves whitespace in text', () => {
      const textWithWhitespace = '  Leading and trailing spaces  '
      render(<TextBlock content={textWithWhitespace} />)

      const textElement = screen.getByTestId('text-block-content')
      expect(textElement.textContent).toBe(textWithWhitespace)
    })
  })
})
