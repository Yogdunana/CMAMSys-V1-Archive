# Sentry 自托管完整指南

## 目录

1. [概述](#概述)
2. [系统要求](#系统要求)
3. [快速开始](#快速开始)
4. [详细配置](#详细配置)
5. [创建项目和获取 DSN](#创建项目和获取-dsn)
6. [配置 CMAMSys 使用自托管 Sentry](#配置-cmamsys-使用自托管-sentry)
7. [生产环境部署](#生产环境部署)
8. [维护和优化](#维护和优化)
9. [故障排查](#故障排查)

---

## 概述

本指南将帮助你部署一个完全自托管的 Sentry 实例，用于监控 CMAMSys 应用的错误和性能。

### 优势

- **数据隐私**：所有错误和性能数据存储在你的服务器上
- **成本控制**：无需支付 Sentry Cloud 的订阅费用
- **完全控制**：可以自定义和扩展功能
- **离线支持**：在内网环境中也能使用

### 架构

```
┌─────────────┐      ┌─────────────┐
│  CMAMSys    │─────►│  Sentry Web │
│  (Next.js)  │      │  (Port 9000)│
└─────────────┘      └──────┬──────┘
                            │
                    ┌───────┴───────┐
                    │   PostgreSQL  │
                    │   (Database)  │
                    └───────────────┘
                            │
                    ┌───────┴───────┐
                    │     Redis     │
                    │   (Cache)     │
                    └───────────────┘
```

---

## 系统要求

### 硬件要求

- **CPU**: 2 核心（推荐 4 核心）
- **内存**: 4GB（推荐 8GB）
- **存储**: 20GB（推荐 50GB+）
- **网络**: 稳定的网络连接

### 软件要求

- **Docker**: 20.10 或更高版本
- **Docker Compose**: 2.0 或更高版本
- **域名**: 可选，但推荐用于生产环境

### 端口要求

- `9000`: Sentry Web 界面
- `5432`: PostgreSQL 数据库
- `6379`: Redis 缓存

---

## 快速开始

### 1. 生成安全的密钥

```bash
# 生成 Sentry Secret Key
openssl rand -base64 64

# 输出示例:
# YyQ4ZmFhZjktZjZmNy00ZmQ2LTk4ZjAtYWZlZmZlZmZlZmY4ZGVkYzYxZjAtMzJhMi00Mjk4LTliYTAtZmZmZmZmZmZmZmY=

# 生成数据库密码
openssl rand -base64 32
```

### 2. 创建 Sentry 目录

```bash
mkdir -p docker/sentry
cd docker/sentry
```

### 3. 更新环境变量

编辑 `docker/sentry/.env` 文件，替换生成的密钥：

```bash
# 使用上面生成的密钥更新
SENTRY_SECRET_KEY="你的生成密钥"
SENTRY_DB_PASSWORD="你的数据库密码"
```

### 4. 启动 Sentry 服务

```bash
# 进入 Sentry 目录
cd docker/sentry

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 5. 初始化数据库

```bash
# 创建数据库迁移
docker-compose run --rm web sentry db upgrade

# 创建管理员账户
docker-compose run --rm web sentry createuser \
  --email admin@cmamsys.local \
  --password 你的管理员密码 \
  --superuser
```

### 6. 访问 Sentry

打开浏览器访问: `http://localhost:9000`

使用上面创建的管理员账户登录。

---

## 详细配置

### Docker Compose 配置说明

`docker-compose.yml` 包含以下服务：

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| web | sentry:24.12.1 | 9000 | Sentry Web 应用 |
| cron | sentry:24.12.1 | - | 定时任务调度 |
| worker | sentry:24.12.1 | - | 后台任务处理 |
| postgres | postgres:16-alpine | 5432 | 数据库 |
| redis | redis:7-alpine | 6379 | 缓存和队列 |
| smtp | tianon/exim4 | - | 邮件服务 |

### Sentry 配置文件 (sentry.conf.py)

主要配置项：

```python
# 数据库配置
SENTRY_DB_NAME = 'sentry'
SENTRY_DB_USER = 'sentry'
SENTRY_DB_PASSWORD = 'your-password'
SENTRY_DB_HOST = 'postgres'

# Redis 配置
SENTRY_REDIS_HOST = 'redis'
SENTRY_REDIS_PORT = 6379

# 事件保留天数
SENTRY_OPTIONS['system.event-retention-days'] = 90

# 单个事件最大大小（1MB）
SENTRY_OPTIONS['system.max-event-size'] = 1000000
```

### 持久化存储

Sentry 使用 Docker 卷来持久化数据：

```yaml
volumes:
  sentry-postgres:  # PostgreSQL 数据
  sentry-data:      # 文件上传（如堆栈跟踪）
```

数据存储位置：
- `sentry-postgres`: `/var/lib/docker/volumes/docker_sentry-postgres/_data`
- `sentry-data`: `/var/lib/docker/volumes/docker_sentry-sentry-data/_data`

### 备份策略

```bash
# 备份 PostgreSQL 数据库
docker-compose exec postgres pg_dump -U sentry sentry > backup_$(date +%Y%m%d).sql

# 备份文件存储
tar -czf sentry-files-backup_$(date +%Y%m%d).tar.gz /var/lib/docker/volumes/docker_sentry-sentry-data

# 恢复数据库
docker-compose exec -T postgres psql -U sentry sentry < backup_20240101.sql
```

---

## 创建项目和获取 DSN

### 1. 登录 Sentry

访问 `http://localhost:9000` 并使用管理员账户登录。

### 2. 创建组织

1. 点击右上角头像 → "Settings"
2. 在左侧导航点击 "Organizations"
3. 点击 "Create Organization"
4. 输入组织名称（例如：CMAMSys）
5. 选择 "Team"
6. 点击 "Continue"

### 3. 创建项目

1. 在组织页面点击 "Create Project"
2. 选择平台：**Next.js**
3. 输入项目名称（例如：cmamsys-web）
4. 选择团队
5. 点击 "Create Project"

### 4. 获取 DSN

创建项目后，你会看到类似以下 DSN：

```
http://abcdefghijklmnopqrstuvwxyz123456@localhost:9000/123456
```

DSN 格式说明：
- `protocol`: http（本地）或 https（生产）
- `public-key`: 公钥（abc...456）
- `host`: Sentry 主机（localhost:9000）
- `project-id`: 项目 ID（123456）

### 5. 测试 DSN

```bash
# 测试 Sentry 连接
curl http://localhost:9000/api/123456/store/ \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'X-Sentry-Auth: Sentry sentry_version=7, sentry_key=abcdefghijklmnopqrstuvwxyz123456' \
  -d '{"message":"Test message from CMAMSys"}'
```

---

## 配置 CMAMSys 使用自托管 Sentry

### 1. 更新项目环境变量

编辑项目根目录的 `.env` 文件：

```bash
# Sentry Configuration
SENTRY_DSN="http://abcdefghijklmnopqrstuvwxyz123456@localhost:9000/123456"
SENTRY_AUTH_TOKEN="你的认证令牌"
SENTRY_ENVIRONMENT="development"
NEXT_PUBLIC_SENTRY_DSN="http://abcdefghijklmnopqrstuvwxyz123456@localhost:9000/123456"

# Sentry Project Settings
SENTRY_ORGANIZATION="cmamsys"
SENTRY_PROJECT="cmamsys-web"
SENTRY_RELEASE="v1.0.0"
```

### 2. 生成 Sentry Auth Token

1. 在 Sentry 中进入 "Settings" → "Auth Tokens"
2. 点击 "Create New Token"
3. 选择权限：`project:read`, `project:write`, `org:read`
4. 复制生成的 Token

### 3. 更新 Sentry 配置文件

更新 `sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',

  // Release tracking
  release: process.env.SENTRY_RELEASE || 'v1.0.0',

  // Organization and project for source maps upload
  org: process.env.SENTRY_ORGANIZATION,
  project: process.env.SENTRY_PROJECT,

  tracesSampleRate: 1.0,

  beforeSend(event, hint) {
    // ... 保持现有配置
  },
});
```

### 4. 重启应用

```bash
# 停止开发服务器（如果在运行）
# Ctrl+C

# 重新启动
pnpm run dev
```

### 5. 验证配置

在应用中触发一个错误，检查 Sentry 是否捕获：

```typescript
// 在某个页面中添加测试代码
if (process.env.NODE_ENV === 'development') {
  console.log('Testing Sentry...');
  throw new Error('Sentry test error from CMAMSys');
}
```

---

## 生产环境部署

### 1. 使用域名和 HTTPS

#### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name sentry.yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sentry.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Sentry Web
    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 更新 Sentry 配置

```bash
# docker/sentry/.env
SENTRY_URL_PREFIX="https://sentry.yourdomain.com"
SENTRY_OPTIONS['system.url-prefix'] = "https://sentry.yourdomain.com"
```

### 2. 性能优化

#### 调整 Worker 数量

```yaml
# docker-compose.yml
services:
  web:
    command:
      - "run"
      - "web"
    environment:
      - SENTRY_WORKER_COUNT=4  # 根据 CPU 核心数调整

  worker:
    deploy:
      replicas: 2  # 增加副本数
```

#### 优化数据库

```sql
-- 连接到 Sentry PostgreSQL
docker-compose exec postgres psql -U sentry sentry

-- 创建索引
CREATE INDEX CONCURRENTLY idx_sentry_groupedmessage_project_id
ON sentry_groupedmessage(project_id);

-- 清理旧数据
DELETE FROM sentry_event
WHERE datetime < NOW() - INTERVAL '90 days';
```

### 3. 资源限制

```yaml
# docker-compose.yml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### 4. 监控和告警

#### Prometheus 集成（可选）

```yaml
# 添加到 docker-compose.yml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 维护和优化

### 定期维护任务

#### 1. 数据库清理

```bash
# 清理旧事件（90天前）
docker-compose exec web sentry cleanup --days 90

# 优化数据库
docker-compose exec postgres psql -U sentry sentry -c "VACUUM FULL;"
```

#### 2. 更新 Sentry

```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose down
docker-compose up -d

# 运行数据库迁移
docker-compose run --rm web sentry db upgrade
```

#### 3. 检查磁盘使用

```bash
# 检查 PostgreSQL 大小
docker-compose exec postgres psql -U sentry sentry \
  -c "SELECT pg_size_pretty(pg_database_size('sentry'));"

# 检查文件存储大小
du -sh /var/lib/docker/volumes/docker_sentry-sentry-data
```

### 性能调优

#### 1. Redis 配置优化

```python
# sentry.conf.py
SENTRY_CACHE_OPTIONS = {
    'hosts': {
        0: {
            'host': SENTRY_REDIS_HOST,
            'port': int(SENTRY_REDIS_PORT),
            'max_connections': 50,
            'socket_timeout': 5,
        }
    }
}
```

#### 2. 连接池优化

```python
# sentry.conf.py
SENTRY_POSTGRES_MAX_CONNS = 100
SENTRY_POSTGRES_OPTIONS = {
    'connect_timeout': 10,
    'options': '-c statement_timeout=30000',
}
```

#### 3. 缓存策略

```python
# sentry.conf.py
SENTY_BUFFER = 'sentry.buffer.redis.RedisBuffer'
SENTRY_BUFFER_OPTIONS = {
    'hosts': {
        0: {
            'host': SENTRY_REDIS_HOST,
            'port': int(SENTRY_REDIS_PORT),
        }
    },
    'flush_every': 100,  # 每100条事件刷新一次
}
```

---

## 故障排查

### 常见问题

#### 1. 无法访问 Sentry Web

**症状**: `http://localhost:9000` 无法打开

**解决方案**:
```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs web

# 检查端口占用
netstat -tuln | grep 9000
```

#### 2. 数据库连接失败

**症状**: 日志显示 "could not connect to server"

**解决方案**:
```bash
# 检查 PostgreSQL 是否运行
docker-compose ps postgres

# 进入数据库容器
docker-compose exec postgres psql -U sentry sentry

# 测试连接
docker-compose exec web python -c "import psycopg2; print('OK')"
```

#### 3. 事件未被捕获

**症状**: 应用报错但 Sentry 未显示

**解决方案**:
```bash
# 检查 DSN 配置
echo $SENTRY_DSN

# 测试 Sentry API
curl http://localhost:9000/api/123456/store/ \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'X-Sentry-Auth: Sentry sentry_version=7, sentry_key=your-key' \
  -d '{"message":"Test"}'

# 查看日志
docker-compose logs worker
```

#### 4. 性能问题

**症状**: 页面加载慢，事件延迟高

**解决方案**:
```bash
# 检查资源使用
docker stats

# 检查数据库查询
docker-compose exec postgres psql -U sentry sentry \
  -c "SELECT * FROM pg_stat_activity WHERE datname = 'sentry';"

# 增加工作线程
docker-compose up -d --scale worker=3
```

### 日志分析

```bash
# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web
docker-compose logs -f worker

# 查看错误日志
docker-compose logs --tail=100 | grep ERROR

# 保存日志
docker-compose logs > sentry-$(date +%Y%m%d).log
```

### 健康检查

```bash
# 检查服务健康状态
docker-compose ps

# 测试 API 端点
curl http://localhost:9000/api/0/

# 测试数据库连接
docker-compose exec postgres pg_isready

# 测试 Redis 连接
docker-compose exec redis redis-cli ping
```

---

## 附录

### A. 环境变量完整列表

```bash
# 核心配置
SENTRY_SECRET_KEY="your-secret-key"
SENTRY_URL_PREFIX="http://localhost:9000"
SENTRY_SERVER_EMAIL="sentry@cmamsys.local"

# 数据库
SENTRY_DB_HOST="postgres"
SENTRY_DB_PORT="5432"
SENTRY_DB_NAME="sentry"
SENTRY_DB_USER="sentry"
SENTRY_DB_PASSWORD="your-password"

# Redis
SENTRY_REDIS_HOST="redis"
SENTRY_REDIS_PORT="6379"

# 性能
SENTRY_POSTGRES_MAX_CONNS=100
SENTRY_OPTIONS['system.event-retention-days']=90
SENTRY_OPTIONS['system.max-event-size']=1000000

# 日志
SENTRY_LOG_LEVEL="INFO"
```

### B. 有用的命令

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 执行命令
docker-compose exec web sentry --help

# 备份数据
docker-compose exec postgres pg_dump -U sentry sentry > backup.sql

# 恢复数据
docker-compose exec -T postgres psql -U sentry sentry < backup.sql
```

### C. 资源链接

- [Sentry 官方文档](https://docs.sentry.io/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Redis 文档](https://redis.io/documentation)

---

## 总结

通过本指南，你应该能够：

✅ 在本地或生产环境部署自托管 Sentry
✅ 创建项目和获取 DSN
✅ 配置 CMAMSys 使用自托管 Sentry
✅ 实施性能优化和监控
✅ 处理常见问题和故障排查

如果你在部署过程中遇到问题，请查看故障排查部分或参考官方文档。
