import {
  ArticleIcon,
  LinkIcon,
  ImageIcon,
  FilePdfIcon,
  FileZipIcon,
  FileTextIcon,
  FileIcon,
  FileDocIcon,
  FileMdIcon,
  FileCodeIcon,
  FileAudioIcon,
  FileVideoIcon,
  FileCsvIcon,
  FileXlsIcon,
  FilePptIcon,
  FileArchiveIcon,
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
const fileIconMap: Record<FileSubType, typeof FileIcon> = {
  pdf: FilePdfIcon,
  docx: FileDocIcon,
  txt: FileTextIcon,
  md: FileMdIcon,
  zip: FileZipIcon,
  code: FileCodeIcon,
  audio: FileAudioIcon,
  video: FileVideoIcon,
  csv: FileCsvIcon,
  xls: FileXlsIcon,
  ppt: FilePptIcon,
  archive: FileArchiveIcon,
  other: FileIcon,
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
    return <ArticleIcon {...iconProps} />
  }
  if (isUrlItem(item)) {
    return <LinkIcon {...iconProps} />
  }
  if (isImageItem(item)) {
    return <ImageIcon {...iconProps} />
  }
  if (isFileItem(item)) {
    const IconComponent = fileIconMap[item.metadata.kind]
    return <IconComponent {...iconProps} />
  }
  return <FileIcon {...iconProps} />
}
