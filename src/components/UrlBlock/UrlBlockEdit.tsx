import { useEffect, useRef, useCallback } from 'react'

export interface UrlBlockEditProps {
  /** Initial URL for the input */
  initialUrl: string
  /** Callback when URL changes */
  onChange: (url: string) => void
  /** Callback when user submits (Ctrl+Enter) */
  onSubmit: () => void
  /** Callback when user cancels (Escape) */
  onCancel: () => void
}

/**
 * Editable variant of UrlBlock using an input field
 *
 * Features:
 * - Single-line editing
 * - Ctrl+Enter submits the edit
 * - Escape cancels the edit
 * - Auto-focuses on mount with cursor at end
 */
export function UrlBlockEdit({
  initialUrl,
  onChange,
  onSubmit,
  onCancel,
}: UrlBlockEditProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount and position cursor at end
  useEffect(() => {
    const input = inputRef.current
    if (input) {
      input.focus()
      // Position cursor at end of URL
      input.setSelectionRange(initialUrl.length, initialUrl.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    <input
      ref={inputRef}
      type="text"
      value={initialUrl}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      data-testid="url-block-edit-input"
      className="w-full bg-transparent border-0 text-base text-accent resize-none outline-none p-0 leading-relaxed"
    />
  )
}
