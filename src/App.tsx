import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Feed } from '@/components/Feed'
import { SettingsMenu } from '@/components/SettingsMenu'
import { SettingsModal } from '@/components/SettingsModal'
import {
  useGlobalTyping,
  useGlobalPaste,
  useGlobalDrop,
  useOnlineStatus,
  useQuotaMonitor,
} from '@/hooks'
import { useAppStore } from '@/store/appStore'
import { exportDatabase, restoreDatabase } from '@/services'
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
 * - Settings menu with backup export functionality
 *
 * Uses Zustand for state management.
 */
function App() {
  const { t } = useTranslation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Subscribe to store state
  const items = useAppStore((state) => state.items)
  const draftItem = useAppStore((state) => state.draftItem)
  const isDragging = useAppStore((state) => state.isDragging)
  const loadItems = useAppStore((state) => state.loadItems)
  const deleteItem = useAppStore((state) => state.deleteItem)
  const updateItem = useAppStore((state) => state.updateItem)

  // Load items from storage on mount
  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Use the global hooks (they now interact with the store internally)
  useGlobalTyping()
  useGlobalPaste()
  useGlobalDrop()

  // Monitor online status and quota
  const { isOnline } = useOnlineStatus()
  const { quotaInfo } = useQuotaMonitor()

  // Settings handlers
  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true)
  }, [])

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  const handleBackup = useCallback(() => {
    exportDatabase()
  }, [])

  const handleRestore = useCallback(
    async (file: File): Promise<boolean> => {
      const success = await restoreDatabase(file)
      if (success) {
        // Reload items after successful restore
        await loadItems()
      }
      return success
    },
    [loadItems]
  )

  return (
    <div className="min-h-screen bg-bg relative">
      <Feed
        items={items}
        draftItem={draftItem}
        onDeleteItem={deleteItem}
        onUpdateItem={updateItem}
      />

      {/* Settings Menu */}
      <SettingsMenu onOpen={handleOpenSettings} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        isOnline={isOnline}
        quotaInfo={quotaInfo}
        onBackup={handleBackup}
        onRestore={handleRestore}
      />

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
