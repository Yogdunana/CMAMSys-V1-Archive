# CMAMSys 系统安装指南

## 🚀 快速安装

### 前置条件

在安装 CMAMSys 之前，请确保：

1. 已安装 Node.js 18+
2. 已安装 pnpm 包管理器
3. 已安装 PostgreSQL 14+ 数据库
4. 已创建 PostgreSQL 数据库和用户

### 一键安装脚本

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

安装脚本会自动完成以下步骤：
1. 检查环境（Node.js, pnpm）
2. 安装项目依赖
3. 配置环境变量（生成随机密钥）
4. 初始化 PostgreSQL 数据库
5. 设置管理员账户
6. 构建项目
7. 显示访问信息

### 手动安装

如果一键安装脚本不可用，可以按照以下步骤手动安装：

#### 1. 安装依赖

```bash
pnpm install
```

#### 2. 配置 PostgreSQL 数据库

首先，确保已经安装并配置了 PostgreSQL。详细的 PostgreSQL 安装指南请参考 [PostgreSQL 部署指南](./postgresql-setup.md)。

创建数据库和用户：

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 PostgreSQL 命令行中执行：
CREATE USER cmamsys WITH PASSWORD 'your_secure_password';
CREATE DATABASE cmamsys OWNER cmamsys;
GRANT ALL PRIVILEGES ON DATABASE cmamsys TO cmamsys;
\q
```

#### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下关键参数：

```env
# Database
DATABASE_URL="postgresql://cmamsys:your_secure_password@localhost:5432/cmamsys?schema=public"

# JWT Secrets (生成随机密钥)
JWT_SECRET="your-random-secret-here"
JWT_ACCESS_TOKEN_EXPIRY="15m"
JWT_REFRESH_TOKEN_EXPIRY="7d"
REFRESH_TOKEN_SECRET="your-refresh-secret-here"

# Security
BCRYPT_ROUNDS="12"
MAX_LOGIN_ATTEMPTS="5"
LOCKOUT_DURATION_MS="900000"
```

#### 3. 初始化数据库

```bash
# 运行数据库迁移
pnpm prisma migrate deploy

# 生成 Prisma Client
pnpm prisma generate

# 创建默认管理员账户
pnpm prisma:seed
```

#### 4. 构建项目

```bash
pnpm run build
```

#### 5. 启动服务

```bash
pnpm run start
```

## 🔐 默认管理员账户

### 默认凭证

| 配置项 | 默认值 |
|--------|--------|
| 邮箱 | `admin@cmamsys.com` |
| 用户名 | `admin` |
| 密码 | `Admin123!@#` |

### 自定义管理员账户

在运行 `pnpm prisma:seed` 之前，可以通过环境变量自定义管理员账户：

```bash
ADMIN_EMAIL="your-email@example.com" \
ADMIN_USERNAME="your-username" \
ADMIN_PASSWORD="YourPassword123!" \
pnpm prisma:seed
```

## ⚙️ 系统配置

### 访问系统设置

1. 使用管理员账户登录系统
2. 导航到 `http://localhost:5000/settings/system`
3. 在此页面可以配置：
   - 应用名称和 URL
   - JWT Token 有效期
   - 多因素认证（MFA）
   - 登录尝试限制
   - 日志级别

### 配置数据库

1. 使用管理员账户登录系统
2. 导航到 `http://localhost:5000/settings/database`
3. 在此页面可以：
   - 切换数据库类型（SQLite / PostgreSQL）
   - 配置连接字符串
   - 测试数据库连接

## 👥 用户角色和权限

### 角色定义

| 角色 | 权限说明 |
|------|----------|
| **ADMIN** | 完全访问权限，包括系统设置、数据库配置、用户管理、审计日志 |
| **TEAM_LEAD** | 可以管理团队、创建竞赛和建模任务 |
| **TEAM_MEMBER** | 可以查看和参与竞赛、建模任务 |
| **USER** | 只读权限，可以查看竞赛和报告 |

### 权限详情

#### ADMIN 权限

- ✅ 用户管理（创建、读取、更新、删除）
- ✅ 系统设置（读取、更新）
- ✅ 数据库配置（读取、更新）
- ✅ 竞赛管理（创建、读取、更新、删除）
- ✅ 建模任务（创建、读取、更新、删除）
- ✅ 报告管理（读取、更新、删除、导出）
- ✅ AI Providers（创建、读取、更新、删除）
- ✅ 审计日志（读取、导出）

