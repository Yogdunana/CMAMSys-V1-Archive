# CMAMSys API 文档

本文档描述了 CMAMSys 后端 API 的使用方法。

---

## 目录

- [认证](#认证)
- [用户管理](#用户管理)
- [团队管理](#团队管理)
- [建模任务](#建模任务)
- [讨论管理](#讨论管理)
- [代码管理](#代码管理)
- [论文管理](#论文管理)
- [AI Provider](#ai-provider)
- [系统设置](#系统设置)

---

## 基本信息

### Base URL

```
开发环境: http://localhost:5000/api
生产环境: https://cmamsys.com/api
```

### 认证方式

所有 API 请求（除了登录和注册）都需要在请求头中包含 JWT Token：

```http
Authorization: Bearer <your_jwt_token>
X-CSRF-Token: <your_csrf_token>
```

### 响应格式

成功响应：

```json
{
  "success": true,
  "data": { ... }
}
```

错误响应：

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 认证

### 登录

```http
POST /api/v1/auth/login
Content-Type: application/json
```

**请求体**：

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "username",
      "email": "user@example.com",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### 刷新 Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

**请求体**：

```json
{
  "refreshToken": "your_refresh_token"
}
```

### 登出

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

### 注册

```http
POST /api/v1/auth/register
Content-Type: application/json
```

**请求体**：

```json
{
  "username": "new_user",
  "email": "new_user@example.com",
  "password": "your_password"
}
```

---

## 用户管理

### 获取当前用户信息

```http
GET /api/v1/users/me
Authorization: Bearer <access_token>
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "username": "username",
    "email": "user@example.com",
    "role": "USER",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 更新用户信息

```http
PUT /api/v1/users/me
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "username": "new_username",
  "email": "new_email@example.com"
}
```

### 修改密码

```http
POST /api/v1/users/me/change-password
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "currentPassword": "current_password",
  "newPassword": "new_password"
}
```

### 获取用户列表（管理员）

```http
GET /api/v1/users?page=1&limit=20
Authorization: Bearer <access_token>
```

---

## 团队管理

### 创建团队

```http
POST /api/v1/teams
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "name": "My Team",
  "description": "Team description",
  "isPublic": false
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "team_123",
    "name": "My Team",
    "description": "Team description",
    "ownerId": "user_123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 获取团队列表

```http
GET /api/v1/teams
Authorization: Bearer <access_token>
```

### 邀请成员

```http
POST /api/v1/teams/:teamId/members/invite
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "email": "invitee@example.com",
  "role": "MEMBER"
}
```

### 获取团队成员

```http
GET /api/v1/teams/:teamId/members
Authorization: Bearer <access_token>
```

### 移除成员

```http
DELETE /api/v1/teams/:teamId/members/:memberId
Authorization: Bearer <access_token>
```

---

## 建模任务

### 创建任务

```http
POST /api/v1/tasks
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "name": "Math Modeling Task 2024",
  "description": "Task description",
  "competitionType": "MCM",
  "deadline": "2024-02-15T23:59:59Z",
  "teamId": "team_123",
  "providerId": "provider_123"
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "task_123",
    "name": "Math Modeling Task 2024",
    "status": "PENDING",
    "progress": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 获取任务列表

```http
GET /api/v1/tasks?status=IN_PROGRESS&page=1&limit=20
Authorization: Bearer <access_token>
```

**查询参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | PENDING, IN_PROGRESS, COMPLETED, FAILED |
| teamId | string | 团队 ID |
| page | number | 页码 |
| limit | number | 每页数量 |

### 获取任务详情

```http
GET /api/v1/tasks/:taskId
Authorization: Bearer <access_token>
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "task_123",
    "name": "Math Modeling Task 2024",
    "description": "Task description",
    "status": "IN_PROGRESS",
    "progress": 45,
    "competitionType": "MCM",
    "deadline": "2024-02-15T23:59:59Z",
    "teamId": "team_123",
    "providerId": "provider_123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 启动任务

```http
POST /api/v1/tasks/:taskId/start
Authorization: Bearer <access_token>
```

### 暂停任务

```http
POST /api/v1/tasks/:taskId/pause
Authorization: Bearer <access_token>
```

### 停止任务

```http
POST /api/v1/tasks/:taskId/stop
Authorization: Bearer <access_token>
```

### 删除任务

```http
DELETE /api/v1/tasks/:taskId
Authorization: Bearer <access_token>
```

---

## 讨论管理

### 获取讨论列表

```http
GET /api/v1/tasks/:taskId/discussions
Authorization: Bearer <access_token>
```

### 获取讨论详情

```http
GET /api/v1/discussions/:discussionId
Authorization: Bearer <access_token>
```

### 获取讨论消息

```http
GET /api/v1/discussions/:discussionId/messages?page=1&limit=50
Authorization: Bearer <access_token>
```

### 添加消息

```http
POST /api/v1/discussions/:discussionId/messages
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "content": "Your message",
  "sender": "USER"
}
```

---

## 代码管理

### 获取代码列表

```http
GET /api/v1/tasks/:taskId/codes
Authorization: Bearer <access_token>
```

### 获取代码详情

```http
GET /api/v1/codes/:codeId
Authorization: Bearer <access_token>
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "code_123",
    "code": "import pandas as pd\n...",
    "language": "python",
    "status": "VALID",
    "validationResult": {
      "syntaxValid": true,
      "executionValid": true,
      "errors": []
    }
  }
}
```

### 重新验证代码

```http
POST /api/v1/codes/:codeId/validate
Authorization: Bearer <access_token>
```

### 下载代码

```http
GET /api/v1/codes/:codeId/download
Authorization: Bearer <access_token>
```

---

## 论文管理

### 获取论文列表

```http
GET /api/v1/tasks/:taskId/papers
Authorization: Bearer <access_token>
```

### 获取论文详情

```http
GET /api/v1/papers/:paperId
Authorization: Bearer <access_token>
```

### 更新论文内容

```http
PUT /api/v1/papers/:paperId
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "content": "<h1>Paper Title</h1>..."
}
```

### 创建新版本

```http
POST /api/v1/papers/:paperId/versions
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "tag": "Final Version",
  "comment": "Final submission"
}
```

### 获取版本列表

```http
GET /api/v1/papers/:paperId/versions
Authorization: Bearer <access_token>
```

### 导出论文

```http
POST /api/v1/papers/:paperId/export
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "format": "pdf"
}
```

**支持的格式**：`pdf`, `docx`

### 优化论文

```http
POST /api/v1/papers/:paperId/optimize
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "providerId": "provider_123",
  "prompt": "Improve the introduction section"
}
```

---

## AI Provider

### 获取 Provider 列表

```http
GET /api/v1/providers
Authorization: Bearer <access_token>
```

### 添加 Provider

```http
POST /api/v1/providers
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "name": "DeepSeek",
  "type": "DEEPSEEK",
  "apiKey": "your_api_key",
  "endpoint": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "priority": 1
}
```

### 更新 Provider

```http
PUT /api/v1/providers/:providerId
Authorization: Bearer <access_token>
Content-Type: application/json
```

### 删除 Provider

```http
DELETE /api/v1/providers/:providerId
Authorization: Bearer <access_token>
```

### 测试 Provider 连接

```http
POST /api/v1/providers/:providerId/test
Authorization: Bearer <access_token>
```

---

## 系统设置

### 获取系统配置

```http
GET /api/v1/settings
Authorization: Bearer <access_token>
```

### 更新系统配置（管理员）

```http
PUT /api/v1/settings
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：

```json
{
  "maxFileSize": 10485760,
  "allowedFileTypes": [".pdf", ".docx"],
  "enableRegistration": true
}
```

### 获取健康状态

```http
GET /api/v1/health
```

**响应**：

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2024-01-01T00:00:00Z",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "ai": "healthy"
    }
  }
}
```

---

## 错误代码

| 代码 | 说明 |
|------|------|
| `UNAUTHORIZED` | 未认证或 Token 无效 |
| `FORBIDDEN` | 无权限访问 |
| `NOT_FOUND` | 资源不存在 |
| `VALIDATION_ERROR` | 请求参数验证失败 |
| `RATE_LIMIT_EXCEEDED` | 超过速率限制 |
| `AI_PROVIDER_ERROR` | AI Provider 调用失败 |
| `TASK_ALREADY_RUNNING` | 任务已在运行中 |
| `INSUFFICIENT_CREDITS` | AI 消耗余额不足 |

---

## 速率限制

| 端点类型 | 限制 |
|----------|------|
| 认证端点 | 5 次/分钟 |
| 普通 API | 60 次/分钟 |
| 管理员 API | 120 次/分钟 |

超过限制会返回 `429 Too Many Requests` 状态码。

---

## WebSocket（实时通信）

### 连接

```javascript
const ws = new WebSocket('wss://cmamsys.com/api/ws');

// 认证
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your_jwt_token'
}));
```

### 事件类型

| 事件 | 说明 |
|------|------|
| `task.progress` | 任务进度更新 |
| `discussion.message` | 新讨论消息 |
| `code.generated` | 代码生成完成 |
| `paper.updated` | 论文更新 |
| `notification` | 系统通知 |

### 示例

```javascript
// 监听任务进度
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'task.progress') {
    console.log('任务进度:', data.progress);
  }
});
```

---

## SDK 和客户端库

### JavaScript/TypeScript

```bash
npm install @cmamsys/sdk
```

```typescript
import { CMAMSysClient } from '@cmamsys/sdk';

const client = new CMAMSysClient({
  baseUrl: 'https://cmamsys.com/api',
  token: 'your_jwt_token'
});

// 创建任务
const task = await client.tasks.create({
  name: 'My Task',
  description: 'Task description'
});

// 获取任务列表
const tasks = await client.tasks.list({ status: 'IN_PROGRESS' });
```

### Python

```bash
pip install cmamsys-sdk
```

```python
from cmamsys import CMAMSysClient

client = CMAMSysClient(
    base_url='https://cmamsys.com/api',
    token='your_jwt_token'
)

# 创建任务
task = client.tasks.create(
    name='My Task',
    description='Task description'
)

# 获取任务列表
tasks = client.tasks.list(status='IN_PROGRESS')
```

---

## 获取帮助

- 📧 Email: support@cmamsys.com
- 📝 Issue: https://github.com/Yogdunana/CMAMSys/issues
- 💬 Discord: https://discord.gg/cmamsys
