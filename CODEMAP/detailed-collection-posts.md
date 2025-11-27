# Posts collection — Posts 集合详摘

Excerpt (first ~20 lines) and bilingual notes.

```typescript
import { CollectionConfig } from 'payload'
import { isAdmin } from '../../access/authenticated'

import formatAuthors from '../../utilities/formatAuthors'

const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  versions: {
    drafts: true,
  },
```

EN: Posts collection uses drafts, localized fields, layout builder blocks and has afterChange hooks to revalidate frontend pages.
CN: Posts 集合启用 drafts、本地化字段、布局构建块，并在 afterChange 钩子中触发前端重验证。
```