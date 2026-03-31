import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileBlock } from './FileBlock'
import type { RawItem } from '@/models/rawItem'

function createFileItem(
  filename: string,
  filesize: number,
  subtype: 'pdf' | 'zip' | 'txt' | 'md' | 'docx' | 'other' = 'other'
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
    it('renders file size with "Size: " prefix', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/Size:/)).toBeInTheDocument()
      expect(screen.getByText(/1 KB/)).toBeInTheDocument()
    })

    it('does not render filename in content (shown in header only)', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      const { container } = render(<FileBlock item={item} />)

      // Filename should not appear in the FileBlock content
      const fileContent = container.textContent
      expect(fileContent).not.toContain('document.pdf')
    })

    it('renders bytes for small files', () => {
      const item = createFileItem('tiny.txt', 512, 'txt')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/512 B/)).toBeInTheDocument()
    })

    it('renders megabytes for large files', () => {
      const item = createFileItem('large.zip', 5 * 1024 * 1024, 'zip')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/5 MB/)).toBeInTheDocument()
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
    it('uses text-sm size for content', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const sizeElement = screen.getByText(/Size:/)
      expect(sizeElement).toHaveClass('text-sm')
    })

    it('uses muted text color for content', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const sizeElement = screen.getByText(/Size:/)
      expect(sizeElement).toHaveClass('text-text-muted')
    })

    it('uses relaxed line height for better readability', () => {
      const item = createFileItem('document.pdf', 1024, 'pdf')
      render(<FileBlock item={item} />)

      const container = screen.getByText(/Size:/).parentElement
      expect(container).toHaveClass('leading-relaxed')
    })
  })

  describe('file size formatting', () => {
    it('renders pdf file size correctly', () => {
      const item = createFileItem('report.pdf', 2048, 'pdf')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/2 KB/)).toBeInTheDocument()
    })

    it('renders zip file size correctly', () => {
      const item = createFileItem('archive.zip', 10240, 'zip')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/10 KB/)).toBeInTheDocument()
    })

    it('renders txt file size correctly', () => {
      const item = createFileItem('notes.txt', 256, 'txt')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/256 B/)).toBeInTheDocument()
    })

    it('renders other file types correctly', () => {
      const item = createFileItem('data.bin', 4096, 'other')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/4 KB/)).toBeInTheDocument()
    })

    it('renders docx file size correctly', () => {
      const item = createFileItem('document.docx', 8192, 'docx')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/8 KB/)).toBeInTheDocument()
    })

    it('renders md file size correctly', () => {
      const item = createFileItem('README.md', 2048, 'md')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/2 KB/)).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles zero file size', () => {
      const item = createFileItem('empty.txt', 0, 'txt')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/0 B/)).toBeInTheDocument()
    })

    it('handles very large file sizes', () => {
      const item = createFileItem('huge.iso', 1024 * 1024 * 1024, 'other')
      render(<FileBlock item={item} />)

      expect(screen.getByText(/1 GB/)).toBeInTheDocument()
    })

    it('handles decimal file sizes', () => {
      const item = createFileItem('partial.pdf', 1536, 'pdf')
      render(<FileBlock item={item} />)

      // Should show 1.5 KB or similar
      const sizeElement = screen.getByText(/KB/)
      expect(sizeElement).toBeInTheDocument()
    })
  })
})
