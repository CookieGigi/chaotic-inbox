import type { Meta, StoryObj } from '@storybook/react-vite'
import { BlockTitle } from './BlockTitle'

const meta: Meta<typeof BlockTitle> = {
  title: 'Components/Block/BlockTitle',
  component: BlockTitle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BlockTitle>

export const Default: Story = {
  args: {
    title: 'Example Title',
  },
}

export const LongTitle: Story = {
  args: {
    title:
      'This is a very long title that should be truncated when it exceeds the available space in the header',
  },
  name: 'Long Title (Truncated)',
}

export const FileName: Story = {
  args: {
    title: 'document.pdf',
  },
  name: 'Filename Example',
}

export const UrlHostname: Story = {
  args: {
    title: 'example.com',
  },
  name: 'URL Hostname Example',
}

export const NoTitle: Story = {
  args: {
    title: undefined,
  },
  name: 'No Title (Renders Nothing)',
}
