#!/bin/bash
# 手动部署脚本 - 替代 GitHub Actions CD
# 用法: ./scripts/manual-deploy.sh [环境: production|staging]

set -Eeuo pipefail

# 配置
ENVIRONMENT="${1:-production}"
COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== CMAMSys 手动部署脚本 ===${NC}"
echo "环境: ${ENVIRONMENT}"
echo "备份目录: ${BACKUP_DIR}"
echo ""

# 检查 Docker 是否运行
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}错误: Docker 未运行${NC}"
    exit 1
fi

# 创建备份目录
mkdir -p "${BACKUP_DIR}"

# 备份数据库（如果运行中）
if docker ps | grep -q cmamsys-db; then
    echo -e "${YELLOW}备份数据库...${NC}"
    docker exec cmamsys-db pg_dump -U postgres cmamsys > "${BACKUP_DIR}/db_backup.sql"
    echo -e "${GREEN}数据库备份完成${NC}"
fi

# 拉取最新镜像
echo -e "${YELLOW}拉取最新镜像...${NC}"
if [ -f "${COMPOSE_FILE}" ]; then
    docker compose -f "${COMPOSE_FILE}" pull
else
    echo -e "${RED}错误: 未找到 ${COMPOSE_FILE}${NC}"
    exit 1
fi

# 构建镜像（如果需要）
echo -e "${YELLOW}构建镜像...${NC}"
docker compose -f "${COMPOSE_FILE}" build --no-cache

# 停止旧容器
echo -e "${YELLOW}停止旧容器...${NC}"
docker compose -f "${COMPOSE_FILE}" down

# 启动新容器
echo -e "${YELLOW}启动新容器...${NC}"
docker compose -f "${COMPOSE_FILE}" up -d

# 等待服务启动
echo -e "${YELLOW}等待服务启动...${NC}"
sleep 10

# 运行数据库迁移
echo -e "${YELLOW}运行数据库迁移...${NC}"
docker compose -f "${COMPOSE_FILE}" exec -T app npx prisma migrate deploy

# 清理旧镜像
echo -e "${YELLOW}清理旧镜像...${NC}"
docker image prune -f

# 检查服务状态
echo ""
echo -e "${GREEN}=== 部署完成 ===${NC}"
docker compose -f "${COMPOSE_FILE}" ps

echo ""
echo -e "${GREEN}备份位置: ${BACKUP_DIR}${NC}"
echo -e "${GREEN}部署时间: $(date)${NC}"
echo ""
echo -e "${YELLOW}查看日志: docker compose -f ${COMPOSE_FILE} logs -f${NC}"
