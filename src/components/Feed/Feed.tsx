import { useTranslation } from 'react-i18next'
import type { RawItem } from '@/models/rawItem'
import { Block } from '@/components/Block'
import { DraftBlock } from '@/components/DraftBlock'
import type { DraftTextItem } from '@/store/appStore'
import { useFeedScroll } from '@/hooks/useFeedScroll'

export interface FeedProps {
  items: RawItem[]
  /** Optional draft item to render at the bottom */
  draftItem?: DraftTextItem | null
  /** Callback when an item should be deleted */
  onDeleteItem: (id: string) => void
  /** Callback when an item should be updated */
  onUpdateItem?: (id: string, updates: Partial<RawItem>) => Promise<void>
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
  onDeleteItem,
  onUpdateItem,
}: FeedProps) {
  const { t } = useTranslation()

  // Use feed scroll hook for all scroll orchestration
  const { newestItemRef } = useFeedScroll({
    itemsLength: items.length,
    draftItemExists: !!draftItem,
  })

  const sortedItems = sortByCaptureTime(items)

  const hasContent = items.length > 0 || !!draftItem

  // Empty state - only show when no items AND no draft
  if (!hasContent) {
    return (
      <div
        data-testid="feed"
        aria-label={t('feed.ariaLabel')}
        className="max-w-[720px] mx-auto px-4 py-6 min-h-[200px]"
      >
        <div
          data-testid="feed-empty"
          aria-live="polite"
          className="flex items-center justify-center h-full min-h-[200px]"
        >
          <p className="text-base text-text-faint text-center">
            {t('feed.empty.message')}
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
        aria-label={t('feed.listAriaLabel')}
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
            <Block
              item={item}
              onDelete={onDeleteItem}
              onUpdate={onUpdateItem}
            />
          </div>
        ))}

        {/* Draft block at the bottom */}
        {draftItem && <DraftBlock draft={draftItem} />}
      </div>
    </div>
  )
}
