# 火山引擎（豆包）集成指南

本文档介绍如何在 CMAMSys 中配置和使用火山引擎（豆包）大模型。

## 概述

CMAMSys 已成功集成火山引擎（豆包）大模型能力，支持以下模型：

| 模型 | 上下文长度 | 适用场景 | 成本 |
|------|----------|---------|------|
| doubao-pro-32k | 32K | 日常对话、简单任务 | 低 |
| doubao-pro-128k | 128K | 推理、分析、编码 | 中 |
| doubao-pro-256k | 256K | 复杂推理、长文本处理 | 高 |
| doubao-lite-32k | 32K | 快速响应、简单问答 | 极低 |
| doubao-lite-128k | 128K | 中等复杂度任务 | 低 |
| doubao-speed-1.5x | 32K | 高速响应、实时交互 | 低 |

## 前置要求

1. 注册火山引擎账号：https://www.volcengine.com/
2. 开通火山引擎 Ark 服务：https://console.volcengine.com/ark
3. 创建应用并获取 API Key

## 重要：推理接入点配置

火山引擎 API 调用需要使用**推理接入点（Endpoint）名称**，而不是通用的模型名称。

### 接入点说明

- **接入点名称格式**：`ep-xxxxxxxx`
- **创建方式**：在火山引擎控制台为每个模型创建独立的推理接入点
- **用途**：API 调用时作为 `model` 参数使用

### 接入点示例

```
模型名称: doubao-pro-128k
接入点名称: ep-20240911185450-f9vl2
```

调用时：
```json
{
  "model": "ep-20240911185450-f9vl2"
}
```

## 配置步骤

### 1. 创建火山引擎应用

1. 登录火山引擎控制台：https://console.volcengine.com/ark
2. 点击「创建应用」
3. 填写应用信息（名称、描述等）
4. 创建完成后，在应用详情中获取 **API Key**
5. 记录 API Key，格式通常为：`xxxx-xxxx-xxxx-xxxx`

### 2. 创建推理接入点

1. 在火山引擎控制台，进入「模型推理」>「在线推理」
2. 点击「创建推理接入点」
3. 为每个需要使用的模型创建独立的接入点：
   - 填写接入点名称
   - 选择对应的模型（如：doubao-pro-128k）
   - 点击「接入模型」
4. 创建完成后，记录接入点名称（格式：`ep-xxxxxxxx`）

**示例配置**：

| 接入点名称 | 对应模型 | 用途 |
|-----------|---------|------|
| ep-20240911185450-f9vl2 | doubao-pro-128k | 主要推理任务 |
| ep-20240911215626-tg985 | doubao-lite-128k | 快速响应任务 |
| ep-20240911220000-ab12c | doubao-pro-256k | 复杂任务处理 |

### 3. 设置环境变量

在项目根目录的 `.env` 文件中添加火山引擎 API Key：

```bash
VOLCENGINE_API_KEY="your-volcengine-api-key-here"
```

### 4. 通过 UI 创建火山引擎 Provider

1. 登录 CMAMSys
2. 导航到 **设置** -> **AI Providers**
3. 点击 **添加 Provider**
4. 选择 **VolcEngine** 类型
5. 填写配置信息：
   - **名称**: 例如 "火山引擎豆包"
   - **类型**: VolcEngine
   - **API Key**: 输入您的火山引擎 API Key
   - **Endpoint**: 默认为 `https://ark.cn-beijing.volces.com/api/v3`
   - **接入点映射**: 配置模型名称到接入点名称的映射

6. 配置接入点映射（重要）：
   ```json
   {
     "endpointMapping": {
       "doubao-pro-128k": "ep-20240911185450-f9vl2",
       "doubao-lite-128k": "ep-20240911215626-tg985",
       "doubao-pro-256k": "ep-20240911220000-ab12c"
     }
   }
   ```

7. 点击 **测试连接** 验证配置
8. 保存配置

### 5. 通过 API 创建火山引擎 Provider

使用以下 API 创建火山引擎 Provider：

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "火山引擎豆包",
    "type": "VOLCENGINE",
    "apiKey": "your-volcengine-api-key",
    "endpoint": "https://ark.cn-beijing.volces.com/api/v3",
    "config": {
      "endpointMapping": {
        "doubao-pro-128k": "ep-20240911185450-f9vl2",
        "doubao-lite-128k": "ep-20240911215626-tg985",
        "doubao-pro-256k": "ep-20240911220000-ab12c"
      }
    },
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
  'doubao-pro-128k', // 使用通用模型名称
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
  'doubao-pro-128k',
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
    "type": "VOLCENGINE",
    "apiKey": "your-volcengine-api-key",
    "endpoint": "https://ark.cn-beijing.volces.com/api/v3",
    "model": "doubao-pro-128k",
    "config": {
      "endpointMapping": {
        "doubao-pro-128k": "ep-20240911185450-f9vl2"
      }
    }
  }'
```

### 4. 流式聊天 API

使用 SSE 流式聊天接口：

```bash
curl -N -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "your-provider-id",
    "model": "doubao-pro-128k",
    "messages": [
      { "role": "system", "content": "你是一个数学建模专家" },
      { "role": "user", "content": "请解释什么是线性规划" }
    ]
  }'
