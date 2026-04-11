import { Trash } from '@phosphor-icons/react'

export interface DeleteButtonProps {
  /**
   * Callback when delete is triggered
   */
  onDelete: () => void
  /**
   * Accessible label for the button
   * @default "Delete block"
   */
  ariaLabel?: string
  /**
   * Test id for testing
   */
  testId?: string
}

/**
 * DeleteButton component
 *
 * Features:
 * - Destructive action styling (red on hover)
 * - 16px icon consistent with block header
 * - Accessible with proper ARIA attributes
 * - Focus ring for keyboard navigation
 *
 * Usage:
 * ```tsx
 * <DeleteButton onDelete={() => deleteItem(id)} ariaLabel="Delete text block" />
 * ```
 */
export function DeleteButton({
  onDelete,
  ariaLabel = 'Delete block',
  testId,
}: DeleteButtonProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onDelete()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      data-testid={testId}
      className="
        w-8 h-8 rounded-lg box-border
        flex items-center justify-center
        text-text-faint
        hover:text-error hover:bg-surface-hover
        transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
      "
    >
      <Trash size={16} />
    </button>
  )
}
