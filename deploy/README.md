# 部署说明（生产 - Docker Compose）

本文件描述如何使用仓库中新增的 `deploy/docker-compose.prod.yml` 在目标服务器上以 Docker Compose 方式运行生产实例。

前提
- 服务器已安装 Docker 与 Docker Compose（支持 Compose V2 或 Docker Engine 支持 compose 命令）。
- 已为项目准备好域名并在 DNS 中指向服务器。

快速开始
1. 在服务器上克隆仓库并切换到仓库目录：
```bash
git clone <your-repo> && cd payload
```
2. 复制示例 env 文件并编辑真实值：
```bash
cp deploy/.env.example.prod deploy/.env.prod
# 编辑 deploy/.env.prod，填入 DATABASE_URI、PAYLOAD_SECRET、NEXT_PUBLIC_SERVER_URL 等
```
3. 构建并启动（在 `deploy/` 目录中运行）：
```bash
cd deploy
docker compose -f docker-compose.prod.yml up -d --build
```

主要特性与说明
- `app` 服务：基于仓库根目录的 `Dockerfile` 构建（请确保仓库根含有可用于生产的 `Dockerfile`）。
- `mongo` 服务：使用官方 MongoDB 镜像并将数据持久化到 `mongo_data` 卷。
- Healthchecks：对 `app` 与 `mongo` 均配置了 healthcheck，用于容器编排判断服务健康状况。
- 卷：`uploads` 用于存放可能的媒体/上传文件（根据实际项目调整挂载路径）。

注意事项与建议
- 如果仓库中没有适合生产的 `Dockerfile`，建议增加一个（示例见下）。
- 为了更可靠的部署，请把数据库指向独立的托管数据库（例如 Mongo Atlas 或另一个受管理的实例），而不是将 DB 作为同一 Compose 文件中的容器在生产中运行。
- 若使用反向代理（Nginx/Traefik），建议将其放在 app 之前并负责 TLS（Let's Encrypt）。
- 如果需要水平扩展或高可用，请考虑 Kubernetes 或使用云平台（Payload Cloud / Vercel 等）。

示例生产 `Dockerfile`（放在仓库根）：
```dockerfile
# 基于官方 node 18
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:18-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app .
EXPOSE 3000
CMD ["pnpm","start"]
```

后续改进建议
- 为 `app` 添加更严谨的 health endpoint（例如 `/api/health` 返回 200 并检查 DB）而不是直接请求根路径。
- 在 CI 中加入构建并推送镜像到私有 registry 的步骤，然后在 compose 中直接使用镜像标签部署。
- 增加备份策略：定期备份 `mongo_data` 或使用云 DB 的备份功能。