```

## 模型选择指南

### doubao-pro 系列

**doubao-pro-32k**
- 适用场景：日常对话、简单问答、快速响应
- 优势：成本低、速度快
- 推荐用于：简单任务、日常交互

**doubao-pro-128k**（推荐默认）
- 适用场景：推理、分析、编码、中等复杂度任务
- 优势：平衡性能和成本
- 推荐用于：数学建模、代码生成、分析任务

**doubao-pro-256k**
- 适用场景：复杂推理、长文本处理、文档分析
- 优势：超长上下文、强大的推理能力
- 推荐用于：复杂建模任务、长文档分析

### doubao-lite 系列

**doubao-lite-32k / doubao-lite-128k**
- 适用场景：快速响应、简单问答、高并发场景
- 优势：极低成本、高速度
- 推荐用于：简单查询、批量处理

### doubao-speed-1.5x

- 适用场景：高速响应、实时交互、游戏/直播
- 优势：1.5 倍速度、低延迟
- 推荐用于：实时对话、即时反馈

## API 端点说明

火山引擎 Ark 服务提供 OpenAI 兼容的 API 端点：

```
https://ark.cn-beijing.volces.com/api/v3
```

支持的操作：
- `/chat/completions`: 聊天补全
- `/models`: 模型列表

## 认证方式

火山引擎使用 Bearer Token 认证：

```bash
Authorization: Bearer ak-xxxxxx
```

API Key 格式：
- 格式：`ak-` 开头，后跟一串字符
- 示例：`ak-abc123xyz789`

## 价格参考

（以下价格仅供参考，具体以火山引擎官方定价为准）

| 模型 | 输入价格（元/千tokens） | 输出价格（元/千tokens） |
|------|------------------------|------------------------|
| doubao-pro-32k | 0.0008 | 0.002 |
| doubao-pro-128k | 0.001 | 0.0025 |
| doubao-pro-256k | 0.002 | 0.005 |
| doubao-lite-32k | 0.0004 | 0.001 |
| doubao-lite-128k | 0.0005 | 0.0012 |
| doubao-speed-1.5x | 0.0006 | 0.0015 |

## 最佳实践

### 1. 流式优先

对于需要实时反馈的场景（如建模过程、对话），优先使用流式调用：

```typescript
// 推荐：使用流式调用
const stream = await callAIStream(...);
for await (const chunk of stream) {
  console.log(chunk.content); // 实时输出
}
```

### 2. 请求头转发

始终使用 `HeaderUtils.extractForwardHeaders()` 提取并转发请求头，以便进行请求追踪：

```typescript
const forwardHeaders = HeaderUtils.extractForwardHeaders(requestHeaders);
const response = await client.invoke(messages, {}, undefined, forwardHeaders);
```

### 3. 错误处理

始终使用 try-catch 块处理可能的错误：

```typescript
try {
  const stream = await callAIStream(...);
  for await (const chunk of stream) {
    // 处理输出
  }
} catch (error) {
  console.error('调用失败:', error);
  // 错误处理逻辑
}
```

### 4. 模型选择

根据任务复杂度选择合适的模型：

```typescript
// 简单任务
const model = 'doubao-lite-32k';

// 中等任务（推荐）
const model = 'doubao-pro-128k';

// 复杂任务
const model = 'doubao-pro-256k';

// 高速响应
const model = 'doubao-speed-1.5x';
```

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
      'doubao-pro-128k',
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

### 前端 SSE 接收示例

```typescript
async function chatWithVolcEngine(prompt: string) {
  const response = await fetch('/api/ai-providers/chat-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      providerId: 'your-provider-id',
      messages: [
        { role: 'system', content: '你是一个数学建模专家' },
        { role: 'user', content: prompt }
      ]
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.content) {
          console.log(data.content); // 实时输出
          // 更新 UI
        }
      }
    }
  }
}
```

## 故障排查

### 问题 1: API Key 无效

**错误信息**: `Invalid API key`

**解决方案**:
1. 检查 API Key 格式是否正确（`ak-` 开头）
2. 确认 API Key 已激活
3. 检查账户余额是否充足
4. 确认应用是否已启用

### 问题 2: 连接超时

**错误信息**: `Request timeout`

**解决方案**:
1. 检查网络连接
2. 确认 API 端点地址正确
3. 增加超时时间配置
4. 检查防火墙设置

### 问题 3: 模型不存在

**错误信息**: `Model not found`

**解决方案**:
1. 检查模型名称拼写
2. 确认模型在火山引擎控制台已开通
3. 查看可用模型列表

### 问题 4: 速率限制

**错误信息**: `Rate limit exceeded`

**解决方案**:
1. 检查调用频率是否超出限制
2. 升级服务等级
3. 实现请求队列和重试机制

## 技术细节

### OpenAI 兼容性

火山引擎 Ark 服务提供 OpenAI 兼容的 API，因此可以使用：
- `coze-coding-dev-sdk` 调用
- 标准 OpenAI 客户端
- 自定义 fetch 请求

### 流式输出

火山引擎支持 Server-Sent Events (SSE) 流式输出，实现方式：
- 后端：`callAIStream` 函数
- 前端：`fetch` + `ReadableStream`
- 传输协议：`text/event-stream`

### 请求追踪

通过转发请求头，实现：
- 请求 ID 追踪
- 调试日志记录
- 性能监控

## 参考资源

- [火山引擎 Ark 官方文档](https://www.volcengine.com/docs/82379)
- [豆包大模型 API 文档](https://www.volcengine.com/docs/82379/1541595)
- [OpenAI 兼容接口说明](https://www.volcengine.com/docs/82379/1263481)
- [火山引擎控制台](https://console.volcengine.com/ark)
- [coze-coding-dev-sdk 文档](https://github.com/coze-dev/coze-coding-dev-sdk)

## 更新日志

- **2026-02-06**: 初始版本，支持 doubao-pro/lite/speed 系列 6 个模型
- 支持 OpenAI 兼容 API 调用
- 支持流式输出（SSE）
- 支持多轮对话
