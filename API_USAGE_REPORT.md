# 📊 CMAMSys API 使用情况报告

## 📋 报告概览

**生成时间**: 2025-02-21
**项目**: CMAMSys - 企业级数学建模竞赛平台
**扫描工具**: `scripts/check-api-usage.js`

---

## 🎯 API 使用总结

项目**支持 17 种外部 API 服务**，分为以下几类：

| 分类 | 服务数量 | 风险等级 |
|------|----------|----------|
| AI Services | 4 | 🔴 高风险 |
| Storage | 3 | 🟠 中等风险 |
| Communication | 4 | 🟡 低-中等风险 |
| Video | 2 | 🟠 中等风险 |
| Monitoring | 2 | 🟡 低-中等风险 |
| Database | 1 | 🔴 高风险 |
| Cache | 1 | 🟡 低风险 |
| **总计** | **17** | **-** |

---

## 🔴 高风险 API（需要立即检查）

### 1. AI Services (4 个)

#### 1.1 DeepSeek AI
- **环境变量**: `DEEPSEEK_API_KEY`
- **提供商**: https://platform.deepseek.com/
- **描述**: DeepSeek 大语言模型 API
- **当前状态**: ⚪ 未配置（.env 文件中）
- **风险**: 🔴 **高风险**
- **操作**: ⚠️ **立即检查是否已使用过，撤销旧 Key**

#### 1.2 VolcEngine AI (火山引擎)
- **环境变量**: `VOLCENGINE_API_KEY`
- **提供商**: https://console.volcengine.com/
- **描述**: 火山引擎 AI 服务
- **当前状态**: ⚪ 未配置（.env 文件中）
- **风险**: 🔴 **高风险**
- **操作**: ⚠️ **立即检查是否已使用过，撤销旧 Key**

#### 1.3 Aliyun AI (阿里云)
- **环境变量**: `ALIYUN_API_KEY`
- **提供商**: https://www.aliyun.com/
- **描述**: 阿里云人工智能服务
- **当前状态**: ⚪ 未配置（.env 文件中）
- **风险**: 🔴 **高风险**
- **操作**: ⚠️ **立即检查是否已使用过，撤销旧 Key**

#### 1.4 OpenAI
- **环境变量**: `OPENAI_API_KEY`
- **提供商**: https://platform.openai.com/
- **描述**: OpenAI GPT API
- **当前状态**: ⚪ 未配置（.env 文件中）
- **风险**: 🔴 **高风险**
- **操作**: ⚠️ **立即检查是否已使用过，撤销旧 Key**

### 2. Storage (2 个)

#### 2.1 AWS S3 Access Key
- **环境变量**: `S3_ACCESS_KEY_ID`
- **提供商**: AWS / MinIO / 其他 S3 兼容服务
- **描述**: S3 访问密钥
- **当前状态**: ⚪ 未配置（.env 文件中）
- **风险**: 🔴 **高风险**
- **操作**: ⚠️ **立即检查是否已使用过，撤销旧 Key**

#### 2.2 AWS S3 Secret Key
- **环境变量**: `S3_SECRET_ACCESS_KEY`
- **提供商**: AWS / MinIO / 其他 S3 兼容服务
- **描述**: S3 访问密钥
- **当前状态**: ⚪ 未配置（.env 文件中）
- **风险**: 🔴 **高风险**
- **操作**: ⚠️ **立即检查是否已使用过，撤销旧 Key**

### 3. Database (1 个)

#### 3.1 PostgreSQL Database
- **环境变量**: `DATABASE_URL`
- **提供商**: PostgreSQL
- **描述**: 数据库连接字符串
- **当前状态**: ⚪ 使用本地/安全默认值
- **风险**: 🔴 **高风险**
- **操作**: ✅ 已清理（生产数据库凭据已移除）

---

## 🟠 中等风险 API（建议检查）

### 1. SMS Service
- **环境变量**: `SMS_API_KEY`
- **提供商**: 未指定（需要配置）
- **描述**: 短信服务 API Key
- **当前状态**: ⚪ 未配置
- **风险**: 🟠 中等风险

### 2. SMTP Password
- **环境变量**: `SMTP_PASSWORD`
- **提供商**: Gmail / SendGrid / 其他 SMTP
- **描述**: SMTP 密码
- **当前状态**: ⚪ 未配置
- **风险**: 🟠 中等风险

### 3. Bilibili Cookie
- **环境变量**: `BILIBILI_COOKIE`
- **提供商**: https://www.bilibili.com/
- **描述**: Bilibili Cookie / Token
- **当前状态**: ⚪ 未配置
- **风险**: 🟠 中等风险

### 4. Bilibili API Key
- **环境变量**: `BILIBILI_API_KEY`
- **提供商**: https://www.bilibili.com/
- **描述**: Bilibili API Key
- **当前状态**: ⚪ 未配置
- **风险**: 🟠 中等风险

