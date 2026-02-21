# 🚨 紧急凭据撤销清单

## ⚠️ 重要说明

以下凭据已经泄露到 Git 历史，**必须立即撤销/轮换**！

## 📋 凭据清单

### 1. 数据库凭据 🔴【最高优先级】

| 项目 | 泄露值 | 风险等级 | 状态 | 操作 |
|------|--------|----------|------|------|
| 数据库主机 | `***REDACTED_DB_IP***` | 🔴 严重 | ⏳ 待处理 | [ ] 更换数据库服务器或限制访问 |
| 数据库端口 | `5632` | 🟡 中等 | ⏳ 待处理 | [ ] 更改数据库端口 |
| 数据库用户 | `***REDACTED_DB_USER***` | 🟠 高 | ⏳ 待处理 | [ ] 删除此用户或重命名 |
| 数据库密码 | `***REDACTED_DB_PASSWORD***` | 🔴 严重 | ⏳ 待处理 | [ ] 立即更改密码 |

#### 数据库密码更改 SQL

```sql
-- 连接到数据库后执行
ALTER USER "***REDACTED_DB_USER***" WITH PASSWORD 'new_secure_password_here_32_chars_long';

-- 或者创建新用户
CREATE USER "cmamsys_user" WITH PASSWORD 'new_secure_password_here_32_chars_long';
GRANT ALL PRIVILEGES ON DATABASE cmamsys TO "cmamsys_user";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "cmamsys_user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "cmamsys_user";

-- 删除旧用户（谨慎操作）
-- DROP USER "***REDACTED_DB_USER***";
```

#### 数据库安全加固

```sql
-- 1. 限制数据库访问 IP（如果有 pg_hba.conf 控制权限）
-- 在 pg_hba.conf 中配置：
# hostssl  cmamsys  cmamsys_user  192.168.1.0/24  scram-sha-256

-- 2. 启用 SSL 连接
-- 修改 postgresql.conf：
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'

-- 3. 更改默认端口（可选）
-- 修改 postgresql.conf：
port = 5432  # 改为非标准端口

-- 4. 启用连接日志
log_connections = on
log_disconnections = on
```

### 2. 管理员账户凭据 🔴【最高优先级】

| 项目 | 泄露值 | 风险等级 | 状态 | 操作 |
|------|--------|----------|------|------|
| 管理员邮箱 | `admin@example.com` | 🟡 中等 | ⏳ 待处理 | [ ] 保留或更新 |
| 管理员用户名 | `Yogdunana` | 🟡 中等 | ⏳ 待处理 | [ ] 保留或更新 |
| 管理员密码 | `***REDACTED_PASSWORD***` | 🔴 严重 | ⏳ 待处理 | [ ] 立即更改密码 |

#### 管理员密码更改步骤

**方法 1：通过系统 UI（推荐）**

1. 登录系统（如果还能登录）
2. 进入用户设置
3. 更改密码

**方法 2：通过数据库直接更改**

```sql
-- 1. 生成新密码的 bcrypt 哈希值
-- 使用 Node.js：
const bcrypt = require('bcrypt');
const saltRounds = 12;
const newPassword = 'new_secure_admin_password_here_32_chars';
const hash = await bcrypt.hash(newPassword, saltRounds);
console.log(hash);

-- 2. 更新数据库中的密码
UPDATE "User"
SET password = '$2b$12$...'  -- 替换为上面生成的哈希值
WHERE email = 'admin@example.com';

-- 3. 重置失败登录次数（如果需要）
UPDATE "User"
SET "failedLoginAttempts" = 0,
    "lockedUntil" = NULL
WHERE email = 'admin@example.com';
```

**方法 3：使用种子脚本**

```bash
# 重新运行种子脚本（会使用新的环境变量）
export ADMIN_PASSWORD="new_secure_admin_password_here"
npx tsx prisma/seed.ts
```

### 3. AI Provider API Keys 🟠【高优先级】

| Provider | 泄露状态 | 风险等级 | 状态 | 操作 |
|----------|----------|----------|------|------|
| DeepSeek | 可能泄露 | 🟠 高 | ⏳ 待处理 | [ ] 撤销并重新生成 |
| VolcEngine | 可能泄露 | 🟠 高 | ⏳ 待处理 | [ ] 撤销并重新生成 |
| Aliyun | 可能泄露 | 🟠 高 | ⏳ 待处理 | [ ] 撤销并重新生成 |

###***REMOVED*** 撤销步骤

**DeepSeek API Key**