#### TEAM_LEAD 权限

- ✅ 用户管理（读取、更新团队成员）
- ✅ 竞赛管理（创建、读取、更新、删除）
- ✅ 建模任务（创建、读取、更新、删除）
- ✅ 报告管理（读取、导出）

#### TEAM_MEMBER 权限

- ✅ 竞赛管理（读取）
- ✅ 建模任务（创建、读取、更新）
- ✅ 报告管理（读取、导出）

#### USER 权限

- ✅ 竞赛管理（读取）
- ✅ 报告管理（读取）

## 🔒 页面鉴权

### 受保护的路由

以下路由需要特定的权限才能访问：

| 路由 | 所需权限 | 允许角色 |
|------|----------|----------|
| `/settings/system` | SYSTEM_SETTINGS:READ, UPDATE | ADMIN |
| `/settings/database` | DATABASE_CONFIG:READ, UPDATE | ADMIN |
| `/dashboard/ai-providers` | AI_PROVIDERS:CREATE, READ, UPDATE, DELETE | ADMIN |
| `/audit` | AUDIT_LOGS:READ, EXPORT | ADMIN |
| `/admin/users` | USER_MANAGEMENT:READ | ADMIN, TEAM_LEAD |
| `/admin/users/create` | USER_MANAGEMENT:CREATE | ADMIN |

### API 鉴权

API 端点使用 JWT Token 进行鉴权：

```bash
# 在请求头中包含 Token
curl -X GET http://localhost:5000/api/settings/system \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 或使用 Cookie
curl -X GET http://localhost:5000/api/settings/system \
  --cookie "accessToken=YOUR_ACCESS_TOKEN"
```

## 🛠️ 常见问题

### 1. 忘记管理员密码

运行 seed 脚本重新创建管理员：

```bash
ADMIN_EMAIL="admin@cmamsys.com" \
ADMIN_USERNAME="admin" \
ADMIN_PASSWORD="NewPassword123!" \
pnpm prisma:seed
```

### 2. 更改数据库类型

1. 登录系统
2. 访问 `/settings/database`
3. 更新数据库配置
4. 测试连接
5. 重启服务
6. 运行迁移

### 3. 迁移数据

从 SQLite 迁移到 PostgreSQL：

```bash
# 1. 备份 SQLite 数据
cp dev.db dev.db.backup

# 2. 更新配置
# 访问 /settings/database 更新为 PostgreSQL

# 3. 重启服务
pnpm run start

# 4. 运行迁移
pnpm prisma migrate deploy

# 5. 导入数据
# 使用数据库迁移工具（如 pgloader）导入数据
```

### 4. 查看审计日志

```bash
# 使用 Prisma Studio
pnpm prisma studio

# 或查询日志文件
tail -f /app/work/logs/bypass/app.log
```

---

## 🔧 故障排查

### 安装问题

#### 问题：npm install 失败

**错误信息**：`Error: Cannot resolve module 'xxx'`

**解决方案**：
```bash
# 清除缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

#### 问题：数据库连接失败

**错误信息**：`Error: Connection refused` 或 `Error: Authentication failed`

**解决方案**：
1. 检查 PostgreSQL 是否运行：
```bash
# 检查服务状态
sudo systemctl status postgresql

# 或检查 Docker 容器
docker ps | grep postgres
```

2. 验证连接字符串：
```bash
# 测试连接
psql -U postgres -h localhost -d cmamsys -c "SELECT NOW();"
```

3. 检查 .env 文件配置：
```bash
# 确保 DATABASE_URL 正确
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cmamsys"
```

#### 问题：迁移失败

**错误信息**：`Error: Migration failed`

**解决方案**：
```bash
# 查看迁移历史
pnpm prisma migrate status

# 重置数据库（WARNING：删除所有数据）
pnpm prisma migrate reset

# 或创建新的迁移
pnpm prisma migrate dev --name fix_migration
```

### 运行时问题

#### 问题：应用无法启动

**错误信息**：`Error: Port 5000 already in use`

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i:5000

# 或使用 ss 命令
ss -tuln | grep 5000

# 终止进程
kill -9 <PID>

# 或修改端口
# 在 .env 文件中设置 PORT=3000
```

