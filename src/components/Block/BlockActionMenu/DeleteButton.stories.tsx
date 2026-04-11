import type { Meta, StoryObj } from '@storybook/react-vite'
import { DeleteButton } from './DeleteButton'
import { BlockActionMenu } from './BlockActionMenu'

const meta: Meta<typeof DeleteButton> = {
  title: 'Components/Block/DeleteButton',
  component: DeleteButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A destructive action button for deleting blocks. Shows red color on hover.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onDelete: {
      description: 'Callback when delete is triggered',
      action: 'deleted',
    },
    ariaLabel: {
      description: 'Accessible label for the button',
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof DeleteButton>

/**
 * Default delete button with standard styling.
 */
export const Default: Story = {
  args: {
    onDelete: () => alert('Delete triggered!'),
  },
}

/**
 * Delete button with custom aria label for different block types.
 */
export const CustomLabel: Story = {
  args: {
    onDelete: () => {},
    ariaLabel: 'Delete image block',
  },
}

/**
 * Shows the hover state (simulated with class).
 * In real usage, hover to see the red color.
 */
export const HoverState: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-text-muted text-xs">Default</span>
        <DeleteButton onDelete={() => {}} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-text-muted text-xs">Hover (simulated)</span>
        <button
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-error bg-surface-hover"
          aria-label="Delete block"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 256 256"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16ZM96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 160H64V64h128ZM112 104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Z" />
          </svg>
        </button>
      </div>
    </div>
  ),
}

/**
 * Focus state for keyboard navigation.
 */
export const FocusState: Story = {
  render: () => (
    <div className="p-4">
      <p className="text-text-muted text-sm mb-4">
        Press Tab to focus the button and see the focus ring:
      </p>
      <DeleteButton onDelete={() => {}} />
    </div>
  ),
}

/**
 * Delete button shown in context within the BlockActionMenu.
 * Hover over the block to see the menu appear with the delete button.
 */
export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-text text-sm">
        Hover over the block to see the delete button in the action menu:
      </p>
      <div className="group flex w-96">
        <div className="flex-1 p-4 bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">📝</span>
              <span className="text-sm text-text-muted font-mono truncate">
                Note
              </span>
            </div>
            <span className="text-sm text-text-muted font-mono">14:32</span>
          </div>
          <p className="text-text">
            This is how the delete button appears inside the BlockActionMenu.
          </p>
        </div>
        <BlockActionMenu>
          <DeleteButton onDelete={() => {}} />
        </BlockActionMenu>
      </div>
    </div>
  ),
}
