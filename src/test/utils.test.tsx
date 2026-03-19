import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@test/utils'

describe('Test Utilities', () => {
  describe('renderWithProviders', () => {
    it('renders with ErrorBoundary and StrictMode by default', () => {
      const TestComponent = () => <div data-testid="test">Test Content</div>

      renderWithProviders(<TestComponent />)

      expect(screen.getByTestId('test')).toBeInTheDocument()
    })

    it('can disable ErrorBoundary', () => {
      const ErrorComponent = () => {
        throw new Error('Test error')
      }

      // With ErrorBoundary disabled, error should propagate
      expect(() => {
        renderWithProviders(<ErrorComponent />, {
          providers: { errorBoundary: false },
        })
      }).toThrow('Test error')
    })

    it('catches errors when ErrorBoundary is enabled', () => {
      const ErrorComponent = () => {
        throw new Error('Test error')
      }

      // Suppress console.error for this test to avoid React error noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        // With ErrorBoundary enabled, error is caught
        expect(() => {
          renderWithProviders(<ErrorComponent />)
        }).not.toThrow()

        // ErrorBoundary renders fallback UI
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      } finally {
        consoleSpy.mockRestore()
      }
    })
  })

  describe('userEvent', () => {
    it('simulates user interactions', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      const TestButton = () => (
        <button type="button" onClick={handleClick}>
          Click me
        </button>
      )

      renderWithProviders(<TestButton />)

      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('simulates typing', async () => {
      const user = userEvent.setup()

      const TestInput = () => <input type="text" placeholder="Enter text" />

      renderWithProviders(<TestInput />)

      const input = screen.getByPlaceholderText('Enter text')
      await user.type(input, 'Hello World')

      expect(input).toHaveValue('Hello World')
    })
  })

  describe('waitFor', () => {
    it('waits for async operations', async () => {
      const AsyncComponent = () => {
        const [content, setContent] = React.useState('Loading...')

        React.useEffect(() => {
          const timer = setTimeout(() => {
            setContent('Loaded!')
          }, 100)
          return () => clearTimeout(timer)
        }, [])

        return <div>{content}</div>
      }

      renderWithProviders(<AsyncComponent />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Loaded!')).toBeInTheDocument()
      })
    })
  })

  describe('browser API mocks', () => {
    it('has matchMedia mock available', () => {
      expect(window.matchMedia).toBeDefined()
      expect(typeof window.matchMedia).toBe('function')

      const mql = window.matchMedia('(min-width: 768px)')
      expect(mql.matches).toBe(false)
    })

    it('has localStorage mock available', () => {
      expect(window.localStorage).toBeDefined()

      window.localStorage.setItem('test-key', 'test-value')
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        'test-value'
      )
    })

    it('has IntersectionObserver mock available', () => {
      expect(window.IntersectionObserver).toBeDefined()

      const observer = new window.IntersectionObserver(() => {})
      expect(observer.observe).toBeDefined()
      expect(typeof observer.observe).toBe('function')
    })
  })
})
