# Docker PostgreSQL 部署指南

## 📋 前置要求

- Docker (20.10+)
- Docker Compose (2.0+)
- Node.js 24+ 和 pnpm (用于后续应用部署)

## 🚀 快速部署

### 方式一：使用自动部署脚本（推荐）

```bash
# 赋予脚本执行权限
chmod +x scripts/deploy-postgres.sh

# 运行部署脚本
./scripts/deploy-postgres.sh
```

### 方式二：手动部署

#### 1. 准备环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件（可选，使用默认配置也可以）
nano .env
```

默认配置：
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cmamsys"
```

#### 2. 启动 PostgreSQL

```bash
cd docker

# 仅启动 PostgreSQL
docker-compose up -d postgres

# 或同时启动 PostgreSQL 和 Redis（用于缓存）
docker-compose up -d postgres redis
```

#### 3. 验证数据库状态

```bash
# 检查容器状态
docker ps | grep cmamsys-postgres

# 查看日志
docker logs -f cmamsys-postgres

# 测试数据库连接
docker exec -it cmamsys-postgres psql -U postgres -d cmamsys -c "SELECT version();"
```

## 📊 数据库管理

### 连接数据库

```bash
# 使用 Docker exec
docker exec -it cmamsys-postgres psql -U postgres -d cmamsys

# 使用 psql 客户端（如果本地安装）
psql -h localhost -p 5432 -U postgres -d cmamsys
```

### 常用 SQL 命令

```sql
-- 查看数据库列表
\l

-- 连接到 cmamsys 数据库
\c cmamsys

-- 查看表列表
\dt

-- 查看表结构
\d users

-- 退出
\q
```

### 备份和恢复

```bash
# 备份数据库
docker exec cmamsys-postgres pg_dump -U postgres cmamsys > backup.sql

# 恢复数据库
docker exec -i cmamsys-postgres psql -U postgres cmamsys < backup.sql

# 备份到文件
docker run --rm -v $(pwd)/backup:/backup \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine \
  pg_dump -h host.docker.internal -U postgres cmamsys > backup/backup-$(date +%Y%m%d).sql
```

## 🔧 运行数据库迁移

启动数据库后，运行 Prisma 迁移创建表结构：

```bash
# 返回项目根目录
cd ..

# 生成 Prisma Client
pnpm prisma generate

# 运行迁移
pnpm prisma migrate dev --name init

# 或使用生产模式迁移
pnpm prisma migrate deploy
```

## 🎯 测试数据库连接

### 使用 Prisma Studio（可视化工具）

```bash
pnpm prisma studio
```

访问 http://localhost:5555 查看和管理数据库。

### 使用 Node.js 脚本测试

创建 `test-db.js`：
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');

    // 测试查询
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('📅 数据库时间:', result[0].now);

    // 查看用户数量
    const userCount = await prisma.user.count();
    console.log('👥 当前用户数:', userCount);

  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

运行测试：
```bash
node test-db.js
```

## 🛑 停止和清理

### 停止服务

```bash
cd docker
docker-compose down
```

### 停止并删除数据卷（⚠️ 会删除所有数据）

```bash
docker-compose down -v
```

### 重启服务

```bash
docker-compose restart postgres
```

### 查看日志

```bash
# 实时查看日志
docker logs -f cmamsys-postgres

# 查看最近 100 行日志
docker logs --tail 100 cmamsys-postgres
```

## 🔐 安全建议

### 1. 修改默认密码

编辑 `docker/docker-compose.yml`：

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # 从 .env 文件读取
```

在 `.env` 文件中设置：
```env
POSTGRES_PASSWORD=your-secure-password-here
```

### 2. 配置防火墙

```bash
# 只允许本地访问
sudo ufw allow from 127.0.0.1 to any port 5432

# 或限制特定 IP
sudo ufw allow from YOUR_IP_ADDRESS to any port 5432
```

### 3. 启用 SSL 连接（生产环境推荐）

编辑 `docker/docker-compose.yml`：

```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "ssl=on"
    - "-c"
    - "ssl_cert_file=/var/lib/postgresql/server.crt"
    - "-c"
    - "ssl_key_file=/var/lib/postgresql/server.key"
  volumes:
    - ./ssl/server.crt:/var/lib/postgresql/server.crt:ro
    - ./ssl/server.key:/var/lib/postgresql/server.key:ro
```

## 📈 性能优化

### PostgreSQL 配置优化

创建 `docker/postgresql.conf`：

```ini
# 内存配置
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB

# 连接配置
max_connections = 100

# WAL 配置
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# 查询优化
random_page_cost = 1.1
effective_io_concurrency = 200

# 日志配置
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

在 `docker-compose.yml` 中引用：

```yaml
postgres:
  volumes:
    - ./postgresql.conf:/etc/postgresql/postgresql.conf:ro
  command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

## 🐛 常见问题

### 问题 1: 容器启动失败

```bash
# 查看详细日志
docker logs cmamsys-postgres

# 检查端口占用
sudo lsof -i :5432

# 停止冲突的进程
sudo systemctl stop postgresql  # 如果系统有 PostgreSQL 服务
```

### 问题 2: 数据库连接被拒绝

```bash
# 检查容器是否运行
docker ps | grep cmamsys-postgres

# 检查端口映射
docker port cmamsys-postgres

# 测试连接
telnet localhost 5432
```

### 问题 3: 权限问题

```bash
# 修复数据目录权限
sudo chown -R 999:999 data/postgres
```

## 📞 获取帮助

- 查看日志：`docker logs -f cmamsys-postgres`
- 查看容器状态：`docker ps -a`
- 进入容器：`docker exec -it cmamsys-postgres bash`

---

**部署完成后，你可以继续运行数据库迁移并启动应用！**
