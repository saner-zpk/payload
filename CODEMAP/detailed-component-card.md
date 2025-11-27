# Card component — Card 组件摘录

Excerpt (first ~20 lines) and bilingual notes.

```tsx
import React from 'react'

type Props = {
  title: string
  description?: string
  href?: string
}

export default function Card({ title, description, href }: Props) {
  return (
    <article className="card">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </article>
  )
}
```

EN: Simple presentational Card component used across listing pages.
CN: 简单的展示型 Card 组件，用于列表页面。
