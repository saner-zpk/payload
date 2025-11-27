# Payload 使用指南（适用于本仓库）

本文档为在本仓库中使用 Payload CMS 的实用指南，包含：安装、运行、环境变量、用户与密码迁移、备份/恢复、常见问题与排错步骤。假定你在 macOS，默认 shell 为 zsh。
---

### 1) 快速开始

- 安装依赖（项目使用 pnpm）：

```bash

---

### 1) 快速开始

- 安装依赖（项目使用 pnpm）：

```bash
pnpm install
```

- 本地开发：

```bash
pnpm dev
```

- 生产构建：

```bash
pnpm build
# 可选：pnpm start (在构建后启动 production server)
```

开发时会使用 `.env`（仓库根），常见变量：

- `DATABASE_URI` — MongoDB 连接字符串（例如：`mongodb://127.0.0.1/blooog`）
- `PAYLOAD_SECRET` — Payload 的 secret
- `NEXT_PUBLIC_SERVER_URL`、`PREVIEW_SECRET`、`CRON_SECRET` 等按需要设置

在修改 `.env` 后，重启 dev server 以使改动生效。

---

（原使用说明内容省略，见仓库中其他文档或历史版本）

---

- 生产构建：

```bash
pnpm build
# 可选：pnpm start (在构建后启动 production server)
```

开发时会使用 `.env`（仓库根），常见变量：

-- `DATABASE_URI` — MongoDB 连接字符串（例如：`mongodb://127.0.0.1/blooog`）
-- `PAYLOAD_SECRET` — Payload 的 secret
-- `NEXT_PUBLIC_SERVER_URL`、`PREVIEW_SECRET`、`CRON_SECRET` 等按需要设置

在修改 `.env` 后，重启 dev server 以使改动生效。

---

（原使用说明内容省略，见仓库中 `PAYLOAD_USAGE_GUIDE.md` 的上半部分）

---
### 替换或修改 `BeforeLogin` / `BeforeDashboard`

这两个组件位于 `src/components/BeforeLogin` 和 `src/components/BeforeDashboard`。

- `BeforeLogin`：非常简单的 React 组件。示例，替换欢迎文本或添加公司 Logo：

```tsx
// src/components/BeforeLogin/index.tsx
import React from 'react'
import Logo from '@/components/Logo'

const BeforeLogin = () => (
  <div className="before-login">
    <Logo />
    <h2>欢迎进入管理后台</h2>
    <p>请输入你的管理员凭证登录。</p>
  </div>
)

export default BeforeLogin
```

- `BeforeDashboard`：更复杂，可包含操作按钮（例如一键生成示例数据）、说明和快捷链接。可以使用 Payload UI 组件（例如 `@payloadcms/ui/elements/Banner`）来保持样式一致。

修改后，保存并重启 dev（`pnpm dev`），打开 `http://localhost:3000/(payload)/admin` 查看登录页/仪表盘的变化。

### 定制 `AdminBar`

`AdminBar` 位于 `src/components/AdminBar/index.tsx`。它使用 `@payloadcms/admin-bar` 提供的 `PayloadAdminBar` 组件并传入 `cmsURL`、`collectionSlug`、`collectionLabels`、`logo` 等属性。

常见修改：

- 更改 logo：把 `Title` 组件替换为自定义 JSX（如公司 logo）。
- 修改样式：`className` / `classNames` / `style` 属性都可传入，用来自定义外观或覆盖 CSS（文件 `src/components/AdminBar/index.scss`）。
- 增加/减少控件：传入 `adminBarProps` 来覆盖默认行为或添加自定义按钮。

示例：把 logo 换成图片并增加一个自定义按钮

```tsx
// 在 AdminBar 里
const Title = () => <img src="/your-logo.svg" alt="logo" style={{ height: 22 }} />

<PayloadAdminBar
  logo={<Title />}
  classNames={{ controls: 'font-medium text-white' }}
  cmsURL={getClientSideURL()}
  // ...其它属性
>
  {/* 你可以传入 children 或在外层渲染自定义按钮 */}
</PayloadAdminBar>
```

注意：`AdminBar` 是一个 client component（文件顶部 `use client`），任何涉及浏览器 API 的逻辑必须在 client 组件中执行。

### 自定义 Admin 页面或面板

Payload 允许你添加自定义 React 组件到 Admin 界面（比如为某个集合添加自定义视图或操作）。一般做法：

1. 在 `admin.components` 中注册你的组件（可参考 `beforeDashboard` 的做法）。
2. 在组件中使用 `usePayloadAPI` 或直接 fetch 后端 API 来读取/写入数据。

示例（在 dashboard 中放一个“导出 CSV”按钮）：

```tsx
import React from 'react'
import { Button } from '@payloadcms/ui/elements/Button'

const ExportCSV = () => {
  const onExport = async () => {
    const res = await fetch('/api/export-csv')
    const blob = await res.blob()
    // 触发下载
  }
  return <Button onClick={onExport}>导出 CSV</Button>
}

export default ExportCSV
```

然后在 `payload.config.ts` 的 `beforeDashboard`（或其它 admin 插槽）中引用此组件。

### 样式（CSS / SCSS）

本仓库中许多 admin 组件带有对应的 `.scss` 文件（例如 `src/components/BeforeDashboard/index.scss`、`src/components/AdminBar/index.scss`）。直接编辑这些文件可以调整颜色、间距等。若要使用 Tailwind 或主题变量，请参阅项目的 `tailwind.config.mjs`。

示例（覆盖 AdminBar 背景色）：

```scss
.admin-bar {
  background-color: #111 !important;
  .container { padding: 12px 0; }
}
```

### 本地测试与注意事项

-- 修改 admin 相关文件后（尤其是 server-side 改动），请重启 dev server；client-side 修改通常热更新即可。
-- 如果某个 admin chunk 在运行时报错缺失（如 vendor-chunks 的问题），请先尝试 `rm -rf .next && pnpm build`，确认构建成功后再运行 `pnpm dev` 或 `pnpm start`。

---

如果你希望我：

- 将 above 文档合并回 `PAYLOAD_USAGE_GUIDE.md`；
- 或在仓库添加具体 UI 修改示例（比如替换 logo 的 PR、改写 BeforeDashboard 的样式等），我可以直接修改并运行 dev 以验证页面。请告诉我你的优先项。
