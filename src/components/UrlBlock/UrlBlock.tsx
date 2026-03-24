export interface UrlBlockProps {
  url: string
}

function normalizeUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

export function UrlBlock({ url }: UrlBlockProps) {
  const normalizedUrl = normalizeUrl(url)

  const handleClick = () => {
    window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-start text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded p-2 -ml-2 hover:bg-surface/50 transition-colors"
      aria-label={`Open link: ${normalizedUrl}`}
    >
      <span className="text-base text-accent break-all hover:underline">
        {normalizedUrl}
      </span>
    </button>
  )
}
