import type { RawItem } from '@/models/rawItem'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BlockIcon } from './BlockIcon'

const meta: Meta<typeof BlockIcon> = {
  title: 'Components/Block/BlockIcon',
  component: BlockIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BlockIcon>

// Helper for timestamps
const timestamp = (date: string): RawItem['capturedAt'] =>
  date as RawItem['capturedAt']

// Text Item
const textItem: RawItem = {
  id: 'text-1',
  type: 'text',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: 'Test text content',
  metadata: {
    kind: 'plain',
    wordCount: 3,
  },
}

export const TextIcon: Story = {
  args: {
    item: textItem,
  },
  name: 'Text (Article Icon)',
}

// URL Item
const urlItem: RawItem = {
  id: 'url-1',
  type: 'url',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: 'https://example.com',
  metadata: {
    kind: 'url',
    title: 'Example',
    favicon: 'https://example.com/favicon.ico',
  },
}

export const UrlIcon: Story = {
  args: {
    item: urlItem,
  },
  name: 'URL (Link Icon)',
}

// Image Item
const imageItem: RawItem = {
  id: 'image-1',
  type: 'image',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], { type: 'image/png' }),
  metadata: {
    kind: 'image',
    width: 800,
    height: 600,
  },
}

export const ImageIcon: Story = {
  args: {
    item: imageItem,
  },
  name: 'Image (Image Icon)',
}

// PDF File Item
const pdfItem: RawItem = {
  id: 'file-pdf',
  type: 'file',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], { type: 'application/pdf' }),
  metadata: {
    kind: 'pdf',
    filename: 'document.pdf',
    filesize: 2048,
    mimetype: 'application/pdf',
  },
}

export const PdfIcon: Story = {
  args: {
    item: pdfItem,
  },
  name: 'PDF File (FilePdf Icon)',
}

// Zip File Item
const zipItem: RawItem = {
  id: 'file-zip',
  type: 'file',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], { type: 'application/zip' }),
  metadata: {
    kind: 'zip',
    filename: 'archive.zip',
    filesize: 1024,
    mimetype: 'application/zip',
  },
}

export const ZipIcon: Story = {
  args: {
    item: zipItem,
  },
  name: 'Zip File (FileZip Icon)',
}

// Text File Item
const txtItem: RawItem = {
  id: 'file-txt',
  type: 'file',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], { type: 'text/plain' }),
  metadata: {
    kind: 'txt',
    filename: 'notes.txt',
    filesize: 512,
    mimetype: 'text/plain',
  },
}

export const TxtIcon: Story = {
  args: {
    item: txtItem,
  },
  name: 'Text File (FileText Icon)',
}

// Docx File Item
const docxItem: RawItem = {
  id: 'file-docx',
  type: 'file',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }),
  metadata: {
    kind: 'docx',
    filename: 'document.docx',
    filesize: 1024,
    mimetype:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
}

export const DocxIcon: Story = {
  args: {
    item: docxItem,
  },
  name: 'Docx File (FileText Icon)',
}

// Other File Item
const otherItem: RawItem = {
  id: 'file-other',
  type: 'file',
  capturedAt: timestamp('2026-03-24T10:00:00.000Z'),
  raw: new Blob(['test'], { type: 'application/octet-stream' }),
  metadata: {
    kind: 'other',
    filename: 'unknown.bin',
    filesize: 256,
    mimetype: 'application/octet-stream',
  },
}

export const OtherIcon: Story = {
  args: {
    item: otherItem,
  },
  name: 'Other File (Generic File Icon)',
}
