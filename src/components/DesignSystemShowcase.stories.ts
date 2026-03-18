import type { Meta, StoryObj } from '@storybook/react-vite'
import { DesignSystemShowcase } from './DesignSystemShowcase'

const meta = {
  title: 'Design System/Showcase',
  component: DesignSystemShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Comprehensive showcase of all design tokens from the Vault Design System based on Catppuccin Macchiato palette.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DesignSystemShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
