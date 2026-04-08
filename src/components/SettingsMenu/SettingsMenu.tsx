import { WrenchIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

interface SettingsMenuProps {
  onOpen: () => void
}

export function SettingsMenu({ onOpen }: SettingsMenuProps) {
  const { t } = useTranslation()

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-40">
      <button
        type="button"
        data-testid="settings-menu-button"
        aria-label={t('settings.buttonLabel')}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        className="bg-surface hover:bg-surface-hover text-text p-3 rounded-lg shadow-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
      >
        <WrenchIcon size={24} weight="duotone" />
      </button>
    </div>
  )
}
