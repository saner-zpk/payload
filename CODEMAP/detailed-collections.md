# Detailed Collections — 详细集合摘录

This file includes short code excerpts (first ~15 lines) and bilingual summaries for key collections.

下面包含关键集合的代码摘录（前约 15 行）和中英简要说明。

## Categories.ts

```typescript
import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
```

EN: Category taxonomy collection (title + slug).
CN: 分类集合（包含标题与 slug）。

## Media.ts

```typescript
import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
```

EN: Media collection and upload settings (imageSizes, staticDir, focal point).
CN: 媒体集合与上传设置（图片尺寸、静态目录、焦点裁剪）。

## Pages/index.ts

```typescript
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
```

EN: Pages collection: hero, layout blocks, SEO, draft previews and revalidation hooks.
CN: 页面集合：Hero、布局块、SEO、草稿预览与重新验证钩子。

## Posts/index.ts

```typescript
import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
```

EN: Posts collection: localized fields, richtext blocks, authors, SEO and publish hooks.
CN: 文章集合：多语言字段、富文本区块、作者关系、SEO 与发布钩子。