1. 登录 [DeepSeek 控制台](https://platform.deepseek.com/)
2. 进入 API Keys 管理
3. 撤销旧 API Key
4. 生成新的 API Key
5. 更新系统中的 API Key

**VolcEngine API Key**

1. 登录 [火山引擎控制台](https://console.volcengine.com/)
2. 进入 API Key 管理
3. 撤销旧 API Key
4. 生成新的 API Key
5. 更新系统中的 API Key

**Aliyun API Key**

1. 登录 [阿里云控制台](https://console.aliyun.com/)
2. 进入 AccessKey 管理
3. 禁用旧的 AccessKey
4. 创建新的 AccessKey
5. 更新系统中的 API Key

### 4. 其他敏感凭据 🟡【中等优先级】

| 项目 | 泄露值 | 风险等级 | 状态 | 操作 |
|------|--------|----------|------|------|
| JWT Secret | 可能泄露 | 🟠 高 | ⏳ 待处理 | [ ] 重新生成并更新 |
| Encryption Key | 可能泄露 | 🔴 严重 | ⏳ 待处理 | [ ] 重新生成（⚠️ 会影响现有加密数据）|
| CSRF Secret | 可能泄露 | 🟡 中等 | ⏳ 待处理 | [ ] 重新生成并更新 |

#### JWT Secret 重新生成

```bash
# 生成新的 JWT Secret
NEW_JWT_SECRET=$(openssl rand -base64 32)
echo "新的 JWT Secret: $NEW_JWT_SECRET"

# 更新 .env 文件
sed -i "s/JWT_SECRET=.*/JWT_SECRET=\"$NEW_JWT_SECRET\"/" .env
```

#### Encryption Key 重新生成（⚠️ 慎重）

⚠️ **警告**：重新生成 Encryption Key 会导致所有使用旧密钥加密的数据无法解密！

如果必须重新生成：

1. **备份数据库**（必须）
2. **记录所有 AI Provider 的 API Keys**（需要重新加密）
3. 生成新密钥
4. 重新加密所有敏感数据
5. 更新 .env 文件

```bash
# 生成新的 Encryption Key
NEW_ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "新的 Encryption Key: $NEW_ENCRYPTION_KEY"

# 更新 .env 文件
sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=\"$NEW_ENCRYPTION_KEY\"/" .env
```

## ✅ 完成检查清单

在完成所有凭据撤销后，请检查：

### 数据库
- [ ] 数据库密码已更改
- [ ] 数据库用户已更新
- [ ] 数据库访问已限制（IP 白名单）
- [ ] SSL/TLS 已启用
- [ ] 连接日志已启用
- [ ] 数据库端口已更改（可选）

### 管理员账户
- [ ] 管理员密码已更改
- [ ] 新密码已测试可以登录
- [ ] 失败登录次数已重置
- [ ] 邮箱确认（如果需要）

### AI Providers
- [ ] DeepSeek API Key 已撤销
- [ ] DeepSeek API Key 已重新生成
- [ ] DeepSeek API Key 已更新到系统
- [ ] VolcEngine API Key 已撤销
- [ ] VolcEngine API Key 已重新生成
- [ ] VolcEngine API Key 已更新到系统
- [ ] Aliyun API Key 已撤销
- [ ] Aliyun API Key 已重新生成
- [ ] Aliyun API Key 已更新到系统

### 系统配置
- [ ] JWT Secret 已重新生成
- [ ] CSRF Secret 已重新生成
- [ ] 所有环境变量已更新
- [ ] .env 文件已检查（不包含泄露信息）
- [ ] 应用已重启

### Git 历史
- [ ] Git 历史已清理
- [ ] 已强制推送到 GitHub
- [ ] 所有协作者已通知
- [ ] 所有协作者已重新克隆

### 验证
- [ ] 运行安全审计脚本：`node scripts/security-audit.js`
- [ ] 运行 Git 清理验证：`./scripts/verify-git-cleanup.sh`
- [ ] 检查 GitHub 仓库历史
- [ ] 测试所有功能是否正常

## 📊 处理进度跟踪

| 日期 | 操作 | 执行人 | 状态 |
|------|------|--------|------|
| 2025-02-21 | 发现敏感信息泄露 | - | ✅ 完成 |
| 2025-02-21 | 清理源代码敏感信息 | - | ✅ 完成 |
| 2025-02-21 | 更改数据库密码 | - | ⏳ 待执行 |
| 2025-02-21 | 更改管理员密码 | - | ⏳ 待执行 |
| 2025-02-21 | 撤销 API Keys | - | ⏳ 待执行 |
| 2025-02-21 | 清理 Git 历史 | - | ⏳ 待执行 |
| 2025-02-21 | 强制推送 GitHub | - | ⏳ 待执行 |
| 2025-02-21 | 通知协作者 | - | ⏳ 待执行 |

## 🔐 安全加固建议

### 短期（24小时内）
1. ✅ 撤销所有已泄露的凭据
2. ⏳ 清理 Git 历史并强制推送
3. ⏳ 通知所有协作者重新克隆
4. ⏳ 启用额外的安全审计

### 中期（1周内）
1. 配置 `git-secrets` 工具
2. 添加 pre-commit hooks
3. 启用 GitHub Secret Scanning
4. 实施凭据轮换策略
5. 配置数据库访问白名单

### 长期（1个月内）
1. 实施密钥管理系统（KMS）
2. 启用自动化安全扫描
3. 实施安全培训
4. 建立安全事件响应流程
5. 定期进行安全审计

## 📞 紧急联系

如果发现任何可疑活动：

1. 立即断开数据库连接
2. 检查数据库访问日志
3. 检查 API 使用日志
4. 通知所有用户更改密码
5. 考虑暂时关闭系统

---

**最后更新**: 2025-02-21
**状态**: 🚨 需要立即处理
