import { useTranslation } from 'react-i18next'
import type { ISO8601Timestamp } from '@/types/branded'

interface TimestampProps {
  value: ISO8601Timestamp
}

/**
 * Formats time portion as HH:MM in local timezone
 */
function formatTime(date: Date, locale: string): string {
  return date.toLocaleTimeString(locale, {
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
export function formatTimestamp(
  timestamp: ISO8601Timestamp,
  locale: string
): string {
  const date = new Date(timestamp)
  const now = new Date()

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) {
    return formatTime(date, locale)
  }

  const isThisYear = date.getFullYear() === now.getFullYear()

  if (isThisYear) {
    const datePart = date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    })
    return `${datePart} · ${formatTime(date, locale)}`
  }

  const yearPart = date.getFullYear()
  const datePart = date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  })
  return `${yearPart} ${datePart} · ${formatTime(date, locale)}`
}

/**
 * Maps i18n language codes to BCP 47 locale strings for date formatting.
 * Handles both full codes (e.g., 'fr-FR') and short codes (e.g., 'fr').
 */
function getLocale(i18nLanguage: string): string {
  // Map of supported languages to their full locale codes
  const localeMap: Record<string, string> = {
    en: 'en-US',
    fr: 'fr-FR',
  }

  // If it's already a full code with region, use it directly
  if (i18nLanguage.includes('-')) {
    return i18nLanguage
  }

  // Otherwise, map the short code to full locale
  return localeMap[i18nLanguage] ?? 'en-US'
}

export function Timestamp({ value }: TimestampProps) {
  const { i18n } = useTranslation()
  const locale = getLocale(i18n.language)

  return (
    <time
      dateTime={value}
      className="text-sm text-text-muted font-mono"
      title={`${value} (UTC)`}
    >
      {formatTimestamp(value, locale)}
    </time>
  )
}
