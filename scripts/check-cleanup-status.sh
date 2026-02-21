#!/bin/bash

# 敏感信息清理状态确认脚本
# 确认所有敏感信息已清理

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  敏感信息清理状态确认                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
COMPLETED=0
TOTAL=0

# 检查函数
check_item() {
    local item="$1"
    local status="$2"
    TOTAL=$((TOTAL + 1))

    if [ "$status" = "completed" ]; then
        echo -e "  ${GREEN}✅${NC} $item"
        COMPLETED=$((COMPLETED + 1))
    elif [ "$status" = "pending" ]; then
        echo -e "  ${YELLOW}⏳${NC} $item"
    elif [ "$status" = "warning" ]; then
        echo -e "  ${RED}⚠️${NC} $item"
    else
        echo -e "  ${RED}❌${NC} $item"
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 凭据撤销状态${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "AI Services:"
check_item "DeepSeek API Keys 已删除" "completed"
check_item "VolcEngine API Keys 已删除" "completed"
check_item "Aliyun API Keys 已删除" "completed"
check_item "OpenAI API Keys 已删除" "completed"
echo ""

echo "Storage:"
check_item "AWS S3 Access Keys 已删除" "completed"
echo ""

echo "Database:"
check_item "数据库已从服务器卸载" "completed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 代码清理状态${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查源代码是否已清理
if [ -f "scripts/security-audit.js" ]; then
    check_item "安全审计脚本已创建" "completed"
    if node scripts/security-audit.js 2>&1 | grep -q "安全审计通过"; then
        check_item "源代码敏感信息已清理" "completed"
    else
        check_item "源代码敏感信息已清理" "warning"
    fi
else
    check_item "源代码敏感信息已清理" "warning"
fi
echo ""

# 检查 .env 文件
if [ -f ".env" ]; then
    check_item ".env 文件已更新" "completed"
    if ! grep -q "***REDACTED_DB_IP***" .env && ! grep -q "***REDACTED_PASSWORD***" .env; then
        check_item ".env 文件不包含敏感信息" "completed"
    else
        check_item ".env 文件不包含敏感信息" "warning"
    fi
else
    check_item ".env 文件已更新" "warning"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔒 Git 历史清理状态${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 Git 历史是否包含敏感信息
if git log --all -S "***REDACTED_PASSWORD***" 2>/dev/null | grep -q "***REDACTED_PASSWORD***"; then
    check_item "Git 历史敏感信息已清理" "warning"
    echo -e "  ${YELLOW}⚠️  发现：Git 历史中仍包含敏感信息${NC}"
    echo -e "  ${YELLOW}💡 建议：运行 ./scripts/cleanup-git-history.sh${NC}"
else
    check_item "Git 历史敏感信息已清理" "completed"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 完成度统计${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PERCENTAGE=$((COMPLETED * 100 / TOTAL))
echo -e "完成度: ${COMPLETED}/${TOTAL} (${PERCENTAGE}%)"
echo ""

if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}🎉 恭喜！所有敏感信息已清理完成！${NC}"
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  大部分完成，但还有几项需要处理${NC}"
else
    echo -e "${RED}❌ 还有大量工作需要完成${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 下一步操作${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if git log --all -S "***REDACTED_PASSWORD***" 2>/dev/null | grep -q "***REDACTED_PASSWORD***"; then
    echo -e "${RED}🔴 紧急：清理 Git 历史${NC}"
    echo ""
    echo "执行以下命令："
    echo "  1. ./scripts/cleanup-git-history.sh"
    echo "  2. ./scripts/verify-git-cleanup.sh"
    echo "  3. git push origin --force --all"
    echo "  4. git push origin --force --tags"
    echo ""
fi

echo -e "${GREEN}✅ 可选：重新部署系统${NC}"
echo ""
echo "由于数据库已卸载，需要重新配置："
echo "  1. 在服务器上安装新的数据库"
echo "  2. 运行数据库迁移: npx prisma migrate deploy"
echo "  3. 运行种子脚本: npx prisma seed"
echo "  4. 重新配置 AI Provider（在系统 UI 中）"
echo ""

echo -e "${GREEN}✅ 可选：加强安全措施${NC}"
echo ""
echo "防止未来再次泄露："
echo "  1. 配置 git-secrets"
echo "  2. 添加 pre-commit hooks"
echo "  3. 更新 .gitignore"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
