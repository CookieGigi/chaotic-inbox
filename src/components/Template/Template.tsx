import type { ReactNode, ReactElement } from 'react'

interface TemplateProps {
  title: string
  children: ReactNode
}

export function Template({ title, children }: TemplateProps): ReactElement {
  return (
    <div className="template">
      <h3>{title}</h3>
      <div className="template-content">{children}</div>
    </div>
  )
}
