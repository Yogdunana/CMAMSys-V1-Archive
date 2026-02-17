#!/bin/bash

# 本地部署测试脚本
# 这个脚本用于测试应用是否能够正常运行

set -e

echo "=== CMAMSys 本地部署测试 ==="
echo ""

# 检查 Node.js
echo "1. 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi
echo "✅ Node.js 版本: $(node --version)"

# 检查 pnpm
echo "2. 检查 pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装"
    exit 1
fi
echo "✅ pnpm 版本: $(pnpm --version)"

# 设置环境变量
echo "3. 设置环境变量..."
export NODE_ENV=production
export DATABASE_URL=postgresql://test:test@localhost:5432/test_cmamsys
export JWT_SECRET=test-jwt-secret-for-ci-build-only-32-char
export REFRESH_TOKEN_SECRET=test-refresh-token-secret-for-ci-build-32
export ENCRYPTION_KEY=test-encryption-key-for-ci-build-only-32-chars
export CSRF_SECRET=test-csrf-secret-for-ci-build-only-32-chars
export SESSION_SECRET=test-session-secret-for-ci-build-only-32-chars
export LOG_FILE_PATH=/tmp/app.log
echo "✅ 环境变量已设置"

# 清理旧的构建
echo "4. 清理旧的构建..."
rm -rf .next
echo "✅ 旧的构建已清理"

# 安装依赖
echo "5. 安装依赖..."
pnpm install --prefer-frozen-lockfile
echo "✅ 依赖安装完成"

# 生成 Prisma Client
echo "6. 生成 Prisma Client..."
./node_modules/.bin/prisma generate
echo "✅ Prisma Client 生成完成"

# 构建应用
echo "7. 构建应用..."
pnpm run build
echo "✅ 应用构建完成"

echo ""
echo "=== 部署测试完成 ==="
echo "应用已成功构建，可以启动服务了！"
echo ""
echo "启动命令："
echo "  NODE_ENV=production DATABASE_URL=... pnpm start"
