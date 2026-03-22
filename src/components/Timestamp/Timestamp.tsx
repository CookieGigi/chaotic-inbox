import type { ISO8601Timestamp } from '@/types/branded'

interface TimestampProps {
  value: ISO8601Timestamp
}

/**
 * Formats time portion as HH:MM in local timezone
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Formats an ISO8601 timestamp based on relative time:
 * - Today: "HH:MM"
 * - This year: "Mon DD · HH:MM"
 * - Older: "YYYY Mon DD · HH:MM"
 *
 * Times are displayed in the user's local timezone.
 */
export function formatTimestamp(timestamp: ISO8601Timestamp): string {
  const date = new Date(timestamp)
  const now = new Date()

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) {
    return formatTime(date)
  }

  const isThisYear = date.getFullYear() === now.getFullYear()

  if (isThisYear) {
    const datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    return `${datePart} · ${formatTime(date)}`
  }

  const yearPart = date.getFullYear()
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `${yearPart} ${datePart} · ${formatTime(date)}`
}

export function Timestamp({ value }: TimestampProps) {
  return (
    <time
      dateTime={value}
      className="text-sm text-text-muted"
      title={`${value} (UTC)`}
    >
      {formatTimestamp(value)}
    </time>
  )
}