#### 问题：登录失败

**错误信息**：`Error: Invalid credentials` 或 `Error: Token expired`

**解决方案**：
1. 检查管理员账户：
```bash
# 使用 seed 脚本重置
pnpm prisma:seed
```

2. 检查 Token 配置：
```bash
# 确保 JWT_SECRET 已设置
# 在 .env 文件中：
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-here
```

3. 清除浏览器缓存和 Cookie

#### 问题：API 请求失败

**错误信息**：`Error: 401 Unauthorized` 或 `Error: 403 Forbidden`

**解决方案**：
1. 检查 Token 是否有效：
```bash
# 使用 curl 测试
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

2. 检查权限：
- 确保用户有足够的权限访问该资源
- 查看用户的角色和权限设置

3. 查看日志：
```bash
tail -f /app/work/logs/bypass/app.log
```

### AI Provider 问题

#### 问题：AI 调用失败

**错误信息**：`Error: AI provider request failed`

**解决方案**：
1. 验证 API Key：
- 检查 API Key 是否正确
- 确保没有多余的空格或换行

2. 检查网络连接：
```bash
# 测试连接到 AI Provider
curl -I https://api.openai.com
```

3. 查看详细日志：
```bash
tail -f /app/work/logs/bypass/app.log | grep "AI"
```

### 性能问题

#### 问题：应用响应缓慢

**可能原因**：
- 数据库查询慢
- 缺少索引
- 网络延迟

**解决方案**：
1. 优化数据库查询：
```bash
# 使用 Prisma Studio 检查查询
pnpm prisma studio
```

2. 添加数据库索引（在 schema.prisma 中）：
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  @@index([email])  // 添加索引
}
```

3. 启用 Redis 缓存（可选）：
```bash
# 在 .env 文件中配置
REDIS_URL=redis://localhost:6379
```

### 学习模块问题

#### 问题：Bilibili 学习失败

**错误信息**：`Error: Failed to fetch Bilibili video`

**解决方案**：
1. 检查 Bilibili API 配置：
- 确保 BILIBILI_API_URL 正确
- 验证 API 密钥

2. 检查视频 URL：
- 确保视频 URL 格式正确
- 验证视频是否可用

3. 查看学习日志：
```bash
tail -f /app/work/logs/bypass/app.log | grep "learning"
```

---

## 📞 获取帮助

如果以上方法都无法解决你的问题，请尝试：

- 📚 查看文档: `/docs`
- 📋 查看日志: `/app/work/logs/bypass/`
- 🔍 搜索已知问题: [GitHub Issues](https://github.com/your-org/cmamsys/issues)
- 💬 社区讨论: [GitHub Discussions](https://github.com/your-org/cmamsys/discussions)
- 📧 联系支持: support@cmamsys.com

### 提交 Issue 时，请提供：

1. 系统信息：
   - 操作系统版本
   - Node.js 版本
   - PostgreSQL 版本

2. 错误信息：
   - 完整的错误堆栈
   - 截图（如适用）

3. 复现步骤：
   - 详细的操作步骤
   - 预期行为
   - 实际行为

4. 环境配置：
   - `.env` 文件（隐藏敏感信息）
   - 配置文件版本

---

**安装完成后，访问 http://localhost:5000 开始使用 CMAMSys！**

## 📊 系统监控

### 日志位置

- 应用日志: `/app/work/logs/bypass/app.log`
- 开发日志: `/app/work/logs/bypass/dev.log`
- 控制台日志: 浏览器开发者工具

### 健康检查

```bash
# 检查服务状态
curl http://localhost:5000/api/health

# 检查数据库连接
curl -X POST http://localhost:5000/api/settings/database \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"connectionString":"...","testConnection":true}'
```

## 🔄 更新系统

```bash
# 拉取最新代码
git pull

# 安装新依赖
pnpm install

# 运行数据库迁移
pnpm prisma migrate deploy

# 重新构建
pnpm run build

# 重启服务
pnpm run start
```

## 📞 获取帮助

- 查看文档: `/docs`
- 查看日志: `/app/work/logs/bypass/`
- 问题反馈: GitHub Issues

---

**安装完成后，访问 http://localhost:5000 开始使用 CMAMSys！**
