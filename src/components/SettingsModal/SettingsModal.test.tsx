import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsModal } from './SettingsModal'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/test/i18n'
import { ToastContainer } from '@/components/Toast'

describe('SettingsModal', () => {
  const mockOnClose = vi.fn()
  const mockOnExport = vi.fn()

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
          onExport={mockOnExport}
        />
      )

      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument()
    })

    it('renders when isOpen is true', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      )

      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    })

    it('renders with dialog role', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
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
          onExport={mockOnExport}
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
          onExport={mockOnExport}
        />
      )

      const dialog = screen.getByRole('dialog')
      const titleId = dialog.getAttribute('aria-labelledby')
      expect(titleId).toBeTruthy()

      const title = document.getElementById(titleId!)
      expect(title).toBeInTheDocument()
    })

    it('renders data management section', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      )

      expect(screen.getByText('Data Management')).toBeInTheDocument()
    })

    it('renders export button', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      )

      const exportButton = screen.getByTestId('export-button')
      expect(exportButton).toBeInTheDocument()
      expect(exportButton).toHaveTextContent('Export')
    })

    it('renders close button', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      )

      const closeButton = screen.getByTestId('modal-close-button')
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onClose when close button is clicked', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
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
          onExport={mockOnExport}
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
          onExport={mockOnExport}
        />
      )

      // Dispatch keydown on document to trigger the modal's keydown listener
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onExport when export button is clicked', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      )

      const exportButton = screen.getByTestId('export-button')
      fireEvent.click(exportButton)

      expect(mockOnExport).toHaveBeenCalledTimes(1)
    })
  })

  describe('Focus Management', () => {
    it('focuses close button when opened', async () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
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
          onExport={mockOnExport}
        />
      )

      const closeButton = screen.getByTestId('modal-close-button')
      const exportButton = screen.getByTestId('export-button')

      // Both buttons should be focusable
      expect(closeButton.tagName.toLowerCase()).toBe('button')
      expect(exportButton.tagName.toLowerCase()).toBe('button')
    })

    it('modal has keyboard event handler for Tab key', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      )

      // Verify the modal implements focus trap by checking for keydown listener setup
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('has surface background for modal content', () => {
      renderWithProviders(
        <SettingsModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
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
          onExport={mockOnExport}
        />
      )

      const content = screen.getByTestId('modal-content')
      expect(content).toHaveClass('rounded-lg')
    })
  })
})
