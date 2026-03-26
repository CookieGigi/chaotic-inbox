import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileBlock } from './FileBlock'
import type { RawItem } from '@/models/rawItem'

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
    title: filename,
  }
}

describe('FileBlock', () => {
  describe('rendering', () => {
    it('renders filename from metadata', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      expect(screen.getByText('document.pdf')).toBeInTheDocument()
    })

    it('renders file size in human-readable format', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      expect(screen.getByText('1 KB')).toBeInTheDocument()
    })

    it('renders bytes for small files', () => {
      const item = createFileItem('tiny.txt', 512, 'txt')
      render(<FileBlock item={item} />)

      expect(screen.getByText('512 B')).toBeInTheDocument()
    })

    it('renders megabytes for large files', () => {
      const item = createFileItem('large.zip', 5 * 1024 * 1024, 'zip')
      render(<FileBlock item={item} />)

      expect(screen.getByText('5 MB')).toBeInTheDocument()
    })

    it('has no icon (handled by Block wrapper)', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      const { container } = render(<FileBlock item={item} />)

      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('has no header (handled by Block)', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      const { container } = render(<FileBlock item={item} />)

      expect(container.querySelector('header')).not.toBeInTheDocument()
    })

    it('has no footer', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      const { container } = render(<FileBlock item={item} />)

      expect(container.querySelector('footer')).not.toBeInTheDocument()
    })
  })

  describe('design system compliance', () => {
    it('filename uses base-medium text size', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const filename = screen.getByText('document.pdf')
      expect(filename).toHaveClass('text-base')
    })

    it('filename uses medium font weight', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const filename = screen.getByText('document.pdf')
      expect(filename).toHaveClass('font-medium')
    })

    it('filename uses text color', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const filename = screen.getByText('document.pdf')
      expect(filename).toHaveClass('text-text')
    })

    it('file size uses xs text size', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const size = screen.getByText('1 KB')
      expect(size).toHaveClass('text-xs')
    })

    it('file size uses muted color', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const size = screen.getByText('1 KB')
      expect(size).toHaveClass('text-textSecondary')
    })

    it('uses flex row layout', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const container = screen.getByText('document.pdf').parentElement
      expect(container).toHaveClass('flex')
      expect(container).toHaveClass('flex-row')
    })

    it('has gap between filename and size', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const container = screen.getByText('document.pdf').parentElement
      expect(container).toHaveClass('gap-2')
    })
  })

  describe('file types', () => {
    it('renders pdf filename correctly', () => {
      const item = createFileItem('report.pdf', 2048, 'pdf')
      render(<FileBlock item={item} />)

      expect(screen.getByText('report.pdf')).toBeInTheDocument()
    })

    it('renders zip filename correctly', () => {
      const item = createFileItem('archive.zip', 10240, 'zip')
      render(<FileBlock item={item} />)

      expect(screen.getByText('archive.zip')).toBeInTheDocument()
    })

    it('renders txt filename correctly', () => {
      const item = createFileItem('notes.txt', 256, 'txt')
      render(<FileBlock item={item} />)

      expect(screen.getByText('notes.txt')).toBeInTheDocument()
    })

    it('renders other file types correctly', () => {
      const item = createFileItem('data.bin', 4096, 'other')
      render(<FileBlock item={item} />)

      expect(screen.getByText('data.bin')).toBeInTheDocument()
    })

    it('renders docx filename correctly', () => {
      const item = createFileItem('document.docx', 8192, 'docx')
      render(<FileBlock item={item} />)

      expect(screen.getByText('document.docx')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles empty filename', () => {
      const item = createFileItem('', 1024, 'pdf')
      render(<FileBlock item={item} />)

      // Should still render the size
      expect(screen.getByText('1 KB')).toBeInTheDocument()
    })

    it('handles zero file size', () => {
      const item = createFileItem('empty.txt', 0, 'txt')
      render(<FileBlock item={item} />)

      expect(screen.getByText('0 B')).toBeInTheDocument()
    })

    it('handles very large file sizes', () => {
      const item = createFileItem('huge.iso', 1024 * 1024 * 1024, 'other')
      render(<FileBlock item={item} />)

      expect(screen.getByText('1 GB')).toBeInTheDocument()
    })

    it('handles decimal file sizes', () => {
      const item = createFileItem('partial.pdf', 1536, 'pdf')
      render(<FileBlock item={item} />)

      // Should show 1.5 KB or similar
      const sizeElement = screen.getByText(/KB/)
      expect(sizeElement).toBeInTheDocument()
    })

    it('handles filenames with special characters', () => {
      const item = createFileItem('file-with-special_chars.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      expect(
        screen.getByText('file-with-special_chars.pdf')
      ).toBeInTheDocument()
    })

    it('handles long filenames', () => {
      const longName = 'a'.repeat(100) + '.pdf'
      const item = createFileItem(longName, 1024, 'pdf')
      render(<FileBlock item={item} />)

      expect(screen.getByText(longName)).toBeInTheDocument()
    })
  })
})
