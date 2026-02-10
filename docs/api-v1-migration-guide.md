# API v1 迁移指南

## 概述

本文档提供了从旧版 API 迁移到 v1 版本的详细指南。

## 版本控制策略

### URL 路径

所有 API 端点现在都需要包含版本号：

```
旧版: /api/auth/login
新版: /api/v1/auth/login
```

### 支持的版本

- **v1**: 当前稳定版本
- **v2, v3**: 未来版本（未发布）

## 迁移步骤

### 1. 更新基础 URL

在客户端代码中更新 API 基础 URL：

```typescript
// 旧版
const API_BASE_URL = '/api';

// 新版
const API_BASE_URL = '/api/v1';
```

### 2. 添加 CSRF Token 支持

对于需要 CSRF 保护的端点（登录、注册、上传等），需要：

1. **获取 CSRF Token**:
```typescript
async function getCSRFToken() {
  const response = await fetch('/api/v1/auth/csrf-token');
  const data = await response.json();
  return data.data.csrfToken;
}
```

2. **在请求头中包含 CSRF Token**:
```typescript
const csrfToken = await getCSRFToken();

const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});
```

### 3. 处理速率限制

API 现在应用速率限制，如果超过限制会收到 `429 Too Many Requests` 响应：

```typescript
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  // ...
});

if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  console.log(`请等待 ${retryAfter} 秒后重试`);
  return;
}
```

### 4. 处理 API 版本响应头

响应包含以下版本相关头：

```
X-API-Version: v1
X-API-Supported-Versions: v1, v2, v3
```

## 端点映射

### 认证端点

| 旧版路径 | 新版路径 | 说明 |
|---------|---------|------|
| `/api/auth/login` | `/api/v1/auth/login` | 用户登录 |
| `/api/auth/register` | `/api/v1/auth/register` | 用户注册 |
| `/api/auth/logout` | `/api/v1/auth/logout` | 用户登出 |
| `/api/auth/refresh` | `/api/v1/auth/refresh` | 刷新令牌 |
| `/api/auth/verify` | `/api/v1/auth/verify` | 验证令牌 |
| **新增** | `/api/v1/auth/csrf-token` | 获取 CSRF Token |

### AI Provider 端点

| 旧版路径 | 新版路径 | 说明 |
|---------|---------|------|
| `/api/ai-providers` | `/api/v1/ai-providers` | 获取 AI Provider 列表 |
| `/api/ai-providers/[id]` | `/api/v1/ai-providers/[id]` | 获取单个 AI Provider |
| `/api/ai-providers/chat-stream` | `/api/v1/ai-providers/chat-stream` | AI 聊天流 |
| `/api/ai-providers/test` | `/api/v1/ai-providers/test` | 测试 AI Provider |
| `/api/ai-providers/types` | `/api/v1/ai-providers/types` | 获取 AI Provider 类型 |
| `/api/ai/stream` | `/api/v1/ai/stream` | AI 流式输出 |

### 建模任务端点

| 旧版路径 | 新版路径 | 说明 |
|---------|---------|------|
| `/api/modeling-tasks` | `/api/v1/modeling-tasks` | 获取建模任务列表 |
| `/api/modeling-tasks/[id]` | `/api/v1/modeling-tasks/[id]` | 获取单个任务 |
| `/api/modeling-tasks/[id]/start` | `/api/v1/modeling-tasks/[id]/start` | 启动任务 |
| `/api/modeling-tasks/[id]/pause` | `/api/v1/modeling-tasks/[id]/pause` | 暂停任务 |
| `/api/modeling-tasks/[id]/logs` | `/api/v1/modeling-tasks/[id]/logs` | 获取任务日志 |

### 自动建模端点

| 旧版路径 | 新版路径 | 说明 |
|---------|---------|------|
| `/api/auto-modeling/start` | `/api/v1/auto-modeling/start` | 启动自动建模 |
| `/api/auto-modeling/tasks` | `/api/v1/auto-modeling/tasks` | 获取自动建模任务 |
| `/api/auto-modeling/[id]/status` | `/api/v1/auto-modeling/[id]/status` | 获取任务状态 |

