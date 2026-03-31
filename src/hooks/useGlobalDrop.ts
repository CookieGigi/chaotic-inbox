import { useEffect, useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { RawItem } from '@/models/rawItem'
import type {
  FileSubType,
  FileMetadata,
  ImageMetadata,
} from '@/models/metadata'

/**
 * Hook options for useGlobalDrop
 */
interface UseGlobalDropOptions {
  /** Whether drop capture is disabled */
  disabled?: boolean
  /** Called when new items should be created from drop */
  onDropItems?: (items: RawItem[]) => void
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
 * Check if a file is an image based on extension
 */
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
  const lowerFilename = filename.toLowerCase()
  return imageExtensions.some((ext) => lowerFilename.endsWith(ext))
}

/**
 * Get file subtype from filename
 */
function getFileSubType(filename: string): FileSubType {
  const lowerFilename = filename.toLowerCase()
  if (lowerFilename.endsWith('.pdf')) return 'pdf'
  if (lowerFilename.endsWith('.zip')) return 'zip'
  if (lowerFilename.endsWith('.txt')) return 'txt'
  if (lowerFilename.endsWith('.docx')) return 'docx'
  if (lowerFilename.endsWith('.md')) return 'md'
  return 'other'
}

/**
 * Process a file and create appropriate RawItem
 */
function processFile(file: File): RawItem | null {
  if (isImageFile(file.name)) {
    // Create image item
    const metadata: ImageMetadata = {
      kind: 'image',
    }
    return {
      id: uuidv4() as RawItem['id'],
      type: 'image',
      raw: file,
      capturedAt: new Date().toISOString() as RawItem['capturedAt'],
      metadata,
      title: file.name,
    }
  } else {
    // Create file item
    const metadata: FileMetadata = {
      kind: getFileSubType(file.name),
      filename: file.name,
      filesize: file.size,
      mimetype: file.type || 'application/octet-stream',
    }
    return {
      id: uuidv4() as RawItem['id'],
      type: 'file',
      raw: file,
      capturedAt: new Date().toISOString() as RawItem['capturedAt'],
      metadata,
      title: file.name,
    }
  }
}

/**
 * Hook to capture global file drop events and create items
 *
 * Features:
 * - Detects file drag events anywhere in the app
 * - Shows visual overlay during drag
 * - Handles image files (png, jpg, gif, webp) as image items
 * - Handles other files as file items with metadata
 * - Supports multiple files dropped simultaneously
 * - Ignores non-file drags (URLs, text)
 * - Works over interactive elements
 */
export function useGlobalDrop(
  options: UseGlobalDropOptions = {}
): UseGlobalDropReturn {
  const { disabled = false, onDropItems } = options

  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  /**
   * Handle dragenter - show overlay for file drags
   */
  const handleDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault()

    // Only respond to file drags
    if (!hasFiles(event.dataTransfer)) {
      return
    }

    dragCounterRef.current += 1
    setIsDragging(true)
  }, [])

  /**
   * Handle dragover - allow drop
   */
  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
  }, [])

  /**
   * Handle dragleave - hide overlay when leaving window
   */
  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault()

    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDragging(false)
    }
  }, [])

  /**
   * Handle drop - process files
   */
  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()

      // Reset drag state
      dragCounterRef.current = 0
      setIsDragging(false)

      // Only process file drops
      if (!hasFiles(event.dataTransfer)) {
        return
      }

      const files = event.dataTransfer?.files
      if (!files || files.length === 0) {
        return
      }

      // Process all files
      const newItems: RawItem[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const item = processFile(file)
        if (item) {
          newItems.push(item)
        }
      }

      // Create items from drop
      if (newItems.length > 0) {
        onDropItems?.(newItems)
      }
    },
    [onDropItems]
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
