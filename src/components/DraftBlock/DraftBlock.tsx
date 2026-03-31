import { useEffect, useRef } from 'react'
import { ArticleIcon } from '@phosphor-icons/react'
import { TextBlockEdit } from '@/components/TextBlock/TextBlockEdit'
import { Timestamp } from '@/components/Timestamp'
import type { DraftTextItem } from '@/hooks/useGlobalTyping'
import type { ISO8601Timestamp } from '@/types/branded'

export interface DraftBlockProps {
  /** The draft item to render */
  draft: DraftTextItem
  /** Callback when content changes */
  onChange: (content: string) => void
  /** Callback when user submits */
  onSubmit: () => void
  /** Callback when user cancels */
  onCancel: () => void
}

/**
 * Draft block component for in-progress text capture
 *
 * Features:
 * - Visual styling distinguishes draft from read-only blocks
 * - Shows hint text below textarea (Ctrl+Enter to save, Escape to cancel)
 * - Auto-scrolls into view on mount
 * - Uses draft-specific colors and focus states
 */
export function DraftBlock({
  draft,
  onChange,
  onSubmit,
  onCancel,
}: DraftBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null)

  // Scroll into view on mount
  useEffect(() => {
    if (blockRef.current) {
      blockRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [])

  return (
    <article
      ref={blockRef}
      data-testid="draft-block"
      className="bg-[rgba(30,32,48,0.3)] border border-[rgba(139,213,202,0.5)] rounded-sm py-3 px-4 focus-within:border-[#8bd5ca] focus-within:shadow-[0_0_0_2px_rgba(139,213,202,0.2)]"
    >
      {/* Header - Same layout as read-only blocks */}
      <header
        className="flex items-baseline justify-between mb-2"
        data-testid="draft-block-header"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ArticleIcon
            size={16}
            weight="regular"
            className="text-text-muted flex-shrink-0"
          />
          <span className="text-label text-text-muted font-medium">Draft</span>
        </div>
        <Timestamp value={draft.capturedAt as ISO8601Timestamp} />
      </header>

      {/* Content - Editable textarea */}
      <div data-testid="draft-block-content" className="mb-2">
        <TextBlockEdit
          initialContent={draft.content}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>

      {/* Hint text */}
      <div data-testid="draft-block-hint" className="text-hint text-[#939ab7]">
        <span className="sr-only">Keyboard shortcuts:</span>
        Ctrl+Enter to save, Escape to cancel
      </div>
    </article>
  )
}
