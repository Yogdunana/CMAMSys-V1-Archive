# Git 历史敏感信息清理指南

## ⚠️ 紧急安全警告

你的 Git 历史中包含了以下敏感信息，必须立即清理：

### 已泄露的信息
1. **管理员密码**: `***REDACTED_PASSWORD***`
2. **生产数据库**: `***REDACTED_DB_IP***:5632`
3. **数据库用户**: `***REDACTED_DB_USER***`
4. **数据库密码**: `***REDACTED_DB_PASSWORD***`
5. **可能的 API Keys**: DeepSeek、VolcEngine、Aliyun 等

### 风险评估
- 🔴 **高危**: 任何人都可能通过 GitHub 历史找到这些凭据
- 🔴 **高危**: 攻击者可能已经访问了数据库
- 🔴 **高危**: API Keys 可能已被滥用

## 🚀 立即采取的行动（按优先级）

### 第一步：撤销/轮换已泄露的凭据 ⚡【最高优先级】

在清理 Git 历史之前，**必须先撤销所有已泄露的凭据**：

1. **立即修改数据库密码**：
   ```sql
   -- 连接到生产数据库
   ALTER USER "***REDACTED_DB_USER***" WITH PASSWORD 'new_secure_password_here';
   ```

2. **立即修改管理员密码**：
   ```sql
   -- 连接到数据库
   UPDATE "User" SET password = '$2b$12$...' WHERE email = 'admin@example.com';
   ```
   （新密码需要先使用 bcrypt 加密）

3. **立即撤销所有 API Keys**：
   - 登录 DeepSeek 控制台，撤销旧 API Key，生成新的
   - 登录火山引擎控制台，撤销旧 API Key，生成新的
   - 登录阿里云控制台，撤销旧 API Key，生成新的

4. **更改数据库服务器安全设置**：
   - 限制数据库访问 IP（白名单）
   - 启用 SSL/TLS 连接
   - 更改数据库端口（如果可能）

### 第二步：清理 Git 历史 📝

#### 方案 A：使用 BFG Repo-Cleaner（推荐）

**优点**：
- 比原生 git-filter-branch 快 10-1000 倍
- 更简单易用
- 适合大型仓库

**步骤**：

1. **备份仓库**（非常重要！）：
   ```bash
   cd /path/to/workspace
   cp -r cmamsys cmamsys.backup
   ```

2. **下载 BFG**：
   ```bash
   # macOS/Linux
   brew install bfg

   # 或手动下载
   wget -O bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
   ```

3. **清理密码**：
   ```bash
   cd cmamsys

   # 创建密码列表文件
   cat > passwords.txt << EOF
   ***REDACTED_PASSWORD***
   ***REDACTED_DB_PASSWORD***
   ***REDACTED_DB_USER***
   ***REDACTED_DB_IP***
   EOF

   # 使用 BFG 清理
   bfg --replace-text passwords.txt
   ```

4. **清理大文件**（如果有）：
   ```bash
   bfg --strip-blobs-bigger-than 100M
   ```

5. **执行 Git 清理**：
   ```bash
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

6. **强制推送到 GitHub**：
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

#### 方案 B：使用 git-filter-repo（现代方案）

**优点**：
- 官方推荐的工具
- 更安全、更可靠
- 支持复杂的重写操作

**步骤**：

1. **安装 git-filter-repo**：
   ```bash
   pip install git-filter-repo
   ```

2. **创建替换规则文件**：
   ```bash
   cat > expressions.txt << EOF
   ***REDACTED_PASSWORD***==>[REDACTED_PASSWORD]
   ***REDACTED_DB_PASSWORD***==>[REDACTED_DB_PASSWORD]
   ***REDACTED_DB_USER***==>[REDACTED_DB_USER]
   ***REDACTED_DB_IP***==>[REDACTED_DB_IP]
   sk-==>[REDACTED_API_KEY]
   EOF
   ```

3. **执行清理**：
   ```bash
   git filter-repo --replace-text expressions.txt
   ```

4. **强制推送**：
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

#### 方案 C：使用 git filter-branch（原生方案）

**优点**：
- Git 原生工具，无需安装
- 适合小规模仓库

**缺点**：
- 速度慢
- 已被官方标记为过时

**步骤**：

1. **创建清理脚本**：
   ```bash
   cat > clean-history.sh << 'EOF'
   #!/bin/bash

   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch \
        $(git ls-files | xargs grep -l '***REDACTED_PASSWORD***\|***REDACTED_DB_PASSWORD***\|***REDACTED_DB_USER***\|101\.237\.129\.5')" \
     --prune-empty --tag-name-filter cat -- --all
   EOF

   chmod +x clean-history.sh
   ```

2. **执行清理**：
   ```bash
   ./clean-history.sh
   ```

3. **清理引用**：
   ```bash
   rm -rf .git/refs/original/
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

4. **强制推送**：
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

### 第三步：通知所有协作者 📢

