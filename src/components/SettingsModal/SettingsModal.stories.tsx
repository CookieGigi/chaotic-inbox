import type { Meta, StoryObj } from '@storybook/react-vite'
import { SettingsModal } from './SettingsModal'
import { useState } from 'react'
import { ToastContainer } from '@/components/Toast'

const meta = {
  title: 'Components/SettingsModal',
  component: SettingsModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An extensible settings modal with focus trap and accessibility features. Currently includes a Data Management section with export functionality.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: () => {},
    onExport: () => {},
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <ToastContainer />
      </>
    ),
  ],
} satisfies Meta<typeof SettingsModal>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => alert('Close clicked'),
    onExport: () => alert('Export clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in open state showing the Data Management section.',
      },
    },
  },
}

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    onExport: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in closed state (renders nothing).',
      },
    },
  },
}

// Interactive wrapper to show full flow
const InteractiveModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [exportCount, setExportCount] = useState(0)

  return (
    <div className="bg-bg p-8 rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-accent text-white rounded cursor-pointer"
      >
        Open Settings
      </button>
      <p className="text-text mt-4">Export count: {exportCount}</p>
      <SettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onExport={() => setExportCount((c) => c + 1)}
      />
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveModal />,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showing open/close functionality and export button interaction.',
      },
    },
  },
}

export const WithToastNotification: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)
    return (
      <>
        <SettingsModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onExport={() => alert('Export triggered - would show toast in app')}
        />
        <ToastContainer />
      </>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal with ToastContainer visible to show how notifications would appear.',
      },
    },
  },
}
