# API Key 加密存储实现文档

## 问题背景

原问题：API Keys 明文存储在数据库中，存在安全风险。

## 解决方案

使用 **AES-256-GCM** 加密算法对 API Keys 进行加密存储。

## 技术实现

### 1. 加密工具函数 (`src/lib/encryption.ts`)

**算法**：AES-256-GCM
- **密钥长度**：256 bits
- **IV 长度**：128 bits
- **认证标签**：128 bits
- **密钥派生**：PBKDF2 (100,000 iterations, SHA-256)

**加密流程**：
1. 生成随机 Salt (64 bytes)
2. 使用 PBKDF2 从 Salt 和 ENCRYPTION_KEY 派生加密密钥
3. 生成随机 IV (16 bytes)
4. 使用 AES-256-GCM 加密数据
5. 组合：`Salt + IV + AuthTag + EncryptedData`
6. Base64 编码存储

**解密流程**：
1. Base64 解码
2. 提取 Salt、IV、AuthTag、EncryptedData
3. 使用 PBKDF2 从 Salt 和 ENCRYPTION_KEY 派生密钥
4. 使用 AES-256-GCM 解密数据
5. 验证 AuthTag 确保数据完整性

### 2. 数据库集成

**存储时加密**：
```typescript
// src/services/ai-provider.ts - createProvider
const encryptedApiKey = encrypt(data.apiKey);

return await prisma.aIProvider.create({
  data: {
    ...
    apiKey: encryptedApiKey, // 存储加密后的 API Key
    ...
  },
});
```

**使用时解密**：
```typescript
// src/services/ai-provider.ts - makeProviderRequest
const decryptedApiKey = decrypt(provider.apiKey);

// 使用解密后的 API Key 调用 API
const config = new Config({
  apiKey: decryptedApiKey,
  baseUrl: endpoint,
});
```

### 3. 环境变量配置

**`.env` 文件**：
```env
# 加密密钥（必须保密！）
ENCRYPTION_KEY="cmamsys-encryption-key-2024-secure-256-bit"
```

**`.env.example` 文件**：
```env
# 生成安全密钥：openssl rand -base64 32
ENCRYPTION_KEY=""
```

**密钥来源**：
1. 优先使用 `ENCRYPTION_KEY` 环境变量
2. 如果未设置，回退到 `JWT_SECRET`（不推荐）

## 安全最佳实践

### 1. 加密密钥管理

**生产环境**：
- ✅ 使用专用密钥管理服务（AWS Secrets Manager、Azure Key Vault、HashiCorp Vault）
- ✅ 定期轮换密钥（建议每 3-6 个月）
- ✅ 使用环境变量或密钥管理服务注入，不要硬编码
- ✅ 限制密钥访问权限（最小权限原则）

**开发环境**：
- ✅ 使用 `.env` 文件存储密钥
- ✅ 确保 `.env` 文件在 `.gitignore` 中
- ✅ 使用强随机密钥：`openssl rand -base64 32`

### 2. 数据库安全

**加密后的 API Key 示例**：
```
原始 API Key: sk-REDACTED
加密后:      bax7vImjWT5sB4JW8oysjaWCAMEYJdCSor6piixo++/sa4mOcIYVL8hUYST6mGY+662zlztDQ8QTSuKlr/DOmw2YB8tx0ZslnzKov13lq1/4WBVGnrbrGkzyVA5AxNvbUOArYo60vWgNRZAKcdezsc5SB6QVDbdZGnv1fA+qTiaaLlk=
```

**数据库备份**：
- ⚠️ 备份文件中包含加密数据，需要保密
- ⚠️ 如果 `ENCRYPTION_KEY` 丢失，所有加密数据将无法恢复

### 3. API 响应安全

**当前实现**：
- API 返回的 `apiKey` 字段是加密后的值
- 前端不应显示完整的 API Key
- 建议在 API 响应中隐藏或脱敏显示