清理历史后，**必须通知所有协作者**：

1. **发送紧急通知**：
   ```
   ⚠️ 安全警报

   我们在 Git 历史中发现了敏感信息泄露，已经清理了仓库历史。

   请立即执行以下操作：

   1. 删除本地仓库：rm -rf cmamsys
   2. 重新克隆仓库：git clone <your-repo-url>
   3. 不要使用 git pull，直接重新克隆

   请勿执行 git fetch 或 git pull，否则会再次引入敏感信息历史！
   ```

2. **更新文档**：
   - 在 README.md 中添加安全警告
   - 在 CONTRIBUTING.md 中说明正确的提交流程

3. **配置 Git Hooks**（可选）：
   - 设置 pre-commit hook 检测敏感信息
   - 防止未来再次泄露

### 第四步：验证清理结果 ✅

1. **检查本地仓库**：
   ```bash
   # 搜索密码
   git log --all --grep="***REDACTED_PASSWORD***"
   git log --all --grep="***REDACTED_DB_PASSWORD***"
   git log --all -S "***REDACTED_PASSWORD***"

   # 应该返回空结果
   ```

2. **检查 GitHub 仓库**：
   - 访问 GitHub 仓库
   - 检查 commits 历史
   - 使用 GitHub 的代码搜索功能搜索密码

3. **检查敏感文件**：
   ```bash
   # 检查 .env 文件是否在历史中
   git log --all -- .env
   git log --all -S "DATABASE_URL"

   # 应该返回空结果
   ```

### 第五步：加强安全措施 🔒

1. **配置 git-secrets**：
   ```bash
   # macOS/Linux
   brew install git-secrets

   # 配置
   cd cmamsys
   git secrets --install
   git secrets --register-aws
   git secrets --add 'password'
   git secrets --add 'API.*key'

   # 扫描当前仓库
   git secrets --scan
   ```

2. **添加 pre-commit hook**：
   ```bash
   cat > .git/hooks/pre-commit << 'EOF'
   #!/bin/bash

   # 检查敏感信息
   if git diff --cached --name-only | xargs grep -iE "(password|api.*key|secret|token)" | grep -v ".git"; then
     echo "⚠️  警告：检测到可能的敏感信息！"
     echo "请检查您的提交，确保不包含密码、API Keys 或其他敏感信息。"
     exit 1
   fi
   EOF

   chmod +x .git/hooks/pre-commit
   ```

3. **配置 .gitignore**：
   ```bash
   # 确保 .env 文件被忽略
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   echo ".env.*.local" >> .gitignore
   echo "*.key" >> .gitignore
   echo "*.pem" >> .gitignore
   ```

4. **使用 GitHub Secret Scanning**（如果是私有仓库）：
   - 启用 GitHub 的 Secret Scanning
   - 配置自定义模式

## 📋 清理检查清单

清理完成后，确保：

- [ ] 所有已泄露的密码已更改
- [ ] 所有 API Keys 已撤销并重新生成
- [ ] Git 历史已清理
- [ ] 已强制推送到 GitHub
- [ ] 所有协作者已通知并重新克隆
- [ ] 已配置 git-secrets 或 pre-commit hooks
- [ ] .gitignore 已正确配置
- [ ] 验证扫描显示无敏感信息残留

## 🆘 如果清理失败

1. **不要删除仓库**：
   - 保留原始仓库作为证据
   - 创建新的干净仓库

2. **联系 GitHub 支持**：
   - 如果敏感信息无法从历史中删除
   - 可以请求 GitHub 帮助删除

3. **创建新仓库**（最后选择）：
   ```bash
   # 创建新仓库
   git init --initial-branch=main cmamsys-new
   cd cmamsys-new
   cp -r ../cmamsys/* .
   git add .
   git commit -m "Initial clean commit"
   git remote add origin <new-repo-url>
   git push -u origin main
   ```

## 📚 参考资料

- [BFG Repo-Cleaner 官方文档](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo 官方文档](https://github.com/newren/git-filter-repo)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Scanner](https://owasp.org/www-project-secrets-scanner/)

## ⚡ 快速操作命令汇总

```bash
# 1. 备份
cp -r cmamsys cmamsys.backup

# 2. 使用 BFG 清理（推荐）
echo "***REDACTED_PASSWORD***" > passwords.txt
echo "***REDACTED_DB_PASSWORD***" >> passwords.txt
echo "***REDACTED_DB_USER***" >> passwords.txt
echo "***REDACTED_DB_IP***" >> passwords.txt
bfg --replace-text passwords.txt

# 3. 清理 Git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. 强制推送
git push origin --force --all
git push origin --force --tags

# 5. 验证
git log --all -S "***REDACTED_PASSWORD***"
# 应该返回空
```

---

**重要提醒**：清理 Git 历史会改变所有提交的 SHA 哈希值，所有协作者必须重新克隆仓库！

**执行时间**：约 30 分钟 - 2 小时（取决于仓库大小）
