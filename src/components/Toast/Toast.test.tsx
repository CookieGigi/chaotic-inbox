import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Toast } from './Toast'
import { ToastContainer } from './ToastContainer'
import {
  useToastStore,
  showError,
  showWarning,
  showInfo,
  showSuccess,
} from '@/store/toastStore'

describe('Toast Component', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    useToastStore.getState().clearAll()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Toast rendering', () => {
    it('renders error toast with correct styling', () => {
      render(<Toast id="test-1" message="Error message" type="error" />)

      const toast = screen.getByTestId('toast')
      expect(toast).toBeInTheDocument()
      expect(toast).toHaveAttribute('data-toast-type', 'error')
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('renders warning toast with correct styling', () => {
      render(<Toast id="test-1" message="Warning message" type="warning" />)

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('data-toast-type', 'warning')
    })

    it('renders info toast with correct styling', () => {
      render(<Toast id="test-1" message="Info message" type="info" />)

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('data-toast-type', 'info')
    })

    it('renders success toast with correct styling', () => {
      render(<Toast id="test-1" message="Success message" type="success" />)

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('data-toast-type', 'success')
    })
  })

  describe('Toast dismissal', () => {
    it('dismisses toast when clicking the dismiss button', () => {
      render(
        <>
          <ToastContainer />
        </>
      )

      // Add a toast
      act(() => {
        showError('Test error')
      })

      // Toast should be visible
      expect(screen.getByText('Test error')).toBeInTheDocument()

      // Click dismiss button
      const dismissButton = screen.getByTestId('toast-dismiss')
      fireEvent.click(dismissButton)

      // Toast should be removed
      expect(screen.queryByText('Test error')).not.toBeInTheDocument()
    })

    it('auto-dismisses toast after duration', async () => {
      render(<ToastContainer />)

      // Add a toast with 1 second duration
      act(() => {
        showError('Auto dismiss test', 1000)
      })

      // Toast should be visible initially
      expect(screen.getByText('Auto dismiss test')).toBeInTheDocument()

      // Advance timers by 1 second
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Toast should be removed
      await waitFor(() => {
        expect(screen.queryByText('Auto dismiss test')).not.toBeInTheDocument()
      })
    })

    it('does not auto-dismiss when duration is 0', async () => {
      render(<ToastContainer />)

      // Add a toast with 0 duration (no auto-dismiss)
      act(() => {
        showError('Persistent toast', 0)
      })

      // Toast should be visible
      expect(screen.getByText('Persistent toast')).toBeInTheDocument()

      // Advance timers
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Toast should still be visible
      expect(screen.getByText('Persistent toast')).toBeInTheDocument()
    })
  })

  describe('ToastContainer', () => {
    it('renders nothing when no toasts exist', () => {
      render(<ToastContainer />)

      expect(screen.queryByTestId('toast-container')).not.toBeInTheDocument()
    })

    it('renders multiple toasts stacked', () => {
      render(<ToastContainer />)

      act(() => {
        showError('First error')
        showWarning('Second warning')
        showInfo('Third info')
      })

      const container = screen.getByTestId('toast-container')
      expect(container).toBeInTheDocument()

      // All toasts should be visible
      expect(screen.getByText('First error')).toBeInTheDocument()
      expect(screen.getByText('Second warning')).toBeInTheDocument()
      expect(screen.getByText('Third info')).toBeInTheDocument()

      // Should have 3 toast elements
      const toasts = screen.getAllByTestId('toast')
      expect(toasts).toHaveLength(3)
    })

    it('has correct accessibility attributes', () => {
      render(<ToastContainer />)

      act(() => {
        showError('Accessible error')
      })

      const container = screen.getByTestId('toast-container')
      expect(container).toHaveAttribute('aria-label', 'Notifications')

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('role', 'alert')
      expect(toast).toHaveAttribute('aria-live', 'polite')

      const dismissButton = screen.getByTestId('toast-dismiss')
      expect(dismissButton).toHaveAttribute(
        'aria-label',
        'Dismiss notification'
      )
    })
  })

  describe('Toast helper functions', () => {
    it('showError creates an error toast', () => {
      render(<ToastContainer />)

      act(() => {
        showError('Error from helper')
      })

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('data-toast-type', 'error')
      expect(screen.getByText('Error from helper')).toBeInTheDocument()
    })

    it('showWarning creates a warning toast', () => {
      render(<ToastContainer />)

      act(() => {
        showWarning('Warning from helper')
      })

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('data-toast-type', 'warning')
    })

    it('showInfo creates an info toast', () => {
      render(<ToastContainer />)

      act(() => {
        showInfo('Info from helper')
      })

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('data-toast-type', 'info')
    })

    it('showSuccess creates a success toast', () => {
      render(<ToastContainer />)

      act(() => {
        showSuccess('Success from helper')
      })

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('data-toast-type', 'success')
    })
  })

  describe('Toast store', () => {
    it('clearAll removes all toasts', () => {
      render(<ToastContainer />)

      act(() => {
        showError('Error 1')
        showError('Error 2')
        showError('Error 3')
      })

      // Should have 3 toasts
      expect(screen.getAllByTestId('toast')).toHaveLength(3)

      // Clear all
      act(() => {
        useToastStore.getState().clearAll()
      })

      // Should have no toasts
      expect(screen.queryByTestId('toast')).not.toBeInTheDocument()
    })

    it('returns unique IDs for each toast', () => {
      const ids: string[] = []

      act(() => {
        ids.push(showError('First'))
        ids.push(showError('Second'))
        ids.push(showError('Third'))
      })

      // All IDs should be unique
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(3)
    })
  })
})
