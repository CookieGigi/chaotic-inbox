export interface ImageBlockProps {
  src: string
  alt?: string
  width?: number
  height?: number
}

export function ImageBlock({ src, alt, width, height }: ImageBlockProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="max-w-full h-auto rounded block"
    />
  )
}
