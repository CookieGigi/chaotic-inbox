import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ISO8601Timestamp } from '@/types/branded'
import { Timestamp } from './Timestamp'

const meta = {
  title: 'Components/Timestamp',
  component: Timestamp,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Timestamp>

export default meta
type Story = StoryObj<typeof meta>

// All timestamps use UTC time (as stored in ISO8601)

export const Today: Story = {
  args: {
    value: '2026-03-22T14:30:00.000Z' as ISO8601Timestamp,
  },
}

export const ThisYear: Story = {
  args: {
    value: '2026-01-15T10:05:00.000Z' as ISO8601Timestamp,
  },
}

export const Older: Story = {
  args: {
    value: '2023-06-10T08:30:00.000Z' as ISO8601Timestamp,
  },
}

export const Yesterday: Story = {
  args: {
    value: '2026-03-21T18:45:00.000Z' as ISO8601Timestamp,
  },
}

export const LastMonth: Story = {
  args: {
    value: '2026-02-20T09:15:00.000Z' as ISO8601Timestamp,
  },
}

export const Midnight: Story = {
  args: {
    value: '2026-03-22T00:00:00.000Z' as ISO8601Timestamp,
  },
}

export const NewYearsDay: Story = {
  args: {
    value: '2026-01-01T00:00:00.000Z' as ISO8601Timestamp,
  },
}
