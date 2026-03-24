import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UrlBlock } from './UrlBlock'

describe('UrlBlock', () => {
  describe('rendering', () => {
    it('renders hostname as muted label', () => {
      render(<UrlBlock url="example.com" />)

      expect(screen.getByText('example.com')).toBeInTheDocument()
    })

    it('renders full URL as body text', () => {
      render(<UrlBlock url="example.com" />)

      expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })

    it('renders link icon in hostname label', () => {
      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('strips www from hostname label', () => {
      render(<UrlBlock url="www.example.com" />)

      expect(screen.getByText('example.com')).toBeInTheDocument()
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

    it('shows hostname without path in label', () => {
      render(<UrlBlock url="https://example.com/path/to/page" />)

      // Hostname label should not include path
      const hostnameLabel = screen.getByText('example.com')
      expect(hostnameLabel).toBeInTheDocument()
    })

    it('handles empty URL gracefully', () => {
      render(<UrlBlock url="" />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('displays invalid URL as-is when parsing fails', () => {
      render(<UrlBlock url="not-a-valid-url" />)

      expect(screen.getByText('not-a-valid-url')).toBeInTheDocument()
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
    it('has aria-label with hostname', () => {
      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Open link: example.com')
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

    it('icon has aria-hidden attribute', () => {
      render(<UrlBlock url="example.com" />)

      const icon = screen.getByRole('button').querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('styling', () => {
    it('hostname label has muted color', () => {
      render(<UrlBlock url="example.com" />)

      const hostnameText = screen.getByText('example.com')
      const hostnameLabel = hostnameText.parentElement
      expect(hostnameLabel).toHaveClass('text-textSecondary')
    })

    it('hostname label uses small text size', () => {
      render(<UrlBlock url="example.com" />)

      const hostnameText = screen.getByText('example.com')
      const hostnameLabel = hostnameText.parentElement
      expect(hostnameLabel).toHaveClass('text-sm')
    })

    it('full URL body has accent color', () => {
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

    it('uses vertical flex column layout', () => {
      render(<UrlBlock url="example.com" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('flex-col')
    })
  })

  describe('edge cases', () => {
    it('handles URL with port in hostname label', () => {
      render(<UrlBlock url="https://example.com:8080/path" />)

      // Hostname includes port
      expect(screen.getByText('example.com:8080')).toBeInTheDocument()
    })

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

      expect(screen.getByText('blog.example.com')).toBeInTheDocument()
      expect(screen.getByText('https://blog.example.com')).toBeInTheDocument()
    })

    it('handles complex nested paths', () => {
      render(
        <UrlBlock url="https://deep.nested.subdomain.example.com/a/b/c/d" />
      )

      expect(
        screen.getByText('deep.nested.subdomain.example.com')
      ).toBeInTheDocument()
      expect(
        screen.getByText('https://deep.nested.subdomain.example.com/a/b/c/d')
      ).toBeInTheDocument()
    })

    it('handles URL with both query and hash', () => {
      render(<UrlBlock url="https://example.com/page?id=123#section" />)

      expect(screen.getByText('example.com')).toBeInTheDocument()
      expect(
        screen.getByText('https://example.com/page?id=123#section')
      ).toBeInTheDocument()
    })
  })
})
