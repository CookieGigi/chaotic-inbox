import { useEffect, useRef, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  XIcon,
  DownloadIcon,
  CloudCheckIcon,
  CloudSlashIcon,
} from '@phosphor-icons/react'
import type { QuotaInfo } from '@/services/quotaService'
import { UploadIcon, WarningIcon } from '@phosphor-icons/react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onBackup: () => void
  onRestore?: (file: File) => Promise<boolean>
  isOnline?: boolean
  quotaInfo?: QuotaInfo | null
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  const mb = bytes / 1000000
  if (mb >= 1000) {
    const gb = mb / 1000
    const formatted = gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1)
    return `${formatted}GB`
  }
  return `${Math.round(mb)}MB`
}

export function SettingsModal({
  isOpen,
  onClose,
  isOnline = true,
  quotaInfo,
  onBackup,
  onRestore,
}: SettingsModalProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const backupButtonRef = useRef<HTMLButtonElement>(null)
  const restoreButtonRef = useRef<HTMLButtonElement>(null)
  const confirmRestoreButtonRef = useRef<HTMLButtonElement>(null)
  const cancelRestoreButtonRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleId = 'settings-modal-title'

  // State for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const showConfirmDialogRef = useRef(showConfirmDialog)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Keep ref in sync with state for event handlers
  useEffect(() => {
    showConfirmDialogRef.current = showConfirmDialog
  }, [showConfirmDialog])

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file && onRestore) {
        setSelectedFile(file)
        setShowConfirmDialog(true)
      }
      // Reset input so same file can be selected again
      event.target.value = ''
    },
    [onRestore]
  )

  // Handle restore button click
  const handleRestoreClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle confirm restore
  const handleConfirmRestore = useCallback(async () => {
    if (selectedFile && onRestore) {
      setShowConfirmDialog(false)
      const success = await onRestore(selectedFile)
      if (success) {
        onClose()
      }
      setSelectedFile(null)
    }
  }, [selectedFile, onRestore, onClose])

  // Handle cancel restore
  const handleCancelRestore = useCallback(() => {
    setShowConfirmDialog(false)
    setSelectedFile(null)
  }, [])

  // Focus trap implementation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Use ref to get latest state value
      const isConfirmDialogOpen = showConfirmDialogRef.current

      if (event.key === 'Escape') {
        if (isConfirmDialogOpen) {
          handleCancelRestore()
        } else {
          onClose()
        }
        return
      }

      if (event.key !== 'Tab') return

      // Determine which focusable elements to use based on dialog state
      let focusableElements: HTMLElement[]
      if (isConfirmDialogOpen) {
        focusableElements = [
          cancelRestoreButtonRef.current,
          confirmRestoreButtonRef.current,
        ].filter(Boolean) as HTMLElement[]
      } else {
        focusableElements = [
          closeButtonRef.current,
          backupButtonRef.current,
          restoreButtonRef.current,
        ].filter(Boolean) as HTMLElement[]
      }

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
    [onClose, handleCancelRestore]
  )

  // Set up event listeners and focus management
  useEffect(() => {
    if (!isOpen) return

    // Focus appropriate element when opened or dialog state changes
    if (showConfirmDialog) {
      cancelRestoreButtonRef.current?.focus()
    } else {
      closeButtonRef.current?.focus()
    }

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown, showConfirmDialog])

  const handleBackdropClick = () => {
    if (!showConfirmDialog) {
      onClose()
    }
  }

  if (!isOpen) return null

  // Determine progress bar color based on percentage
  const getProgressColor = (percent: number): string => {
    if (percent >= 90) return 'bg-error'
    if (percent >= 80) return 'bg-warning'
    return 'bg-accent'
  }

  return (
    <div
      data-testid="settings-modal"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        data-testid="modal-backdrop"
        aria-label={t('settings.closeButton')}
        className="absolute inset-0 bg-black/50 cursor-pointer border-0 p-0"
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div
        data-testid="modal-content"
        className="relative bg-surface rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id={titleId} className="text-xl font-semibold text-text">
            {t('settings.title')}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            data-testid="modal-close-button"
            aria-label={t('settings.closeButton')}
            onClick={onClose}
            className="text-text-secondary hover:text-text p-1 rounded transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Status Section */}
        <section className="mb-6">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-4">
            {t('settings.sections.status')}
          </h3>

          <div className="bg-bg rounded-lg p-4 space-y-3">
            {/* Online/Offline Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <CloudCheckIcon
                    size={20}
                    className="text-success"
                    weight="fill"
                  />
                  <span className="text-text">
                    {t('settings.status.online')}
                  </span>
                </>
              ) : (
                <>
                  <CloudSlashIcon
                    size={20}
                    className="text-warning"
                    weight="fill"
                  />
                  <span className="text-text">
                    {t('settings.status.offline')}
                  </span>
                </>
              )}
            </div>

            {/* Quota Info */}
            {quotaInfo && (
              <div className="space-y-2">
                {/* Progress Bar */}
                <div
                  role="progressbar"
                  aria-valuenow={quotaInfo.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Storage ${quotaInfo.percent}% full`}
                  className="w-full bg-overlay rounded-full h-2 overflow-hidden"
                >
                  <div
                    className={`h-full ${getProgressColor(quotaInfo.percent)} transition-all duration-300`}
                    style={{ width: `${quotaInfo.percent}%` }}
                  />
                </div>

                {/* Storage Text */}
                <p className="text-sm text-text-secondary">
                  {t('settings.status.storageUsed', {
                    used: formatBytes(quotaInfo.used),
                    total: formatBytes(quotaInfo.quota),
                  })}
                </p>

                {/* Items Count */}
                <p className="text-sm text-text-secondary">
                  {t('settings.status.itemsCount', {
                    count: quotaInfo.itemCount,
                  })}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Data Management Section */}
        <section className="mb-6">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-4">
            {t('settings.sections.dataManagement')}
          </h3>

          {/* Backup Option */}
          <div className="bg-bg rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text font-medium">
                  {t('settings.backup.title')}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {t('settings.backup.description')}
                </p>
              </div>
              <button
                ref={backupButtonRef}
                type="button"
                data-testid="backup-button"
                onClick={onBackup}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface cursor-pointer"
              >
                <DownloadIcon size={18} weight="bold" />
                <span>{t('settings.backup.button')}</span>
              </button>
            </div>
          </div>

          {/* Restore Option */}
          {onRestore && (
            <div className="bg-bg rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text font-medium">
                    {t('settings.restore.title')}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {t('settings.restore.description')}
                  </p>
                </div>
                <button
                  ref={restoreButtonRef}
                  type="button"
                  data-testid="restore-button"
                  onClick={handleRestoreClick}
                  className="flex items-center gap-2 bg-surface border border-border hover:bg-bg text-text px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface cursor-pointer"
                >
                  <UploadIcon size={18} weight="bold" />
                  <span>{t('settings.restore.button')}</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          data-testid="restore-file-input"
          onChange={handleFileSelect}
          className="hidden"
          aria-label={t('settings.restore.button')}
        />

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div
            data-testid="restore-confirm-dialog"
            className="absolute inset-0 bg-surface rounded-lg flex flex-col items-center justify-center p-6"
          >
            <WarningIcon
              size={48}
              className="text-warning mb-4"
              weight="fill"
            />
            <h3 className="text-lg font-semibold text-text mb-2">
              {t('settings.restore.confirmTitle')}
            </h3>
            <p className="text-text-secondary text-center mb-6">
              {t('settings.restore.confirmMessage')}
            </p>
            <div className="flex gap-3">
              <button
                ref={cancelRestoreButtonRef}
                type="button"
                data-testid="restore-cancel-button"
                onClick={handleCancelRestore}
                className="px-4 py-2 border border-border rounded-lg text-text hover:bg-bg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
              >
                {t('settings.restore.cancelButton')}
              </button>
              <button
                ref={confirmRestoreButtonRef}
                type="button"
                data-testid="restore-confirm-button"
                onClick={handleConfirmRestore}
                className="px-4 py-2 bg-warning hover:bg-warning-hover text-white rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-warning cursor-pointer"
              >
                {t('settings.restore.confirmButton')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
