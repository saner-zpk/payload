# Detailed Blocks — 详细区块摘录

This file includes short code excerpts and bilingual summaries for key blocks.

## Banner/config.ts

```typescript
import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
```

EN: Banner block config (style + richText content).
CN: 横幅区块配置（样式 + 富文本内容）。

## Code/config.ts

```typescript
import type { Block } from 'payload'

export const Code: Block = {
  slug: 'code',
```

EN: Code block config (language + code field).
CN: 代码区块配置（语言选择 + 代码字段）。

## MediaBlock/config.ts

```typescript
import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
```

EN: Media upload block for embedding media in layouts.
CN: 媒体区块，用于在布局中嵌入上传的媒体。

## RenderBlocks.tsx

```tsx
import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'
```

EN: Renderer mapping blocks to frontend components.
CN: 前端渲染器：将区块映射到 React 组件。
