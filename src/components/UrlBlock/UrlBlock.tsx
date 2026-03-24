import { Link } from '@phosphor-icons/react'

export interface UrlBlockProps {
  url: string
}

function normalizeUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

function getHostname(url: string): string {
  try {
    const normalized = normalizeUrl(url)
    const urlObj = new URL(normalized)
    // Return host (hostname + port) without www prefix
    return urlObj.host.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function UrlBlock({ url }: UrlBlockProps) {
  const normalizedUrl = normalizeUrl(url)
  const hostname = getHostname(url)

  const handleClick = () => {
    window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-start text-left gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded p-2 -ml-2 hover:bg-surface/50 transition-colors"
      aria-label={`Open link: ${hostname}`}
    >
      {/* Hostname as muted label */}
      <span className="flex items-center gap-1.5 text-sm text-textSecondary">
        <Link size={14} weight="regular" aria-hidden="true" />
        <span className="truncate">{hostname}</span>
      </span>

      {/* Full URL as body text */}
      <span className="text-base text-accent break-all hover:underline">
        {normalizedUrl}
      </span>
    </button>
  )
}
