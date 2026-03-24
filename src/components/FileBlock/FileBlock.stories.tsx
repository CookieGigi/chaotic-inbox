import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileBlock } from './FileBlock'
import type { RawItem } from '@/models/rawItem'

const meta = {
  title: 'Components/FileBlock',
  component: FileBlock,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FileBlock>

export default meta
type Story = StoryObj<typeof meta>

function createFileItem(
  filename: string,
  filesize: number,
  subtype: 'pdf' | 'zip' | 'txt' | 'docx' | 'other' = 'other'
): RawItem & { type: 'file' } {
  return {
    id: 'test-id',
    capturedAt:
      new Date().toISOString() as import('@/types/branded').ISO8601Timestamp,
    type: 'file',
    raw: new Blob(),
    metadata: {
      kind: subtype,
      filename,
      filesize,
      mimetype: 'application/octet-stream',
    },
  }
}

// PDF file - common document type
export const PdfFile: Story = {
  args: {
    item: createFileItem('document.pdf', 2048576, 'pdf'),
  },
}

// ZIP archive - compressed file
export const ZipFile: Story = {
  args: {
    item: createFileItem('archive.zip', 10485760, 'zip'),
  },
}

// Text file - plain text document
export const TextFile: Story = {
  args: {
    item: createFileItem('notes.txt', 1024, 'txt'),
  },
}

// Word document - office file
export const WordDocument: Story = {
  args: {
    item: createFileItem('report.docx', 512000, 'docx'),
  },
}

// Binary/unknown file type
export const BinaryFile: Story = {
  args: {
    item: createFileItem('data.bin', 4096, 'other'),
  },
}

// Small file - shows bytes
export const SmallFile: Story = {
  args: {
    item: createFileItem('tiny.txt', 256, 'txt'),
  },
}

// Large file - shows megabytes
export const LargeFile: Story = {
  args: {
    item: createFileItem('large-video.mp4', 1073741824, 'other'),
  },
}

// Very large file - shows gigabytes
export const VeryLargeFile: Story = {
  args: {
    item: createFileItem('huge.iso', 5368709120, 'other'),
  },
}

// Empty file - edge case
export const EmptyFile: Story = {
  args: {
    item: createFileItem('empty.txt', 0, 'txt'),
  },
}

// Long filename - truncation test
export const LongFilename: Story = {
  args: {
    item: createFileItem(
      'this-is-a-very-long-filename-that-might-need-truncation-in-the-ui.pdf',
      1048576,
      'pdf'
    ),
  },
}

// Filename with special characters
export const SpecialCharacters: Story = {
  args: {
    item: createFileItem(
      'file-with-special_chars-and-numbers-123.txt',
      2048,
      'txt'
    ),
  },
}

// Multiple file types showcase
export const FileTypeShowcase: Story = {
  args: {
    item: createFileItem('presentation.pdf', 3145728, 'pdf'),
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <FileBlock item={createFileItem('document.pdf', 2048576, 'pdf')} />
      <FileBlock item={createFileItem('backup.zip', 52428800, 'zip')} />
      <FileBlock item={createFileItem('readme.txt', 512, 'txt')} />
      <FileBlock item={createFileItem('project.docx', 1048576, 'docx')} />
      <FileBlock item={createFileItem('unknown-file.xyz', 102400, 'other')} />
    </div>
  ),
}
