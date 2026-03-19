interface TemplateProps {
  title: string
  content: string
}

export function Template({ title, content }: TemplateProps) {
  return (
    <div className="template">
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  )
}
