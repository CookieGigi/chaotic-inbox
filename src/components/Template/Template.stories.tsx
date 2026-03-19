import type { Meta, StoryObj } from '@storybook/react-vite'
import { Template } from './Template'

const meta = {
  title: 'Components/Template',
  component: Template,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Template>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Example Item',
    content: 'This is a template component example.',
  },
}

export const LongContent: Story = {
  args: {
    title: 'Long Content Example',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
}
