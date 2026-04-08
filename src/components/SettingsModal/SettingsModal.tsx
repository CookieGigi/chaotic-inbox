import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { XIcon, DownloadIcon } from '@phosphor-icons/react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: () => void
}

export function SettingsModal({
  isOpen,
  onClose,
  onExport,
}: SettingsModalProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const exportButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = 'settings-modal-title'

  // Focus trap implementation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = [
        closeButtonRef.current,
        exportButtonRef.current,
      ].filter(Boolean) as HTMLElement[]

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
    [onClose]
  )

  // Set up event listeners and focus management
  useEffect(() => {
    if (!isOpen) return

    // Focus close button when opened
    closeButtonRef.current?.focus()

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  const handleBackdropClick = () => {
    onClose()
  }

  if (!isOpen) return null

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

        {/* Data Management Section */}
        <section className="mb-6">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-4">
            {t('settings.sections.dataManagement')}
          </h3>

          <div className="bg-bg rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text font-medium">
                  {t('settings.export.title')}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {t('settings.export.description')}
                </p>
              </div>
              <button
                ref={exportButtonRef}
                type="button"
                data-testid="export-button"
                onClick={onExport}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface cursor-pointer"
              >
                <DownloadIcon size={18} weight="bold" />
                <span>{t('settings.export.button')}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
