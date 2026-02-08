# CMAMSys 部署文档

本文档提供 CMAMSys 的私有化部署指南，支持社区版和企业版。

## 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [部署社区版](#部署社区版)
- [部署企业版](#部署企业版)
- [配置说明](#配置说明)
- [数据持久化](#数据持久化)
- [备份与恢复](#备份与恢复)
- [常见问题](#常见问题)

---

## 系统要求

### 硬件要求

| 版本 | CPU | 内存 | 磁盘空间 | 说明 |
|------|-----|------|----------|------|
| 社区版 | 2 核 | 4GB | 20GB | 适合 1-10 用户的团队 |
| 企业版 | 4 核 | 8GB | 100GB | 适合 10-100 用户的团队 |

### 软件要求

- Docker 20.10+
- Docker Compose 2.0+
- Linux/macOS/Windows (WSL2)

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-org/cmamsys.git
cd cmamsys
```

### 2. 选择版本

```bash
# 社区版（免费）
cd docker
./deploy.sh community up

# 企业版（需要许可证）
./deploy.sh enterprise up
```

### 3. 访问应用

打开浏览器访问：http://localhost:5000

默认管理员账号：
- 邮箱：admin@cmamsys.com
- 密码：admin123

⚠️ **重要**：首次登录后请立即修改密码！

---

## 部署社区版

### 方法一：使用部署脚本（推荐）

```bash
cd docker

# 配置环境变量
cp .env.community.example .env.community
# 编辑 .env.community 文件，修改必要配置

# 启动服务
./deploy.sh community up

# 查看日志
./deploy.sh community logs
```

### 方法二：使用 Docker Compose

```bash
cd docker

# 配置环境变量
cp .env.community.example .env.community

# 启动服务
docker compose -f docker-compose.community.yml --env-file .env.community up -d

# 查看服务状态
docker compose -f docker-compose.community.yml ps
```

### 启用 Redis（可选）

```bash
# 启动包含 Redis 的完整服务
./deploy.sh community up --with-redis
```

### 停止服务

```bash
./deploy.sh community down
```

### 完全清理（删除所有数据）

```bash
./deploy.sh community clean
```

---

## 部署企业版

### 前置条件

1. 获取企业版许可证密钥
2. 准备对象存储（MinIO 或 S3 兼容）

### 方法一：使用部署脚本（推荐）

```bash
cd docker

# 配置环境变量
cp .env.enterprise.example .env.enterprise
# 编辑 .env.enterprise 文件，填入许可证密钥和其他配置

# 启动完整服务（包含 Redis、MinIO）
./deploy.sh enterprise up --with-redis --with-minio

# 查看日志
./deploy.sh enterprise logs
```

### 启用 Nginx 反向代理

```bash
# 创建 SSL 证书目录
mkdir -p docker/ssl

# 放置证书文件（fullchain.pem 和 privkey.pem）
cp /path/to/your/fullchain.pem docker/ssl/
cp /path/to/your/privkey.pem docker/ssl/

# 启动包含 Nginx 的完整服务
./deploy.sh enterprise up --with-redis --with-minio --with-nginx
```

### 使用 Let's Encrypt 自动获取证书

```bash
# 安装 certbot
sudo apt-get update
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到 docker/ssl 目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/
sudo chmod 644 docker/ssl/*.pem

# 启动服务
./deploy.sh enterprise up --with-nginx
```

### 停止服务

```bash
./deploy.sh enterprise down
```

---

## 配置说明

### 环境变量配置

#### 数据库配置

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=cmamsys
```

#### JWT 密钥配置

```bash
# 生成安全的随机密钥
openssl rand -base64 32

# 配置到环境变量
JWT_SECRET=your-generated-secret-key
REFRESH_TOKEN_SECRET=your-generated-refresh-token-key
```

#### 对象存储配置（企业版）

**MinIO 配置（默认）：**

```bash
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=admin
S3_SECRET_KEY=admin123456
S3_BUCKET=cmamsys-uploads
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
```

**AWS S3 配置：**

```bash
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=false
```

#### 邮件配置（企业版）

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@cmamsys.com
```

#### 许可证配置（企业版）

```bash
LICENSE_KEY=your-enterprise-license-key
LICENSE_SERVER=https://license.cmamsys.com
LICENSE_OFFLINE_MODE=false
```

### 功能开关

社区版和企业版的功能通过环境变量控制：

```bash
# 社区版默认配置
ENABLE_BASIC_MODELING=true
ENABLE_TEAM_COLLABORATION=true
ENABLE_REPORT_GENERATION=true
ENABLE_ADVANCED_ANALYTICS=false
ENABLE_AI_AUTO_SELECTION=false

# 企业版默认配置
ENABLE_ADVANCED_ANALYTICS=true
ENABLE_AI_AUTO_SELECTION=true
ENABLE_ENTERPRISE_SSO=true
ENABLE_UNLIMITED_STORAGE=true
```

---

## 数据持久化

### 数据卷说明

| 卷名称 | 用途 | 路径 |
|--------|------|------|
| `postgres_data` | PostgreSQL 数据库数据 | `/var/lib/postgresql/data` |
| `redis_data` | Redis 缓存数据 | `/data` |
| `minio_data` | MinIO 对象存储数据 | `/data` |
| `app_data` | 应用程序数据 | `/app/data` |
| `app_logs` | 应用程序日志 | `/app/logs` |
| `app_uploads` | 上传文件临时存储 | `/app/uploads` |

### 备份数据卷

```bash
# 备份 PostgreSQL 数据
docker run --rm \
  -v cmamsys_postgres_data:/data \
  -v $(pwd)/backups:/backups \
  alpine tar czf /backups/postgres-$(date +%Y%m%d).tar.gz -C /data .

# 备份 MinIO 数据
docker run --rm \
  -v cmamsys_minio_data:/data \
  -v $(pwd)/backups:/backups \
  alpine tar czf /backups/minio-$(date +%Y%m%d).tar.gz -C /data .
```

### 恢复数据卷

```bash
# 恢复 PostgreSQL 数据
docker run --rm \
  -v cmamsys_postgres_data:/data \
  -v $(pwd)/backups:/backups \
  alpine tar xzf /backups/postgres-20250101.tar.gz -C /data

# 恢复 MinIO 数据
docker run --rm \
  -v cmamsys_minio_data:/data \
  -v $(pwd)/backups:/backups \
  alpine tar xzf /backups/minio-20250101.tar.gz -C /data
```

---

## 备份与恢复

### 数据库备份

#### 自动备份（企业版）

企业版内置自动备份功能，通过配置启用：

```bash
# .env.enterprise
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # 每天凌晨 2 点
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=cmamsys-backups
```

#### 手动备份

```bash
# 备份数据库
docker exec cmamsys-enterprise-postgres \
  pg_dump -U postgres cmamsys > backup-$(date +%Y%m%d).sql

# 备份到 MinIO
docker exec cmamsys-enterprise-minio \
  mc cp backup-20250101.sql cmamsys-backups/
```

### 数据库恢复

```bash
# 从备份恢复
docker exec -i cmamsys-enterprise-postgres \
  psql -U postgres cmamsys < backup-20250101.sql
```

---

## 常见问题

### 1. 服务启动失败

**问题**：Docker 容器无法启动

**解决方案**：

```bash
# 查看容器日志
docker logs cmamsys-community-app

# 检查端口占用
netstat -tuln | grep 5000

# 重启服务
./deploy.sh community restart
```

### 2. 数据库连接失败

**问题**：应用无法连接到数据库

**解决方案**：

```bash
# 检查数据库状态
docker compose -f docker-compose.community.yml ps postgres

# 查看数据库日志
docker logs cmamsys-community-postgres

# 验证数据库连接
docker exec -it cmamsys-community-postgres \
  psql -U postgres -d cmamsys -c "SELECT 1;"
```

### 3. 文件上传失败

**问题**：无法上传文件

**解决方案**：

```bash
# 检查 MinIO 状态（企业版）
docker logs cmamsys-enterprise-minio

# 检查 S3 配置
# 确认 S3_ENDPOINT、S3_ACCESS_KEY、S3_SECRET_KEY 配置正确

# 检查存储桶是否存在
docker exec -it cmamsys-enterprise-minio \
  mc ls myminio/cmamsys-uploads
```

### 4. 许可证验证失败（企业版）

**问题**：许可证无法验证

**解决方案**：

```bash
# 检查网络连接
curl https://license.cmamsys.com/api/health

# 使用离线模式
# 在 .env.enterprise 中设置
LICENSE_OFFLINE_MODE=true

# 联系支持获取离线许可证文件
```

### 5. 性能问题

**问题**：应用响应缓慢

**解决方案**：

```bash
# 启用 Redis 缓存
./deploy.sh community up --with-redis

# 增加资源限制
# 编辑 docker-compose.yml，添加：
# deploy:
#   resources:
#     limits:
#       cpus: '2'
#       memory: 4G

# 优化数据库
docker exec -it cmamsys-community-postgres \
  psql -U postgres -d cmamsys -c "VACUUM ANALYZE;"
```

### 6. 内存不足

**问题**：容器因内存不足被杀死

**解决方案**：

```bash
# 查看 Docker 资源使用
docker stats

# 增加 Swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 限制容器内存
# 编辑 docker-compose.yml，添加内存限制
```

### 7. SSL 证书问题

**问题**：HTTPS 无法访问

**解决方案**：

```bash
# 检查证书文件
ls -la docker/ssl/

# 验证证书有效期
openssl x509 -in docker/ssl/fullchain.pem -noout -dates

# 重新获取证书
sudo certbot renew
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/
```

### 8. 升级到新版本

**问题**：如何升级 CMAMSys

**解决方案**：

```bash
# 1. 备份数据
./deploy.sh community backup

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建镜像
docker compose -f docker-compose.community.yml build

# 4. 重启服务
./deploy.sh community restart

# 5. 运行数据库迁移（如果有）
docker exec -it cmamsys-community-postgres \
  psql -U postgres -d cmamsys -f /docker-entrypoint-initdb.d/migrate.sql
```

---

## 常见问题

### 1. 服务启动失败

**问题**：Docker 容器无法启动

**解决方案**：

```bash
# 查看容器日志
docker logs cmamsys-community-app

# 检查端口占用
netstat -tuln | grep 5000

# 检查磁盘空间
df -h

# 重启服务
./deploy.sh community restart
```

### 2. 数据库连接失败

**问题**：应用无法连接到数据库

**解决方案**：

```bash
# 检查 PostgreSQL 容器状态
docker ps | grep postgres

# 测试数据库连接
docker exec -it cmamsys-community-postgres \
  psql -U postgres -d cmamsys -c "SELECT NOW();"

# 检查环境变量配置
docker exec cmamsys-community-app env | grep DATABASE_URL

# 重启数据库容器
docker restart cmamsys-community-postgres
```

### 3. 性能问题

**问题**：应用响应缓慢

**解决方案**：

```bash
# 启用 Redis 缓存
./deploy.sh community up --with-redis

# 增加资源限制
# 编辑 docker-compose.yml，添加：
# deploy:
#   resources:
#     limits:
#       cpus: '2'
#       memory: 4G

# 优化数据库
docker exec -it cmamsys-community-postgres \
  psql -U postgres -d cmamsys -c "VACUUM ANALYZE;"
```

### 4. 内存不足

**问题**：容器因内存不足被杀死

**解决方案**：

```bash
# 查看 Docker 资源使用
docker stats

# 增加 Swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 限制容器内存
# 编辑 docker-compose.yml，添加内存限制
```

### 5. SSL 证书问题

**问题**：HTTPS 无法访问

**解决方案**：

```bash
# 检查证书文件
ls -la docker/ssl/

# 验证证书有效期
openssl x509 -in docker/ssl/fullchain.pem -noout -dates

# 重新获取证书
sudo certbot renew
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/
```

### 6. 升级到新版本

**问题**：如何升级 CMAMSys

**解决方案**：

```bash
# 1. 备份数据
./deploy.sh community backup

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建镜像
docker compose -f docker-compose.community.yml build

# 4. 重启服务
./deploy.sh community restart

# 5. 运行数据库迁移（如果有）
docker exec -it cmamsys-community-postgres \
  psql -U postgres -d cmamsys -f /docker-entrypoint-initdb.d/migrate.sql
```

### 7. 备份失败

**问题**：自动备份无法执行

**解决方案**：

```bash
# 检查备份目录权限
ls -la backups/

# 检查磁盘空间
df -h

# 手动测试备份
docker exec cmamsys-community-postgres \
  pg_dump -U postgres cmamsys > test-backup.sql

# 检查 cron 任务（如果使用系统 cron）
crontab -l
```

### 8. MinIO 连接失败

**问题**：企业版无法连接到 MinIO

**解决方案**：

```bash
# 检查 MinIO 容器状态
docker ps | grep minio

# 测试 MinIO 连接
curl -I http://localhost:9000

# 检查 MinIO 配置
docker exec cmamsys-enterprise-minio env | grep S3

# 查看 MinIO 日志
docker logs cmamsys-enterprise-minio
```

### 9. 邮件发送失败

**问题**：通知邮件无法发送

**解决方案**：

```bash
# 检查 SMTP 配置
docker exec cmamsys-community-app env | grep SMTP

# 测试 SMTP 连接
telnet smtp.gmail.com 587

# 检查邮箱密码（如果是 Gmail，需要使用应用专用密码）
# 访问：https://myaccount.google.com/apppasswords

# 查看邮件日志
docker logs cmamsys-community-app | grep -i mail
```

### 10. 许可证验证失败

**问题**：企业版许可证验证失败

**解决方案**：

```bash
# 检查许可证配置
docker exec cmamsys-community-app env | grep LICENSE

# 验证许可证密钥
curl -X POST https://license.cmamsys.com/validate \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"your-license-key"}'

# 如果是离线模式，确保已配置离线验证
# .env.enterprise
LICENSE_OFFLINE_MODE=true
```

### 11. AI Provider 调用失败

**问题**：AI 功能无法使用

**解决方案**：

```bash
# 检查网络连接
curl -I https://api.openai.com

# 验证 API Key 配置
# 在系统设置中查看 AI Providers 配置

# 查看详细日志
docker logs cmamsys-community-app | grep -i "ai\|llm"

# 测试 API 连接
# 使用系统设置中的测试功能
```

### 12. 数据迁移问题

**问题**：从旧版本迁移数据失败

**解决方案**：

```bash
# 1. 备份旧数据
docker exec cmamsys-community-postgres \
  pg_dump -U postgres cmamsys > old-backup.sql

# 2. 检查迁移文件
ls -la prisma/migrations/

# 3. 手动运行迁移
docker exec -it cmamsys-community-postgres \
  psql -U postgres -d cmamsys -f /path/to/migration.sql

# 4. 验证数据完整性
docker exec -it cmamsys-community-postgres \
  psql -U postgres -d cmamsys -c "SELECT COUNT(*) FROM User;"
```

### 13. 端口冲突

**问题**：5000 端口已被占用

**解决方案**：

```bash
# 查找占用端口的进程
lsof -i:5000

# 或使用 ss 命令
ss -tuln | grep 5000

# 终止进程
kill -9 <PID>

# 或修改端口配置
# 在 docker-compose.yml 中：
# ports:
#   - "3000:5000"  # 映射到宿主机的 3000 端口
```

### 14. Docker 镜像拉取失败

**问题**：无法拉取 Docker 镜像

**解决方案**：

```bash
# 检查 Docker 镜像源
docker info | grep Registry

# 配置国内镜像源（如果在中国）
# 编辑 /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ]
}

# 重启 Docker
sudo systemctl restart docker

# 重试拉取
docker pull postgres:14
```

### 15. 文件上传失败

**问题**：用户无法上传文件

**解决方案**：

```bash
# 检查上传目录权限
ls -la data/uploads/

# 修改权限
chmod 755 data/uploads/
chown -R $(whoami):$(whoami) data/uploads/

# 检查磁盘空间
df -h

# 查看上传日志
docker logs cmamsys-community-app | grep -i upload
```

---

## 📞 技术支持

如果以上方法都无法解决你的问题，请尝试：

- 📧 **邮件**：support@cmamsys.com
- 📚 **文档**：https://docs.cmamsys.com
- 💬 **社区**：https://community.cmamsys.com
- 🐛 **提交 Issue**：[GitHub Issues](https://github.com/your-org/cmamsys/issues)

### 提交问题时，请提供：

1. 系统环境信息
2. 完整的错误日志
3. 复现步骤
4. 配置文件（隐藏敏感信息）

---

## 许可证

- **社区版**：MIT License - 免费用于个人和商业用途
- **企业版**：商业许可证 - 需要购买授权以使用高级功能

**许可证咨询**：license@cmamsys.com

---

*最后更新：2026-02-08*
