import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextBlock } from './TextBlock'

const meta = {
  title: 'Components/TextBlock',
  component: TextBlock,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TextBlock>

export default meta
type Story = StoryObj<typeof meta>

// Short text that fits within 5 lines
export const Short: Story = {
  args: {
    content:
      'This is a short text that fits comfortably within 5 lines. No truncation needed.',
  },
}

// Long text that exceeds 5 lines and shows toggle
export const Long: Story = {
  args: {
    content: `This is the first line of a longer text block.
Second line adds more content here.
Third line continues building up the text.
Fourth line is getting close to the limit.
Fifth line is the last visible one by default.
Sixth line is hidden until you expand.
Seventh line has even more content to show.
Eighth and final line demonstrates the full expansion.`,
  },
}

// Exactly 5 lines (edge case - no toggle)
export const ExactlyFiveLines: Story = {
  args: {
    content: `First line of exactly five.
Second line of content here.
Third line in the middle.
Fourth line almost done.
Fifth and final line visible.`,
  },
}

// Empty content edge case
export const Empty: Story = {
  args: {
    content: '',
  },
}

// Text with special characters and unicode
export const SpecialCharacters: Story = {
  args: {
    content: `Special characters: <>&"' should render correctly.
Unicode emojis: 🔥🎉✨💡🚀 work too!
Line 3 with more content.
Line 4 continues the story.
Line 5 is still visible.
Line 6 requires expansion to see.`,
  },
}

// Very long single word
export const LongWord: Story = {
  args: {
    content: `This paragraph contains a very long single word that should wrap correctly: ${'a'.repeat(200)} and more text after.`,
  },
}

// Expanded state (using play function)
export const Expanded: Story = {
  args: {
    content: `Line one of the content.
Line two continues here.
Line three adds more.
Line four is next.
Line five is visible.
Line six is initially hidden.
Line seven shows when expanded.
Line eight completes the view.`,
  },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button')
    if (button) {
      button.click()
    }
  },
}
