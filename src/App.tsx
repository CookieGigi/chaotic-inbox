import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Feed } from '@/components/Feed'
import { useGlobalTyping, useGlobalPaste, useGlobalDrop } from '@/hooks'
import { useAppStore } from '@/store/appStore'
import { UploadSimpleIcon } from '@phosphor-icons/react'
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
 *
 * Uses Zustand for state management.
 */
function App() {
  const { t } = useTranslation()

  // Subscribe to store state
  const items = useAppStore((state) => state.items)
  const draftItem = useAppStore((state) => state.draftItem)
  const isDragging = useAppStore((state) => state.isDragging)
  const loadItems = useAppStore((state) => state.loadItems)

  // Load items from storage on mount
  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Use the global hooks (they now interact with the store internally)
  useGlobalTyping()
  useGlobalPaste()
  useGlobalDrop()

  return (
    <div className="min-h-screen bg-bg relative">
      <Feed items={items} draftItem={draftItem} />

      {/* Drop overlay */}
      {isDragging && (
        <div
          data-testid="drop-overlay"
          className="fixed inset-0 bg-bg/90 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-4">
            <UploadSimpleIcon
              size={64}
              className="text-accent"
              weight="duotone"
            />
            <p className="text-lg font-medium text-text">
              {t('app.dropFiles')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
