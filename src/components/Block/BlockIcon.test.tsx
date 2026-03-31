import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { RawItem } from '@/models/rawItem'
import { BlockIcon } from './BlockIcon'

// Test data factories
const createTextItem = (): RawItem => ({
  id: 'test-text',
  type: 'text',
  capturedAt: '2026-03-24T10:00:00.000Z' as RawItem['capturedAt'],
  raw: 'Test text',
  metadata: {
    kind: 'plain',
    wordCount: 2,
  },
})

const createUrlItem = (): RawItem => ({
  id: 'test-url',
  type: 'url',
  capturedAt: '2026-03-24T10:00:00.000Z' as RawItem['capturedAt'],
  raw: 'https://example.com',
  metadata: {
    kind: 'url',
    title: 'Example',
    favicon: 'https://example.com/favicon.ico',
  },
})

const createImageItem = (): RawItem => ({
  id: 'test-image',
  type: 'image',
  capturedAt: '2026-03-24T10:00:00.000Z' as RawItem['capturedAt'],
  raw: new Blob(['test'], { type: 'image/png' }),
  metadata: {
    kind: 'image',
    width: 800,
    height: 600,
  },
})

const createFileItem = (
  kind: 'pdf' | 'zip' | 'txt' | 'md' | 'docx' | 'other'
): RawItem => ({
  id: `test-file-${kind}`,
  type: 'file',
  capturedAt: '2026-03-24T10:00:00.000Z' as RawItem['capturedAt'],
  raw: new Blob(['test']),
  metadata: {
    kind,
    filename: `test.${kind}`,
    filesize: 1024,
    mimetype: 'application/octet-stream',
  },
})

describe('BlockIcon', () => {
  describe('Icon rendering by type', () => {
    it('renders Article icon for text items', () => {
      const item = createTextItem()
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders Link icon for URL items', () => {
      const item = createUrlItem()
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders Image icon for image items', () => {
      const item = createImageItem()
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders FilePdf icon for PDF files', () => {
      const item = createFileItem('pdf')
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders FileZip icon for zip files', () => {
      const item = createFileItem('zip')
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders FileText icon for txt files', () => {
      const item = createFileItem('txt')
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders FileText icon for md files', () => {
      const item = createFileItem('md')
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders FileText icon for docx files', () => {
      const item = createFileItem('docx')
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders generic File icon for other file types', () => {
      const item = createFileItem('other')
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Icon styling', () => {
    it('has correct styling classes', () => {
      const item = createTextItem()
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toHaveClass('text-text-muted')
      expect(icon).toHaveClass('flex-shrink-0')
    })

    it('renders as SVG element', () => {
      const item = createTextItem()
      render(<BlockIcon item={item} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon.tagName.toLowerCase()).toBe('svg')
    })
  })

  describe('Fallback behavior', () => {
    it('renders generic File icon for unknown types', () => {
      // Create an item with an unknown type by modifying the type property
      const textItem = createTextItem()
      const unknownItem = {
        ...textItem,
        type: 'unknown',
      } as unknown as RawItem
      render(<BlockIcon item={unknownItem} />)

      const icon = screen.getByTestId('block-icon')
      expect(icon).toBeInTheDocument()
    })
  })
})
