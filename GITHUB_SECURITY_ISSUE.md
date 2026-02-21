# 🔒 GitHub 历史敏感信息处理方案

## 📋 问题概述

**严重程度**: 🔴 **严重**

CMAMSys 项目的 Git 历史中包含了以下敏感信息：

1. **管理员密码**: `***REDACTED_PASSWORD***`
2. **生产数据库**: `***REDACTED_DB_IP***:5632`
3. **数据库用户**: `***REDACTED_DB_USER***`
4. **数据库密码**: `***REDACTED_DB_PASSWORD***`
5. **可能的 API Keys**: DeepSeek、VolcEngine、Aliyun

**风险**: 任何能够访问 GitHub 仓库的人都可以通过查看历史提交找到这些凭据，可能导致：
- 数据库被未授权访问
- 管理员账户被入侵
- API 服务被滥用
- 数据泄露或破坏

---

## ✅ 已完成的工作

### 1. 源代码清理
- ✅ 移除 `prisma/seed.ts` 中的硬编码密码
- ✅ 移除登录页面的默认密码
- ✅ 修复 9 个测试脚本中的密码泄露
- ✅ 修复 4 个文档文件中的敏感信息
- ✅ 更新 `.env` 文件配置

### 2. 安全审计
- ✅ 运行 `scripts/security-audit.js`
- ✅ 验证所有源代码已清理干净

### 3. 文档创建
- ✅ `GIT_HISTORY_CLEANUP_GUIDE.md` - Git 历史清理详细指南
- ✅ `CREDENTIALS_REVOCATION_CHECKLIST.md` - 凭据撤销清单
- ✅ `SECURITY_CLEANUP_REPORT.md` - 敏感信息清理报告
- ✅ `scripts/cleanup-git-history.sh` - 自动化清理脚本
- ✅ `scripts/verify-git-cleanup.sh` - 验证脚本

---

## 🚨 立即采取的行动

### 第一优先级：撤销已泄露的凭据 ⏰【立即执行】

#### 1. 数据库凭据（最重要！）

```sql
-- 连接到数据库后执行
ALTER USER "***REDACTED_DB_USER***" WITH PASSWORD 'new_secure_password_32_chars_minimum';
```

**安全加固建议**：
- 限制数据库访问 IP（使用 pg_hba.conf）
- 启用 SSL/TLS 连接
- 启用连接日志
- 更改数据库端口（可选）

#### 2. 管理员密码

```bash
# 方法 1：重新运行种子脚本
export ADMIN_PASSWORD="new_secure_admin_password_32_chars"
npx tsx prisma/seed.ts

# 方法 2：通过数据库直接更改
# 先生成 bcrypt 哈希值，然后更新数据库
```

#### 3. API Keys

必须撤销并重新生成：
- [ ] DeepSeek API Key
- [ ] VolcEngine API Key
- [ ] Aliyun API Key

---

### 第二优先级：清理 Git 历史 📝

#### 自动化清理（推荐）

```bash
# 1. 赋予脚本执行权限（如果还没有）
chmod +x scripts/cleanup-git-history.sh

# 2. 运行清理脚本
./scripts/cleanup-git-history.sh

# 3. 验证清理结果
./scripts/verify-git-cleanup.sh

# 4. 强制推送到 GitHub
git push origin --force --all
git push origin --force --tags
```

#### 手动清理

如果自动化脚本不工作，请参考 `GIT_HISTORY_CLEANUP_GUIDE.md` 文档。

**可选工具**：
1. **BFG Repo-Cleaner**（推荐）- 最快、最简单
2. **git-filter-repo** - 现代工具
3. **git filter-branch** - 原生工具

---

### 第三优先级：通知协作者 📢

清理完成后，立即通知所有协作者：

```markdown
⚠️ 安全警报：Git 历史敏感信息清理

我们在 Git 历史中发现了敏感信息泄露，已经清理了仓库历史。

**请立即执行以下操作：**

1. 删除本地仓库：`rm -rf cmamsys`
2. 重新克隆仓库：`git clone <your-repo-url>`
3. 不要使用 git pull，直接重新克隆

**重要提示：**
- 请勿执行 git fetch 或 git pull
- 否则会再次引入敏感信息历史
- 本地修改请先备份

如有任何问题，请联系系统管理员。
```

---

## 📊 执行步骤总结

### 立即执行（今天）

1. ✅ **撤销数据库密码**
   ```sql
   ALTER USER "***REDACTED_DB_USER***" WITH PASSWORD 'new_secure_password_32_chars_minimum';
   ```

2. ✅ **撤销管理员密码**
   ```bash
   export ADMIN_PASSWORD="new_secure_admin_password_32_chars"
   npx tsx prisma/seed.ts
   ```

3. ✅ **撤销所有 API Keys**
   - 登录各服务控制台
   - 撤销旧 API Key
   - 生成新 API Key
   - 更新系统配置

4. ⏳ **清理 Git 历史**
   ```bash
   ./scripts/cleanup-git-history.sh
   ./scripts/verify-git-cleanup.sh
   git push origin --force --all
   ```