### 5. Sentry Auth Token
- **环境变量**: `SENTRY_AUTH_TOKEN`
- **提供商**: https://sentry.io/
- **描述**: Sentry 认证令牌
- **当前状态**: ⚪ 未配置
- **风险**: 🟠 中等风险

---

## 🟡 低风险 API（已配置或可选）

### 1. Sentry (已配置)
- **环境变量**: `SENTRY_DSN`
- **提供商**: https://sentry.io/ (自托管)
- **描述**: 错误追踪和性能监控
- **当前状态**: 🟢 已配置（使用自托管实例）
- **风险**: 🟡 低风险

### 2. Redis (已配置)
- **环境变量**: `REDIS_URL`
- **提供商**: Redis
- **描述**: Redis 缓存服务
- **当前状态**: 🟢 已配置（使用本地实例）
- **风险**: 🟡 低风险

### 3. SMTP Email
- **环境变量**: `SMTP_HOST`, `SMTP_USER`
- **提供商**: Gmail / SendGrid / 其他 SMTP
- **描述**: SMTP 邮件服务
- **当前状态**: ⚪ 未配置
- **风险**: 🟡 低风险

---

## 🤖 数据库中的 AI Provider 配置

系统支持以下 **15 种 AI Provider**：

| Provider | 说明 |
|----------|------|
| DEEPSEEK | DeepSeek AI |
| VOLCENGINE | 火山引擎 AI |
| ALIYUN | 阿里云 AI |
| OPENAI | OpenAI GPT |
| ANTHROPIC | Anthropic Claude |
| ZHIPU | 智谱 AI |
| BAIDU | 百度文心一言 |
| TENCENT | 腾讯混元 |
| HUNGYUAN | 火原 AI |
| MINIMAX | MiniMax |
| GOOGLE_GEMINI | Google Gemini |
| AZURE_OPENAI | Azure OpenAI |
| ALIYUN_QWEN | 阿里云通义千问 |
| BAIDU_WENXIN | 百度文心 |
| CUSTOM | 自定义 Provider |

---

## 📦 已安装的 SDK/依赖包

### AI Services
- ✓ `@aws-sdk/client-s3` (^3.991.0) - AWS S3 客户端 SDK
- ✓ `coze-coding-dev-sdk` (^0.7.15) - Coze Coding 开发 SDK

### Storage
- ✓ `@aws-sdk/client-s3` (^3.991.0) - AWS S3 客户端 SDK
- ✓ `@aws-sdk/lib-storage` (^3.991.0) - AWS S3 上传库

### Monitoring
- ✓ `@sentry/nextjs` (^10.39.0) - Sentry 错误追踪

### Cache
- ✓ `ioredis` (^5.9.2) - Redis 客户端

### Authentication
- ✓ `bcrypt` (^6.0.0) - 密码加密
- ✓ `bcryptjs` (^3.0.3) - 密码加密（兼容）
- ✓ `jsonwebtoken` (^9.0.3) - JWT Token 生成
- ✓ `jose` (^6.1.3) - JWT 处理库

---

## ⚠️ 紧急行动建议

### 今天必须完成

#### 1. 撤销所有高风险 API Keys 🔴【最高优先级】

即使不确定是否使用过，也需要立即检查并撤销：

**DeepSeek AI**
1. 登录 https://platform.deepseek.com/
2. 进入 API Keys 管理
3. 查看所有 API Keys 的使用记录
4. 如果发现异常，立即撤销并生成新的

**VolcEngine AI**
1. 登录 https://console.volcengine.com/
2. 进入 API Key 管理
3. 查看调用记录和费用
4. 如果发现异常，立即撤销并生成新的

**Aliyun AI**
1. 登录 https://www.aliyun.com/
2. 进入 AccessKey 管理
3. 查看调用日志
4. 如果发现异常，立即禁用旧 Key 并创建新的

**OpenAI**
1. 登录 https://platform.openai.com/
2. 进入 API Keys 管理
3. 查看使用记录和费用
4. 如果发现异常，立即撤销并生成新的

**AWS S3** (如果使用了)
1. 登录 AWS 控制台
2. 进入 IAM 用户管理
3. 查看访问密钥使用情况
4. 如果发现异常，立即撤销并生成新的

#### 2. 检查 API 使用日志

对于每个 AI 服务，检查以下内容：

| 项目 | 检查内容 |
|------|----------|
| DeepSeek | API 调用次数、费用统计、异常请求 |
| VolcEngine | QPS 使用情况、调用记录、费用 |
| Aliyun | AccessKey 调用日志、API 使用量 |
| OpenAI | Token 使用量、请求次数、费用 |
| AWS S3 | 访问日志、数据传输量、异常访问 |

#### 3. 清理 Git 历史并强制推送

```bash
./scripts/cleanup-git-history.sh
./scripts/verify-git-cleanup.sh
git push origin --force --all
git push origin --force --tags
```

