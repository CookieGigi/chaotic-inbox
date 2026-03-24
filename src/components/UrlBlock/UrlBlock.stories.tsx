import type { Meta, StoryObj } from '@storybook/react-vite'
import { UrlBlock } from './UrlBlock'

const meta = {
  title: 'Components/UrlBlock',
  component: UrlBlock,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UrlBlock>

export default meta
type Story = StoryObj<typeof meta>

// Simple URL - hostname label + full URL body
export const Simple: Story = {
  args: {
    url: 'example.com',
  },
}

// URL with https - protocol normalized
export const WithHttps: Story = {
  args: {
    url: 'https://example.com',
  },
}

// URL with path - hostname in label, full URL with path in body
export const WithPath: Story = {
  args: {
    url: 'https://example.com/path/to/page',
  },
}

// URL with www - www stripped from label
export const WithWww: Story = {
  args: {
    url: 'www.example.com',
  },
}

// Long URL - breaks to multiple lines
export const LongUrl: Story = {
  args: {
    url: 'https://example.com/very/long/path/to/some/deeply/nested/page/with/lots/of/segments',
  },
}

// URL with query parameters - full query shown in body
export const WithQueryParams: Story = {
  args: {
    url: 'https://example.com/search?q=test&page=1',
  },
}

// Subdomain - shown in hostname label
export const Subdomain: Story = {
  args: {
    url: 'https://blog.example.com',
  },
}

// HTTP URL - protocol preserved
export const WithHttp: Story = {
  args: {
    url: 'http://example.com',
  },
}

// Complex URL with all parts - hostname:port in label, full URL in body
export const Complex: Story = {
  args: {
    url: 'https://www.example.com:8080/path/to/resource?query=value#anchor',
  },
}

// URL with port
export const WithPort: Story = {
  args: {
    url: 'https://example.com:3000/api',
  },
}

// Empty URL (edge case)
export const Empty: Story = {
  args: {
    url: '',
  },
}

// Invalid URL (edge case - should still display)
export const Invalid: Story = {
  args: {
    url: 'not-a-valid-url',
  },
}

// URL with special characters
export const SpecialCharacters: Story = {
  args: {
    url: 'https://example.com/path-with-&-special?chars=<>&"',
  },
}

// Deep subdomain nesting
export const DeepSubdomain: Story = {
  args: {
    url: 'https://api.staging.service.company.com/v1/users',
  },
}
