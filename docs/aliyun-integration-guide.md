# 阿里云百炼平台集成指南

本文档介绍如何在 CMAMSys 中配置和使用阿里云通义千问大模型。

## 概述

CMAMSys 已成功集成阿里云百炼平台的大模型能力，支持以下模型：
- **qwen-turbo**: 快速响应模型，适合简单任务
- **qwen-plus**: 平衡性能模型，支持推理能力
- **qwen-max**: 高性能模型，适合复杂任务

## 前置要求

1. 注册阿里云账号并开通百炼服务：https://dashscope.console.aliyun.com/
2. 创建 API Key：https://dashscope.console.aliyun.com/apiKey

## 配置步骤

### 1. 设置环境变量

在项目根目录的 `.env` 文件中添加阿里云 API Key：

```bash
ALIYUN_API_KEY="your-aliyun-api-key-here"
```

### 2. 通过 UI 创建阿里云 Provider

1. 登录 CMAMSys
2. 导航到 **设置** -> **AI Providers**
3. 点击 **添加 Provider**
4. 选择 **阿里云** 类型
5. 填写配置信息：
   - **名称**: 例如 "阿里云通义千问"
   - **类型**: Aliyun
   - **API Key**: 输入您的阿里云 API Key
   - **模型**: 选择默认模型（推荐：qwen-plus）
6. 点击 **测试连接** 验证配置
7. 保存配置

### 3. 通过 API 创建阿里云 Provider

使用以下 API 创建阿里云 Provider：

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "阿里云通义千问",
    "type": "ALIYUN",
    "apiKey": "your-aliyun-api-key",
    "priority": 10,
    "isDefault": true
  }'
```

## 使用方式

### 1. 流式调用（推荐）

使用 `callAIStream` 函数进行流式输出：

```typescript
import { callAIStream } from '@/services/ai-provider';

const stream = await callAIStream(
  providerId,
  'qwen-plus',
  [
    { role: 'system', content: '你是一个数学建模专家' },
    { role: 'user', content: '请解释什么是线性规划' }
  ],
  {
    modelType: 'CHAT',
    context: 'modeling'
  },
  userId,
  requestHeaders
);

// 读取流式输出
for await (const chunk of stream) {
  console.log(chunk.content);
}
```

### 2. 非流式调用

使用 `callAI` 函数进行非流式调用：

```typescript
import { callAI } from '@/services/ai-provider';

const response = await callAI(
  providerId,
  'qwen-plus',
  '请解释什么是线性规划',
  {
    modelType: 'CHAT',
    context: 'modeling'
  },
  userId
);

console.log(response.content);
```

### 3. 测试连接

使用测试 API 验证配置：

```bash
curl -X POST http://localhost:5000/api/ai-providers/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ALIYUN",
    "apiKey": "your-aliyun-api-key",
    "model": "qwen-plus"
  }'
```

## 模型选择

根据任务需求选择合适的模型：

| 模型 | 适用场景 | 成本 | 速度 |
|------|---------|------|------|
| qwen-turbo | 简单对话、快速响应 | 低 | 快 |
| qwen-plus | 推理、分析、编码 | 中 | 中 |
| qwen-max | 复杂推理、长文本处理 | 高 | 慢 |

## 最佳实践

1. **流式优先**: 对于需要实时反馈的场景（如建模过程、对话），优先使用流式调用
2. **请求头转发**: 始终使用 `HeaderUtils.extractForwardHeaders()` 提取并转发请求头，以便进行请求追踪
3. **错误处理**: 始终使用 try-catch 块处理可能的错误
4. **模型选择**: 根据任务复杂度选择合适的模型，避免过度使用高性能模型

## 示例代码

### 完整的流式调用示例

```typescript
import { callAIStream } from '@/services/ai-provider';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { providerId, prompt } = await request.json();
    const userId = 'your-user-id';

    const messages = [
      { role: 'system', content: '你是一个数学建模专家' },
      { role: 'user', content: prompt }
    ];

    const stream = await callAIStream(
      providerId,
      'qwen-plus',
      messages,
      {
        modelType: 'CHAT',
        context: 'modeling'
      },
      userId,
      Object.fromEntries(request.headers.entries())
    );

    // 返回 SSE 流
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

## 故障排查

### 问题 1: API Key 无效

**错误信息**: `Invalid API key`

**解决方案**:
1. 检查 API Key 是否正确复制
2. 确认 API Key 已激活
3. 检查账户余额是否充足

### 问题 2: 连接超时

**错误信息**: `Request timeout`

**解决方案**:
1. 检查网络连接
2. 确认 API 端点地址正确
3. 增加超时时间配置

### 问题 3: 模型不存在

**错误信息**: `Model not found`

**解决方案**:
1. 检查模型名称拼写
2. 确认模型已发布
3. 查看可用模型列表

## 技术细节

### API 端点

阿里云百炼平台的 API 端点：
```
https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 认证方式

使用 Bearer Token 认证：
```
Authorization: Bearer YOUR_API_KEY
```

### 兼容性

阿里云百炼平台提供 OpenAI 兼容的 API 格式，因此可以使用标准的 OpenAI 客户端或 `coze-coding-dev-sdk` 进行调用。

## 参考资源

- [阿里云百炼官方文档](https://help.aliyun.com/zh/dashscope/)
- [通义千问 API 文档](https://help.aliyun.com/zh/dashscope/developer-reference/compatibility-of-openai-with-dashscope/)
- [coze-coding-dev-sdk 文档](https://github.com/coze-dev/coze-coding-dev-sdk)

## 更新日志

- **2026-02-06**: 初始版本，支持 qwen-turbo, qwen-plus, qwen-max 模型
