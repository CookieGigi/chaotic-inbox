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
import type { FileSubType } from '@/models/metadata'

// Map file subtypes to their respective icons
const fileIconMap: Record<FileSubType, typeof File> = {
  pdf: FilePdf,
  docx: FileText,
  txt: FileText,
  zip: FileZip,
  other: File,
}

interface BlockIconProps {
  item: RawItem
}

export function BlockIcon({ item }: BlockIconProps) {
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
