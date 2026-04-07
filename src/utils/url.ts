/**
 * Extract hostname from a URL string
 *
 * Handles URLs with or without protocol prefix.
 * If the URL is invalid, returns the original string.
 *
 * @param url - The URL string to extract hostname from
 * @returns The hostname, or the original string if parsing fails
 */
export function extractHostname(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname
  } catch {
    return url
  }
}
