import { useEffect, useRef, useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'

export interface TextBlockProps {
  content: string
}

/**
 * Line height in pixels for text-base (15px * 1.6 line-height = 24px)
 */
const LINE_HEIGHT = 24

/**
 * Maximum height for 5 lines (5 * 24px = 120px)
 */
const MAX_HEIGHT = LINE_HEIGHT * 5

/**
 * Check if text has more than 5 explicit newlines
 * Used as fallback when scrollHeight measurement isn't available
 */
function hasMoreThanFiveNewlines(content: string): boolean {
  return content.split('\n').length > 5
}

export function TextBlock({ content }: TextBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current && content) {
        const element = textRef.current
        // Check if content height exceeds 5 lines (for wrapped text)
        const isOverflowing = element.scrollHeight > MAX_HEIGHT + 1 // +1 for rounding
        setNeedsTruncation(isOverflowing || hasMoreThanFiveNewlines(content))
      }
    }

    checkTruncation()

    // Re-check on window resize
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [content])

  return (
    <>
      {/* Content */}
      <p
        ref={textRef}
        data-testid="text-block-content"
        className={`text-base text-text whitespace-pre-wrap break-words overflow-hidden ${
          !isExpanded ? 'line-clamp-5' : ''
        }`}
        style={{
          lineHeight: `${LINE_HEIGHT}px`,
        }}
      >
        {content}
      </p>

      {/* Footer - show more/less */}
      {needsTruncation && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="flex items-center gap-1 text-sm text-accent self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded mt-2"
        >
          {isExpanded ? (
            <>
              <CaretUp size={16} weight="regular" aria-hidden="true" />
              <span>Show less</span>
            </>
          ) : (
            <>
              <CaretDown size={16} weight="regular" aria-hidden="true" />
              <span>Show more</span>
            </>
          )}
        </button>
      )}
    </>
  )
}
