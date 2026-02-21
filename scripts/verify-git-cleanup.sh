#!/bin/bash

# Git 历史敏感信息验证脚本
# 用于验证 Git 历史中是否仍有敏感信息残留

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Git History Sensitive Information Verification            ║"
echo "║  验证 Git 历史中的敏感信息                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在 Git 仓库中
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ 错误：当前目录不是 Git 仓库！${NC}"
    exit 1
fi

# 敏感信息列表
SENSITIVE_PATTERNS=(
    "***REDACTED_PASSWORD***"
    "***REDACTED_DB_PASSWORD***"
    "***REDACTED_DB_USER***"
    "***REDACTED_DB_IP***"
    "DATABASE_URL.*postgres"
)

TOTAL_ISSUES=0

echo -e "${BLUE}🔍 开始扫描 Git 历史...${NC}"
echo ""

# 检查每个敏感模式
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    echo -e "${BLUE}检查模式：${NC}$pattern"

    # 使用 git log -S 搜索
    COMMITS=$(git log --all -S "$pattern" --oneline 2>/dev/null | wc -l)

    if [ $COMMITS -gt 0 ]; then
        echo -e "${RED}❌ 发现 $COMMITS 个提交包含此模式${NC}"
        echo -e "${RED}影响的提交：${NC}"
        git log --all -S "$pattern" --oneline | head -5

        # 如果超过 5 个提交，显示更多信息
        if [ $COMMITS -gt 5 ]; then
            echo -e "${YELLOW}... 还有 $((COMMITS - 5)) 个提交${NC}"
        fi

        TOTAL_ISSUES=$((TOTAL_ISSUES + COMMITS))
    else
        echo -e "${GREEN}✅ 未发现${NC}"
    fi
    echo ""
done

# 检查 API Keys（sk- 开头）
echo -e "${BLUE}检查 API Keys (sk-)...${NC}"
API_KEY_COMMITS=$(git log --all -S "sk-" --oneline --grep="sk-" 2>/dev/null | grep -E "sk-REDACTED" | wc -l)

if [ $API_KEY_COMMITS -gt 0 ]; then
    echo -e "${RED}❌ 发现可能的 API Keys${NC}"
    echo -e "${RED}影响的提交：${NC}"
    git log --all -S "sk-" --oneline | head -5
    TOTAL_ISSUES=$((TOTAL_ISSUES + API_KEY_COMMITS))
else
    echo -e "${GREEN}✅ 未发现 API Keys${NC}"
fi
echo ""

# 检查 .env 文件历史
echo -e "${BLUE}检查 .env 文件历史...${NC}"
ENV_COMMITS=$(git log --all -- .env 2>/dev/null | grep -c "commit" || echo "0")

if [ $ENV_COMMITS -gt 0 ]; then
    echo -e "${RED}❌ 发现 $ENV_COMMITS 个提交包含 .env 文件${NC}"
    echo -e "${YELLOW}注意：.env 文件不应提交到 Git${NC}"
    TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
else
    echo -e "${GREEN}✅ 未发现 .env 文件历史${NC}"
fi
echo ""

# 检查大文件（可能包含敏感数据）
echo -e "${BLUE}检查大文件（>1MB）...${NC}"
LARGE_FILES=$(git rev-list --objects --all | \
    git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
    awk '/^blob/ {print substr($0,6)}' | \
    sort -nk2 | \
    awk '$2 > 1048576 {print $2/1024/1024 " MB", $3}')

if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  发现大文件（可能包含敏感数据）：${NC}"
    echo "$LARGE_FILES" | head -10
else
    echo -e "${GREEN}✅ 未发现大文件${NC}"
fi
echo ""

# 检查分支
echo -e "${BLUE}检查所有分支...${NC}"
BRANCHES=$(git branch -a | wc -l)
echo -e "${GREEN}✅ 共发现 $BRANCHES 个分支${NC}"
echo ""

# 检查标签
echo -e "${BLUE}检查所有标签...${NC}"
TAGS=$(git tag | wc -l)
echo -e "${GREEN}✅ 共发现 $TAGS 个标签${NC}"
echo ""

# 统计结果
echo "╔════════════════════════════════════════════════════════════╗"
if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "║  ${GREEN}✅ 验证通过：未发现敏感信息残留${NC}                        ║"
else
    echo -e "║  ${RED}❌ 验证失败：发现 $TOTAL_ISSUES 个问题${NC}                         ║"
fi
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 恭喜！Git 历史已清理干净${NC}"
    echo ""
    echo -e "${BLUE}📋 下一步：${NC}"
    echo "1. 强制推送到 GitHub："
    echo "   git push origin --force --all"
    echo "   git push origin --force --tags"
    echo ""
    echo "2. 通知所有协作者重新克隆仓库"
    exit 0
else
    echo -e "${RED}⚠️  请先清理敏感信息后再强制推送${NC}"
    echo ""
    echo -e "${BLUE}📋 建议操作：${NC}"
    echo "1. 运行清理脚本：./scripts/cleanup-git-history.sh"
    echo "2. 重新运行验证脚本"
    echo "3. 确认无误后再强制推送"
    exit 1
fi
