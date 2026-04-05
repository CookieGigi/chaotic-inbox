import { useEffect, useRef } from 'react'
import { useScrollPosition } from './useScrollPosition'

export interface UseFeedScrollOptions {
  /** Current number of items in the feed */
  itemsLength: number
  /** Whether a draft item exists (suppresses auto-scroll) */
  draftItemExists: boolean
}

export interface UseFeedScrollReturn {
  /** Ref to attach to the newest item element for scrolling */
  newestItemRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Hook for managing feed scroll behavior.
 *
 * Features:
 * - Disables browser's native scroll restoration
 * - Restores saved scroll position on mount (if available)
 * - Auto-scrolls to newest item on initial mount (if no saved position)
 * - Auto-scrolls to newest item when new items are added
 * - Suppresses auto-scroll when draft item is active
 *
 * This hook coordinates with useScrollPosition to persist and restore
 * scroll position across page reloads.
 */
export function useFeedScroll({
  itemsLength,
  draftItemExists,
}: UseFeedScrollOptions): UseFeedScrollReturn {
  const newestItemRef = useRef<HTMLDivElement>(null)
  const hasDoneInitialScroll = useRef(false)
  const previousItemsLength = useRef(itemsLength)

  // Use scroll position hook for persistence
  const { savedScrollPosition } = useScrollPosition()

  // Disable browser's native scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // Initial mount: restore scroll position or scroll to bottom
  useEffect(() => {
    if (hasDoneInitialScroll.current || draftItemExists) {
      return
    }

    previousItemsLength.current = itemsLength

    if (itemsLength === 0) {
      return
    }

    hasDoneInitialScroll.current = true

    // Restore saved position if available, otherwise scroll to bottom
    if (savedScrollPosition > 0) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedScrollPosition, behavior: 'instant' })
      })
    } else {
      // First launch or no saved position - scroll to newest item
      if (newestItemRef.current) {
        newestItemRef.current.scrollIntoView({
          behavior: 'auto',
          block: 'end',
        })
      }
    }
  }, [savedScrollPosition, itemsLength, draftItemExists])

  // Handle new items added after mount
  useEffect(() => {
    if (!hasDoneInitialScroll.current || draftItemExists) {
      return
    }

    // Only scroll if items were added (length increased)
    if (itemsLength > previousItemsLength.current) {
      previousItemsLength.current = itemsLength

      if (newestItemRef.current) {
        newestItemRef.current.scrollIntoView({
          behavior: 'auto',
          block: 'end',
        })
      }
    } else {
      previousItemsLength.current = itemsLength
    }
  }, [itemsLength, draftItemExists])

  return {
    newestItemRef,
  }
}
