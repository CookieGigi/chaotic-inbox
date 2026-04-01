import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY_POSITION = 'vault:scroll-position'
const DEBOUNCE_MS = 150

interface UseScrollPositionReturn {
  /** Current saved scroll position from localStorage */
  savedScrollPosition: number
}

function getSavedScrollPosition(): number {
  const saved = localStorage.getItem(STORAGE_KEY_POSITION)
  if (!saved) return 0
  const parsed = parseInt(saved, 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Hook for managing scroll position persistence.
 *
 * Features:
 * - Saves window scroll position to localStorage when user stops scrolling (debounced)
 * - Returns saved scroll position for restoration
 */
export function useScrollPosition(): UseScrollPositionReturn {
  // Read initial value from localStorage using lazy initializer
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(
    getSavedScrollPosition
  )

  // Ref for debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced scroll handler - saves scroll position when user stops scrolling
  useEffect(() => {
    const handleScroll = () => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new timer to save after debounce period
      debounceTimerRef.current = setTimeout(() => {
        const scrollY = window.scrollY

        // Only save non-zero positions to avoid overwriting useful positions
        if (scrollY > 0) {
          localStorage.setItem(STORAGE_KEY_POSITION, String(scrollY))
          setSavedScrollPosition(scrollY)
        }
      }, DEBOUNCE_MS)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    savedScrollPosition,
  }
}
