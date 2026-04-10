import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from './Toast'
import { ToastContainer } from './ToastContainer'
import {
  useToastStore,
  showError,
  showWarning,
  showInfo,
  showSuccess,
  showUndoable,
} from '@/store/toastStore'

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toast notification component for user feedback. Supports error, warning, info, and success types with auto-dismiss and manual dismiss options. Used for persistence failure feedback.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Toast>

export const ErrorToast: Story = {
  args: {
    id: 'error-1',
    message: 'Failed to save items. Please try again.',
    type: 'error',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error toast used for persistence failures and other errors.',
      },
    },
  },
}

export const Warning: Story = {
  args: {
    id: 'warning-1',
    message: 'Storage quota is running low.',
    type: 'warning',
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning toast for non-critical issues that need attention.',
      },
    },
  },
}

export const Info: Story = {
  args: {
    id: 'info-1',
    message: 'Sync completed successfully.',
    type: 'info',
  },
  parameters: {
    docs: {
      description: {
        story: 'Info toast for general notifications.',
      },
    },
  },
}

export const Success: Story = {
  args: {
    id: 'success-1',
    message: 'Settings saved successfully.',
    type: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Success toast for positive confirmations.',
      },
    },
  },
}

export const LongMessage: Story = {
  args: {
    id: 'long-1',
    message:
      'Failed to submit draft. Your content is preserved - please try again. This is a longer message to demonstrate text wrapping behavior.',
    type: 'error',
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast with longer message content showing text wrapping.',
      },
    },
  },
}

export const ToastContainerStory: StoryObj<typeof ToastContainer> = {
  render: () => <ToastContainer />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Fixed-position container that renders active toasts at the top-right of the screen.',
        story:
          'ToastContainer positioned at top-right. Use the buttons below to trigger different toast types.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-bg p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-text mb-6">Toast Demo</h1>
          <p className="text-text-muted mb-8">
            Click the buttons below to trigger toast notifications. They will
            appear in the top-right corner and auto-dismiss after 5 seconds.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() =>
                showError('Failed to save items. Please try again.')
              }
              className="px-4 py-2 bg-error/20 text-error border border-error rounded hover:bg-error/30 transition-colors"
            >
              Show Error
            </button>

            <button
              type="button"
              onClick={() => showWarning('Storage quota is running low.')}
              className="px-4 py-2 bg-warning/20 text-warning border border-warning rounded hover:bg-warning/30 transition-colors"
            >
              Show Warning
            </button>

            <button
              type="button"
              onClick={() => showInfo('New update available.')}
              className="px-4 py-2 bg-accent/20 text-accent border border-accent rounded hover:bg-accent/30 transition-colors"
            >
              Show Info
            </button>

            <button
              type="button"
              onClick={() => showSuccess('Settings saved successfully.')}
              className="px-4 py-2 bg-success/20 text-success border border-success rounded hover:bg-success/30 transition-colors"
            >
              Show Success
            </button>

            <button
              type="button"
              onClick={() => {
                showError('First error message')
                showWarning('Second warning message')
                showInfo('Third info message')
              }}
              className="px-4 py-2 bg-surface text-text border border-border rounded hover:bg-overlay transition-colors"
            >
              Show Multiple
            </button>

            <button
              type="button"
              onClick={() => useToastStore.getState().clearAll()}
              className="px-4 py-2 bg-surface text-text-muted border border-border rounded hover:text-text hover:bg-overlay transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
}

export const PersistenceErrorExample: StoryObj<typeof ToastContainer> = {
  render: () => <ToastContainer />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Simulates the actual persistence error scenario from TASK-84. Shows how error toasts appear when database operations fail.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Clear toasts and show error on mount
      setTimeout(() => {
        useToastStore.getState().clearAll()
        showError(
          'Failed to save draft. Your content is preserved - please try again.'
        )
      }, 100)

      return (
        <div className="min-h-screen bg-bg p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-text mb-6">
              Persistence Error Demo
            </h1>
            <p className="text-text-muted mb-4">
              This demonstrates the error feedback shown when database
              persistence fails. The error toast appears automatically in the
              top-right corner.
            </p>
            <div className="p-4 bg-surface border border-error/50 rounded">
              <p className="text-error font-medium">
                Error: QuotaExceededError
              </p>
              <p className="text-text-muted text-sm mt-2">
                The draft content remains in the editor for the user to retry.
              </p>
            </div>
          </div>
          <Story />
        </div>
      )
    },
  ],
}

export const WithUndoAction: Story = {
  args: {
    id: 'undo-1',
    message: 'Block deleted',
    type: 'warning',
    action: {
      label: 'Undo',
      onClick: () => alert('Undo clicked!'),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Toast with an undo action button. Used for reversible actions like delete. Clicking Undo triggers the action and dismisses the toast.',
      },
    },
  },
}

export const UndoToastDemo: StoryObj<typeof ToastContainer> = {
  render: () => <ToastContainer />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Demonstrates the undo toast pattern for delete operations. The toast appears with an Undo button that restores the deleted item.',
      },
    },
  },
  decorators: [
    (Story) => {
      const [deletedItems, setDeletedItems] = React.useState<string[]>([])

      const handleDelete = (itemId: string) => {
        setDeletedItems((prev) => [...prev, itemId])
        showUndoable(`Block ${itemId} deleted`, () => {
          setDeletedItems((prev) => prev.filter((id) => id !== itemId))
          showSuccess(`Block ${itemId} restored`)
        })
      }

      return (
        <div className="min-h-screen bg-bg p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-text mb-6">
              Undo Toast Demo
            </h1>
            <p className="text-text-muted mb-8">
              Click delete buttons to see undo toasts. You have 5 seconds to
              undo the deletion before it becomes permanent.
            </p>

            <div className="space-y-4">
              {['A', 'B', 'C'].map(
                (id) =>
                  !deletedItems.includes(id) && (
                    <div
                      key={id}
                      className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg"
                    >
                      <span className="text-text">Block {id}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(id)}
                        className="px-3 py-1 text-sm text-error hover:bg-error/10 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )
              )}
              {deletedItems.length === 3 && (
                <p className="text-text-muted text-center py-8">
                  All blocks deleted. Refresh to reset.
                </p>
              )}
            </div>
          </div>
          <Story />
        </div>
      )
    },
  ],
}
