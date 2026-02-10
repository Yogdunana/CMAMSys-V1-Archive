# CMAMSys 服务启动指南

## 概述

本文档提供了 CMAMSys 所需服务的启动指南，包括 Redis 和 Sentry。

---

## Redis 服务

### 快速启动

#### 方式 1: 使用管理脚本（推荐）

```bash
# 启动 Redis
./scripts/manage-redis.sh start

# 查看状态
./scripts/manage-redis.sh status

# 测试连接
./scripts/manage-redis.sh test
```

#### 方式 2: 使用 Docker（如果可用）

```bash
cd docker/redis
docker compose up -d

# 查看日志
docker compose logs -f redis

# 停止服务
docker compose down
```

#### 方式 3: 使用系统服务

```bash
# Ubuntu/Debian
sudo systemctl start redis-server
sudo systemctl status redis-server

# macOS
brew services start redis

# Windows
redis-server.exe
```

### 验证 Redis 运行

```bash
# 测试连接
redis-cli ping
# 应该返回: PONG

# 查看信息
redis-cli info server

# 查看内存使用
redis-cli info memory
```

### Redis 配置

配置文件位于 `config/redis.conf`：

```conf
# 网络配置
bind 127.0.0.1
port 6379

# 持久化
appendonly yes
appendfsync everysec

# 内存限制
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 常见问题

#### Redis 无法启动

**问题：** `Address already in use`

**解决方案：**
```bash
# 查找占用端口的进程
lsof -i :6379

# 终止进程
kill -9 <PID>

# 或更改端口
# 编辑 config/redis.conf，修改 port 配置
```

#### 连接被拒绝

**问题：** `Connection refused`

**解决方案：**
```bash
# 检查 Redis 是否运行
./scripts/manage-redis.sh status

# 检查防火墙
sudo ufw allow 6379
```

---

## Sentry 服务

### 前置要求

- Docker 和 Docker Compose
- 至少 4GB 可用内存
- 20GB 可用磁盘空间

### 快速启动

#### 使用自动启动脚本（推荐）

```bash
# 运行自动启动脚本
./scripts/setup-sentry.sh

# 脚本会自动完成以下操作：
# 1. 检查 Docker 和 Docker Compose
# 2. 生成安全密钥
# 3. 启动 Sentry 服务
# 4. 初始化数据库
# 5. 创建管理员账户
```

#### 手动启动步骤

##### 1. 检查环境

```bash
# 检查 Docker
docker --version
docker compose --version

# 应该看到类似输出：
# Docker version 20.10.x
# Docker Compose version v2.x.x
```

##### 2. 生成密钥

```bash
# 生成 Sentry Secret Key
openssl rand -base64 64

# 输出示例:
# YyQ4ZmFhZjktZjZmNy00ZmQ2LTk4ZjAtYWZlZmZlZmZlZmY4ZGVkYzYxZjAtMzJhMi00Mjk4LTliYTAtZmZmZmZmZmZmZmY=

# 生成数据库密码
openssl rand -base64 32
```

##### 3. 更新配置文件

编辑 `docker/sentry/.env`：

```bash
SENTRY_SECRET_KEY="你的生成密钥"
SENTRY_DB_PASSWORD="你的数据库密码"
```

##### 4. 启动服务

```bash
cd docker/sentry

# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f

# 等待所有服务启动（约 2-3 分钟）
```

##### 5. 初始化数据库

```bash
# 运行数据库迁移
docker compose run --rm web sentry db upgrade

# 创建管理员账户
docker compose run --rm web sentry createuser \
  --email admin@cmamsys.local \
  --password 你的密码 \
  --superuser
```

##### 6. 访问 Sentry

打开浏览器访问: `http://localhost:9000`

使用创建的管理员账户登录。

### 验证 Sentry 运行

```bash
# 检查服务状态
cd docker/sentry
docker compose ps

# 应该看到所有服务都在运行：
# web      Up
# worker   Up
# cron     Up
# postgres Up
# redis    Up
# smtp     Up

# 测试 API 端点
curl http://localhost:9000/api/0/
# 应该返回 JSON 响应
```

### 创建项目和获取 DSN

1. 登录 Sentry (`http://localhost:9000`)
2. 点击 "Create Project"
3. 选择平台：Next.js
4. 输入项目名称：cmamsys-web
5. 获取 DSN

DSN 格式示例：
```
http://1234567890abcdef@localhost:9000/123456
```

### 更新应用配置

编辑项目根目录的 `.env`：

```bash
# Sentry Configuration
SENTRY_DSN="http://1234567890abcdef@localhost:9000/123456"
SENTRY_AUTH_TOKEN="你的认证令牌"
SENTRY_ENVIRONMENT="development"
SENTRY_ORGANIZATION="cmamsys"
SENTRY_PROJECT="cmamsys-web"
SENTRY_RELEASE="v1.0.0"
NEXT_PUBLIC_SENTRY_DSN="http://1234567890abcdef@localhost:9000/123456"
```

