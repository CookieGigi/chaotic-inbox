import type { Meta, StoryObj } from '@storybook/react-vite'
import { SettingsMenu } from './SettingsMenu'
import { useState } from 'react'

const meta = {
  title: 'Components/SettingsMenu',
  component: SettingsMenu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A floating settings menu button positioned at the bottom-right of the screen. Opens the settings modal when clicked. Uses a Wrench icon from Phosphor Icons.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onOpen: () => {},
  },
} satisfies Meta<typeof SettingsMenu>

export default meta
type Story = StoryObj<typeof meta>

// Wrapper component to provide state management
const SettingsMenuWrapper = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <SettingsMenu onOpen={() => setIsOpen(true)} />
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg">
            <p className="text-text">Modal would open here</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-accent text-white rounded cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export const Default: Story = {
  render: () => <SettingsMenuWrapper />,
  parameters: {
    docs: {
      description: {
        story:
          'Default settings menu button positioned at bottom-right. Click to see interaction.',
      },
    },
  },
}

export const PositioningDemo: Story = {
  render: () => (
    <div className="min-h-screen bg-bg relative p-4">
      <p className="text-text">
        The settings button is positioned at the bottom-right corner of the
        screen (fixed position).
      </p>
      <SettingsMenu onOpen={() => alert('Settings opened!')} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the fixed positioning of the settings button at bottom-right.',
      },
    },
  },
}

export const WithLongContent: Story = {
  render: () => (
    <div className="min-h-screen bg-bg relative">
      <div className="p-4 space-y-4">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={`content-${i}`} className="text-text">
            Scrollable content line {i + 1}. The settings button stays fixed at
            the bottom-right regardless of scroll position.
          </p>
        ))}
      </div>
      <SettingsMenu onOpen={() => alert('Settings opened!')} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows that the settings button maintains its position even with scrollable content.',
      },
    },
  },
}