### 其他端点

| 旧版路径 | 新版路径 | 说明 |
|---------|---------|------|
| `/api/competitions` | `/api/v1/competitions` | 竞赛列表 |
| `/api/competitions/[id]` | `/api/v1/competitions/[id]` | 单个竞赛 |
| `/api/problems` | `/api/v1/problems` | 题目列表 |
| `/api/problems/[id]` | `/api/v1/problems/[id]` | 单个题目 |
| `/api/solutions` | `/api/v1/solutions` | 解答列表 |
| `/api/solutions/[id]` | `/api/v1/solutions/[id]` | 单个解答 |
| `/api/dashboard/stats` | `/api/v1/dashboard/stats` | 仪表盘统计 |
| `/api/dashboard/activities` | `/api/v1/dashboard/activities` | 仪表盘活动 |
| `/api/cost/stats` | `/api/v1/cost/stats` | 成本统计 |
| `/api/cost/anomaly` | `/api/v1/cost/anomaly` | 成本异常 |
| `/api/user/profile` | `/api/v1/user/profile` | 用户资料 |
| `/api/learning/videos` | `/api/v1/learning/videos` | 学习视频 |
| `/api/learning/tasks` | `/api/v1/learning/tasks` | 学习任务 |

## 速率限制配置

不同端点的速率限制：

| 端点类型 | 限制 | 时间窗口 |
|---------|------|---------|
| 认证端点（登录、注册） | 5 次 | 15 分钟 |
| 通用端点 | 100 次 | 15 分钟 |
| AI 聊天 | 20 次 | 1 分钟 |
| 建模任务 | 5 次 | 1 分钟 |
| 文件上传 | 3 次 | 1 分钟 |

## 安全头

所有 API 响应包含以下安全头：

```
Content-Security-Policy: default-src 'self'...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

## 错误响应格式

### 速率限制错误

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": 1641234567890
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### CSRF Token 错误

```json
{
  "success": false,
  "error": {
    "code": "CSRF_TOKEN_INVALID",
    "message": "Invalid or missing CSRF token"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### API 版本错误

```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_API_VERSION",
    "message": "API version v99 is not supported",
    "details": {
      "supportedVersions": ["v1", "v2", "v3"],
      "documentation": "/api/docs"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 向后兼容性

### 弃用计划

- 旧版 API (`/api/*`) 将继续支持 **6 个月**
- 6 个月后，旧版 API 将被禁用
- 建议在 3 个月内完成迁移

### 弃用通知

旧版 API 响应会包含警告头：

```
X-API-Deprecated: true
X-API-Deprecation-Warning: API version is deprecated. Please migrate to v1.
```

## 示例代码

### 完整的登录流程

```typescript
async function login(email: string, password: string) {
  // 1. 获取 CSRF Token
  const csrfResponse = await fetch('/api/v1/auth/csrf-token');
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.data.csrfToken;

  // 2. 发送登录请求
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({ email, password }),
  });

  // 3. 处理响应
  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`请求过于频繁，请 ${retryAfter} 秒后重试`);
    }
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const data = await response.json();
  return data.data;
}
```

### API 客户端封装

```typescript
class ApiClient {
  private baseUrl = '/api/v1';
  private csrfToken: string | null = null;

  async getCSRFToken() {
    const response = await fetch(`${this.baseUrl}/auth/csrf-token`);
    const data = await response.json();
    this.csrfToken = data.data.csrfToken;
    return this.csrfToken;
  }

  async post(endpoint: string, body: any, requireCSRF = false) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requireCSRF && this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`请求过于频繁，请 ${retryAfter} 秒后重试`);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }
}

// 使用示例
const api = new ApiClient();
await api.getCSRFToken();
const result = await api.post('/auth/login', { email, password }, true);
```

## 支持与帮助

如有问题，请参考：
- API 文档: `/api/docs`
- 技术支持: support@cmamsys.com
- GitHub Issues: https://github.com/cmamsys/issues

---

**文档版本**: 1.0
**最后更新**: 2024-01-01
**维护者**: CMAMSys 团队