### 常见问题

#### 服务启动失败

**问题：** 服务无法启动

**解决方案：**
```bash
# 查看详细日志
docker compose logs web

# 检查端口占用
lsof -i :9000

# 重启服务
docker compose down
docker compose up -d
```

#### 数据库连接失败

**问题：** `could not connect to server`

**解决方案：**
```bash
# 检查 PostgreSQL 容器
docker compose ps postgres

# 进入数据库容器
docker compose exec postgres psql -U sentry sentry

# 测试连接
docker compose exec web python -c "import psycopg2; print('OK')"
```

#### 端口冲突

**问题：** `Address already in use`

**解决方案：**
```bash
# 更改端口
# 编辑 docker-compose.yml，修改端口映射
ports:
  - "9001:9000"  # 将 9000 改为 9001
```

---

## 同时启动所有服务

### 开发环境

```bash
# 1. 启动 Redis
./scripts/manage-redis.sh start

# 2. 启动 Sentry
cd docker/sentry
docker compose up -d

# 3. 启动 CMAMSys 应用
cd ../..
pnpm run dev
```

### 生产环境

```bash
# 1. 使用 systemd 管理 Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 2. 使用 Docker Compose 管理 Sentry
cd docker/sentry
docker compose up -d

# 3. 使用 PM2 管理 CMAMSys
cd ../..
pm2 start npm --name "cmamsys" -- run start
```

---

## 服务监控

### Redis 监控

```bash
# 实时监控
redis-cli monitor

# 查看统计信息
redis-cli info stats

# 查看慢查询
redis-cli slowlog get 10
```

### Sentry 监控

```bash
# 查看日志
cd docker/sentry
docker compose logs -f

# 查看资源使用
docker stats
```

---

## 停止服务

### 停止 Redis

```bash
# 使用管理脚本
./scripts/manage-redis.sh stop

# 或使用 redis-cli
redis-cli shutdown
```

### 停止 Sentry

```bash
cd docker/sentry
docker compose down
```

### 停止所有服务

```bash
# 停止 Redis
./scripts/manage-redis.sh stop

# 停止 Sentry
cd docker/sentry
docker compose down

# 停止 CMAMSys
# Ctrl+C 或 kill 进程
```

---

## 备份和恢复

### Redis 备份

```bash
# 备份 RDB 文件
cp /var/lib/redis/dump.rdb /backup/redis_$(date +%Y%m%d).rdb

# 备份 AOF 文件
cp /var/lib/redis/appendonly.aof /backup/redis_aof_$(date +%Y%m%d).aof
```

### Sentry 备份

```bash
# 备份 PostgreSQL 数据库
cd docker/sentry
docker compose exec postgres pg_dump -U sentry sentry > backup_$(date +%Y%m%d).sql

# 备份文件存储
tar -czf sentry-files-backup_$(date +%Y%m%d).tar.gz \
  /var/lib/docker/volumes/docker_sentry-sentry-data
```

### 恢复

```bash
# 恢复 Redis
cp /backup/redis_20240101.rdb /var/lib/redis/dump.rdb
./scripts/manage-redis.sh restart

# 恢复 Sentry
cd docker/sentry
docker compose exec -T postgres psql -U sentry sentry < backup_20240101.sql
```

---

## 故障排查

### 所有服务无法启动

**症状：** 所有服务启动失败

**解决方案：**
```bash
# 1. 检查磁盘空间
df -h

# 2. 检查内存
free -h

# 3. 检查端口占用
lsof -i :6379
lsof -i :9000

# 4. 清理 Docker 资源
docker system prune -a
```

### 连接超时

**症状：** 应用无法连接到服务

**解决方案：**
```bash
# 1. 检查服务是否运行
./scripts/manage-redis.sh status
cd docker/sentry && docker compose ps

# 2. 检查防火墙
sudo ufw status

# 3. 检查网络连接
ping localhost
telnet localhost 6379
telnet localhost 9000
```

---

## 最佳实践

1. **使用服务管理工具**
   - Redis: systemd 或 supervisord
   - Sentry: Docker Compose

2. **定期备份**
   - 每日备份数据库
   - 每周备份文件存储

3. **监控资源使用**
   - 内存、CPU、磁盘
   - 设置告警阈值

4. **日志管理**
   - 定期清理旧日志
   - 使用日志轮转

5. **安全加固**
   - 更改默认密码
   - 启用防火墙
   - 使用 SSL/TLS

---

## 总结

通过本指南，你应该能够：

✅ 启动和管理 Redis 服务
✅ 部署和配置 Sentry
✅ 监控服务状态
✅ 备份和恢复数据
✅ 解决常见问题

如有问题，请查看各服务的官方文档或故障排查部分。
