/**
 * Branded type for ISO8601 timestamps.
 * Provides compile-time type safety for timestamp strings.
 */
export type ISO8601Timestamp = string & { __brand: 'ISO8601Timestamp' }

/**
 * ISO8601 regex that accepts various valid formats:
 * - 2023-01-15T10:05:00Z
 * - 2023-01-15T10:05:00.000Z (with milliseconds)
 * - 2023-01-15T10:05:00+00:00 (with timezone offset)
 * - 2023-01-15T10:05:00.123+05:30 (with ms and offset)
 * - 20230115T100500Z (basic format)
 * - 2023-01-15 (date only)
 * - 2023-01-15 10:05:00 (space separator)
 */
const ISO8601_REGEX =
  /^(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?|\d{4}\d{2}\d{2}T\d{2}\d{2}\d{2}(?:\.\d+)?Z?|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)$/

/**
 * Type guard to check if a string is a valid ISO8601 timestamp.
 * @param value - The string to validate
 * @returns True if the string is a valid ISO8601 timestamp
 */
export function isISO8601Timestamp(value: string): value is ISO8601Timestamp {
  if (!ISO8601_REGEX.test(value)) {
    return false
  }

  // Additional validation: the string must be parseable as a valid date
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Factory function to create an ISO8601Timestamp from a Date.
 * Defaults to the current date/time if no date is provided.
 * @param date - Optional Date object (defaults to new Date())
 * @returns A validated ISO8601Timestamp
 */
export function createISO8601Timestamp(
  date: Date = new Date()
): ISO8601Timestamp {
  return date.toISOString() as ISO8601Timestamp
}

/**
 * Parses a string and returns an ISO8601Timestamp if valid, otherwise null.
 * @param value - The string to parse
 * @returns ISO8601Timestamp if valid, null otherwise
 */
export function parseISO8601Timestamp(value: string): ISO8601Timestamp | null {
  return isISO8601Timestamp(value) ? value : null
}
