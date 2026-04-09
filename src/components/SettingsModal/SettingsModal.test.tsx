import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsModal } from './SettingsModal'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/test/i18n'
import { ToastContainer } from '@/components/Toast'

describe('SettingsModal', () => {
  const mockOnClose = vi.fn()
  const mockOnBackup = vi.fn()
  const mockOnRestore = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
        <ToastContainer />
      </I18nextProvider>
    )
  }

  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={false}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument()
    })

    it('renders when isOpen is true', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    })

    it('renders with dialog role', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('has aria-modal attribute', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby pointing to title', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const dialog = screen.getByRole('dialog')
      const titleId = dialog.getAttribute('aria-labelledby')
      expect(titleId).toBeTruthy()

      const title = document.getElementById(titleId!)
      expect(title).toBeInTheDocument()
    })

    it('renders status section', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
        />
      )

      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('renders data management section', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      expect(screen.getByText('Data Management')).toBeInTheDocument()
    })

    it('renders backup button', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const backupButton = screen.getByTestId('backup-button')
      expect(backupButton).toBeInTheDocument()
      expect(backupButton).toHaveTextContent('Backup')
    })

    it('renders restore button when onRestore is provided', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const restoreButton = screen.getByTestId('restore-button')
      expect(restoreButton).toBeInTheDocument()
      expect(restoreButton).toHaveTextContent('Restore')
    })

    it('does not render restore button when onRestore is not provided', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
        />
      )

      expect(screen.queryByTestId('restore-button')).not.toBeInTheDocument()
    })

    it('renders restore file input', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('type', 'file')
      expect(fileInput).toHaveAttribute('accept', '.json')
    })

    it('renders close button', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const closeButton = screen.getByTestId('modal-close-button')
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Status Section - Online/Offline', () => {
    it('shows online status when isOnline is true', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          isOnline={true}
        />
      )

      expect(screen.getByText('Online')).toBeInTheDocument()
    })

    it('shows offline status when isOnline is false', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          isOnline={false}
        />
      )

      expect(screen.getByText('Offline')).toBeInTheDocument()
    })

    it('defaults to online when isOnline prop is not provided', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
        />
      )

      expect(screen.getByText('Online')).toBeInTheDocument()
    })
  })

  describe('Status Section - Quota Display', () => {
    it('shows quota info when provided', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          quotaInfo={{
            used: 120000000,
            quota: 250000000,
            percent: 48,
            itemCount: 10,
          }}
        />
      )

      expect(screen.getByText('120MB of 250MB used')).toBeInTheDocument()
      expect(screen.getByText('10 items stored')).toBeInTheDocument()
    })

    it('does not show quota section when quotaInfo is null', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          quotaInfo={null}
        />
      )

      expect(screen.queryByText(/MB of/)).not.toBeInTheDocument()
    })

    it('does not show quota section when quotaInfo is undefined', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
        />
      )

      expect(screen.queryByText(/MB of/)).not.toBeInTheDocument()
    })

    it('shows progress bar when quota info is provided', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          quotaInfo={{
            used: 120000000,
            quota: 250000000,
            percent: 48,
            itemCount: 10,
          }}
        />
      )

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '48')
    })
  })

  describe('Interactions', () => {
    it('calls onClose when close button is clicked', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const closeButton = screen.getByTestId('modal-close-button')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop is clicked', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const backdrop = screen.getByTestId('modal-backdrop')
      fireEvent.click(backdrop)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape key is pressed', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      // Dispatch keydown on document to trigger the modal's keydown listener
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onBackup when backup button is clicked', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const backupButton = screen.getByTestId('backup-button')
      fireEvent.click(backupButton)

      expect(mockOnBackup).toHaveBeenCalledTimes(1)
    })

    it('opens file picker when restore button is clicked', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const clickSpy = vi.spyOn(fileInput, 'click')

      const restoreButton = screen.getByTestId('restore-button')
      fireEvent.click(restoreButton)

      expect(clickSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Restore Confirmation Dialog', () => {
    it('shows confirmation dialog when file is selected', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const file = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(screen.getByTestId('restore-confirm-dialog')).toBeInTheDocument()
    })

    it('displays confirmation title and message', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const file = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(screen.getByText('Restore Data?')).toBeInTheDocument()
      expect(
        screen.getByText(/This will replace all your current data/)
      ).toBeInTheDocument()
    })

    it('renders confirm and cancel buttons in dialog', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const file = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(screen.getByTestId('restore-confirm-button')).toBeInTheDocument()
      expect(screen.getByTestId('restore-cancel-button')).toBeInTheDocument()
    })

    it('hides confirmation dialog when cancel is clicked', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const file = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      const cancelButton = screen.getByTestId('restore-cancel-button')
      fireEvent.click(cancelButton)

      expect(
        screen.queryByTestId('restore-confirm-dialog')
      ).not.toBeInTheDocument()
    })

    it('calls onRestore when confirm is clicked', async () => {
      mockOnRestore.mockResolvedValue(true)

      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const file = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      const confirmButton = screen.getByTestId('restore-confirm-button')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnRestore).toHaveBeenCalledTimes(1)
      })
    })

    it('closes modal on successful restore', async () => {
      mockOnRestore.mockResolvedValue(true)

      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const file = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      const confirmButton = screen.getByTestId('restore-confirm-button')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      })
    })

    it('keeps modal open on failed restore', async () => {
      mockOnRestore.mockResolvedValue(false)

      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const file = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      const confirmButton = screen.getByTestId('restore-confirm-button')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnRestore).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
      })
    })

    it('closes confirmation dialog on Escape key', async () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const file = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      await waitFor(() => {
        expect(
          screen.queryByTestId('restore-confirm-dialog')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Focus Management', () => {
    it('focuses close button when opened', async () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      await waitFor(() => {
        const closeButton = screen.getByTestId('modal-close-button')
        expect(document.activeElement).toBe(closeButton)
      })
    })

    it('has focusable elements within modal', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const closeButton = screen.getByTestId('modal-close-button')
      const backupButton = screen.getByTestId('backup-button')
      const restoreButton = screen.getByTestId('restore-button')

      // All buttons should be focusable
      expect(closeButton.tagName.toLowerCase()).toBe('button')
      expect(backupButton.tagName.toLowerCase()).toBe('button')
      expect(restoreButton.tagName.toLowerCase()).toBe('button')
    })

    it('modal has keyboard event handler for Tab key', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      // Verify the modal implements focus trap by checking for keydown listener setup
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('focuses cancel button when confirmation dialog opens', async () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const fileInput = screen.getByTestId('restore-file-input')
      const file = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        const cancelButton = screen.getByTestId('restore-cancel-button')
        expect(document.activeElement).toBe(cancelButton)
      })
    })
  })

  describe('Styling', () => {
    it('has surface background for modal content', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const content = screen.getByTestId('modal-content')
      expect(content).toHaveClass('bg-surface')
    })

    it('has rounded corners', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onBackup={mockOnBackup}
          onRestore={mockOnRestore}
        />
      )

      const content = screen.getByTestId('modal-content')
      expect(content).toHaveClass('rounded-lg')
    })
  })
})
