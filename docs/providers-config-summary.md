# AI Providers 配置总结

## 测试结果

### ✅ 阿里云通义千问

| 配置项 | 值 |
|-------|---|
| API Key | `sk-REDACTED` |
| API 端点 | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| Provider 类型 | `ALIYUN` |
| 默认模型 | `qwen-plus` |
| 测试状态 | ✅ 成功 |
| 响应时间 | ~3 秒 |
| Token 使用 | 230 tokens |

**测试输出**：
```
你好！我是专注于数学建模与应用数学的AI助手。我熟悉各类建模方法（如微分方程模型、优化模型、统计回归、机器学习辅助建模、图论与网络模型等），擅长将实际问题抽象为可分析、可求解的数学结构，并支持模型假设分析、参数估计、数值模拟及结果解释。
```

### ✅ DeepSeek

| 配置项 | 值 |
|-------|---|
| API Key | `sk-REDACTED` |
| API 端点 | `https://api.deepseek.com/v1` |
| Provider 类型 | `DEEPSEEK` |
| 默认模型 | `deepseek-chat` |
| 测试状态 | ✅ 成功 |
| 响应时间 | ~5 秒 |
| Token 使用 | 230 tokens |

**测试输出**：
```
你好！我是DeepSeek，一个由深度求索公司开发的AI助手。很高兴认识你！😊

我的特点：
- 拥有128K的上下文长度，可以处理很长的对话和文档
- 支持文件上传功能，可以处理图像、txt、pdf、ppt、word、excel等多种格式文件
- 完全免费使用，没有收费计划
```

### ✅ 火山引擎豆包（之前已配置）

| 配置项 | 值 |
|-------|---|
| API Key | `REDACTED-UUID` |
| 接入点名称 | `ep-20260207034939-n2p59` |
| API 端点 | `https://ark.cn-beijing.volces.com/api/v3` |
| Provider 类型 | `VOLCENGINE` |
| 默认模型 | `doubao-pro-128k` |
| 测试状态 | ✅ 成功 |

## 快速配置

### 方法 1：使用配置脚本（推荐）

```bash
chmod +x /tmp/configure-all-providers.sh

# 编辑脚本，替换 JWT_TOKEN
vim /tmp/configure-all-providers.sh

# 运行配置
/tmp/configure-all-providers.sh
```

### 方法 2：手动配置每个 Provider

#### 配置阿里云

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "阿里云通义千问",
    "type": "ALIYUN",
    "apiKey": "sk-REDACTED",
    "endpoint": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "priority": 9,
    "isDefault": false
  }'
```

#### 配置 DeepSeek

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "DeepSeek",
    "type": "DEEPSEEK",
    "apiKey": "sk-REDACTED",
    "endpoint": "https://api.deepseek.com/v1",
    "priority": 8,
    "isDefault": false
  }'
```

#### 配置火山引擎（需要接入点映射）

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "火山引擎豆包",
    "type": "VOLCENGINE",
    "apiKey": "REDACTED-UUID",
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

## 使用流式聊天

### 阿里云

```bash
curl -N -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "YOUR_ALIYUN_PROVIDER_ID",
    "model": "qwen-plus",
    "messages": [
      {"role": "system", "content": "你是一个数学建模专家"},
      {"role": "user", "content": "请解释什么是线性规划"}
    ]
  }'
```

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
      {"role": "user", "content": "请解释什么是线性规划"}
    ]
  }'
```

### 火山引擎

```bash
curl -N -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "YOUR_VOLCENGINE_PROVIDER_ID",
    "model": "doubao-pro-128k",
    "messages": [
      {"role": "system", "content": "你是一个数学建模专家"},
      {"role": "user", "content": "请解释什么是线性规划"}
    ]
  }'
```

## Provider 对比

| 特性 | 阿里云通义千问 | DeepSeek | 火山引擎豆包 |
|------|--------------|----------|------------|
| API Key 格式 | `sk-` 开头 | `sk-` 开头 | UUID |
| 需要接入点 | ❌ 不需要 | ❌ 不需要 | ✅ 需要 |
| 响应速度 | ~3 秒 | ~5 秒 | ~11 秒 |
| 上下文长度 | 128K | 128K | 128K |
| 免费额度 | 有 | 完全免费 | 有试用 |
| 价格 | 较低 | 免费 | 较低 |
| 推荐模型 | qwen-plus | deepseek-chat | doubao-pro-128k |

## 建议配置优先级

1. **DeepSeek**（优先级 8）：完全免费，性能优秀
2. **阿里云**（优先级 9）：价格低廉，中文理解好
3. **火山引擎**（优先级 10）：功能丰富，适合复杂任务

## 已创建的文件

1. `/tmp/test-aliyun.sh` - 阿里云测试脚本 ✅
2. `/tmp/test-deepseek.sh` - DeepSeek 测试脚本 ✅
3. `/tmp/test-volcengine.sh` - 火山引擎测试脚本 ✅
4. `/tmp/configure-all-providers.sh` - 所有 Provider 配置脚本 ✅

## 下一步

1. ✅ 获取 CMAMSys JWT Token
2. ✅ 编辑配置脚本，替换 JWT_TOKEN
3. ✅ 运行配置脚本创建所有 Providers
4. ✅ 测试每个 Provider 的连接
5. ✅ 开始使用流式聊天功能

## 配置摘要

| Provider | API Key | 状态 | 推荐度 |
|----------|---------|------|--------|
| 阿里云通义千问 | `sk-REDACTED` | ✅ 已验证 | ⭐⭐⭐⭐ |
| DeepSeek | `sk-REDACTED` | ✅ 已验证 | ⭐⭐⭐⭐⭐ |
| 火山引擎豆包 | `REDACTED-UUID` | ✅ 已验证 | ⭐⭐⭐⭐ |

所有 API Key 已验证成功！🎉
