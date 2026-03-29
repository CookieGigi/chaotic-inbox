import { useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { RawItem } from '@/models/rawItem'
import { isInputElement } from '@/utils'

/**
 * Hook options for useGlobalPaste
 */
interface UseGlobalPasteOptions {
  /** Whether paste capture is disabled */
  disabled?: boolean
  /** Whether a draft currently exists */
  hasDraft?: boolean
  /** Current draft content (for appending paste to draft) */
  draftContent?: string
  /** Called when text should be appended to existing draft */
  onPasteToDraft?: (content: string) => void
  /** Called when new items should be created from paste */
  onPasteItems?: (items: RawItem[]) => void
}

/**
 * Hook return type
 */
interface UseGlobalPasteReturn {
  /** Whether a paste operation is in progress */
  isPasting: boolean
}

/**
 * Check if drag overlay is active
 */
function isDragOverlayActive(): boolean {
  return document.body.classList.contains('drag-overlay-active')
}

/**
 * Check if text is a valid URL
 */
function isValidUrl(text: string): boolean {
  return /^https?:\/\/.+/.test(text.trim())
}

/**
 * Extract hostname from URL for display
 */
function extractHostname(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * Hook to capture global paste events and create items
 *
 * Features:
 * - Detects paste events anywhere in the app
 * - Handles text, URLs, and images from clipboard
 * - Supports multiple items in single paste
 * - Appends to draft if active and only text pasted
 * - Ignores when inputs are focused or drag overlay is active
 * - Silently ignores empty or unsupported clipboard
 */
export function useGlobalPaste(
  options: UseGlobalPasteOptions = {}
): UseGlobalPasteReturn {
  const {
    disabled = false,
    hasDraft = false,
    onPasteToDraft,
    onPasteItems,
  } = options

  const isPastingRef = useRef(false)

  /**
   * Process a text string and create appropriate item
   */
  const processText = useCallback((text: string): RawItem | null => {
    const trimmedText = text.trim()
    if (!trimmedText) return null

    if (isValidUrl(trimmedText)) {
      // URL item
      return {
        id: uuidv4() as RawItem['id'],
        type: 'url',
        raw: trimmedText,
        capturedAt: new Date().toISOString() as RawItem['capturedAt'],
        metadata: { kind: 'url' as const },
        title: extractHostname(trimmedText),
      }
    } else {
      // Text item
      return {
        id: uuidv4() as RawItem['id'],
        type: 'text',
        raw: trimmedText,
        capturedAt: new Date().toISOString() as RawItem['capturedAt'],
        metadata: { kind: 'plain' as const },
      }
    }
  }, [])

  /**
   * Process an image blob and create image item
   */
  const processImage = useCallback((blob: Blob): RawItem | null => {
    return {
      id: uuidv4() as RawItem['id'],
      type: 'image',
      raw: blob,
      capturedAt: new Date().toISOString() as RawItem['capturedAt'],
      metadata: { kind: 'image' as const },
    }
  }, [])

  useEffect(() => {
    if (disabled) return

    const handlePaste = async (event: ClipboardEvent) => {
      // Skip if drag overlay is active
      if (isDragOverlayActive()) {
        return
      }

      // Skip if any input is focused (TASK-4)
      if (isInputElement(document.activeElement)) {
        return
      }

      // Prevent default to stop browser from handling paste
      event.preventDefault()

      const clipboardData = event.clipboardData
      if (!clipboardData) return

      isPastingRef.current = true

      try {
        const newItems: RawItem[] = []
        let textContent = ''
        let hasImage = false

        // Process all items in clipboard (multiple support)
        const items = clipboardData.items

        for (let i = 0; i < items.length; i++) {
          const item = items[i]

          // Skip if item is undefined or doesn't have type
          if (!item?.type) {
            continue
          }

          if (item.type.startsWith('image/')) {
            // Handle image paste (TASK-3)
            const file = item.getAsFile()
            if (file) {
              const imageItem = processImage(file)
              if (imageItem) {
                newItems.push(imageItem)
                hasImage = true
              }
            }
          } else if (item.type === 'text/plain') {
            // Handle text paste (TASK-1, TASK-2)
            const text = clipboardData.getData('text/plain')
            if (text) {
              textContent = text
              // Don't create item yet - we'll decide if it goes to draft
            }
          }
        }

        // If we have text and no images, check if we should append to draft
        if (textContent && !hasImage && hasDraft) {
          // Append to existing draft (Decision B)
          onPasteToDraft?.(textContent)
        } else if (textContent) {
          // Create new text/URL item
          const textItem = processText(textContent)
          if (textItem) {
            newItems.push(textItem)
          }
        }

        // Create items from paste (TASK-1, TASK-2, TASK-3)
        if (newItems.length > 0) {
          onPasteItems?.(newItems)
        }
        // If no items were created, silently ignore (TASK-5)
      } finally {
        isPastingRef.current = false
      }
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [
    disabled,
    hasDraft,
    processText,
    processImage,
    onPasteToDraft,
    onPasteItems,
  ])

  return {
    isPasting: isPastingRef.current,
  }
}
