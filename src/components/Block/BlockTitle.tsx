interface BlockTitleProps {
  title?: string
}

export function BlockTitle({ title }: BlockTitleProps) {
  if (!title) {
    return null
  }

  return (
    <span
      className="text-sm text-text-muted font-mono truncate"
      data-testid="block-label"
    >
      {title}
    </span>
  )
}
