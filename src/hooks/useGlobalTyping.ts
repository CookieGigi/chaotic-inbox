import { useState, useEffect, useCallback, useRef } from 'react'
import { isInputElement } from '@/utils'

/**
 * Draft item type for in-progress text capture
 * Temporary ID, not persisted until submitted
 */
export interface DraftTextItem {
  id: 'draft'
  type: 'text'
  content: string
  capturedAt: string
}

/**
 * Hook options for useGlobalTyping
 */
interface UseGlobalTypingOptions {
  /** Whether typing capture is disabled (e.g., during drag overlay) */
  disabled?: boolean
  /** Called when a new draft should be created */
  onDraftCreate?: (content: string) => void
  /** Called when content should be appended to existing draft */
  onDraftAppend?: (char: string) => void
  /** Whether a draft currently exists */
  hasDraft?: boolean
}

/**
 * Hook return type
 */
interface UseGlobalTypingReturn {
  /** Current draft item or null */
  draftItem: DraftTextItem | null
  /** Create a new draft with initial content */
  createDraft: (initialContent: string) => void
  /** Update draft content */
  updateDraft: (content: string) => void
  /** Submit the draft (clear it) */
  submitDraft: () => void
  /** Cancel the draft (clear it) */
  cancelDraft: () => void
  /** Whether draft currently exists */
  hasDraft: boolean
}

/**
 * Check if drag overlay is active
 */
function isDragOverlayActive(): boolean {
  return document.body.classList.contains('drag-overlay-active')
}

/**
 * Hook to capture global typing and manage draft text items
 *
 * Features:
 * - Detects alphanumeric keys (a-z, A-Z, 0-9) when no input is focused
 * - Creates draft with first keystroke as content
 * - Appends subsequent keystrokes to existing draft
 * - Ignores when inputs are focused or drag overlay is active
 */
export function useGlobalTyping(
  options: UseGlobalTypingOptions = {}
): UseGlobalTypingReturn {
  const {
    disabled = false,
    onDraftCreate,
    onDraftAppend,
    hasDraft: externalHasDraft,
  } = options

  const [draftItem, setDraftItem] = useState<DraftTextItem | null>(null)
  const draftRef = useRef<DraftTextItem | null>(null)

  // Keep ref in sync with state for event handler access
  useEffect(() => {
    draftRef.current = draftItem
  }, [draftItem])

  const createDraft = useCallback(
    (initialContent: string) => {
      const newDraft: DraftTextItem = {
        id: 'draft',
        type: 'text',
        content: initialContent,
        capturedAt: new Date().toISOString(),
      }
      setDraftItem(newDraft)
      onDraftCreate?.(initialContent)
    },
    [onDraftCreate]
  )

  const updateDraft = useCallback((content: string) => {
    if (draftRef.current) {
      setDraftItem({
        ...draftRef.current,
        content,
      })
    }
  }, [])

  const submitDraft = useCallback(() => {
    setDraftItem(null)
  }, [])

  const cancelDraft = useCallback(() => {
    setDraftItem(null)
  }, [])

  // Determine if draft exists (prefer external if provided)
  const hasDraft = externalHasDraft ?? draftItem !== null

  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if drag overlay is active
      if (isDragOverlayActive()) {
        return
      }

      // Skip if any input is focused
      if (isInputElement(document.activeElement)) {
        return
      }

      // Skip if any modifier key is pressed (Ctrl, Alt, Meta)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      // Check if key is alphanumeric (a-z, A-Z, 0-9)
      const key = event.key
      const isAlphanumeric = /^[a-zA-Z0-9]$/.test(key)

      if (!isAlphanumeric) {
        return
      }

      // Prevent default to capture the keystroke
      event.preventDefault()

      if (hasDraft) {
        // Append to existing draft
        onDraftAppend?.(key)
      } else {
        // Create new draft with this character
        createDraft(key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [disabled, hasDraft, createDraft, onDraftAppend])

  return {
    draftItem,
    createDraft,
    updateDraft,
    submitDraft,
    cancelDraft,
    hasDraft,
  }
}
