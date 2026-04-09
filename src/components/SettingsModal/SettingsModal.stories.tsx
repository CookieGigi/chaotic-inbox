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
          'An extensible settings modal with focus trap and accessibility features. Includes a Data Management section with backup and restore functionality.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: () => {},
    onBackup: () => {},
    onRestore: undefined,
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
    onBackup: () => alert('Backup clicked'),
    onRestore: () => Promise.resolve(true),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal in open state showing the Data Management section with both backup and restore buttons.',
      },
    },
  },
}

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    onBackup: () => {},
    onRestore: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in closed state (renders nothing).',
      },
    },
  },
}

export const BackupOnly: Story = {
  args: {
    isOpen: true,
    onClose: () => alert('Close clicked'),
    onBackup: () => alert('Backup clicked'),
    onRestore: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal showing only backup button (restore disabled when onRestore prop is not provided).',
      },
    },
  },
}

// Interactive wrapper to show full flow with restore
const InteractiveModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [backupCount, setBackupCount] = useState(0)
  const [restoreCount, setRestoreCount] = useState(0)

  const handleRestore = async (file: File): Promise<boolean> => {
    alert(`Restore triggered with file: ${file.name}`)
    setRestoreCount((c) => c + 1)
    return true
  }

  return (
    <div className="bg-bg p-8 rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-accent text-white rounded cursor-pointer"
      >
        Open Settings
      </button>
      <p className="text-text mt-4">Backup count: {backupCount}</p>
      <p className="text-text">Restore count: {restoreCount}</p>
      <SettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onBackup={() => setBackupCount((c) => c + 1)}
        onRestore={handleRestore}
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
          'Interactive demo showing open/close functionality with both backup and restore interactions.',
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
          onBackup={() => alert('Backup triggered - would show toast in app')}
          onRestore={() => Promise.resolve(true)}
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
