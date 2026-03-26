import {
  Article,
  Link,
  Image,
  FilePdf,
  FileZip,
  FileText,
  File,
} from '@phosphor-icons/react'
import type { RawItem } from '@/models/rawItem'
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
import type { FileSubType } from '@/models/metadata'

export interface BlockProps {
  item: RawItem
}

// Map file subtypes to their respective icons
const fileIconMap: Record<FileSubType, typeof File> = {
  pdf: FilePdf,
  docx: FileText,
  txt: FileText,
  zip: FileZip,
  other: File,
}

// Render the appropriate icon for a RawItem
function renderBlockIcon(item: RawItem) {
  const iconProps = {
    size: 16,
    weight: 'regular' as const,
    className: 'text-text-muted flex-shrink-0',
    'data-testid': 'block-icon',
  }

  if (isTextItem(item)) {
    return <Article {...iconProps} />
  }
  if (isUrlItem(item)) {
    return <Link {...iconProps} />
  }
  if (isImageItem(item)) {
    return <Image {...iconProps} />
  }
  if (isFileItem(item)) {
    const IconComponent = fileIconMap[item.metadata.kind]
    return <IconComponent {...iconProps} />
  }
  return <File {...iconProps} />
}

// Get the title/label for the block header
function getBlockTitle(item: RawItem): string | undefined {
  return item.title
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
    const blob = item.raw as Blob
    const objectUrl = URL.createObjectURL(blob)
    return (
      <ImageBlock
        src={objectUrl}
        alt={item.metadata.alt}
        width={item.metadata.width}
        height={item.metadata.height}
      />
    )
  }
  if (isFileItem(item)) {
    return <FileBlock item={item} />
  }
  return null
}

export function Block({ item }: BlockProps) {
  const title = getBlockTitle(item)

  return (
    <article
      className="bg-transparent py-3 px-4 border-b border-border"
      data-testid="block"
    >
      {/* Header */}
      <header
        className="flex items-center justify-between mb-2"
        data-testid="block-header"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {renderBlockIcon(item)}
          {title && (
            <span
              className="text-sm text-text-muted font-mono truncate"
              data-testid="block-label"
            >
              {title}
            </span>
          )}
        </div>
        <Timestamp value={item.capturedAt} />
      </header>

      {/* Content */}
      <div data-testid="block-content">{renderBlockContent(item)}</div>
    </article>
  )
}
