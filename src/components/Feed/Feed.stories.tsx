import type { Meta, StoryObj } from '@storybook/react-vite'
import { Feed } from './Feed'
import type { RawItem } from '@/models/rawItem'

const meta = {
  title: 'Components/Feed',
  component: Feed,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Feed component displays a chronological list of captured items. Items are sorted oldest-first (top) to newest-last (bottom). The feed auto-scrolls to the newest item on mount and when items are added.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onDeleteItem: () => {},
  },
} satisfies Meta<typeof Feed>

export default meta
type Story = StoryObj<typeof meta>

// Test data factories
const createTextItem = (
  id: string,
  capturedAt: string,
  content: string
): RawItem & { type: 'text' } => ({
  id,
  type: 'text',
  capturedAt: capturedAt as RawItem['capturedAt'],
  raw: content,
  metadata: {
    kind: 'plain',
    wordCount: content.split(' ').length,
  },
})

const createUrlItem = (
  id: string,
  capturedAt: string,
  url: string,
  title?: string
): RawItem & { type: 'url' } => ({
  id,
  type: 'url',
  capturedAt: capturedAt as RawItem['capturedAt'],
  raw: url,
  metadata: {
    kind: 'url',
    title,
    favicon: 'https://example.com/favicon.ico',
  },
  title: title || new URL(url).hostname,
})

const createImageItem = (
  id: string,
  capturedAt: string
): RawItem & { type: 'image' } => ({
  id,
  type: 'image',
  capturedAt: capturedAt as RawItem['capturedAt'],
  raw: new Blob(['fake-image-data'], { type: 'image/png' }),
  metadata: {
    kind: 'image',
    width: 800,
    height: 600,
  },
})

const createFileItem = (
  id: string,
  capturedAt: string,
  filename: string,
  size: number
): RawItem & { type: 'file' } => ({
  id,
  type: 'file',
  capturedAt: capturedAt as RawItem['capturedAt'],
  raw: new Blob(['fake-file-data'], { type: 'application/pdf' }),
  metadata: {
    kind: 'pdf',
    filename,
    filesize: size,
    mimetype: 'application/pdf',
  },
  title: filename,
})

export const Empty: Story = {
  args: {
    items: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Empty state shown when no items have been captured. Displays a helpful prompt to guide users on how to add content.',
      },
    },
  },
}

export const SingleTextItem: Story = {
  args: {
    items: [
      createTextItem(
        'text-1',
        '2026-03-27T10:00:00.000Z',
        'This is a single text item in the feed.'
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Feed with a single text block.',
      },
    },
  },
}

export const SingleUrlItem: Story = {
  args: {
    items: [
      createUrlItem(
        'url-1',
        '2026-03-27T10:00:00.000Z',
        'https://example.com/article',
        'Example Article'
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Feed with a single URL block showing hostname label.',
      },
    },
  },
}

export const MixedContent: Story = {
  args: {
    items: [
      createTextItem(
        'text-1',
        '2026-03-27T08:00:00.000Z',
        'First item: A simple text note captured earlier in the morning.'
      ),
      createUrlItem(
        'url-1',
        '2026-03-27T09:30:00.000Z',
        'https://github.com',
        'GitHub'
      ),
      createTextItem(
        'text-2',
        '2026-03-27T10:15:00.000Z',
        'Another text item with more content to show how multiple text blocks appear in the feed alongside other types.'
      ),
      createUrlItem(
        'url-2',
        '2026-03-27T11:00:00.000Z',
        'https://developer.mozilla.org',
        'MDN Web Docs'
      ),
      createFileItem(
        'file-1',
        '2026-03-27T12:30:00.000Z',
        'document.pdf',
        1024 * 1024 * 2.5
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Feed with mixed content types: text, URLs, and files. Demonstrates chronological ordering and 1px dividers between blocks.',
      },
    },
  },
}

export const ChronologicalOrder: Story = {
  args: {
    items: [
      createTextItem(
        'oldest',
        '2026-03-27T08:00:00.000Z',
        'Oldest item (8:00 AM) - appears at the top'
      ),
      createTextItem(
        'middle-1',
        '2026-03-27T10:00:00.000Z',
        'Middle item 1 (10:00 AM)'
      ),
      createTextItem(
        'middle-2',
        '2026-03-27T12:00:00.000Z',
        'Middle item 2 (12:00 PM)'
      ),
      createTextItem(
        'newest',
        '2026-03-27T14:00:00.000Z',
        'Newest item (2:00 PM) - appears at the bottom'
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates chronological ordering: items are sorted by capture time ascending (oldest first). The timestamps show the ordering visually.',
      },
    },
  },
}

export const ScrollableList: Story = {
  args: {
    items: Array.from({ length: 15 }, (_, i) => {
      const hour = 8 + Math.floor(i / 2)
      const minute = (i % 2) * 30
      return createTextItem(
        `item-${i}`,
        `2026-03-27T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`,
        `Item ${i + 1}: This is a longer text item to demonstrate scrolling behavior. The feed should show multiple items and auto-scroll to the newest (bottom) item. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
      )
    }),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Feed with 15 items to demonstrate scrollable content. The feed auto-scrolls to the bottom (newest item) on mount.',
      },
    },
  },
}

export const WithImagesAndFiles: Story = {
  args: {
    items: [
      createTextItem(
        'text-1',
        '2026-03-27T09:00:00.000Z',
        'Starting with some text content.'
      ),
      createImageItem('image-1', '2026-03-27T09:30:00.000Z'),
      createTextItem(
        'text-2',
        '2026-03-27T10:00:00.000Z',
        'Some notes about the image above.'
      ),
      createFileItem(
        'file-1',
        '2026-03-27T10:30:00.000Z',
        'screenshot.png',
        1024 * 512
      ),
      createUrlItem(
        'url-1',
        '2026-03-27T11:00:00.000Z',
        'https://example.com',
        'Example Site'
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Feed containing all supported content types: text, images, files, and URLs.',
      },
    },
  },
}
