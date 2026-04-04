import type { Meta, StoryObj } from '@storybook/react-vite'
import { DraftBlock } from './DraftBlock'
import type { DraftTextItem } from '@/store/appStore'

const meta: Meta<typeof DraftBlock> = {
  title: 'Components/DraftBlock',
  component: DraftBlock,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Draft block for in-progress text capture. Shows editable textarea with hint text and visual distinction from read-only blocks. Uses Zustand store for actions.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DraftBlock>

const createMockDraft = (content: string): DraftTextItem => ({
  id: 'draft',
  type: 'text',
  content,
  capturedAt: new Date().toISOString(),
})

export const Empty: Story = {
  args: {
    draft: createMockDraft(''),
  },
}

export const WithContent: Story = {
  args: {
    draft: createMockDraft('This is a draft text block. Edit me!'),
  },
}

export const SingleCharacter: Story = {
  args: {
    draft: createMockDraft('a'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Initial state when user types first character. Shows how the draft appears immediately.',
      },
    },
  },
}

export const MultiLine: Story = {
  args: {
    draft: createMockDraft(`This is a multi-line draft
with several lines
of text content
showing how it expands`),
  },
}

export const LongText: Story = {
  args: {
    draft:
      createMockDraft(`This is a longer draft that demonstrates the auto-expanding behavior.

The draft block should grow to accommodate all the content without scrolling.

You can keep typing and the textarea will expand vertically.

Use Ctrl+Enter to save or Escape to cancel.`),
  },
}

export const Interactive: Story = {
  args: {
    draft: createMockDraft(
      'Interactive draft - type and use keyboard shortcuts'
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive draft. Try editing the text, then press Ctrl+Enter to submit or Escape to cancel. Actions are handled via Zustand store.',
      },
    },
  },
}

export const InFeedContext: Story = {
  args: {
    draft: createMockDraft('New draft at the bottom of the feed'),
  },
  decorators: [
    (Story) => (
      <div className="max-w-[720px] mx-auto">
        <div className="divide-y divide-border">
          {/* Mock existing items */}
          <div className="py-3 px-4 opacity-50">
            <p className="text-sm text-text-muted mb-2">Previous item 1</p>
            <p className="text-base text-text">Some existing content...</p>
          </div>
          <div className="py-3 px-4 opacity-50">
            <p className="text-sm text-text-muted mb-2">Previous item 2</p>
            <p className="text-base text-text">More existing content...</p>
          </div>
          {/* The draft */}
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the draft block appears at the bottom of the feed, below existing items.',
      },
    },
  },
}

export const FocusedState: Story = {
  args: {
    draft: createMockDraft('This draft is focused'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Draft block in focused state with accent border and focus ring visible.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Auto-focus the textarea when story loads
    const textarea = canvasElement.querySelector('textarea')
    if (textarea) {
      textarea.focus()
    }
  },
}
