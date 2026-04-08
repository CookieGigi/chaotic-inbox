import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsMenu } from './SettingsMenu'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/test/i18n'

describe('SettingsMenu', () => {
  const mockOnOpen = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderWithI18n = (component: React.ReactNode) => {
    return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>)
  }

  describe('Rendering', () => {
    it('renders the settings button with Wrench icon', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Settings')
    })

    it('positions button at bottom right of screen', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      // Check for fixed positioning classes
      expect(button.parentElement).toHaveClass('fixed')
      expect(button.parentElement).toHaveClass('right-4')
      expect(button.parentElement).toHaveClass('bottom-4')
    })

    it('has correct z-index for overlay elements', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      expect(button.parentElement).toHaveClass('z-40')
    })
  })

  describe('Interactions', () => {
    it('calls onOpen when button is clicked', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      fireEvent.click(button)

      expect(mockOnOpen).toHaveBeenCalledTimes(1)
    })

    it('calls onOpen when Enter key is pressed', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      fireEvent.keyDown(button, { key: 'Enter' })

      expect(mockOnOpen).toHaveBeenCalledTimes(1)
    })

    it('calls onOpen when Space key is pressed', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      fireEvent.keyDown(button, { key: ' ' })

      expect(mockOnOpen).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('button is naturally focusable', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      expect(button.tagName.toLowerCase()).toBe('button')
    })

    it('has aria-label for screen readers', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      expect(button).toHaveAttribute('aria-label')
      expect(button.getAttribute('aria-label')).toBeTruthy()
    })
  })

  describe('Styling', () => {
    it('has rounded styling', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      expect(button).toHaveClass('rounded-lg')
    })

    it('has surface background color', () => {
      renderWithI18n(<SettingsMenu onOpen={mockOnOpen} />)

      const button = screen.getByTestId('settings-menu-button')
      expect(button).toHaveClass('bg-surface')
    })
  })
})
