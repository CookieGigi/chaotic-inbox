import { useState, useEffect } from 'react'

const STORAGE_KEY_POSITION = 'vault:scroll-position'

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

function saveScrollPositionToStorage() {
  const scrollY = window.scrollY
  if (scrollY > 0) {
    localStorage.setItem(STORAGE_KEY_POSITION, String(scrollY))
  }
}

/**
 * Hook for managing scroll position persistence.
 *
 * Features:
 * - Saves window scroll position to localStorage when page is hidden/unloaded
 * - Returns saved scroll position for restoration
 * - No continuous scroll listening (avoids race conditions)
 */
export function useScrollPosition(): UseScrollPositionReturn {
  // Read initial value from localStorage using lazy initializer
  const [savedScrollPosition] = useState<number>(getSavedScrollPosition)

  // Save scroll position on page hide/visibility change
  useEffect(() => {
    // Save when page is hidden (user switches tabs, closes browser, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveScrollPositionToStorage()
      }
    }

    // Save when page is about to unload (user closes window, navigates away)
    const handleBeforeUnload = () => {
      saveScrollPositionToStorage()
    }

    // Save when page is hidden (more reliable on mobile)
    const handlePageHide = () => {
      saveScrollPositionToStorage()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [])

  return {
    savedScrollPosition,
  }
}
