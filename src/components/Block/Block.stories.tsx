import type { Meta, StoryObj } from '@storybook/react-vite'
import { Block } from './Block'
import type { RawItem } from '@/models/rawItem'

const meta: Meta<typeof Block> = {
  title: 'Components/Block',
  component: Block,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Block>

// Helper for timestamps
const timestamp = (date: string): RawItem['capturedAt'] =>
  date as RawItem['capturedAt']

// Text Block
const textItem: RawItem = {
  id: 'text-1',
  type: 'text',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: 'This is a simple text block. It can contain plain text content that will be displayed in the feed.',
  metadata: {
    kind: 'plain',
    wordCount: 20,
  },
}

export const TextBlock: Story = {
  args: {
    item: textItem,
  },
}

// URL Block
const urlItem: RawItem = {
  id: 'url-1',
  type: 'url',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: 'https://example.com/path/to/page',
  metadata: {
    kind: 'url',
    title: 'Example Page',
    favicon: 'https://example.com/favicon.ico',
  },
  title: 'example.com',
}

export const UrlBlock: Story = {
  args: {
    item: urlItem,
  },
}

// Image Block
const imageItem: RawItem = {
  id: 'image-1',
  type: 'image',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], { type: 'image/png' }),
  metadata: {
    kind: 'image',
    width: 800,
    height: 600,
    alt: 'Test image',
  },
  title: 'Test image',
}

export const ImageBlock: Story = {
  args: {
    item: imageItem,
  },
}

// File Block - PDF
const pdfFileItem: RawItem = {
  id: 'file-1',
  type: 'file',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], { type: 'application/pdf' }),
  metadata: {
    kind: 'pdf',
    filename: 'document.pdf',
    filesize: 2048576, // 2 MB
    mimetype: 'application/pdf',
  },
  title: 'document.pdf',
}

export const FileBlockPdf: Story = {
  args: {
    item: pdfFileItem,
  },
  name: 'File Block (PDF)',
}

// File Block - Zip
const zipFileItem: RawItem = {
  id: 'file-2',
  type: 'file',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], { type: 'application/zip' }),
  metadata: {
    kind: 'zip',
    filename: 'archive.zip',
    filesize: 102400, // 100 KB
    mimetype: 'application/zip',
  },
  title: 'archive.zip',
}

export const FileBlockZip: Story = {
  args: {
    item: zipFileItem,
  },
  name: 'File Block (Zip)',
}

// File Block - Text
const textFileItem: RawItem = {
  id: 'file-3',
  type: 'file',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], { type: 'text/plain' }),
  metadata: {
    kind: 'txt',
    filename: 'notes.txt',
    filesize: 1024, // 1 KB
    mimetype: 'text/plain',
  },
  title: 'notes.txt',
}

export const FileBlockText: Story = {
  args: {
    item: textFileItem,
  },
  name: 'File Block (Text)',
}

// Long text block (truncation demo)
const longTextItem: RawItem = {
  id: 'text-long',
  type: 'text',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: `This is a very long text that should demonstrate the truncation feature.
It has multiple lines.
Each line adds to the total.
Line four is here.
Line five should be visible.
Line six should be hidden initially.
Line seven should also be hidden.
Line eight is the final line.`,
  metadata: {
    kind: 'plain',
    wordCount: 50,
  },
}

export const TextBlockLong: Story = {
  args: {
    item: longTextItem,
  },
  name: 'Text Block (Long - Truncated)',
}