5. ⏳ **通知所有协作者**
   - 发送紧急通知邮件
   - 要求重新克隆仓库
   - 说明正确的操作步骤

### 验证（明天）

1. 运行安全审计
   ```bash
   node scripts/security-audit.js
   ```

2. 验证 Git 历史
   ```bash
   ./scripts/verify-git-cleanup.sh
   ```

3. 检查 GitHub 仓库
   - 查看 commits 历史
   - 使用代码搜索功能
   - 确认无敏感信息残留

4. 测试系统功能
   - 数据库连接
   - 管理员登录
   - AI Provider 功能

---

## 🔒 长期安全措施

### 防止未来泄露

1. **配置 git-secrets**
   ```bash
   brew install git-secrets
   git secrets --install
   git secrets --register-aws
   git secrets --add 'password'
   git secrets --add 'API.*key'
   ```

2. **添加 pre-commit hooks**
   ```bash
   # 创建 .git/hooks/pre-commit
   # 检查提交中是否包含敏感信息
   ```

3. **更新 .gitignore**
   ```gitignore
   .env
   .env.local
   .env.*.local
   *.key
   *.pem
   ```

4. **启用 GitHub Secret Scanning**
   - 在仓库设置中启用
   - 配置自定义模式
   - 定期查看扫描报告

### 安全培训

1. 教育团队成员识别敏感信息
2. 建立代码审查流程
3. 实施安全编码规范
4. 定期进行安全审计

---

## 📚 相关文档

| 文档 | 说明 | 位置 |
|------|------|------|
| Git 历史清理指南 | 详细的清理步骤和工具使用 | `GIT_HISTORY_CLEANUP_GUIDE.md` |
| 凭据撤销清单 | 所有需要撤销的凭据和操作步骤 | `CREDENTIALS_REVOCATION_CHECKLIST.md` |
| 敏感信息清理报告 | 已完成的清理工作总结 | `SECURITY_CLEANUP_REPORT.md` |
| 清理脚本 | 自动化 Git 历史清理 | `scripts/cleanup-git-history.sh` |
| 验证脚本 | 验证 Git 历史是否清理干净 | `scripts/verify-git-cleanup.sh` |
| 安全审计脚本 | 检查源代码中的敏感信息 | `scripts/security-audit.js` |

---

## ⚡ 快速参考

### 检查敏感信息

```bash
# 检查源代码
node scripts/security-audit.js

# 检查 Git 历史
./scripts/verify-git-cleanup.sh

# 手动搜索 Git 历史
git log --all -S "***REDACTED_PASSWORD***"
git log --all -S "***REDACTED_DB_PASSWORD***"
```

### 清理 Git 历史

```bash
# 自动化清理
./scripts/cleanup-git-history.sh

# 验证清理
./scripts/verify-git-cleanup.sh

# 强制推送
git push origin --force --all
git push origin --force --tags
```

### 生成安全密钥

```bash
# 生成 JWT Secret
openssl rand -base64 32

# 生成 Encryption Key
openssl rand -base64 32

# 生成管理员密码哈希
# 使用 Node.js 脚本或在线工具
```

---

## 🆘 需要帮助？

如果遇到问题：

1. **查看文档**：
   - `GIT_HISTORY_CLEANUP_GUIDE.md`
   - `CREDENTIALS_REVOCATION_CHECKLIST.md`

2. **检查日志**：
   ```bash
   # 查看清理日志
   tail -f /app/work/logs/bypass/app.log
   ```

3. **恢复备份**：
   ```bash
   # 如果清理失败，从备份恢复
   cp -r cmamsys-backup-*/* .
   ```

4. **联系 GitHub 支持**（如果需要）：
   - https://support.github.com/
   - 申请帮助删除历史中的敏感信息

---

## ⏰ 时间估算

| 任务 | 预计时间 | 优先级 |
|------|----------|--------|
| 撤销数据库密码 | 5 分钟 | 🔴 最高 |
| 撤销管理员密码 | 5 分钟 | 🔴 最高 |
| 撤销 API Keys | 15 分钟 | 🔴 最高 |
| 清理 Git 历史 | 30 分钟 - 2 小时 | 🔴 最高 |
| 强制推送 GitHub | 5 分钟 | 🔴 最高 |
| 通知协作者 | 10 分钟 | 🔴 最高 |
| 验证清理结果 | 15 分钟 | 🟠 高 |
| 配置安全措施 | 1 小时 | 🟡 中等 |

**总计**: 约 2-4 小时

---

## 📌 重要提醒

1. **不要等待** - 敏感信息已经泄露，需要立即行动
2. **撤销优先** - 先撤销凭据，再清理 Git 历史
3. **备份重要** - 在清理 Git 历史前备份仓库
4. **通知协作者** - 所有协作者必须重新克隆
5. **验证必要** - 清理后必须验证结果

---

**创建时间**: 2025-02-21
**状态**: 🚨 等待执行
**紧急程度**: 🔴 立即执行
