import { useEffect, useRef } from 'react'
import type { RawItem } from '@/models/rawItem'
import { Block } from '@/components/Block'

export interface FeedProps {
  items: RawItem[]
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

export function Feed({ items }: FeedProps) {
  const newestItemRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to newest item on mount and when items change
  useEffect(() => {
    if (newestItemRef.current && items.length > 0) {
      newestItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [items])

  const sortedItems = sortByCaptureTime(items)

  // Empty state
  if (items.length === 0) {
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
            ref={index === sortedItems.length - 1 ? newestItemRef : undefined}
          >
            <Block item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}
