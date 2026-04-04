import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { isInputElement } from '@/utils'

// Re-export DraftTextItem from store for backward compatibility
export type { DraftTextItem } from '@/store/appStore'

/**
 * Hook options for useGlobalTyping
 */
interface UseGlobalTypingOptions {
  /** Whether typing capture is disabled (e.g., during drag overlay) */
  disabled?: boolean
}

/**
 * Hook return type
 */
interface UseGlobalTypingReturn {
  /** Current draft item or null */
  draftItem: import('@/store/appStore').DraftTextItem | null
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
 *
 * Uses Zustand store for state management.
 */
export function useGlobalTyping(
  options: UseGlobalTypingOptions = {}
): UseGlobalTypingReturn {
  const { disabled = false } = options

  // Subscribe to store state and actions
  const draftItem = useAppStore((state) => state.draftItem)
  const createDraft = useAppStore((state) => state.createDraft)
  const appendToDraft = useAppStore((state) => state.appendToDraft)
  const updateDraft = useAppStore((state) => state.updateDraft)
  const submitDraft = useAppStore((state) => state.submitDraft)
  const cancelDraft = useAppStore((state) => state.cancelDraft)

  const hasDraft = draftItem !== null

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
        appendToDraft(key)
      } else {
        // Create new draft with this character
        createDraft(key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [disabled, hasDraft, createDraft, appendToDraft])

  return {
    draftItem,
    createDraft,
    updateDraft,
    submitDraft,
    cancelDraft,
    hasDraft,
  }
}
