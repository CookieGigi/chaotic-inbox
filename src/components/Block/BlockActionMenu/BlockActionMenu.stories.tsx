import type { Meta, StoryObj } from '@storybook/react-vite'
import { BlockActionMenu } from './BlockActionMenu'
import { DeleteButton } from './DeleteButton'

const meta: Meta<typeof BlockActionMenu> = {
  title: 'Components/Block/BlockActionMenu',
  component: BlockActionMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A sticky action menu that appears on block hover. Stays at top of block but sticks to viewport when scrolling. Supports max 4 items per column with automatic multi-column layout.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BlockActionMenu>

/**
 * Basic example with a single delete button.
 * Hover over the block to see the menu appear on the right side.
 * The menu is positioned outside the block flow and does not affect its height.
 */
export const Default: Story = {
  render: () => (
    <div className="group flex w-96">
      <div className="flex-1 p-4 bg-surface border border-border rounded-lg">
        <p className="text-text">Block content goes here...</p>
      </div>
      <BlockActionMenu>
        <DeleteButton onDelete={() => alert('Delete clicked!')} />
      </BlockActionMenu>
    </div>
  ),
}

/**
 * Example showing hover behavior.
 * The menu appears on the right side on hover, positioned outside the block.
 */
export const HoverBehavior: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-text text-sm">
        Hover over the block below to see the action menu appear on the right:
      </p>
      <div className="group flex w-96">
        <div className="flex-1 p-4 bg-surface border border-border rounded-lg transition-colors">
          <p className="text-text">Hover over this block</p>
        </div>
        <BlockActionMenu>
          <DeleteButton onDelete={() => console.log('Delete')} />
        </BlockActionMenu>
      </div>
    </div>
  ),
}

/**
 * Example with 4 buttons showing single column layout.
 * Menu is positioned outside the block flow and does NOT extend block height.
 * The block content determines the height, not the menu.
 */
export const MultipleButtons: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-text text-sm">
        Menu with 4 buttons appears on the right - block height is determined by
        content only:
      </p>
      <div className="group flex w-96">
        <div className="flex-1 p-4 bg-surface border border-border rounded-lg">
          <p className="text-text">Short block content</p>
          <p className="text-text-muted text-xs mt-2">
            The menu is outside this block
          </p>
        </div>
        <BlockActionMenu>
          <DeleteButton onDelete={() => {}} />
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-faint hover:text-text hover:bg-surface-hover transition-colors"
            aria-label="Edit"
          >
            <span className="text-sm">✎</span>
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-faint hover:text-text hover:bg-surface-hover transition-colors"
            aria-label="Copy"
          >
            <span className="text-sm">⎘</span>
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-faint hover:text-text hover:bg-surface-hover transition-colors"
            aria-label="Share"
          >
            <span className="text-sm">⇧</span>
          </button>
        </BlockActionMenu>
      </div>
    </div>
  ),
}

/**
 * Example with 10 buttons to demonstrate multi-column layout.
 * Menu displays max 4 items per column - additional items wrap to new columns.
 */
export const TenButtonsMultiColumn: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-text text-sm">
        Menu with 10 buttons - max 4 per column, wraps to 3 columns (4+4+2):
      </p>
      <div className="group flex w-96">
        <div className="flex-1 p-4 bg-surface border border-border rounded-lg">
          <p className="text-text">Block content</p>
          <p className="text-text-muted text-xs mt-2">
            The menu expands horizontally for more buttons
          </p>
        </div>
        <BlockActionMenu>
          {Array.from({ length: 10 }).map((_, index) => (
            <button
              key={`action-${index + 1}`}
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-faint hover:text-text hover:bg-surface-hover transition-colors"
              aria-label={`Action ${index + 1}`}
            >
              <span className="text-xs">{index + 1}</span>
            </button>
          ))}
        </BlockActionMenu>
      </div>
    </div>
  ),
}

/**
 * Example showing sticky behavior with scrollable content.
 * The menu sticks to the top of the viewport when scrolling.
 */
export const StickyBehavior: Story = {
  render: () => {
    const blocks = [
      { id: 'sticky-1', title: 'First Block' },
      { id: 'sticky-2', title: 'Second Block' },
      { id: 'sticky-3', title: 'Third Block' },
      { id: 'sticky-4', title: 'Fourth Block' },
      { id: 'sticky-5', title: 'Fifth Block' },
    ]
    return (
      <div className="h-[600px] w-[800px] overflow-y-auto border border-border rounded-lg">
        <div className="p-8 space-y-8">
          <p className="text-text text-base">
            Scroll down to see sticky behavior:
          </p>
          {blocks.map((block) => (
            <div key={block.id} className="group flex w-80">
              <div className="flex-1 p-6 bg-surface border border-border rounded-lg min-h-[300px]">
                <p className="text-text text-lg">{block.title}</p>
                <p className="text-text-muted text-base mt-4">
                  This block is tall to demonstrate sticky behavior. The menu
                  stays at the top of the block but will stick to the viewport
                  when scrolling.
                </p>
              </div>
              <BlockActionMenu>
                <DeleteButton onDelete={() => {}} />
              </BlockActionMenu>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * Dark theme example showing subtle background difference.
 */
export const OnDarkBackground: Story = {
  render: () => (
    <div className="group flex w-96 p-4 bg-bg rounded-lg">
      <div className="flex-1 p-4 bg-surface border border-border rounded-lg">
        <p className="text-text">Block on dark background</p>
        <p className="text-text-muted text-sm mt-2">
          Notice the subtle background difference of the menu.
        </p>
      </div>
      <BlockActionMenu>
        <DeleteButton onDelete={() => {}} />
      </BlockActionMenu>
    </div>
  ),
}
