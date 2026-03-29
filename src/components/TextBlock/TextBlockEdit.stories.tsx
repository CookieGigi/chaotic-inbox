import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextBlockEdit } from './TextBlockEdit'

const meta: Meta<typeof TextBlockEdit> = {
  title: 'Components/TextBlock/TextBlockEdit',
  component: TextBlockEdit,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Editable variant of TextBlock using a textarea. Supports multi-line editing with Ctrl+Enter to submit and Escape to cancel.',
      },
    },
  },
  argTypes: {
    onChange: { action: 'changed' },
    onSubmit: { action: 'submitted' },
    onCancel: { action: 'cancelled' },
  },
}

export default meta
type Story = StoryObj<typeof TextBlockEdit>

export const Empty: Story = {
  args: {
    initialContent: '',
    onChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
  },
}

export const WithContent: Story = {
  args: {
    initialContent: 'This is some editable text content. Try typing here!',
    onChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
  },
}

export const MultiLine: Story = {
  args: {
    initialContent: `Line 1: This is the first line
Line 2: This is the second line
Line 3: This is the third line
Line 4: Press Enter to create new lines`,
    onChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
  },
}

export const LongContent: Story = {
  args: {
    initialContent: `This is a longer text that demonstrates the auto-expanding behavior of the textarea component. 

As you type more content, the textarea should automatically grow to accommodate the new lines without showing scrollbars.

Try pressing Ctrl+Enter to simulate submission or Escape to simulate cancellation.`,
    onChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
  },
}

export const Interactive: Story = {
  args: {
    initialContent: 'Type here and watch the actions panel...',
    onChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive story where all callbacks are logged to the actions panel. Try typing, then press Ctrl+Enter or Escape.',
      },
    },
  },
}

export const SingleCharacter: Story = {
  args: {
    initialContent: 'a',
    onChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Represents the initial state when user types first character to create a draft.',
      },
    },
  },
}
