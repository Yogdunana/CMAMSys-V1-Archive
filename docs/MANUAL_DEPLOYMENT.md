# 手动部署指南

由于 GitHub 免费私有仓库不支持 GitHub Actions 的 Docker actions，我们提供了手动部署工具。

## 快速开始

### 1. 准备环境变量

复制环境变量模板：

```bash
cp .env.docker.example .env
```

编辑 `.env` 文件，填入真实值：

```env
# 数据库配置
POSTGRES_PASSWORD=your_secure_postgres_password_here

# JWT 配置
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
REFRESH_TOKEN_SECRET=your_refresh_token_secret_minimum_32

# 加密和安全
ENCRYPTION_KEY=your_encryption_key_minimum_32_characters
CSRF_SECRET=your_csrf_secret_minimum_32_characters_long
SESSION_SECRET=your_session_secret_minimum_32_characters
```

### 2. 手动部署

使用部署脚本：

```bash
./scripts/manual-deploy.sh production
```

### 3. 查看日志

```bash
docker compose logs -f
```

## 部署脚本功能

`scripts/manual-deploy.sh` 脚本会自动执行以下操作：

1. ✅ 检查 Docker 运行状态
2. ✅ 备份数据库（如果服务正在运行）
3. ✅ 拉取最新镜像
4. ✅ 构建镜像
5. ✅ 停止旧容器
6. ✅ 启动新容器
7. ✅ 运行数据库迁移
8. ✅ 清理旧镜像

## 手动部署步骤

如果你需要完全手动控制，可以执行以下步骤：

### 1. 拉取最新代码

```bash
git pull origin main
```

### 2. 构建 Docker 镜像

```bash
docker compose build
```

### 3. 停止旧容器

```bash
docker compose down
```

### 4. 启动新容器

```bash
docker compose up -d
```

### 5. 运行数据库迁移

```bash
docker compose exec -T app npx prisma migrate deploy
```

## 数据库备份

### 手动备份数据库

```bash
docker exec cmamsys-db pg_dump -U postgres cmamsys > backup_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
cat backup_20240217.sql | docker exec -i cmamsys-db psql -U postgres cmamsys
```

## 常见问题

### 1. 端口冲突

如果 5000 端口被占用，修改 `docker-compose.yml`：

```yaml
app:
  ports:
    - "5001:5000"  # 改为其他端口
```

### 2. 数据库连接失败

检查 `.env` 文件中的 `DATABASE_URL` 配置是否正确。

### 3. 迁移失败

```bash
# 重置数据库（慎用！会删除所有数据）
docker compose exec app npx prisma migrate reset --force

# 重新运行迁移
docker compose exec -T app npx prisma migrate deploy
```

## 监控和维护

### 查看容器状态

```bash
docker compose ps
```

### 查看资源使用

```bash
docker stats
```

### 清理未使用的资源

```bash
docker system prune -a
```

## 回滚部署

如果新版本有问题，可以快速回滚：

```bash
# 1. 停止当前容器
docker compose down

# 2. 拉取上一个稳定版本
git checkout <stable-commit-hash>

# 3. 重新构建和启动
docker compose up -d
```

## 安全建议

1. **定期备份数据库**：建议每天自动备份
2. **更新依赖**：定期更新 Docker 镜像和依赖
3. **监控日志**：定期检查应用日志
4. **使用强密码**：所有环境变量使用强密码
5. **限制访问**：配置防火墙规则，只允许必要的端口访问

## 自动化部署（可选）

如果你有 VPS 服务器，可以设置 cron 定时任务自动部署：

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天凌晨 2 点部署）
0 2 * * * cd /opt/cmamsys && git pull && ./scripts/manual-deploy.sh production >> /var/log/cmamsys-deploy.log 2>&1
```

## 支持

如果遇到问题，请检查：

1. Docker 版本：`docker --version`（建议 20.10+）
2. Docker Compose 版本：`docker compose version`（建议 2.0+）
3. 系统资源：确保有足够的内存和磁盘空间
4. 日志文件：`docker compose logs --tail=100`
