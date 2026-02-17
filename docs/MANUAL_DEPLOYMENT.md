# CMAMSys 部署文档

## 📋 目录

- [部署方式对比](#部署方式对比)
- [方式一：GitHub Actions 自动部署](#方式一-github-actions-自动部署)
- [方式二：手动部署](#方式二手动部署)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

---

## 部署方式对比

| 特性 | GitHub Actions 自动部署 | 手动部署 |
|------|------------------------|----------|
| 难度 | 低 | 中 |
| 触发方式 | Git Tag 推送 | 手动执行脚本 |
| 部署位置 | GitHub Container Registry | Docker Hub / 任意仓库 |
| 适用场景 | 生产环境 | 开发环境 / 测试环境 |

**推荐**：生产环境使用 **GitHub Actions 自动部署**（推送 Tag 触发），开发环境使用 **手动部署脚本**。

---

## 方式一：GitHub Actions 自动部署

### 1. 前置条件

- 确保仓库为 **GitHub Pro** 或 **Enterprise**
- 确保 GitHub Actions 已启用：`Settings` → `Actions` → `General` → `Actions permissions` → `Allow all actions and reusable workflows`
- 确保 GitHub Container Registry 已启用（默认已启用）

### 2. 配置 GitHub Token

1. 进入仓库设置：`Settings` → `Secrets and variables` → `Actions`
2. 确保 `GITHUB_TOKEN` 权限包含：
   - `contents: read`
   - `deployments: write`
   - `packages: write`
   - `metadata: read`

这些权限已在 `.github/workflows/cd.yml` 中配置。

### 3. 创建 Tag 触发部署

```bash
# 格式：v<主版本>.<次版本>.<修订版本>
git tag v1.0.0
git push origin v1.0.0
```

### 4. 查看部署进度

进入 `Actions` 标签页，查看 `Continuous Deployment` workflow 运行状态。

### 5. 部署位置

镜像将推送到：
- `ghcr.io/yogdunana/cmamsys:latest`
- `ghcr.io/yogdunana/cmamsys:v1.0.0`

### 6. 拉取镜像

```bash
docker pull ghcr.io/yogdunana/cmamsys:latest
```

---

## 方式二：手动部署

### 方法 1：使用一键部署脚本

```bash
# 1. 确保已登录 Docker Hub（如果推送到 Docker Hub）
docker login -u <your-username>

# 2. 执行部署脚本
chmod +x scripts/manual-deploy.sh
./scripts/manual-deploy.sh production

# 3. 按照提示输入版本号（如：1.0.0）
```

### 方法 2：使用 Docker Compose

```bash
# 1. 复制环境变量模板
cp .env.docker.example .env

# 2. 编辑环境变量
nano .env

# 3. 构建并启动
docker compose up -d --build

# 4. 查看日志
docker compose logs -f
```

### 方法 3：手动构建（完全控制）

```bash
# 1. 构建镜像
docker build -t ghcr.io/yogdunana/cmamsys:latest .

# 2. 登录 GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u <username> --password-stdin

# 3. 推送镜像
docker push ghcr.io/yogdunana/cmamsys:latest
```

---

## 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 示例 | 默认值 |
|--------|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db?schema=public` | - |
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key` | - |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `CMAMSys` | `CMAMSys` |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | `your-nextauth-secret` | - |
| `NEXTAUTH_URL` | 应用 URL | `https://your-domain.com` | - |

### Sentry 监控配置（可选）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SENTRY_DSN` | Sentry DSN | `https://xxx@sentry.io/xxx` |
| `SENTRY_AUTH_TOKEN` | Sentry 认证令牌 | `your-auth-token` |
| `NEXT_PUBLIC_SENTRY_DSN` | 公开 Sentry DSN | `https://xxx@sentry.io/xxx` |

### AI Provider 配置（可选）

```bash
# DeepSeek
DEEPSEEK_API_KEY=your-deepseek-api-key

# Kimi
KIMI_API_KEY=your-kimi-api-key

# Seed/豆包
SEED_API_KEY=your-seed-api-key
```

---

## 常见问题

### 1. GitHub Actions 构建失败

**错误**：`Unable to resolve action docker/login-action@v4`

**原因**：Docker actions 在私有仓库中有访问限制

**解决**：使用 **GitHub Container Registry (ghcr.io)** 方案（CD workflow 已配置）

### 2. Docker Hub 登录失败

**错误**：`unauthorized: incorrect username or password`

**解决**：
```bash
# 重新登录
docker logout
docker login -u <username>
```

### 3. 端口冲突

**错误**：`bind: address already in use`

**解决**：修改 `.env` 文件中的端口配置

### 4. 数据库连接失败

**错误**：`Can't reach database server`

**解决**：
1. 检查 `DATABASE_URL` 是否正确
2. 确保 PostgreSQL 服务已启动
3. 检查防火墙设置

### 5. 镜像拉取超时

**错误**：`net/http: request canceled while waiting for connection`

**解决**：
```bash
# 配置镜像加速器（中国大陆用户）
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]
}
EOF
sudo systemctl restart docker
```

---

## 快速开始（5分钟部署）

```bash
# 1. 克隆仓库
git clone https://github.com/Yogdunana/CMAMSys.git
cd CMAMSys

# 2. 配置环境变量
cp .env.docker.example .env
nano .env

# 3. 使用 Docker Compose 启动
docker compose up -d

# 4. 访问应用
open http://localhost:3000
```

---

## 技术支持

- GitHub Issues: https://github.com/Yogdunana/CMAMSys/issues
- 文档: https://github.com/Yogdunana/CMAMSys/wiki
