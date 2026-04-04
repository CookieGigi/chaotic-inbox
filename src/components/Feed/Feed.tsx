import { useEffect, useRef } from 'react'
import type { RawItem } from '@/models/rawItem'
import { Block } from '@/components/Block'
import { DraftBlock } from '@/components/DraftBlock'
import type { DraftTextItem } from '@/store/appStore'
import { useScrollPosition } from '@/hooks/useScrollPosition'

export interface FeedProps {
  items: RawItem[]
  /** Optional draft item to render at the bottom */
  draftItem?: DraftTextItem | null
}

/**
 * Sorts items by capturedAt timestamp in ascending order (oldest first)
 */
function sortByCaptureTime(items: RawItem[]): RawItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
  )
}

export function Feed({ items, draftItem }: FeedProps) {
  const newestItemRef = useRef<HTMLDivElement>(null)
  const hasDoneInitialScroll = useRef(false)
  const previousItemsLength = useRef(items.length)

  // Use scroll position hook for persistence
  const { savedScrollPosition } = useScrollPosition()

  const sortedItems = sortByCaptureTime(items)

  // Disable browser's native scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // Initial mount: restore scroll position or scroll to bottom
  useEffect(() => {
    if (hasDoneInitialScroll.current || draftItem) {
      return
    }

    previousItemsLength.current = items.length

    if (items.length === 0) {
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
  }, [savedScrollPosition, items.length, draftItem])

  // Handle new items added after mount
  useEffect(() => {
    if (!hasDoneInitialScroll.current || draftItem) {
      return
    }

    // Only scroll if items were added (length increased)
    if (items.length > previousItemsLength.current) {
      previousItemsLength.current = items.length

      if (newestItemRef.current) {
        newestItemRef.current.scrollIntoView({
          behavior: 'auto',
          block: 'end',
        })
      }
    } else {
      previousItemsLength.current = items.length
    }
  }, [items.length, draftItem])

  const hasContent = items.length > 0 || !!draftItem

  // Empty state - only show when no items AND no draft
  if (!hasContent) {
    return (
      <div
        data-testid="feed"
        aria-label="Chronological feed"
        className="max-w-[720px] mx-auto px-4 py-6 min-h-[200px]"
      >
        <div
          data-testid="feed-empty"
          aria-live="polite"
          className="flex items-center justify-center h-full min-h-[200px]"
        >
          <p className="text-base text-text-faint text-center">
            Start by pasting text, URLs, images, or dropping files
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid="feed"
      aria-label="Chronological feed"
      className="max-w-[720px] mx-auto px-4 py-6"
    >
      <div
        data-testid="feed-list"
        role="feed"
        aria-label="Items in chronological order"
        className="divide-y divide-border"
      >
        {sortedItems.map((item, index) => (
          <div
            key={item.id.toString()}
            ref={
              index === sortedItems.length - 1 && !draftItem
                ? newestItemRef
                : undefined
            }
          >
            <Block item={item} />
          </div>
        ))}

        {/* Draft block at the bottom */}
        {draftItem && <DraftBlock draft={draftItem} />}
      </div>
    </div>
  )
}
