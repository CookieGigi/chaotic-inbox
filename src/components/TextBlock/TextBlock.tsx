import { useEffect, useRef, useState } from 'react'
import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react'

export interface TextBlockProps {
  content: string
}

/**
 * Check if text content needs truncation
 * @param scrollHeight - The measured scrollHeight of the element
 * @param content - The text content to check for explicit newlines
 * @returns true if content should be truncated
 */
function shouldTruncateContent(scrollHeight: number, content: string): boolean {
  const LINE_HEIGHT = 24
  const MAX_HEIGHT = LINE_HEIGHT * 5
  const isOverflowing = scrollHeight > MAX_HEIGHT + 1 // +1 for rounding
  const hasMoreThanFiveNewlines = content.split('\n').length > 5
  return isOverflowing || hasMoreThanFiveNewlines
}

export function TextBlock({ content }: TextBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current && content) {
        const element = textRef.current
        setNeedsTruncation(shouldTruncateContent(element.scrollHeight, content))
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
        className={`text-base text-text whitespace-pre-wrap break-words overflow-hidden leading-relaxed ${
          !isExpanded ? 'line-clamp-5' : ''
        }`}
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
              <CaretUpIcon size={16} weight="regular" aria-hidden="true" />
              <span>Show less</span>
            </>
          ) : (
            <>
              <CaretDownIcon size={16} weight="regular" aria-hidden="true" />
              <span>Show more</span>
            </>
          )}
        </button>
      )}
    </>
  )
}
