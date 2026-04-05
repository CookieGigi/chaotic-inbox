import { useMemo, useEffect } from 'react'
import type { RawItem } from '@/models/rawItem'
import type { ImageMetadata } from '@/models/metadata'
import {
  isTextItem,
  isUrlItem,
  isImageItem,
  isFileItem,
} from '@/models/metadata'
import { Timestamp } from '@/components/Timestamp'
import { TextBlock } from '@/components/TextBlock/TextBlock'
import { UrlBlock } from '@/components/UrlBlock/UrlBlock'
import { ImageBlock } from '@/components/ImageBlock/ImageBlock'
import { FileBlock } from '@/components/FileBlock/FileBlock'
import { BlockIcon } from './BlockIcon'
import { BlockTitle } from './BlockTitle'

export interface BlockProps {
  item: RawItem
}

// Component for rendering image blocks with proper blob URL cleanup
function ImageBlockContent({ item }: { item: RawItem }) {
  const blob = item.raw as Blob
  const objectUrl = useMemo(() => URL.createObjectURL(blob), [blob])
  const metadata = item.metadata as ImageMetadata

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  return (
    <ImageBlock
      src={objectUrl}
      alt={metadata.alt}
      width={metadata.width}
      height={metadata.height}
    />
  )
}

// Render the appropriate content based on type
function renderBlockContent(item: RawItem) {
  if (isTextItem(item)) {
    return <TextBlock content={item.raw as string} />
  }
  if (isUrlItem(item)) {
    return <UrlBlock url={item.raw as string} />
  }
  if (isImageItem(item)) {
    return <ImageBlockContent item={item} />
  }
  if (isFileItem(item)) {
    return <FileBlock item={item} />
  }
  return null
}

export function Block({ item }: BlockProps) {
  return (
    <article
      className="bg-transparent py-3 px-4 border-b border-border hover:border-border-subtle"
      data-testid="block"
    >
      {/* Header */}
      <header
        className="flex items-baseline justify-between mb-2"
        data-testid="block-header"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BlockIcon item={item} />
          <BlockTitle title={item.title} />
        </div>
        <Timestamp value={item.capturedAt} />
      </header>

      {/* Content */}
      <div data-testid="block-content">{renderBlockContent(item)}</div>
    </article>
  )
}
