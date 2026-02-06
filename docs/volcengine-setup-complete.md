# 火山引擎配置完成指南

## 你的配置信息

✅ **API Key**: `b91ae0e0-85a5-4e10-8297-4b05fd670fe6`
✅ **接入点名称**: `ep-20260207034939-n2p59`

## 步骤 1：测试火山引擎 API 连接

### 方法 1：使用测试脚本（推荐）

```bash
chmod +x /tmp/test-volcengine.sh
/tmp/test-volcengine.sh
```

### 方法 2：直接使用 curl

```bash
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Authorization: Bearer b91ae0e0-85a5-4e10-8297-4b05fd670fe6" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ep-20260207034939-n2p59",
    "messages": [
      {"role": "system", "content": "你是一个数学建模专家"},
      {"role": "user", "content": "你好，请简单介绍一下你自己"}
    ],
    "stream": false,
    "temperature": 0.7
  }'
```

### 预期结果

如果成功，你会看到类似这样的响应：

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "你好！我是豆包，是由字节跳动开发的 AI 人工智能助手。我可以帮助你解决数学建模相关的问题，提供分析、计算和建议。"
      }
    }
  ],
  "usage": {
    "total_tokens": 50,
    "prompt_tokens": 30,
    "completion_tokens": 20
  }
}
```

## 步骤 2：在 CMAMSys 中创建 Provider

### 获取 JWT Token

首先登录 CMAMSys 并获取 JWT Token：

```bash
# 登录获取 Token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

# 从响应中复制 accessToken
```

### 创建 Provider

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

### 预期结果

```json
{
  "success": true,
  "data": {
    "id": "cmxabc123...",
    "name": "火山引擎豆包",
    "type": "VOLCENGINE",
    "apiKey": "b91ae0e0-85a5-4e10-8297-4b05fd670fe6",
    "endpoint": "https://ark.cn-beijing.volces.com/api/v3",
    "status": "ACTIVE",
    "supportedModels": ["doubao-pro-128k", ...],
    "createdAt": "2026-02-07T..."
  }
}
```

## 步骤 3：测试 Provider 连接

```bash
curl -X POST http://localhost:5000/api/ai-providers/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "VOLCENGINE",
    "apiKey": "b91ae0e0-85a5-4e10-8297-4b05fd670fe6",
    "endpoint": "https://ark.cn-beijing.volces.com/api/v3",
    "model": "doubao-pro-128k",
    "config": {
      "endpointMapping": {
        "doubao-pro-128k": "ep-20260207034939-n2p59"
      }
    }
  }'
```

## 步骤 4：使用流式聊天 API

```bash
curl -N -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "YOUR_PROVIDER_ID",
    "model": "doubao-pro-128k",
    "messages": [
      {"role": "system", "content": "你是一个数学建模专家"},
      {"role": "user", "content": "请解释什么是线性规划"}
    ]
  }'
```

## 配置说明

### 接入点映射配置

```json
{
  "endpointMapping": {
    "doubao-pro-128k": "ep-20260207034939-n2p59"
  }
}
```

这个配置的作用：
- 当你调用 `doubao-pro-128k` 时
- 系统自动使用接入点名称 `ep-20260207034939-n2p59`
- 你无需每次都记住接入点名称

### 如果需要使用更多模型

为每个模型创建接入点，然后在配置中添加映射：

```json
{
  "endpointMapping": {
    "doubao-pro-128k": "ep-20260207034939-n2p59",
    "doubao-lite-128k": "ep-20260207040000-xxx",
    "doubao-pro-256k": "ep-20260207041000-yyy"
  }
}
```

## 常见问题

### Q: 测试时出现 401 错误

**A**: 检查 API Key 是否正确复制，确保没有空格或换行。

### Q: 测试时出现 404 错误

**A**: 确认接入点名称正确：`ep-20260207034939-n2p59`

### Q: CMAMSys 创建 Provider 失败

**A**: 
1. 确认已登录并获取有效的 JWT Token
2. 检查 Provider 名称是否重复
3. 查看详细的错误信息

### Q: 如何查看已创建的 Providers

```bash
curl http://localhost:5000/api/ai-providers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 配置文件位置

已为你创建以下配置文件：

1. `/tmp/test-volcengine.sh` - API 测试脚本
2. `/tmp/configure-volcengine-provider.sh` - Provider 配置脚本

## 下一步

1. ✅ 运行测试脚本验证 API 连接
2. ✅ 获取 CMAMSys JWT Token
3. ✅ 创建 Provider
4. ✅ 测试 Provider 连接
5. ✅ 开始使用流式聊天功能

## 快速命令

```bash
# 1. 测试 API 连接
/tmp/test-volcengine.sh

# 2. 登录获取 Token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email", "password": "your-password"}'

# 3. 创建 Provider（替换 JWT_TOKEN）
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
    "priority": 10
  }'
```

## 配置摘要

| 配置项 | 值 |
|-------|---|
| API Key | `b91ae0e0-85a5-4e10-8297-4b05fd670fe6` |
| 接入点名称 | `ep-20260207034939-n2p59` |
| API 端点 | `https://ark.cn-beijing.volces.com/api/v3` |
| Provider 类型 | `VOLCENGINE` |
| 默认模型 | `doubao-pro-128k` |

配置完成后，你就可以在 CMAMSys 中使用火山引擎豆包的大模型能力了！🎉
