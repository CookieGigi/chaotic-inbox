import { useState, useEffect, useCallback, useRef } from 'react'
import type { RawItem } from '@/models/rawItem'

const STORAGE_KEY_POSITION = 'vault:scroll-position'
const STORAGE_KEY_LAST_SEEN = 'vault:last-seen-item-id'
const STORAGE_KEY_HAS_CAPTURED = 'vault:has-captured-before'

const THROTTLE_MS = 500

interface UseScrollPositionReturn {
  /** Current saved scroll position from localStorage */
  savedScrollPosition: number
  /** Whether this is the first launch (no captured items before) */
  isFirstLaunch: boolean
  /** Check if there are new items since last seen */
  checkForNewItems: (items: RawItem[]) => boolean
  /** Mark all items as seen (updates lastSeenItemId) */
  markAllItemsAsSeen: (items: RawItem[]) => void
}

function getSavedScrollPosition(): number {
  const saved = localStorage.getItem(STORAGE_KEY_POSITION)
  return saved ? parseInt(saved, 10) : 0
}

function getIsFirstLaunch(): boolean {
  return localStorage.getItem(STORAGE_KEY_HAS_CAPTURED) !== 'true'
}

/**
 * Hook for managing scroll position persistence and new item detection.
 *
 * Features:
 * - Saves window scroll position to localStorage (throttled)
 * - Restores saved scroll position on load
 * - Detects new items by comparing capturedAt timestamps
 * - Tracks first launch state
 */
export function useScrollPosition(): UseScrollPositionReturn {
  // Read initial values from localStorage using lazy initializer
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(
    getSavedScrollPosition
  )
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(getIsFirstLaunch)

  // Refs for throttle mechanism
  const lastScrollTime = useRef<number>(0)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Check if there are new items since the last seen item.
   * Compares by capturedAt timestamp.
   */
  const checkForNewItems = useCallback((items: RawItem[]): boolean => {
    if (items.length === 0) {
      return false
    }

    const lastSeenId = localStorage.getItem(STORAGE_KEY_LAST_SEEN)
    if (!lastSeenId) {
      // No last seen item means all items are new
      return true
    }

    // Find the last seen item
    const lastSeenItem = items.find((item) => item.id === lastSeenId)
    if (!lastSeenItem) {
      // Last seen item not in current items (shouldn't happen normally)
      // Treat as new items to be safe
      return true
    }

    const lastSeenTime = new Date(lastSeenItem.capturedAt).getTime()

    // Check if any item is newer than last seen
    return items.some((item) => {
      const itemTime = new Date(item.capturedAt).getTime()
      return itemTime > lastSeenTime
    })
  }, [])

  /**
   * Mark all items as seen by saving the newest item's ID.
   */
  const markAllItemsAsSeen = useCallback((items: RawItem[]) => {
    if (items.length === 0) {
      return
    }

    // Find the newest item by capturedAt
    const newestItem = items.reduce((newest, item) => {
      const itemTime = new Date(item.capturedAt).getTime()
      const newestTime = new Date(newest.capturedAt).getTime()
      return itemTime > newestTime ? item : newest
    })

    localStorage.setItem(STORAGE_KEY_LAST_SEEN, String(newestItem.id))
    localStorage.setItem(STORAGE_KEY_HAS_CAPTURED, 'true')
    setIsFirstLaunch(false)
  }, [])

  /**
   * Throttled scroll handler - saves scroll position every 500ms
   */
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now()
      const elapsed = now - lastScrollTime.current

      if (elapsed >= THROTTLE_MS) {
        // Save immediately if throttle period has passed
        lastScrollTime.current = now
        const scrollY = window.scrollY
        localStorage.setItem(STORAGE_KEY_POSITION, String(scrollY))
        setSavedScrollPosition(scrollY)
      } else {
        // Schedule a save after the throttle period
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
        scrollTimeoutRef.current = setTimeout(() => {
          lastScrollTime.current = Date.now()
          const scrollY = window.scrollY
          localStorage.setItem(STORAGE_KEY_POSITION, String(scrollY))
          setSavedScrollPosition(scrollY)
        }, THROTTLE_MS - elapsed)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return {
    savedScrollPosition,
    isFirstLaunch,
    checkForNewItems,
    markAllItemsAsSeen,
  }
}
