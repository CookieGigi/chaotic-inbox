import { Children, type ReactElement, type ReactNode } from 'react'

export interface BlockActionMenuProps {
  /**
   * Action buttons to display in the menu
   * Max 4 items per column - additional items wrap to new columns
   */
  children: ReactNode
  /**
   * Test id for testing
   */
  testId?: string
}

/**
 * BlockActionMenu component
 *
 * Features:
 * - Positioned on the right side of the block (outside the block's flow)
 * - Sticky behavior: stays at top of block, sticks to viewport when scrolling
 * - Max 4 items per column - additional items wrap to new columns
 * - Height fits content (1-4 rows based on button count)
 * - Subtle semi-transparent background (no border)
 * - Fades in on parent hover
 * - Does NOT affect block height - it's an overlay/contextual menu
 *
 * Usage:
 * ```tsx
 * <article className="group relative">
 *   <div>Block content</div>
 *   <BlockActionMenu>
 *     <DeleteButton onDelete={handleDelete} />
 *   </BlockActionMenu>
 * </article>
 * ```
 */
export function BlockActionMenu({ children, testId }: BlockActionMenuProps) {
  // Count valid React elements to determine grid rows
  const childArray = Children.toArray(children).filter(
    (child): child is ReactElement =>
      typeof child === 'object' && child !== null && 'type' in child
  )
  const childCount = childArray.length
  // Max 4 rows, but fit to content when less
  const rowCount = Math.min(childCount, 4)

  return (
    <div
      data-testid={testId}
      className="
        sticky top-0 self-start
        w-0
        opacity-0 group-hover:opacity-100
        transition-opacity duration-150
        z-10
      "
    >
      <div
        className="
          absolute left-full top-0 ml-2
          bg-surface/60
          grid grid-flow-col gap-0.5 p-0.5
          auto-cols-[34px]
        "
        style={{
          gridTemplateRows: `repeat(${rowCount}, 32px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
