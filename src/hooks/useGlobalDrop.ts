import { useEffect, useCallback, useRef, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import type { RawItem } from '@/models/rawItem'
import { createImageItem, createFileItem } from '@/models/itemFactories'
import { isImageFile, getFileSubType } from '@/utils/fileTypeDetection'

/**
 * Hook options for useGlobalDrop
 */
interface UseGlobalDropOptions {
  /** Whether drop capture is disabled */
  disabled?: boolean
}

/**
 * Hook return type
 */
interface UseGlobalDropReturn {
  /** Whether a file is currently being dragged over */
  isDragging: boolean
}

/**
 * Check if the drag event contains files
 */
function hasFiles(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) return false
  return dataTransfer.types.includes('Files')
}

/**
 * Process a file and create appropriate RawItem
 * Uses magic number detection with extension fallback
 */
async function processFile(file: File): Promise<RawItem | null> {
  try {
    const isImage = await isImageFile(file)

    if (isImage) {
      // Create image item
      return createImageItem(file, { kind: 'image' })
    } else {
      // Create file item with detected subtype
      const subType = await getFileSubType(file)
      return createFileItem(file, {
        kind: subType,
        filename: file.name,
        filesize: file.size,
        mimetype: file.type || 'application/octet-stream',
      })
    }
  } catch (error) {
    console.error('Error processing file:', error)
    return null
  }
}

/**
 * Hook to capture global file drop events and create items
 *
 * Features:
 * - Detects file drag events anywhere in the app
 * - Shows visual overlay during drag
 * - Handles image files (png, jpg, gif, webp) as image items using magic numbers
 * - Handles other files as file items with metadata
 * - Supports multiple files dropped simultaneously
 * - Ignores non-file drags (URLs, text)
 * - Works over interactive elements
 * - Uses hybrid detection (magic numbers + extension fallback) for security
 *
 * Uses Zustand store for state management.
 */
export function useGlobalDrop(
  options: UseGlobalDropOptions = {}
): UseGlobalDropReturn {
  const { disabled = false } = options

  // Subscribe to store actions
  const addItems = useAppStore((state) => state.addItems)
  const setIsDragging = useAppStore((state) => state.setIsDragging)

  const [isDragging, setLocalIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  /**
   * Handle dragenter - show overlay for file drags
   */
  const handleDragEnter = useCallback(
    (event: DragEvent) => {
      event.preventDefault()

      // Only respond to file drags
      if (!hasFiles(event.dataTransfer)) {
        return
      }

      dragCounterRef.current += 1
      setLocalIsDragging(true)
      setIsDragging(true)
    },
    [setIsDragging]
  )

  /**
   * Handle dragover - allow drop
   */
  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
  }, [])

  /**
   * Handle dragleave - hide overlay when leaving window
   */
  const handleDragLeave = useCallback(
    (event: DragEvent) => {
      event.preventDefault()

      dragCounterRef.current -= 1
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0
        setLocalIsDragging(false)
        setIsDragging(false)
      }
    },
    [setIsDragging]
  )

  /**
   * Handle drop - process files
   */
  const handleDrop = useCallback(
    async (event: DragEvent) => {
      event.preventDefault()

      // Reset drag state
      dragCounterRef.current = 0
      setLocalIsDragging(false)
      setIsDragging(false)

      // Only process file drops
      if (!hasFiles(event.dataTransfer)) {
        return
      }

      const files = event.dataTransfer?.files
      if (!files || files.length === 0) {
        return
      }

      // Process all files concurrently
      const itemPromises = Array.from(files).map(processFile)
      const items = (await Promise.all(itemPromises)).filter(
        Boolean
      ) as RawItem[]

      // Create items from drop
      if (items.length > 0) {
        addItems(items)
      }
    },
    [addItems, setIsDragging]
  )

  useEffect(() => {
    if (disabled) return

    // Add event listeners to window for global capture
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
    }
  }, [disabled, handleDragEnter, handleDragOver, handleDragLeave, handleDrop])

  return {
    isDragging,
  }
}
