#!/bin/bash

# CMAMSys System Installation Script
# 一键安装并初始化 CMAMSys 系统

set -e

echo "=========================================="
echo "  CMAMSys 系统安装向导"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: Node.js 未安装${NC}"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本: $(node -v)${NC}"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm 未安装，正在安装...${NC}"
    npm install -g pnpm
fi

echo -e "${GREEN}✅ pnpm 版本: $(pnpm -v)${NC}"
echo ""

# 步骤 1: 安装依赖
echo "=========================================="
echo "步骤 1/6: 安装项目依赖"
echo "=========================================="
pnpm install
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# 步骤 2: 配置环境变量
echo "=========================================="
echo "步骤 2/6: 配置环境变量"
echo "=========================================="

if [ ! -f ".env" ]; then
    echo "创建 .env 文件..."

    # 生成随机密钥
    JWT_SECRET=$(openssl rand -hex 32)
    REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
    CSRF_SECRET=$(openssl rand -hex 32)

    cat > .env << EOF
# Database Configuration
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="${JWT_SECRET}"
JWT_ACCESS_TOKEN_EXPIRY="15m"
JWT_REFRESH_TOKEN_EXPIRY="7d"
REFRESH_TOKEN_SECRET="${REFRESH_TOKEN_SECRET}"

# Security
BCRYPT_ROUNDS="12"
MAX_LOGIN_ATTEMPTS="5"
LOCKOUT_DURATION_MS="900000"
CSRF_SECRET="${CSRF_SECRET}"

# Application
APP_NAME="CMAMSys"
APP_URL="http://localhost:5000"
APP_PORT="5000"
NODE_ENV="production"

# MFA
MFA_ENABLED="false"

# Logging
LOG_LEVEL="info"
LOG_FILE="/app/work/logs/bypass/app.log"
EOF

    echo -e "${GREEN}✅ 环境变量配置完成${NC}"
else
    echo -e "${YELLOW}⚠️  .env 文件已存在，跳过${NC}"
fi
echo ""

# 步骤 3: 初始化数据库
echo "=========================================="
echo "步骤 3/6: 初始化数据库"
echo "=========================================="
pnpm prisma migrate deploy
pnpm prisma generate
echo -e "${GREEN}✅ 数据库初始化完成${NC}"
echo ""

# 步骤 4: 设置管理员账户
echo "=========================================="
echo "步骤 4/6: 设置管理员账户"
echo "=========================================="

echo "请输入管理员信息:"
read -p "管理员邮箱: " ADMIN_EMAIL
read -p "管理员用户名: " ADMIN_USERNAME
read -sp "管理员密码 (至少8位，包含大小写字母、数字和特殊字符): " ADMIN_PASSWORD
echo ""

# 验证密码强度
if [[ ${#ADMIN_PASSWORD} -lt 8 ]]; then
    echo -e "${RED}❌ 密码长度至少8位${NC}"
    exit 1
fi

# 创建管理员账户
node << EOF
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('管理员账户已存在，跳过创建');
      return;
    }

    // 哈希密码
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

    // 创建管理员
    const admin = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL,
        username: process.env.ADMIN_USERNAME,
        passwordHash,
        role: 'ADMIN',
        authProvider: 'LOCAL',
        isVerified: true,
      }
    });

    console.log('管理员账户创建成功!');
    console.log('邮箱:', admin.email);
    console.log('用户名:', admin.username);
    console.log('ID:', admin.id);
  } catch (error) {
    console.error('创建管理员失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

createAdmin();
EOF

echo -e "${GREEN}✅ 管理员账户设置完成${NC}"
echo ""

# 步骤 5: 构建项目
echo "=========================================="
echo "步骤 5/6: 构建项目"
echo "=========================================="
pnpm run build
echo -e "${GREEN}✅ 项目构建完成${NC}"
echo ""

# 步骤 6: 启动服务
echo "=========================================="
echo "步骤 6/6: 启动服务"
echo "=========================================="
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  🎉 CMAMSys 安装完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "📋 管理员信息:"
echo "   邮箱: ${ADMIN_EMAIL}"
echo "   用户名: ${ADMIN_USERNAME}"
echo "   密码: ******"
echo ""
echo "🚀 启动命令:"
echo "   pnpm run start"
echo ""
echo "🌐 访问地址:"
echo "   http://localhost:5000"
echo ""
echo "📚 下一步:"
echo "   1. 使用管理员账户登录系统"
echo "   2. 在系统设置中配置数据库（如需更换）"
echo "   3. 创建其他用户账户"
echo "   4. 开始使用数学建模功能"
echo ""
echo -e "${YELLOW}⚠️  重要提示:${NC}"
echo "   - 请妥善保管管理员账户信息"
echo "   - 建议在生产环境使用 PostgreSQL"
echo "   - 修改 .env 中的密钥配置"
echo "   - 启用 HTTPS（生产环境）"
echo ""
echo "=========================================="
