#!/bin/bash

# Git 历史敏感信息清理脚本
# 使用 BFG Repo-Cleaner 清理 Git 历史中的敏感信息

set -e  # 遇到错误立即退出

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Git History Sensitive Information Cleanup Script         ║"
echo "║  使用 BFG Repo-Cleaner 清理敏感信息                        ║"
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
    echo "请在仓库根目录下运行此脚本。"
    exit 1
fi

# 创建备份
echo -e "${BLUE}📦 步骤 1/5: 创建备份...${NC}"
BACKUP_DIR="../cmamsys-backup-$(date +%Y%m%d-%H%M%S)"
echo "备份目录: $BACKUP_DIR"
cp -r . "$BACKUP_DIR"
echo -e "${GREEN}✅ 备份完成：$BACKUP_DIR${NC}"
echo ""

# 下载 BFG
echo -e "${BLUE}📥 步骤 2/5: 下载 BFG Repo-Cleaner...${NC}"
BFG_VERSION="1.14.0"
BFG_JAR="bfg.jar"

if [ ! -f "$BFG_JAR" ]; then
    echo "正在下载 BFG $BFG_VERSION..."
    wget -q -O "$BFG_JAR" "https://repo1.maven.org/maven2/com/madgag/bfg/$BFG_VERSION/bfg-$BFG_VERSION.jar"
    echo -e "${GREEN}✅ BFG 下载完成${NC}"
else
    echo -e "${GREEN}✅ BFG 已存在，跳过下载${NC}"
fi
echo ""

# 创建密码列表文件
echo -e "${BLUE}📝 步骤 3/5: 创建敏感信息列表...${NC}"
PASSWORDS_FILE="sensitive-data.txt"
cat > "$PASSWORDS_FILE" << 'EOF'
***REDACTED_PASSWORD***
***REDACTED_DB_PASSWORD***
***REDACTED_DB_USER***
***REDACTED_DB_IP***
sk-
EOF

echo -e "${GREEN}✅ 敏感信息列表已创建：$PASSWORDS_FILE${NC}"
echo "包含以下敏感信息："
cat "$PASSWORDS_FILE"
echo ""

# 确认执行
echo -e "${YELLOW}⚠️  警告：此操作将重写 Git 历史！${NC}"
echo -e "${YELLOW}⚠️  所有协作者需要重新克隆仓库！${NC}"
echo ""
read -p "确认继续？(输入 YES 继续): " confirm

if [ "$confirm" != "YES" ]; then
    echo -e "${RED}❌ 操作已取消${NC}"
    exit 0
fi

# 执行 BFG 清理
echo -e "${BLUE}🔧 步骤 4/5: 使用 BFG 清理敏感信息...${NC}"
echo "这可能需要几分钟，请耐心等待..."
java -jar "$BFG_JAR" --replace-text "$PASSWORDS_FILE" . > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ BFG 清理完成${NC}"
else
    echo -e "${RED}❌ BFG 清理失败${NC}"
    exit 1
fi
echo ""

# 清理 Git 引用
echo -e "${BLUE"🧹 步骤 5/5: 清理 Git 引用...${NC}"
echo "正在清理引用..."

git reflog expire --expire=now --all > /dev/null 2>&1
git gc --prune=now --aggressive > /dev/null 2>&1

echo -e "${GREEN}✅ Git 引用清理完成${NC}"
echo ""

# 验证清理结果
echo -e "${BLUE}🔍 验证清理结果...${NC}"
FOUND_ISSUES=0

echo "检查泄露密码..."
if git log --all -S "***REDACTED_PASSWORD***" | grep -q "***REDACTED_PASSWORD***"; then
    echo -e "${RED}❌ 仍在历史中发现：***REDACTED_PASSWORD***${NC}"
    FOUND_ISSUES=$((FOUND_ISSUES + 1))
fi

if git log --all -S "***REDACTED_DB_PASSWORD***" | grep -q "***REDACTED_DB_PASSWORD***"; then
    echo -e "${RED}❌ 仍在历史中发现：***REDACTED_DB_PASSWORD***${NC}"
    FOUND_ISSUES=$((FOUND_ISSUES + 1))
fi

if git log --all -S "***REDACTED_DB_IP***" | grep -q "***REDACTED_DB_IP***"; then
    echo -e "${RED}❌ 仍在历史中发现：***REDACTED_DB_IP***${NC}"
    FOUND_ISSUES=$((FOUND_ISSUES + 1))
fi

if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ 未发现敏感信息残留${NC}"
else
    echo -e "${RED}⚠️  发现 $FOUND_ISSUES 个问题${NC}"
fi
echo ""

# 清理临时文件
rm -f "$PASSWORDS_FILE"
echo -e "${GREEN}✅ 临时文件已清理${NC}"
echo ""

# 显示下一步操作
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ Git 历史清理完成！                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}📋 下一步操作：${NC}"
echo ""
echo "1. ${GREEN}强制推送到 GitHub：${NC}"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "2. ${GREEN}通知所有协作者：${NC}"
echo "   - 删除本地仓库"
echo "   - 重新克隆仓库"
echo "   - 不要使用 git pull"
echo ""
echo "3. ${GREEN}撤销已泄露的凭据（重要！）：${NC}"
echo "   - 修改数据库密码"
echo "   - 修改管理员密码"
echo "   - 撤销所有 API Keys"
echo ""
echo "4. ${GREEN}验证 GitHub 仓库：${NC}"
echo "   - 检查 commits 历史"
echo "   - 使用代码搜索功能"
echo ""
echo -e "${BLUE}💾 备份位置：$BACKUP_DIR${NC}"
echo -e "${RED}⚠️  请在强制推送前验证清理结果！${NC}"
echo ""
