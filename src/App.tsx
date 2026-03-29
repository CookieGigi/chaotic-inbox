import { useState, useCallback, useEffect } from 'react'
import { Feed } from '@/components/Feed'
import { useGlobalTyping, useGlobalPaste } from '@/hooks'
import { createTextItem } from '@/models/itemFactories'
import type { RawItem } from '@/models/rawItem'
import { db } from '@/storage/local_db'
import './App.css'

/**
 * Main App component with global typing and paste capture
 *
 * Features:
 * - Global typing detection (alphanumeric keys create draft)
 * - Global paste detection (Cmd+V / Ctrl+V anywhere)
 * - Draft block at bottom of feed for text entry
 * - Ctrl+Enter to persist, Escape to cancel
 * - Automatic persistence to local storage
 */
function App() {
  const [items, setItems] = useState<RawItem[]>([])
  const [draftContent, setDraftContent] = useState<string>('')

  // Load items from storage on mount
  useEffect(() => {
    const loadItems = async () => {
      const allItems = await db.items.toArray()
      setItems(allItems)
    }
    loadItems()
  }, [])

  // Handle draft content changes from the hook
  const handleDraftCreate = useCallback((content: string) => {
    setDraftContent(content)
  }, [])

  const handleDraftAppend = useCallback((char: string) => {
    setDraftContent((prev) => prev + char)
  }, [])

  // Use the global typing hook
  const { draftItem, updateDraft, submitDraft, cancelDraft } = useGlobalTyping({
    onDraftCreate: handleDraftCreate,
    onDraftAppend: handleDraftAppend,
    hasDraft: draftContent.length > 0,
  })

  // Handle paste to draft (appends text when draft is active)
  const handlePasteToDraft = useCallback((content: string) => {
    setDraftContent((prev) => prev + content)
  }, [])

  // Handle paste items (creates new blocks)
  const handlePasteItems = useCallback(async (newItems: RawItem[]) => {
    try {
      // Persist all items to storage first
      for (const item of newItems) {
        await db.items.add(item)
      }
      // Update local state
      setItems((prev) => [...prev, ...newItems])
    } catch (error) {
      console.error('Failed to persist pasted items:', error)
    }
  }, [])

  // Use the global paste hook
  useGlobalPaste({
    hasDraft: draftContent.length > 0,
    onPasteToDraft: handlePasteToDraft,
    onPasteItems: handlePasteItems,
  })

  // Sync draft content with hook's draft item
  useEffect(() => {
    if (draftItem && draftContent !== draftItem.content) {
      updateDraft(draftContent)
    }
  }, [draftContent, draftItem, updateDraft])

  // Handle draft submission
  const handleDraftSubmit = useCallback(async () => {
    if (draftContent.trim().length === 0) {
      // Empty content - just cancel
      setDraftContent('')
      submitDraft()
      return
    }

    try {
      // Create text item and persist
      const textItem = createTextItem(draftContent.trim(), { kind: 'plain' })
      await db.items.add(textItem)

      // Update local state
      setItems((prev) => [...prev, textItem])

      // Clear draft
      setDraftContent('')
      submitDraft()
    } catch (error) {
      console.error('Failed to persist draft:', error)
    }
  }, [draftContent, submitDraft])

  // Handle draft cancellation
  const handleDraftCancel = useCallback(() => {
    setDraftContent('')
    cancelDraft()
  }, [cancelDraft])

  // Handle draft content changes from component
  const handleDraftChange = useCallback(
    (content: string) => {
      setDraftContent(content)
      if (draftItem) {
        updateDraft(content)
      }
    },
    [draftItem, updateDraft]
  )

  return (
    <div className="min-h-screen bg-bg">
      <Feed
        items={items}
        draftItem={draftItem}
        onDraftChange={handleDraftChange}
        onDraftSubmit={handleDraftSubmit}
        onDraftCancel={handleDraftCancel}
      />
    </div>
  )
}

export default App
