import { useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/store/appStore'
import type { RawItem } from '@/models/rawItem'
import { isInputElement } from '@/utils'
import {
  createTextItem,
  createUrlItem,
  createImageItem,
} from '@/models/itemFactories'

/**
 * Hook options for useGlobalPaste
 */
interface UseGlobalPasteOptions {
  /** Whether paste capture is disabled */
  disabled?: boolean
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
 * Check if text is a valid URL (entire string must be a URL)
 */
function isValidUrl(text: string): boolean {
  const trimmed = text.trim()
  // Must start with http:// or https:// and contain no whitespace
  return /^https?:\/\/\S+$/.test(trimmed)
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
 *
 * Uses Zustand store for state management.
 */
export function useGlobalPaste(
  options: UseGlobalPasteOptions = {}
): UseGlobalPasteReturn {
  const { disabled = false } = options

  // Subscribe to store state and actions
  const draftItem = useAppStore((state) => state.draftItem)
  const addItems = useAppStore((state) => state.addItems)
  const appendToDraft = useAppStore((state) => state.appendToDraft)

  const isPastingRef = useRef(false)

  /**
   * Process a text string and create appropriate item
   */
  const processText = useCallback((text: string): RawItem | null => {
    const trimmedText = text.trim()
    if (!trimmedText) return null

    if (isValidUrl(trimmedText)) {
      // URL item
      return createUrlItem(trimmedText, { kind: 'url' })
    } else {
      // Text item
      return createTextItem(trimmedText, { kind: 'plain' })
    }
  }, [])

  /**
   * Process an image blob and create image item
   */
  const processImage = useCallback((blob: Blob): RawItem | null => {
    return createImageItem(blob, { kind: 'image' })
  }, [])

  useEffect(() => {
    if (disabled) return

    const handlePaste = async (event: ClipboardEvent) => {
      // Skip if window doesn't have focus
      if (!document.hasFocus()) {
        return
      }

      // Skip if drag overlay is active
      if (isDragOverlayActive()) {
        return
      }

      // Skip if any input is focused
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
            // Handle image paste
            const file = item.getAsFile()
            if (file) {
              const imageItem = processImage(file)
              if (imageItem) {
                newItems.push(imageItem)
                hasImage = true
              }
            }
          } else if (item.type === 'text/plain') {
            // Handle text paste
            const text = clipboardData.getData('text/plain')
            if (text) {
              textContent = text
              // Don't create item yet - we'll decide if it goes to draft
            }
          }
        }

        // If we have text and no images, check if we should append to draft
        if (textContent && !hasImage && draftItem) {
          // Append to existing draft
          appendToDraft(textContent)
        } else if (textContent) {
          // Create new text/URL item
          const textItem = processText(textContent)
          if (textItem) {
            newItems.push(textItem)
          }
        }

        // Create items from paste
        if (newItems.length > 0) {
          addItems(newItems)
        }
        // If no items were created, silently ignore
      } finally {
        isPastingRef.current = false
      }
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [disabled, draftItem, processText, processImage, appendToDraft, addItems])

  return {
    isPasting: isPastingRef.current,
  }
}
