import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollPosition } from './useScrollPosition'

const STORAGE_KEY = 'vault:scroll-position'
const DEBOUNCE_MS = 150

describe('useScrollPosition', () => {
  let storage: Record<string, string> = {}

  beforeEach(() => {
    storage = {}
    vi.mocked(localStorage.getItem).mockImplementation(
      (key) => storage[key] ?? null
    )
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
      storage[key] = value
    })
    vi.mocked(localStorage.clear).mockImplementation(() => {
      storage = {}
    })
    window.scrollTo(0, 0)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('AC: Scroll position saved when user stops scrolling', () => {
    it('saves scroll position to localStorage after scroll stops (debounced)', () => {
      renderHook(() => useScrollPosition())

      // Simulate scrolling
      act(() => {
        window.scrollY = 500
        window.dispatchEvent(new Event('scroll'))
      })

      // Position should NOT be saved immediately (debounced)
      expect(storage[STORAGE_KEY]).toBeUndefined()

      // Fast-forward past debounce time
      act(() => {
        vi.advanceTimersByTime(DEBOUNCE_MS)
      })

      // Now position should be saved
      expect(storage[STORAGE_KEY]).toBe('500')
    })

    it('resets debounce timer on continuous scrolling', () => {
      renderHook(() => useScrollPosition())

      // First scroll
      act(() => {
        window.scrollY = 100
        window.dispatchEvent(new Event('scroll'))
      })

      // Wait a bit but not full debounce
      act(() => {
        vi.advanceTimersByTime(50)
      })

      // Scroll again (should reset timer)
      act(() => {
        window.scrollY = 200
        window.dispatchEvent(new Event('scroll'))
      })

      // Wait for first debounce to expire (should NOT save)
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(storage[STORAGE_KEY]).toBeUndefined()

      // Wait for second debounce to complete
      act(() => {
        vi.advanceTimersByTime(DEBOUNCE_MS)
      })

      // Should save the second position, not the first
      expect(storage[STORAGE_KEY]).toBe('200')
    })

    it('captures correct scroll position at time of scroll stop', () => {
      renderHook(() => useScrollPosition())

      // Scroll to 100
      act(() => {
        window.scrollY = 100
        window.dispatchEvent(new Event('scroll'))
      })

      act(() => {
        vi.advanceTimersByTime(DEBOUNCE_MS)
      })

      expect(storage[STORAGE_KEY]).toBe('100')

      // Scroll again to 300
      act(() => {
        window.scrollY = 300
        window.dispatchEvent(new Event('scroll'))
      })

      act(() => {
        vi.advanceTimersByTime(DEBOUNCE_MS)
      })

      expect(storage[STORAGE_KEY]).toBe('300')
    })
  })

  describe('AC: Returns saved scroll position for restoration', () => {
    it('returns 0 when no saved position exists (first launch)', () => {
      const { result } = renderHook(() => useScrollPosition())

      expect(result.current.savedScrollPosition).toBe(0)
    })

    it('returns saved position from localStorage on mount', () => {
      storage[STORAGE_KEY] = '750'

      const { result } = renderHook(() => useScrollPosition())

      expect(result.current.savedScrollPosition).toBe(750)
    })

    it('updates savedScrollPosition when localStorage changes', () => {
      const { result } = renderHook(() => useScrollPosition())

      // Initially 0
      expect(result.current.savedScrollPosition).toBe(0)

      // Simulate a scroll that saves position
      act(() => {
        window.scrollY = 500
        window.dispatchEvent(new Event('scroll'))
        vi.advanceTimersByTime(DEBOUNCE_MS)
      })

      // Should update to the new position
      expect(result.current.savedScrollPosition).toBe(500)
    })
  })

  describe('cleanup', () => {
    it('removes scroll event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useScrollPosition())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })

    it('clears pending debounce timer on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')

      const { unmount } = renderHook(() => useScrollPosition())

      // Start a scroll
      act(() => {
        window.scrollY = 500
        window.dispatchEvent(new Event('scroll'))
      })

      // Unmount before debounce completes
      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
    })
  })

  describe('edge cases', () => {
    it('handles scroll position of 0 correctly', () => {
      storage[STORAGE_KEY] = '0'

      const { result } = renderHook(() => useScrollPosition())

      expect(result.current.savedScrollPosition).toBe(0)
    })

    it('handles very large scroll positions', () => {
      storage[STORAGE_KEY] = '50000'

      const { result } = renderHook(() => useScrollPosition())

      expect(result.current.savedScrollPosition).toBe(50000)
    })

    it('handles corrupted localStorage gracefully', () => {
      storage[STORAGE_KEY] = 'not-a-number'

      const { result } = renderHook(() => useScrollPosition())

      // Should default to 0 for invalid values
      expect(result.current.savedScrollPosition).toBe(0)
    })

    it('does not save position when scroll position is 0', () => {
      renderHook(() => useScrollPosition())

      act(() => {
        window.scrollY = 0
        window.dispatchEvent(new Event('scroll'))
        vi.advanceTimersByTime(DEBOUNCE_MS)
      })

      // Should not save 0 position to avoid overwriting useful position
      expect(storage[STORAGE_KEY]).toBeUndefined()
    })
  })
})
