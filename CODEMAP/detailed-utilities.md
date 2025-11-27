# Detailed Utilities — 详细工具函数摘录

This file includes short code excerpts and bilingual summaries for selected utilities.

## getURL.ts

```typescript
import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
  let url = process.env.NEXT_PUBLIC_SERVER_URL
```

EN: getServerSideURL & getClientSideURL utilities.
CN: 服务端与客户端 URL 工具函数。

## getGlobals.ts

```typescript
import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
```

EN: Fetch/cached globals via Payload and next/cache unstable_cache helper.
CN: 使用 next/cache 的 unstable_cache 缓存全局数据。

## generatePreviewPath.ts

```typescript
import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
```

EN: Build preview URL for a document (used by live preview).
CN: 生成文档预览 URL（供实时预览使用）。

## getDocument.ts

```typescript
import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
```

EN: Fetch and cache a single document from Payload.
CN: 从 Payload 获取并缓存单个文档。

## getRedirects.ts

```typescript
import configPromise from '@payload-config'
import { getPayload } from 'payload'
```

EN: Fetch/cached redirects collection.
CN: 获取并缓存 redirects 集合。
