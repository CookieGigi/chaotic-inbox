import { useEffect, useRef, useCallback } from 'react'

export interface TextBlockEditProps {
  /** Initial content for the textarea */
  initialContent: string
  /** Callback when content changes */
  onChange: (content: string) => void
  /** Callback when user submits (Ctrl+Enter) */
  onSubmit: () => void
  /** Callback when user cancels (Escape) */
  onCancel: () => void
}

/**
 * Editable variant of TextBlock using a textarea
 *
 * Features:
 * - Multi-line editing (Enter creates newlines)
 * - Auto-expands vertically based on content
 * - Ctrl+Enter submits the draft
 * - Escape cancels the draft
 * - Auto-focuses on mount with cursor at end
 */
export function TextBlockEdit({
  initialContent,
  onChange,
  onSubmit,
  onCancel,
}: TextBlockEditProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on mount and position cursor at end
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.focus()
      // Position cursor at end of content
      textarea.setSelectionRange(initialContent.length, initialContent.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault()
        onSubmit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [onSubmit, onCancel]
  )

  return (
    <textarea
      ref={textareaRef}
      value={initialContent}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      data-testid="text-block-edit-textarea"
      className="w-full bg-transparent border-0 text-base text-text resize-none outline-none p-0 leading-relaxed min-h-[1.6em]"
      style={{
        height: 'auto',
        overflow: 'hidden',
      }}
      onInput={(e) => {
        const target = e.target as HTMLTextAreaElement
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
      }}
    />
  )
}
