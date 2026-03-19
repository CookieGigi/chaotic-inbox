import type { Meta, StoryObj } from '@storybook/react'
import { WDYRExample } from './WDYRExample'

const meta = {
  title: 'Debug/WDYR Example',
  component: WDYRExample,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WDYRExample>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