---

## 📊 风险评估矩阵

| API | 已泄露 | 已配置 | 风险等级 | 优先级 |
|-----|--------|--------|----------|--------|
| DeepSeek AI | ⚠️ 可能 | ⚪ 否 | 🔴 高 | P0 |
| VolcEngine AI | ⚠️ 可能 | ⚪ 否 | 🔴 高 | P0 |
| Aliyun AI | ⚠️ 可能 | ⚪ 否 | 🔴 高 | P0 |
| OpenAI | ⚠️ 可能 | ⚪ 否 | 🔴 高 | P0 |
| AWS S3 | ⚠️ 可能 | ⚪ 否 | 🔴 高 | P0 |
| PostgreSQL | ✅ 已泄露 | 🟢 是 | 🔴 高 | P0 |
| SMS Service | ❌ 否 | ⚪ 否 | 🟠 中 | P1 |
| SMTP Password | ❌ 否 | ⚪ 否 | 🟠 中 | P1 |
| Bilibili | ⚠️ 可能 | ⚪ 否 | 🟠 中 | P1 |
| Sentry Auth | ❌ 否 | ⚪ 否 | 🟠 中 | P2 |
| Sentry DSN | ❌ 否 | 🟢 是 | 🟡 低 | P3 |
| Redis | ❌ 否 | 🟢 是 | 🟡 低 | P3 |

**优先级说明**:
- **P0**: 立即处理（今天必须完成）
- **P1**: 高优先级（本周完成）
- **P2**: 中优先级（本月完成）
- **P3**: 低优先级（有空时处理）

---

## 🔍 如何检查 API 使用情况

### 1. DeepSeek

```bash
# 访问控制台
https://platform.deepseek.com/

# 检查内容
- API Keys 列表
- 使用记录
- 费用统计
```

### 2. VolcEngine

```bash
# 访问控制台
https://console.volcengine.com/

# 检查内容
- API Key 管理
- 调用日志
- QPS 使用情况
- 费用明细
```

### 3. Aliyun

```bash
# 访问控制台
https://www.aliyun.com/

# 检查内容
- AccessKey 管理
- 调用日志
- API 使用量
- 费用统计
```

### 4. OpenAI

```bash
# 访问控制台
https://platform.openai.com/

# 检查内容
- API Keys
- Usage
- Billing
```

### 5. AWS S3

```bash
# 访问控制台
https://console.aws.amazon.com/

# 检查内容
- IAM 用户
- Access Keys
- S3 访问日志
- CloudTrail 日志
```

---

## 🛡️ 安全加固建议

### 1. API Key 管理

- ✅ 所有 API Keys 存储在环境变量中
- ✅ 定期轮换 API Keys（建议每 3 个月）
- ✅ 为不同环境使用不同的 API Keys
- ✅ 限制 API Key 的权限和配额
- ✅ 监控 API 使用情况，发现异常立即处理

### 2. 访问控制

- ✅ 使用最小权限原则
- ✅ 限制 API Key 的 IP 白名单（如果支持）
- ✅ 启用 API 调用日志
- ✅ 设置费用预警和上限

### 3. 审计和监控

- ✅ 定期审计 API 使用记录
- ✅ 设置异常使用告警
- ✅ 记录所有 API 调用
- ✅ 定期检查费用和使用量

---

## 📋 检查清单

### 立即执行（今天）

- [ ] 登录 DeepSeek 控制台，检查 API 使用情况
- [ ] 登录 VolcEngine 控制台，检查 API 使用情况
- [ ] 登录 Aliyun 控制台，检查 AccessKey 使用情况
- [ ] 登录 OpenAI 控制台，检查 API 使用情况
- [ ] 登录 AWS 控制台，检查 S3 访问情况
- [ ] 撤销所有可疑的 API Keys
- [ ] 清理 Git 历史并强制推送

### 本周完成

- [ ] 为所有 API Keys 设置费用预警
- [ ] 为所有 API Keys 设置使用上限
- [ ] 启用所有 API 调用日志
- [ ] 配置异常使用告警

### 本月完成

- [ ] 建立 API Key 轮换机制
- [ ] 编写 API 使用监控脚本
- [ ] 更新安全文档

---

## 📞 紧急联系

如果发现任何异常活动：

1. **立即撤销所有 API Keys**
2. **暂停相关服务**
3. **检查系统日志**
4. **通知团队成员**
5. **报告异常（如需要）**

---

## 📚 相关文档

- `GIT_HISTORY_CLEANUP_GUIDE.md` - Git 历史清理指南
- `CREDENTIALS_REVOCATION_CHECKLIST.md` - 凭据撤销清单
- `GITHUB_SECURITY_ISSUE.md` - GitHub 安全问题处理
- `scripts/check-api-usage.js` - API 使用扫描脚本

---

**最后更新**: 2025-02-21
**状态**: 🚨 需要立即检查高风险 API
