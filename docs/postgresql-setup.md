# PostgreSQL 部署指南

本文档介绍如何在 CMAMSys 中部署 PostgreSQL 数据库。

## 系统要求

- PostgreSQL 14+ 推荐
- Node.js 18+
- 内存：至少 2GB（推荐 4GB+）
- 磁盘空间：至少 10GB

## 安装 PostgreSQL

### Ubuntu/Debian

```bash
# 更新包列表
sudo apt update

# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib

# 启动 PostgreSQL 服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### CentOS/RHEL

```bash
# 安装 PostgreSQL 仓库
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# 安装 PostgreSQL
sudo yum install -y postgresql14-server postgresql14

# 初始化数据库
sudo /usr/pgsql-14/bin/postgresql-14-setup initdb

# 启动 PostgreSQL 服务
sudo systemctl start postgresql-14
sudo systemctl enable postgresql-14
```

### macOS

```bash
# 使用 Homebrew 安装
brew install postgresql@14

# 启动 PostgreSQL 服务
brew services start postgresql@14
```

### Docker 部署（推荐）

```bash
# 拉取 PostgreSQL 镜像
docker pull postgres:14

# 运行 PostgreSQL 容器
docker run --name cmamsys-postgres \
  -e POSTGRES_USER=cmamsys \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=cmamsys \
  -p 5432:5432 \
  -v cmamsys-postgres-data:/var/lib/postgresql/data \
  -d postgres:14
```

## 创建数据库用户

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 PostgreSQL 命令行中执行：
CREATE USER cmamsys WITH PASSWORD 'your_secure_password';
CREATE DATABASE cmamsys OWNER cmamsys;
GRANT ALL PRIVILEGES ON DATABASE cmamsys TO cmamsys;
\q
```

## 配置环境变量

编辑项目根目录下的 `.env` 文件：

```env
# Database Configuration
DATABASE_URL="postgresql://cmamsys:your_secure_password@localhost:5432/cmamsys?schema=public"

# PostgreSQL Configuration
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_USER="cmamsys"
POSTGRES_PASSWORD="your_secure_password"
POSTGRES_DB="cmamsys"
```

## 数据库迁移

```bash
# 安装依赖
pnpm install

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# （可选）填充种子数据
npx prisma db seed
```

## 生产环境配置

### 配置 PostgreSQL（postgresql.conf）

编辑 PostgreSQL 配置文件（通常位于 `/etc/postgresql/14/main/postgresql.conf`）：

```ini
# 连接设置
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 1310kB
min_wal_size = 1GB
max_wal_size = 4GB

# 性能优化
shared_preload_libraries = 'pg_stat_statements'
```

### 配置认证（pg_hba.conf）

编辑 PostgreSQL 认证配置文件（通常位于 `/etc/postgresql/14/main/pg_hba.conf`）：

```ini
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# 本地连接
local   all             cmamsys                                 md5

# IPv4 本地连接
host    all             cmamsys         127.0.0.1/32            md5

# IPv4 远程连接（根据需要修改 IP）
host    all             cmamsys         0.0.0.0/0               md5

# IPv6 本地连接
host    all             cmamsys         ::1/128                 md5
```

重启 PostgreSQL 服务：

```bash
sudo systemctl restart postgresql
```

## 数据库备份与恢复

### 备份

```bash
# 备份数据库
pg_dump -U cmamsys -h localhost cmamsys > backup_$(date +%Y%m%d).sql

# 或使用 pg_dump 的压缩格式
pg_dump -U cmamsys -h localhost -F c cmamsys > backup_$(date +%Y%m%d).dump
```

### 恢复

```bash
# 恢复数据库
psql -U cmamsys -h localhost cmamsys < backup_20240101.sql

# 或恢复压缩格式
pg_restore -U cmamsys -h localhost -d cmamsys backup_20240101.dump
```

## 云端 PostgreSQL 服务

### AWS RDS

1. 登录 AWS 管理控制台
2. 进入 RDS 服务
3. 创建 PostgreSQL 实例
4. 获取连接字符串
5. 更新 `.env` 文件：

```env
DATABASE_URL="postgresql://username:password@rds-instance.xxxx.region.rds.amazonaws.com:5432/cmamsys?schema=public"
```

### Google Cloud SQL

1. 登录 Google Cloud 控制台
2. 进入 Cloud SQL 服务
3. 创建 PostgreSQL 实例
4. 获取连接字符串
5. 更新 `.env` 文件

### 阿里云 RDS

1. 登录阿里云控制台
2. 进入 RDS 管理控制台
3. 创建 PostgreSQL 实例
4. 获取连接字符串
5. 更新 `.env` 文件

## 性能优化建议

1. **索引优化**：确保所有外键和常用查询字段都有适当的索引
2. **连接池**：使用连接池（如 PgBouncer）管理数据库连接
3. **定期清理**：定期运行 `VACUUM` 和 `ANALYZE` 命令
4. **监控**：使用监控工具（如 pgAdmin、DataDog）监控数据库性能
5. **备份策略**：设置自动备份策略，至少保留 7 天的备份

## 故障排查

### 连接失败

```bash
# 检查 PostgreSQL 服务状态
sudo systemctl status postgresql

# 检查 PostgreSQL 日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 权限问题

```bash
# 检查用户权限
sudo -u postgres psql -c "\du"

# 重新授权
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cmamsys TO cmamsys;"
```

### 性能问题

```bash
# 查看慢查询
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# 查看表大小
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 安全建议

1. **强密码**：使用强密码管理 PostgreSQL 用户
2. **限制访问**：使用防火墙限制数据库访问
3. **SSL/TLS**：启用 SSL/TLS 加密连接
4. **定期更新**：定期更新 PostgreSQL 到最新版本
5. **备份加密**：对数据库备份进行加密存储

## 更多资源

- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Prisma PostgreSQL 文档](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [pgAdmin](https://www.pgadmin.org/)
- [Prisma Studio](https://www.prisma.io/studio)
