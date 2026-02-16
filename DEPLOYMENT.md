# CMAMSys 部署指南

本指南介绍 CMAMSys（企业级数学建模竞赛自动化系统）的三种部署方式：

1. **Web 界面安装** - 类似 WordPress 的可视化安装向导
2. **命令行安装** - 交互式命令行安装脚本
3. **Docker 部署** - 使用 Docker Compose 一键部署

---

## 目录

- [系统要求](#系统要求)
- [方式一：Web 界面安装](#方式一web-界面安装)
- [方式二：命令行安装](#方式二命令行安装)
- [方式三：Docker 部署](#方式三docker-部署)
- [配置说明](#配置说明)
- [常见问题](#常见问题)

---

## 系统要求

### 最低要求

- **操作系统**: Linux, macOS, Windows (WSL2)
- **Node.js**: 18.0 或更高版本
- **内存**: 2GB RAM（推荐 4GB）
- **存储**: 5GB 可用空间

### 数据库要求

- **PostgreSQL**: 12.0 或更高版本
- **Redis**: 6.0 或更高版本（可选，用于缓存）

### Docker 部署要求

- **Docker**: 20.10 或更高版本
- **Docker Compose**: 2.0 或更高版本

---

## 方式一：Web 界面安装

Web 安装向导提供直观的图形界面，适合不熟悉命令行的用户。

### 步骤 1: 下载项目

```bash
git clone https://github.com/your-org/cmamsys.git
cd cmamsys
```

### 步骤 2: 安装依赖

```bash
pnpm install
```

### 步骤 3: 启动应用

```bash
pnpm dev
```

### 步骤 4: 访问安装向导

打开浏览器访问：`http://localhost:5000/install`

### 步骤 5: 跟随向导完成安装

安装向导包含以下步骤：

1. **欢迎页面** - 了解 CMAMSys 功能和系统要求
2. **环境检查** - 自动检测 Node.js、数据库等环境
3. **数据库配置** - 配置数据库连接信息
4. **管理员账户** - 创建初始管理员账户
5. **应用配置** - 配置应用名称、URL 等
6. **安全配置** - 生成或配置安全密钥
7. **安装进度** - 显示安装进度和日志
8. **完成页面** - 安装完成，提供登录链接

### 步骤 6: 开始使用

安装完成后，访问 `http://localhost:5000/login` 使用管理员账户登录。

---

## 方式二：命令行安装

命令行安装脚本提供交互式配置，适合熟悉命令行的用户。

### 步骤 1: 下载项目

```bash
git clone https://github.com/your-org/cmamsys.git
cd cmamsys
```

### 步骤 2: 运行安装脚本

```bash
node scripts/install-cli.js
```

### 步骤 3: 跟随提示完成配置

安装脚本会引导你完成以下配置：

```
欢迎使用 CMAMSys 安装向导！
================================

? 请输入应用名称 (CMAMSys):
? 请输入应用 URL (http://localhost:5000):
? 数据库类型 (新建/已有) (新建):
? 数据库主机 (localhost):
? 数据库端口 (5432):
? 数据库名称 (cmamsys):
? 数据库用户名 (postgres):
? 数据库密码:
? 管理员用户名 (admin):
? 管理员邮箱:
? 管理员密码:
? 生成随机安全密钥? (Y/n):

正在安装...
✓ 环境检查完成
✓ 数据库连接成功
✓ 执行数据库迁移
✓ 创建管理员账户
✓ 生成配置文件

安装完成！
================================

访问地址: http://localhost:5000
登录邮箱: admin@example.com
登录密码: **********

启动应用:
  pnpm dev      # 开发模式
  pnpm start    # 生产模式
```

### 步骤 4: 启动应用

```bash
pnpm dev
```

### 步骤 5: 开始使用

访问 `http://localhost:5000/login` 使用管理员账户登录。

---

## 方式三：Docker 部署

Docker 部署提供最简单的一键部署方式，包含所有依赖服务。

### 步骤 1: 下载项目

```bash
git clone https://github.com/your-org/cmamsys.git
cd cmamsys
```

### 步骤 2: 配置环境变量

```bash
cp .env.docker.example .env
```

编辑 `.env` 文件，修改必要配置：

```env
# 应用配置
APP_NAME=CMAMSys
APP_URL=http://localhost:5000

# 数据库密码（生产环境必须修改）
DB_PASSWORD=your_secure_password

# 安全密钥（生产环境必须修改）
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_minimum_32_characters
ENCRYPTION_KEY=your_encryption_key_minimum_32_characters
CSRF_SECRET=your_csrf_secret_key_minimum_32_characters
SESSION_SECRET=your_session_secret_key_minimum_32_characters
```

### 步骤 3: 使用部署脚本

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh start
```

部署脚本会自动：
- 构建应用镜像
- 启动 PostgreSQL 和 Redis
- 启动应用服务
- 配置网络和存储卷

### 步骤 4: 初始化数据库

```bash
# 运行数据库迁移
./docker-deploy.sh migrate

# 创建管理员账户
./docker-deploy.sh seed
```

### 步骤 5: 访问应用

打开浏览器访问：`http://localhost:5000`

### Docker 命令参考

```bash
# 启动服务
./docker-deploy.sh start

# 停止服务
./docker-deploy.sh stop

# 重启服务
./docker-deploy.sh restart

# 查看日志
./docker-deploy.sh logs

# 查看服务状态
./docker-deploy.sh status

# 进入应用容器
./docker-deploy.sh shell

# 进入数据库容器
./docker-deploy.sh db-shell

# 健康检查
./docker-deploy.sh health

# 备份数据库
./docker-deploy.sh backup

# 恢复数据库
./docker-deploy.sh restore ./backups/cmamsys_20240101_120000.sql

# 清理未使用的资源
./docker-deploy.sh clean
```

### 使用 Docker Compose 直接部署

```bash
# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重新构建
docker compose up -d --build
```

---

## 配置说明

### 环境变量

所有配置通过环境变量控制，主要配置项包括：

#### 应用配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `APP_NAME` | 应用名称 | `CMAMSys` |
| `APP_URL` | 应用 URL | `http://localhost:5000` |
| `NODE_ENV` | 运行环境 | `development` |

#### 数据库配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://localhost:5432/cmamsys` |
| `DB_PORT` | 数据库端口 | `5432` |
| `DB_PASSWORD` | 数据库密码 | - |

#### 安全密钥

| 变量名 | 说明 | 要求 |
|--------|------|------|
| `JWT_SECRET` | JWT 令牌签名密钥 | 最少 32 字符 |
| `REFRESH_TOKEN_SECRET` | 刷新令牌签名密钥 | 最少 32 字符 |
| `ENCRYPTION_KEY` | 数据加密密钥 | 最少 32 字符 |
| `CSRF_SECRET` | CSRF 保护密钥 | 最少 32 字符 |
| `SESSION_SECRET` | 会话加密密钥 | 最少 32 字符 |

#### 安全配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `BCRYPT_ROUNDS` | bcrypt 加密轮次 | `14` |
| `MAX_LOGIN_ATTEMPTS` | 最大登录尝试次数 | `5` |
| `LOCKOUT_DURATION_MS` | 锁定持续时间（毫秒） | `900000` (15分钟) |

#### CORS 配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `ALLOWED_ORIGINS` | 允许的来源 | `http://localhost:5000` |
| `ALLOWED_METHODS` | 允许的 HTTP 方法 | `GET,POST,PUT,DELETE,PATCH,OPTIONS` |
| `ALLOWED_HEADERS` | 允许的请求头 | `Content-Type,Authorization,X-CSRF-Token` |

### 生成安全密钥

使用以下命令生成随机密钥：

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# OpenSSL
openssl rand -base64 32

# Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 常见问题

### 1. 端口被占用

如果 5000 端口被占用，可以通过修改环境变量 `APP_PORT` 或 Docker Compose 中的端口映射：

```env
APP_PORT=3000
```

或：

```yaml
ports:
  - "3000:5000"
```

### 2. 数据库连接失败

检查以下几点：

- PostgreSQL 是否已启动
- 数据库连接字符串是否正确
- 数据库用户权限是否足够
- 防火墙是否阻止连接

测试数据库连接：

```bash
psql "postgresql://user:password@localhost:5432/cmamsys"
```

### 3. 依赖安装失败

使用国内镜像源加速安装：

```bash
pnpm config set registry https://registry.npmmirror.com
pnpm install
```

### 4. 权限问题

Docker 部署时出现权限问题，确保文件权限正确：

```bash
sudo chown -R $USER:$USER ./
chmod -R 755 .
```

### 5. 迁移失败

如果数据库迁移失败，可以重置数据库：

```bash
# 删除数据库并重新迁移
npx prisma migrate reset

# 或手动删除数据库
dropdb cmamsys
createdb cmamsys
npx prisma migrate deploy
```

### 6. 无法访问安装向导

确保：

- 应用已正确启动
- 防火墙未阻止端口
- 浏览器访问正确的 URL

### 7. Docker 镜像构建慢

使用国内镜像加速：

创建 `/etc/docker/daemon.json`：

```json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
```

重启 Docker：

```bash
sudo systemctl restart docker
```

### 8. 容器无法启动

查看容器日志：

```bash
docker compose logs app
docker compose logs postgres
```

检查资源使用：

```bash
docker stats
```

---

## 生产环境部署建议

### 1. 使用 HTTPS

配置反向代理（如 Nginx）并启用 SSL/TLS：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. 使用进程管理器

使用 PM2 管理进程：

```bash
pnpm add -D pm2

# 创建 PM2 配置文件 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cmamsys',
    script: './scripts/start.sh',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }],
};

# 启动应用
pm2 start ecosystem.config.js

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

### 3. 定期备份

设置定期备份脚本：

```bash
#!/bin/bash
# 每天凌晨 2 点备份数据库
0 2 * * * /path/to/backup.sh

# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
mkdir -p $BACKUP_DIR
pg_dump -U postgres cmamsys > $BACKUP_DIR/cmamsys_$DATE.sql
gzip $BACKUP_DIR/cmamsys_$DATE.sql
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

### 4. 监控和日志

使用日志聚合工具：

```bash
# 使用 ELK Stack
# 或使用 Grafana + Prometheus

# 简单的日志监控
tail -f logs/app.log | grep ERROR
```

### 5. 安全加固

- 定期更新依赖包：`pnpm update`
- 启用防火墙，只开放必要端口
- 配置 fail2ban 防止暴力破解
- 定期审计日志

---

## 获取帮助

如果遇到问题：

1. 查看 [常见问题](#常见问题)
2. 检查日志文件：`logs/app.log`
3. 访问 GitHub Issues: https://github.com/your-org/cmamsys/issues
4. 联系技术支持: support@example.com

---

## 更新日志

### v1.0.0 (2024-01-01)

- 初始发布
- 支持 Web 界面安装
- 支持命令行安装
- 支持 Docker 部署
- 完整的部署文档

---

**祝您使用愉快！**
