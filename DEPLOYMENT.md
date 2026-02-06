# 🚀 在你的环境部署 Docker PostgreSQL

## 一键部署（推荐）

```bash
# 1. 赋予脚本执行权限
chmod +x scripts/deploy-postgres.sh

# 2. 运行部署脚本
./scripts/deploy-postgres.sh
```

脚本会自动：
- ✅ 检查 Docker 环境
- ✅ 创建必要的配置文件
- ✅ 启动 PostgreSQL 容器
- ✅ 等待数据库就绪
- ✅ 显示连接信息

## 手动部署

### 1. 准备配置

```bash
# 复制环境变量配置
cp .env.example .env

# 编辑 .env 文件（可选，使用默认配置也可以）
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cmamsys"
```

### 2. 启动 PostgreSQL

```bash
cd docker
docker-compose up -d postgres
```

### 3. 验证状态

```bash
# 检查容器状态
docker ps | grep cmamsys-postgres

# 测试数据库连接
docker exec -it cmamsys-postgres psql -U postgres -d cmamsys -c "SELECT NOW();"
```

## 📋 连接信息

| 配置项 | 值 |
|--------|-----|
| 主机 | localhost |
| 端口 | 5432 |
| 数据库 | cmamsys |
| 用户名 | postgres |
| 密码 | postgres |
| 连接字符串 | `postgresql://postgres:postgres@localhost:5432/cmamsys` |

## 🔧 下一步

部署完成后，在你的环境执行：

```bash
# 1. 安装依赖
pnpm install

# 2. 运行数据库迁移
pnpm prisma migrate dev --name init

# 3. 启动应用
pnpm run dev
```

## 🛑 停止数据库

```bash
cd docker
docker-compose down
```

## 📚 详细文档

查看完整部署文档：[docs/docker-postgres-deployment.md](docs/docker-postgres-deployment.md)

---

**准备好后，我们可以测试注册和登录功能！**
