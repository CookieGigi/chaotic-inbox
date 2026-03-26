import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImageBlock } from './ImageBlock'

describe('ImageBlock', () => {
  describe('rendering', () => {
    it('renders image with provided src', () => {
      render(<ImageBlock src="data:image/png;base64,abc123" />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('constrains image to parent container width', () => {
      render(<ImageBlock src="test.png" />)
      const img = screen.getByRole('img')
      expect(img).toHaveClass('max-w-full')
      expect(img).toHaveClass('h-auto')
    })

    it('applies alt text when provided', () => {
      render(<ImageBlock src="test.png" alt="Screenshot" />)
      expect(screen.getByAltText('Screenshot')).toBeInTheDocument()
    })

    it('has no header (handled by Block)', () => {
      const { container } = render(<ImageBlock src="test.png" />)
      expect(container.querySelector('header')).not.toBeInTheDocument()
    })

    it('has no footer', () => {
      const { container } = render(<ImageBlock src="test.png" />)
      expect(container.querySelector('footer')).not.toBeInTheDocument()
    })
  })

  describe('design system compliance', () => {
    it('uses rounded corners per design system', () => {
      render(<ImageBlock src="test.png" />)
      expect(screen.getByRole('img')).toHaveClass('rounded')
    })

    it('maintains aspect ratio', () => {
      render(<ImageBlock src="test.png" width={1920} height={1080} />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('width', '1920')
      expect(img).toHaveAttribute('height', '1080')
    })

    it('has responsive height', () => {
      render(<ImageBlock src="test.png" />)
      expect(screen.getByRole('img')).toHaveClass('h-auto')
    })
  })

  describe('edge cases', () => {
    it('handles missing src gracefully', () => {
      render(<ImageBlock src="" />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('handles broken image source', () => {
      render(<ImageBlock src="invalid" alt="Broken" />)
      expect(screen.getByRole('img')).toHaveAttribute('src', 'invalid')
    })

    it('renders without alt when not provided', () => {
      render(<ImageBlock src="test.png" />)
      const img = screen.getByRole('img')
      expect(img).not.toHaveAttribute('alt')
    })
  })
})
