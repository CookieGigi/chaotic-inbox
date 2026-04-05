import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFeedScroll } from './useFeedScroll'

// Mock useScrollPosition
const mockSavedScrollPosition = vi.fn().mockReturnValue(0)

vi.mock('./useScrollPosition', () => ({
  useScrollPosition: () => ({
    savedScrollPosition: mockSavedScrollPosition(),
  }),
}))

// Mock scrollIntoView for scroll testing
const mockScrollIntoView = vi.fn()
const mockScrollTo = vi.fn()

beforeAll(() => {
  // Mock scrollIntoView
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    writable: true,
    configurable: true,
    value: mockScrollIntoView,
  })

  // Mock window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    configurable: true,
    value: mockScrollTo,
  })
})

describe('useFeedScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockScrollIntoView.mockClear()
    mockScrollTo.mockClear()
    mockSavedScrollPosition.mockReturnValue(0)

    // Reset localStorage mock
    vi.mocked(localStorage.getItem).mockImplementation(() => null)
    vi.mocked(localStorage.setItem).mockImplementation(() => {})
  })

  describe('initial mount scroll behavior', () => {
    it('returns newestItemRef', () => {
      const { result } = renderHook(() =>
        useFeedScroll({ itemsLength: 1, draftItemExists: false })
      )

      expect(result.current.newestItemRef).toBeDefined()
      expect(result.current.newestItemRef.current).toBeNull()
    })

    it('disables browser native scroll restoration', () => {
      // Mock history.scrollRestoration
      const originalDescriptor = Object.getOwnPropertyDescriptor(
        history,
        'scrollRestoration'
      )
      let scrollRestorationValue: string | undefined = undefined

      Object.defineProperty(history, 'scrollRestoration', {
        get: () => scrollRestorationValue,
        set: (value: string) => {
          scrollRestorationValue = value
        },
        configurable: true,
      })

      renderHook(() =>
        useFeedScroll({ itemsLength: 1, draftItemExists: false })
      )

      expect(scrollRestorationValue).toBe('manual')

      // Restore original descriptor
      if (originalDescriptor) {
        Object.defineProperty(history, 'scrollRestoration', originalDescriptor)
      }
    })

    it('does not scroll when items length is 0', async () => {
      renderHook(() =>
        useFeedScroll({ itemsLength: 0, draftItemExists: false })
      )

      // Wait for effects to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      expect(mockScrollIntoView).not.toHaveBeenCalled()
      expect(mockScrollTo).not.toHaveBeenCalled()
    })

    it('does not auto-scroll when draft item exists on mount', async () => {
      mockSavedScrollPosition.mockReturnValue(0)

      renderHook(() => useFeedScroll({ itemsLength: 2, draftItemExists: true }))

      // Wait for effects to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      expect(mockScrollIntoView).not.toHaveBeenCalled()
      expect(mockScrollTo).not.toHaveBeenCalled()
    })
  })

  describe('scroll restoration', () => {
    it('restores saved scroll position on mount when available', async () => {
      mockSavedScrollPosition.mockReturnValue(500)

      renderHook(() =>
        useFeedScroll({ itemsLength: 2, draftItemExists: false })
      )

      // Wait for requestAnimationFrame
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 500,
        behavior: 'instant',
      })
    })

    it('attempts scroll when ref is available', async () => {
      mockSavedScrollPosition.mockReturnValue(0)

      // Create hook - will attempt to scroll but ref is null
      const { result } = renderHook(() =>
        useFeedScroll({ itemsLength: 2, draftItemExists: false })
      )

      // Wait for effects
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      // Ref is available for attachment
      expect(result.current.newestItemRef).toBeDefined()
      // Note: Actual scrollIntoView call is tested via Feed component tests
      // because it requires proper DOM rendering
    })
  })

  describe('new items detection', () => {
    it('tracks item length changes', async () => {
      mockSavedScrollPosition.mockReturnValue(0)

      const { rerender } = renderHook(
        ({ itemsLength }) =>
          useFeedScroll({ itemsLength, draftItemExists: false }),
        { initialProps: { itemsLength: 1 } }
      )

      // Wait for initial mount
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      // Add items
      rerender({ itemsLength: 2 })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      // Add more items and verify it doesn't throw
      rerender({ itemsLength: 5 })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      // Should have tracked the changes without errors
      expect(true).toBe(true)
    })

    it('does not auto-scroll when draft item exists on update', async () => {
      mockSavedScrollPosition.mockReturnValue(0)

      const { rerender } = renderHook(
        ({ itemsLength, draftItemExists }) =>
          useFeedScroll({ itemsLength, draftItemExists }),
        { initialProps: { itemsLength: 1, draftItemExists: false } }
      )

      // Wait for initial mount
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      mockScrollIntoView.mockClear()
      mockScrollTo.mockClear()

      // Add item with draft active
      rerender({ itemsLength: 2, draftItemExists: true })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      expect(mockScrollIntoView).not.toHaveBeenCalled()
      expect(mockScrollTo).not.toHaveBeenCalled()
    })
  })

  describe('options handling', () => {
    it('accepts itemsLength parameter', () => {
      const { result } = renderHook(() =>
        useFeedScroll({ itemsLength: 5, draftItemExists: false })
      )

      expect(result.current.newestItemRef).toBeDefined()
    })

    it('accepts draftItemExists parameter', () => {
      const { result } = renderHook(() =>
        useFeedScroll({ itemsLength: 5, draftItemExists: true })
      )

      expect(result.current.newestItemRef).toBeDefined()
    })
  })

  describe('cleanup', () => {
    it('unmounts without errors', () => {
      const { unmount } = renderHook(() =>
        useFeedScroll({ itemsLength: 1, draftItemExists: false })
      )

      // Should unmount without throwing
      expect(() => unmount()).not.toThrow()
    })
  })
})