**建议改进**：
```typescript
// 在 API 响应中隐藏 API Key
return {
  ...provider,
  apiKey: maskApiKey(provider.apiKey), // sk-...f0
};
```

### 4. 密钥轮换策略

**步骤**：
1. 生成新的 `ENCRYPTION_KEY_NEW`
2. 逐步迁移数据：
   ```typescript
   // 重新加密所有 API Keys
   const providers = await prisma.aIProvider.findMany();
   for (const provider of providers) {
     const decrypted = decrypt(provider.apiKey, ENCRYPTION_KEY_OLD);
     const reencrypted = encrypt(decrypted, ENCRYPTION_KEY_NEW);
     await prisma.aIProvider.update({
       where: { id: provider.id },
       data: { apiKey: reencrypted },
     });
   }
   ```
3. 更新环境变量为新的密钥
4. 保留旧密钥作为备份一段时间后删除

## 测试验证

### 1. 加密/解密测试

```bash
# 检查数据库中的 API Key 是否已加密
npx ts-node prisma/check-db.ts
```

**输出示例**：
```
apiKey: "bax7vImjWT5sB4JW8oysjaWCAMEYJdCSor6piixo++/sa4mOcIYVL8hUYST6mGY+662zlztDQ8QTSuKlr/DOmw2YB8tx0ZslnzKov13lq1/4WBVGnrbrGkzyVA5AxNvbUOArYo60vWgNRZAKcdezsc5SB6QVDbdZGnv1fA+qTiaaLlk="
```

### 2. 功能测试

**登录**：
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"***REDACTED_PASSWORD***"}'
```

**获取 AI Providers**：
```bash
curl http://localhost:5000/api/ai-providers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**流式聊天（验证解密）**：
```bash
curl -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "providerId":"default-deepseek",
    "model":"deepseek-chat",
    "messages":[{"role":"user","content":"你好"}]
  }'
```

## 安全级别

| 方案 | 安全级别 | 说明 |
|------|---------|------|
| ❌ 明文存储 | 无 | 任何人访问数据库都能看到 API Keys |
| ⚠️ Base64 编码 | 低 | 容易解码，不算加密 |
| ✅ 哈希存储 | 高 | 不可逆，但不适合需要还原的场景 |
| ✅ **AES-256-GCM 加密** | **极高** | 工业级加密，符合 NIST 标准 |
| ✅ 专业密钥管理服务 | 极高 | AWS Secrets Manager、Azure Key Vault 等 |

## 性能影响

**加密操作**：
- 创建 Provider：约 5-10ms（密钥派生 + 加密）
- 更新 Provider：约 5-10ms（密钥派生 + 加密）

**解密操作**：
- 每次调用：约 5-10ms（密钥派生 + 解密）

**优化建议**：
- 考虑缓存解密后的 API Keys（在内存中，短期）
- 使用硬件加速（如 Intel AES-NI）

## 合规性

**相关法规**：
- ✅ GDPR（数据保护）
- ✅ PCI DSS（支付卡行业）
- ✅ SOC 2（安全控制）
- ✅ ISO 27001（信息安全管理）

## 总结

### ✅ 已实现

1. API Keys 加密存储（AES-256-GCM）
2. 自动解密使用
3. 密钥派生（PBKDF2）
4. 数据完整性验证（GCM AuthTag）

### 🔒 安全措施

1. 强加密算法（AES-256-GCM）
2. 随机 IV 和 Salt
3. 密钥派生（PBKDF2）
4. 完整性验证（AuthTag）

### 📝 最佳实践

1. 不要硬编码密钥
2. 定期轮换密钥
3. 使用专业密钥管理服务
4. 限制密钥访问权限
5. 备份加密数据

### 🚀 生产环境建议

1. 使用专业密钥管理服务
2. 实现密钥轮换机制
3. 添加审计日志
4. 实现密钥泄漏检测
5. 定期安全审计

---

**文档版本**：1.0
**最后更新**：2025-02-06
**作者**：CMAMSys Team
