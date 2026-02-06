#!/bin/bash

# CMAMSys Docker PostgreSQL 快速部署脚本
# 用于在你的本地环境或服务器上快速启动 PostgreSQL 数据库

set -e

echo "=========================================="
echo "CMAMSys Docker PostgreSQL 部署脚本"
echo "=========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 检查 docker-compose.yml 是否存在
if [ ! -f "docker/docker-compose.yml" ]; then
    echo "❌ 错误: 未找到 docker/docker-compose.yml 文件"
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请检查配置"
    echo ""
fi

# 进入 docker 目录
cd docker

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p data/postgres
mkdir -p data/redis
echo "✅ 目录创建完成"
echo ""

# 启动 PostgreSQL
echo "🚀 启动 PostgreSQL 数据库..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres
else
    docker compose up -d postgres
fi

echo "✅ PostgreSQL 启动成功"
echo ""

# 等待数据库就绪
echo "⏳ 等待数据库就绪..."
for i in {1..30}; do
    if docker exec cmamsys-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ 数据库已就绪"
        break
    fi
    echo "   等待中... ($i/30)"
    sleep 2
done

# 检查容器状态
echo ""
echo "📊 容器状态:"
docker ps | grep cmamsys-postgres || echo "⚠️  容器未运行"

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📋 数据库连接信息:"
echo "   主机: localhost"
echo "   端口: 5432"
echo "   数据库: cmamsys"
echo "   用户名: postgres"
echo "   密码: postgres (默认，请在 .env 中修改)"
echo ""
echo "📋 连接字符串:"
echo "   postgresql://postgres:postgres@localhost:5432/cmamsys"
echo ""
echo "🔧 下一步操作:"
echo "   1. 编辑 .env 文件配置 DATABASE_URL"
echo "   2. 运行数据库迁移: pnpm prisma migrate dev"
echo "   3. 启动应用: pnpm run dev"
echo ""
echo "🛑 停止数据库: docker-compose -f docker/docker-compose.yml down"
echo "=========================================="
