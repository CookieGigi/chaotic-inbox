import type { RawItem } from '@/models/rawItem'

export interface FileBlockProps {
  item: RawItem & { type: 'file' }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.floor(Math.log10(bytes) / 3)
  const clampedIndex = Math.min(unitIndex, units.length - 1)

  const value = bytes / Math.pow(1024, clampedIndex)

  // Show whole numbers for B and KB, one decimal for MB+
  if (clampedIndex < 2) {
    return `${Math.round(value)} ${units[clampedIndex]}`
  }
  return `${value.toFixed(1).replace(/\.0$/, '')} ${units[clampedIndex]}`
}

export function FileBlock({ item }: FileBlockProps) {
  const { filename, filesize } = item.metadata

  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-base font-medium text-text truncate">
        {filename}
      </span>
      <span className="text-xs text-textSecondary whitespace-nowrap">
        {formatFileSize(filesize)}
      </span>
    </div>
  )
}
