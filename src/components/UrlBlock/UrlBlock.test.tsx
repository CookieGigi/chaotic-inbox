import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UrlBlock } from './UrlBlock'

describe('UrlBlock', () => {
  describe('rendering', () => {
    it('renders full URL as body text', () => {
      render(<UrlBlock url="example.com" />)

      expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })

    it('shows full URL with https protocol in body', () => {
      render(<UrlBlock url="example.com" />)

      // The full normalized URL should be displayed
      expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })

    it('preserves full URL with path in body', () => {
      render(<UrlBlock url="https://example.com/path/to/page" />)

      expect(
        screen.getByText('https://example.com/path/to/page')
      ).toBeInTheDocument()
    })

    it('handles empty URL gracefully', () => {
      render(<UrlBlock url="" />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('normalizes invalid URL by adding https prefix', () => {
      render(<UrlBlock url="not-a-valid-url" />)

      expect(screen.getByText('https://not-a-valid-url')).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('is clickable as a button', () => {
      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('opens link in new tab when clicked', async () => {
      const user = userEvent.setup()
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(openSpy).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
        'noopener,noreferrer'
      )

      openSpy.mockRestore()
    })

    it('preserves https protocol when opening', async () => {
      const user = userEvent.setup()
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(<UrlBlock url="https://example.com" />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(openSpy).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
        'noopener,noreferrer'
      )

      openSpy.mockRestore()
    })

    it('adds https protocol to urls without protocol', async () => {
      const user = userEvent.setup()
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(<UrlBlock url="www.example.com/path" />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(openSpy).toHaveBeenCalledWith(
        'https://www.example.com/path',
        '_blank',
        'noopener,noreferrer'
      )

      openSpy.mockRestore()
    })

    it('preserves http protocol when specified', async () => {
      const user = userEvent.setup()
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(<UrlBlock url="http://example.com" />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(openSpy).toHaveBeenCalledWith(
        'http://example.com',
        '_blank',
        'noopener,noreferrer'
      )

      openSpy.mockRestore()
    })
  })

  describe('accessibility', () => {
    it('has aria-label with full URL', () => {
      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute(
        'aria-label',
        'Open link: https://example.com'
      )
    })

    it('is keyboard accessible', async () => {
      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      button.focus()

      expect(button).toHaveFocus()
    })

    it('has focus styles', () => {
      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:ring-2')
      expect(button).toHaveClass('focus-visible:ring-accent')
    })
  })

  describe('styling', () => {
    it('button has cursor pointer', () => {
      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('cursor-pointer')
    })

    it('full URL body uses accent color', () => {
      render(<UrlBlock url="example.com" />)

      const fullUrl = screen.getByText('https://example.com')
      expect(fullUrl).toHaveClass('text-accent')
    })

    it('full URL body uses base text size', () => {
      render(<UrlBlock url="example.com" />)

      const fullUrl = screen.getByText('https://example.com')
      expect(fullUrl).toHaveClass('text-base')
    })

    it('full URL has hover underline effect', () => {
      render(<UrlBlock url="example.com" />)

      const fullUrl = screen.getByText('https://example.com')
      expect(fullUrl).toHaveClass('hover:underline')
    })

    it('allows long URLs to break', () => {
      render(<UrlBlock url="https://example.com/very/long/path/to/page" />)

      const fullUrl = screen.getByText(
        'https://example.com/very/long/path/to/page'
      )
      expect(fullUrl).toHaveClass('break-all')
    })

    it('has hover background effect', () => {
      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-surface/50')
    })
  })

  describe('edge cases', () => {
    it('handles URL with port in full URL body', () => {
      render(<UrlBlock url="https://example.com:8080/path" />)

      expect(
        screen.getByText('https://example.com:8080/path')
      ).toBeInTheDocument()
    })

    it('handles URL with hash fragment in full URL', () => {
      render(<UrlBlock url="https://example.com/page#section" />)

      expect(
        screen.getByText('https://example.com/page#section')
      ).toBeInTheDocument()
    })

    it('handles URL with query string in full URL', () => {
      render(<UrlBlock url="https://example.com?query=value" />)

      expect(
        screen.getByText('https://example.com?query=value')
      ).toBeInTheDocument()
    })

    it('handles subdomain URLs', () => {
      render(<UrlBlock url="blog.example.com" />)

      expect(screen.getByText('https://blog.example.com')).toBeInTheDocument()
    })

    it('handles complex nested paths', () => {
      render(
        <UrlBlock url="https://deep.nested.subdomain.example.com/a/b/c/d" />
      )

      expect(
        screen.getByText('https://deep.nested.subdomain.example.com/a/b/c/d')
      ).toBeInTheDocument()
    })

    it('handles URL with both query and hash', () => {
      render(<UrlBlock url="https://example.com/page?id=123#section" />)

      expect(
        screen.getByText('https://example.com/page?id=123#section')
      ).toBeInTheDocument()
    })
  })
})
