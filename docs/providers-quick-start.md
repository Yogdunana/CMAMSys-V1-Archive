# AI Providers 快速使用指南

## 🎉 状态：所有 API Key 已验证并可用

### 可用的 Providers

| # | Provider | API Key | 状态 | 优先级 |
|---|----------|---------|------|--------|
| 1 | DeepSeek | `sk-caed24c0213947838ff9c4ff4c5883f0` | ✅ | ⭐⭐⭐⭐⭐ |
| 2 | 阿里云通义千问 | `sk-14b1cb4072a24f9b9ee55d95977d1e98` | ✅ | ⭐⭐⭐⭐ |
| 3 | 火山引擎豆包 | `b91ae0e0-85a5-4e10-8297-4b05fd670fe6` | ✅ | ⭐⭐⭐⭐ |

---

## 📝 配置步骤

### 步骤 1：测试所有 Providers（验证 API Key 可用）

```bash
/tmp/test-all-providers.sh
```

**预期输出**：
```
总测试数: 3
通过: 3
失败: 0
所有测试通过！ 🎉
```

### 步骤 2：在 CMAMSys 中配置 Providers

#### 方法 A：使用一键配置脚本（推荐）

```bash
# 1. 编辑脚本，替换 JWT_TOKEN
vim /tmp/configure-all-providers.sh

# 2. 将 YOUR_JWT_TOKEN_HERE 替换为实际的 JWT Token
# 3. 运行配置
/tmp/configure-all-providers.sh
```

#### 方法 B：手动配置每个 Provider

**配置 DeepSeek**：

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "DeepSeek",
    "type": "DEEPSEEK",
    "apiKey": "sk-caed24c0213947838ff9c4ff4c5883f0",
    "endpoint": "https://api.deepseek.com/v1",
    "priority": 8,
    "isDefault": false
  }'
```

**配置阿里云通义千问**：

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "阿里云通义千问",
    "type": "ALIYUN",
    "apiKey": "sk-14b1cb4072a24f9b9ee55d95977d1e98",
    "endpoint": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "priority": 9,
    "isDefault": false
  }'
```

**配置火山引擎豆包**（需要接入点映射）：

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "火山引擎豆包",
    "type": "VOLCENGINE",
    "apiKey": "b91ae0e0-85a5-4e10-8297-4b05fd670fe6",
    "endpoint": "https://ark.cn-beijing.volces.com/api/v3",
    "config": {
      "endpointMapping": {
        "doubao-pro-128k": "ep-20260207034939-n2p59"
      }
    },
    "priority": 10,
    "isDefault": false
  }'
```

### 步骤 3：测试配置的 Provider

```bash
# 使用 CMAMSys API 测试 Provider
curl -X POST http://localhost:5000/api/ai-providers/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "YOUR_PROVIDER_ID",
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

## 💬 使用流式聊天

### DeepSeek

```bash
curl -N -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "YOUR_DEEPSEEK_PROVIDER_ID",
    "model": "deepseek-chat",
    "messages": [
      {"role": "system", "content": "你是一个数学建模专家"},
      {"role": "user", "content": "请解释什么是线性规划，并给出一个简单例子"}
    ]
  }'
```

### 阿里云通义千问

```bash
curl -N -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "YOUR_ALIYUN_PROVIDER_ID",
    "model": "qwen-plus",
    "messages": [
      {"role": "system", "content": "你是一个数学建模专家"},
      {"role": "user", "content": "请解释什么是线性规划，并给出一个简单例子"}
    ]
  }'
```

### 火山引擎豆包

```bash
curl -N -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "YOUR_VOLCENGINE_PROVIDER_ID",
    "model": "doubao-pro-128k",
    "messages": [
      {"role": "system", "content": "你是一个数学建模专家"},
      {"role": "user", "content": "请解释什么是线性规划，并给出一个简单例子"}
    ]
  }'
```

---

## 🤖 Provider 对比

### DeepSeek

**优点**：
- ✅ 完全免费使用
- ✅ 128K 上下文长度
- ✅ 支持文件上传（图像、txt、pdf、ppt、word、excel）
- ✅ 响应速度快（~5秒）

**适用场景**：
- 数学建模与问题求解
- 代码编写和调试
- 文档分析和总结
- 学术研究和写作

**推荐模型**：
- `deepseek-chat` - 通用对话

---

### 阿里云通义千问

**优点**：
- ✅ 价格低廉
- ✅ 中文理解能力强
- ✅ 128K 上下文长度
- ✅ 响应速度快（~3秒）

**适用场景**：
- 中文对话
- 数学建模
- 代码生成
- 文档分析

**推荐模型**：
- `qwen-plus` - 平衡性能与成本
- `qwen-turbo` - 快速响应

---

### 火山引擎豆包

**优点**：
- ✅ 功能丰富
- ✅ 128K 上下文长度
- ✅ 推理能力强
- ✅ 支持多种模型

**适用场景**：
- 复杂任务
- 多模型切换
- 企业级应用

**推荐模型**：
- `doubao-pro-128k` - 高性能
- `doubao-lite-128k` - 经济实惠

**注意**：需要配置推理接入点映射

---

## 📊 推荐配置优先级

| 优先级 | Provider | 理由 |
|-------|----------|------|
| 1️⃣ | DeepSeek | 完全免费，性能优秀，推荐作为默认 |
| 2️⃣ | 阿里云 | 价格低廉，中文理解好 |
| 3️⃣ | 火山引擎 | 功能丰富，适合复杂任务 |

---

## 🔧 故障排查

### DeepSeek 返回 401 错误

**原因**：API Key 无效

**解决方案**：
```bash
# 检查 API Key 是否正确
echo "sk-caed24c0213947838ff9c4ff4c5883f0"
```

### 阿里云返回 400 错误

**原因**：请求格式错误

**解决方案**：
```bash
# 检查 API 端点是否正确
https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 火山引擎返回 404 错误

**原因**：推理接入点名称错误

**解决方案**：
1. 确认接入点名称格式：`ep-xxxxxxxx`
2. 检查 `endpointMapping` 配置
3. 确认接入点已创建并激活

---

## 📚 相关文档

- [阿里云集成指南](./aliyun-integration-guide.md)
- [火山引擎集成指南](./volcengine-integration-guide.md)
- [火山引擎故障排查](./volcengine-troubleshooting.md)
- [火山引擎快速开始](./volcengine-quick-start.md)
- [Providers 配置总结](./providers-config-summary.md)

---

## 📦 已创建的工具脚本

| 脚本 | 用途 |
|------|------|
| `/tmp/test-all-providers.sh` | 测试所有 Providers |
| `/tmp/test-deepseek.sh` | 测试 DeepSeek |
| `/tmp/test-aliyun.sh` | 测试阿里云 |
| `/tmp/test-volcengine.sh` | 测试火山引擎 |
| `/tmp/configure-all-providers.sh` | 配置所有 Providers |

---

## ✅ 完成清单

- [x] 验证 DeepSeek API Key
- [x] 验证阿里云 API Key
- [x] 验证火山引擎 API Key
- [x] 创建测试脚本
- [x] 创建配置脚本
- [x] 编写使用指南

---

**状态**：🎉 所有 API Key 已验证并可用，可以开始使用！
