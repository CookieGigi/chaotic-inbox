import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { UrlBlockEdit } from './UrlBlockEdit'

const meta: Meta<typeof UrlBlockEdit> = {
  title: 'UrlBlock/UrlBlockEdit',
  component: UrlBlockEdit,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'content changed' },
    onSubmit: { action: 'submitted' },
    onCancel: { action: 'cancelled' },
  },
}

export default meta
type Story = StoryObj<typeof UrlBlockEdit>

/**
 * Default URL editing with a simple URL
 */
export const Default: Story = {
  args: {
    initialUrl: 'https://example.com',
  },
}

/**
 * URL editing with a long URL to test text overflow handling
 */
export const WithLongUrl: Story = {
  args: {
    initialUrl:
      'https://example.com/very/long/path/that/might/cause/overflow/issues/in/the/ui/if/not/handled/properly',
  },
}

/**
 * URL editing with a URL that has query parameters
 */
export const WithQueryParams: Story = {
  args: {
    initialUrl:
      'https://example.com/search?q=react+components&page=1&sort=desc',
  },
}

/**
 * Interactive demo showing state management
 */
export const Interactive: Story = {
  render: () => {
    const [url, setUrl] = useState('https://example.com')

    const handleSubmit = () => {
      alert(`URL saved: ${url}`)
    }

    const handleCancel = () => {
      setUrl('https://example.com')
    }

    return (
      <div className="w-96 p-4 bg-bg border border-border rounded-lg">
        <p className="text-sm text-hint mb-2">
          Ctrl+Enter to save, Escape to cancel
        </p>
        <div className="bg-surface p-3 rounded">
          <UrlBlockEdit
            initialUrl={url}
            onChange={setUrl}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    )
  },
}

/**
 * URL editing shown within a block-like context
 */
export const InBlockContext: Story = {
  render: () => (
    <div className="w-96 bg-bg border border-border">
      <div className="flex items-baseline justify-between p-3 border-b border-border">
        <span className="text-sm text-text font-medium">URL Block</span>
        <span className="text-xs text-text-faint">Just now</span>
      </div>
      <div className="p-3">
        <UrlBlockEdit
          initialUrl="https://github.com/example/repo"
          onChange={(url) => console.log('Changed:', url)}
          onSubmit={() => console.log('Submitted')}
          onCancel={() => console.log('Cancelled')}
        />
      </div>
      <div className="px-3 pb-3 text-xs text-hint">
        Press Ctrl+Enter to save changes
      </div>
    </div>
  ),
}
