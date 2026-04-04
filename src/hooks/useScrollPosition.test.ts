import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollPosition } from './useScrollPosition'

const STORAGE_KEY = 'vault:scroll-position'

describe('useScrollPosition', () => {
  let storage: Record<string, string> = {}
  let visibilityChangeHandler: (() => void) | null = null
  let beforeUnloadHandler: (() => void) | null = null
  let pageHideHandler: (() => void) | null = null

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

    // Mock event listeners
    vi.spyOn(document, 'addEventListener').mockImplementation(
      (event, handler) => {
        if (event === 'visibilitychange') {
          visibilityChangeHandler = handler as () => void
        }
      }
    )
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (event, handler) => {
        if (event === 'beforeunload') {
          beforeUnloadHandler = handler as () => void
        }
        if (event === 'pagehide') {
          pageHideHandler = handler as () => void
        }
      }
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    visibilityChangeHandler = null
    beforeUnloadHandler = null
    pageHideHandler = null
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
  })

  describe('AC: Saves scroll position on page events', () => {
    it('saves scroll position on beforeunload event', () => {
      renderHook(() => useScrollPosition())

      // Simulate scroll
      window.scrollY = 500

      // Trigger beforeunload
      act(() => {
        beforeUnloadHandler?.()
      })

      expect(storage[STORAGE_KEY]).toBe('500')
    })

    it('saves scroll position on pagehide event', () => {
      renderHook(() => useScrollPosition())

      // Simulate scroll
      window.scrollY = 600

      // Trigger pagehide
      act(() => {
        pageHideHandler?.()
      })

      expect(storage[STORAGE_KEY]).toBe('600')
    })

    it('saves scroll position on visibilitychange when hidden', () => {
      renderHook(() => useScrollPosition())

      // Simulate scroll
      window.scrollY = 700

      // Simulate page being hidden
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
        configurable: true,
      })

      // Trigger visibilitychange
      act(() => {
        visibilityChangeHandler?.()
      })

      expect(storage[STORAGE_KEY]).toBe('700')
    })

    it('does not save on visibilitychange when visible', () => {
      storage[STORAGE_KEY] = '1000'
      renderHook(() => useScrollPosition())

      // Simulate scroll
      window.scrollY = 800

      // Simulate page being visible
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
        configurable: true,
      })

      // Trigger visibilitychange
      act(() => {
        visibilityChangeHandler?.()
      })

      // Should not save when visible
      expect(storage[STORAGE_KEY]).toBe('1000')
    })

    it('does not save position 0 to avoid overwriting useful positions', () => {
      storage[STORAGE_KEY] = '1000'
      renderHook(() => useScrollPosition())

      // At scroll position 0
      window.scrollY = 0

      // Trigger save
      act(() => {
        beforeUnloadHandler?.()
      })

      // Should not overwrite with 0
      expect(storage[STORAGE_KEY]).toBe('1000')
    })
  })

  describe('edge cases', () => {
    it('handles scroll position of 0 correctly when reading', () => {
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
  })
})
