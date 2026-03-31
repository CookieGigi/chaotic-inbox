import { useEffect, useRef } from 'react'
import type { RawItem } from '@/models/rawItem'
import { Block } from '@/components/Block'
import { DraftBlock } from '@/components/DraftBlock'
import type { DraftTextItem } from '@/hooks/useGlobalTyping'
import { useScrollPosition } from '@/hooks/useScrollPosition'

export interface FeedProps {
  items: RawItem[]
  /** Optional draft item to render at the bottom */
  draftItem?: DraftTextItem | null
  /** Callback when draft content changes */
  onDraftChange?: (content: string) => void
  /** Callback when draft is submitted */
  onDraftSubmit?: () => void
  /** Callback when draft is cancelled */
  onDraftCancel?: () => void
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

export function Feed({
  items,
  draftItem,
  onDraftChange,
  onDraftSubmit,
  onDraftCancel,
}: FeedProps) {
  const newestItemRef = useRef<HTMLDivElement>(null)
  const hasDoneInitialScroll = useRef(false)
  const previousItemsLength = useRef(items.length)

  // Use scroll position hook for smart scroll behavior
  const {
    savedScrollPosition,
    isFirstLaunch,
    checkForNewItems,
    markAllItemsAsSeen,
  } = useScrollPosition()

  const sortedItems = sortByCaptureTime(items)
  const hasContent = items.length > 0 || !!draftItem

  // Initial mount: apply smart scroll logic
  useEffect(() => {
    if (hasDoneInitialScroll.current) {
      return
    }

    hasDoneInitialScroll.current = true

    if (items.length === 0) {
      return
    }

    const hasNewItems = checkForNewItems(items)

    if (hasNewItems) {
      // New items exist - scroll to newest
      if (newestItemRef.current && !draftItem) {
        newestItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }
      markAllItemsAsSeen(items)
    } else if (!isFirstLaunch && savedScrollPosition > 0) {
      // No new items and we have a saved position - restore it
      window.scrollTo({ top: savedScrollPosition, behavior: 'smooth' })
    } else {
      // First launch or no saved position - scroll to bottom
      if (newestItemRef.current && !draftItem) {
        newestItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }
      markAllItemsAsSeen(items)
    }
  }, []) // Only run on mount

  // Handle new items added after mount
  useEffect(() => {
    if (!hasDoneInitialScroll.current) {
      return
    }

    // Only scroll if items were added (length increased)
    if (items.length > previousItemsLength.current) {
      previousItemsLength.current = items.length

      if (newestItemRef.current && !draftItem) {
        newestItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
        markAllItemsAsSeen(items)
      }
    } else {
      previousItemsLength.current = items.length
    }
  }, [items.length, draftItem, markAllItemsAsSeen])

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
        {draftItem && onDraftChange && onDraftSubmit && onDraftCancel && (
          <DraftBlock
            draft={draftItem}
            onChange={onDraftChange}
            onSubmit={onDraftSubmit}
            onCancel={onDraftCancel}
          />
        )}
      </div>
    </div>
  )
}
