import type { Meta, StoryObj } from '@storybook/react-vite'
import { EditButton } from './EditButton'
import { BlockActionMenu } from './BlockActionMenu'

const meta: Meta<typeof EditButton> = {
  title: 'Block/BlockActionMenu/EditButton',
  component: EditButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onEdit: { action: 'edit clicked' },
    ariaLabel: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof EditButton>

/**
 * Default edit button with standard styling
 */
export const Default: Story = {
  args: {
    ariaLabel: 'Edit block',
  },
}

/**
 * Edit button with custom accessibility label
 */
export const WithCustomLabel: Story = {
  args: {
    ariaLabel: 'Edit text block content',
  },
}

/**
 * Edit button displayed within a BlockActionMenu context
 * This shows how it appears alongside other action buttons
 */
export const InActionMenu: Story = {
  render: () => (
    <div className="group relative flex items-start gap-2 p-4 bg-surface rounded-lg">
      <div className="flex-1">
        <p className="text-text">Block content goes here</p>
      </div>
      <BlockActionMenu>
        <EditButton onEdit={() => console.log('Edit clicked')} />
      </BlockActionMenu>
    </div>
  ),
}

/**
 * Edit button shown in a context with both edit and delete buttons
 */
export const WithDeleteButton: Story = {
  render: () => (
    <div className="group relative flex items-start gap-2 p-4 bg-surface rounded-lg">
      <div className="flex-1">
        <p className="text-text">Block content goes here</p>
      </div>
      <BlockActionMenu>
        <EditButton onEdit={() => console.log('Edit clicked')} />
        <button
          type="button"
          className="
            w-8 h-8 rounded-lg box-border
            flex items-center justify-center
            text-text-faint
            hover:text-error hover:bg-surface-hover
            transition-colors duration-150
          "
          aria-label="Delete block"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <title>Delete icon</title>
            <path d="M3 4h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4zm3 2v6h2V6H6zm4 0v6h2V6h-2zM5 2V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h3v2H2V2h3z" />
          </svg>
        </button>
      </BlockActionMenu>
    </div>
  ),
}
