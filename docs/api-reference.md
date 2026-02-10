# CMAMSys API Documentation

CMAMSys 提供完整的 REST API 用于集成和自动化操作。

## 📋 目录

- [API 概览](#api-概览)
- [认证](#认证)
- [API 端点](#api-端点)
- [响应格式](#响应格式)
- [错误码](#错误码)
- [OpenAPI 规范](#openapi-规范)

---

## API 概览

### 基础信息

- **Base URL**: `http://localhost:5000/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### API 版本

当前版本：`v2.0.0`

---

## 认证

### JWT Token 认证

所有受保护的 API 都需要在请求头中包含 JWT Token：

```bash
Authorization: Bearer <your-access-token>
```

### 获取 Token

#### 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "USER"
    }
  }
}
```

#### 刷新 Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## API 端点

### 认证 API (`/api/auth`)

| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| POST | `/register` | 用户注册 | ❌ |
| POST | `/login` | 用户登录 | ❌ |
| POST | `/refresh` | 刷新 Token | ❌ |
| POST | `/logout` | 用户登出 | ✅ |
| GET | `/verify` | 验证 Token | ✅ |

### AI Provider API (`/api/ai-providers`)

| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/` | 获取 AI Providers 列表 | ✅ |
| POST | `/` | 创建 AI Provider | ✅ |
| GET | `/[id]` | 获取 Provider 详情 | ✅ |
| PUT | `/[id]` | 更新 Provider | ✅ |
| DELETE | `/[id]` | 删除 Provider | ✅ |
| POST | `/test` | 测试 Provider 连接 | ✅ |
| POST | `/chat` | 非流式聊天 | ✅ |
| POST | `/chat-stream` | 流式聊天 (SSE) | ✅ |

### 建模任务 API (`/api/modeling`)

| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/tasks` | 获取任务列表 | ✅ |
| POST | `/tasks` | 创建任务 | ✅ |
| GET | `/tasks/[id]` | 获取任务详情 | ✅ |
| PUT | `/tasks/[id]` | 更新任务 | ✅ |
| DELETE | `/tasks/[id]` | 删除任务 | ✅ |
| POST | `/tasks/[id]/start` | 启动任务 | ✅ |
| POST | `/tasks/[id]/stop` | 停止任务 | ✅ |

### 学习模块 API (`/api/learning`)

| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/knowledge` | 获取知识库 | ✅ |
| POST | `/videos/extract` | 从视频提取知识 | ✅ |
| POST | `/materials/upload` | 上传学习材料 | ✅ |
| GET | `/schedule` | 获取学习计划 | ✅ |
| PUT | `/schedule` | 更新学习计划 | ✅ |

### 用户 API (`/api/user`)

| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/profile` | 获取用户资料 | ✅ |
| PUT | `/profile` | 更新用户资料 | ✅ |
| POST | `/profile/avatar` | 上传头像 | ✅ |
| PUT | `/password` | 修改密码 | ✅ |

### 设置 API (`/api/settings`)

| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/system` | 获取系统设置 | ✅ (Admin) |
| PUT | `/system` | 更新系统设置 | ✅ (Admin) |
| GET | `/database` | 获取数据库配置 | ✅ (Admin) |
| PUT | `/database` | 更新数据库配置 | ✅ (Admin) |

---

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message description"
  }
}
```

### SSE 流式响应

```
data: {"content": "Hello"}

data: {"content": " World"}

data: {"content": "!", "done": true}
```

---

## 错误码

| 错误码 | 描述 | HTTP 状态码 |
|--------|------|-------------|
| `INVALID_CREDENTIALS` | 无效的凭据 | 401 |
| `TOKEN_EXPIRED` | Token 已过期 | 401 |
| `UNAUTHORIZED` | 未授权 | 401 |
| `FORBIDDEN` | 权限不足 | 403 |
| `NOT_FOUND` | 资源不存在 | 404 |
| `VALIDATION_ERROR` | 验证错误 | 400 |
| `EMAIL_ALREADY_EXISTS` | 邮箱已存在 | 409 |
| `INTERNAL_ERROR` | 内部服务器错误 | 500 |
| `AI_PROVIDER_ERROR` | AI Provider 错误 | 502 |
| `DATABASE_ERROR` | 数据库错误 | 500 |

---

## OpenAPI 规范

```yaml
openapi: 3.0.0
info:
  title: CMAMSys API
  version: 2.0.0
  description: CMAMSys REST API Documentation
  contact:
    name: CMAMSys Support
    email: support@cmamsys.com

servers:
  - url: http://localhost:5000/api
    description: Local development server
  - url: https://api.cmamsys.com
    description: Production server

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
          format: email
        username:
          type: string
        role:
          type: string
          enum: [ADMIN, TEAM_LEAD, TEAM_MEMBER, USER]
        isVerified:
          type: boolean
      required:
        - id
        - email
        - username

    AIProvider:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        type:
          type: string
          enum: [ALIYUN, VOLCENGINE, DEEPSEEK, OPENAI, ANTHROPIC]
        apiKey:
          type: string
        status:
          type: string
          enum: [ACTIVE, INACTIVE, ERROR]
        priority:
          type: integer
        isDefault:
          type: boolean
      required:
        - id
        - name
        - type

    Message:
      type: object
      properties:
        role:
          type: string
          enum: [system, user, assistant]
        content:
          type: string

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
      required:
        - success
        - error

paths:
  /auth/login:
    post:
      tags:
        - Authentication
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
              required:
                - email
                - password
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      accessToken:
                        type: string
                      refreshToken:
                        type: string
                      expiresIn:
                        type: integer
                      user:
                        $ref: '#/components/schemas/User'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /ai-providers:
    get:
      tags:
        - AI Providers
      summary: Get all AI providers
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of AI providers
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/AIProvider'

    post:
      tags:
        - AI Providers
      summary: Create new AI provider
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                type:
                  type: string
                  enum: [ALIYUN, VOLCENGINE, DEEPSEEK, OPENAI, ANTHROPIC]
                apiKey:
                  type: string
                priority:
                  type: integer
                isDefault:
                  type: boolean
              required:
                - name
                - type
                - apiKey
      responses:
        '201':
          description: AI provider created
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/AIProvider'

  /ai-providers/chat:
    post:
      tags:
        - AI Providers
      summary: Chat with AI provider (non-streaming)
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                providerId:
                  type: string
                model:
                  type: string
                messages:
                  type: array
                  items:
                    $ref: '#/components/schemas/Message'
              required:
                - providerId
                - model
                - messages
      responses:
        '200':
          description: Chat response
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      content:
                        type: string
                      usage:
                        type: object
                        properties:
                          totalTokens:
                            type: integer
                          promptTokens:
                            type: integer
                          completionTokens:
                            type: integer

  /ai-providers/chat-stream:
    post:
      tags:
        - AI Providers
      summary: Chat with AI provider (streaming)
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                providerId:
                  type: string
                model:
                  type: string
                messages:
                  type: array
                  items:
                    $ref: '#/components/schemas/Message'
              required:
                - providerId
                - model
                - messages
      responses:
        '200':
          description: Streaming response (SSE)
          content:
            text/event-stream:
              schema:
                type: string
                example: |
                  data: {"content": "Hello"}

                  data: {"content": " World"}

                  data: {"content": "!", "done": true}

  /modeling/tasks:
    get:
      tags:
        - Modeling Tasks
      summary: Get all modeling tasks
      security:
        - BearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [PENDING, RUNNING, COMPLETED, FAILED]
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: List of tasks
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        name:
                          type: string
                        status:
                          type: string
                        progress:
                          type: integer
                        createdAt:
                          type: string
                          format: date-time

    post:
      tags:
        - Modeling Tasks
      summary: Create new modeling task
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                competitionId:
                  type: string
                problemId:
                  type: string
                description:
                  type: string
              required:
                - competitionId
                - problemId
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      id:
                        type: string
                      name:
                        type: string
                      status:
                        type: string

  /learning/knowledge:
    get:
      tags:
        - Learning Module
      summary: Get knowledge base
      security:
        - BearerAuth: []
      parameters:
        - name: competitionId
          in: query
          schema:
            type: string
        - name: topic
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Knowledge base entries
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        title:
                          type: string
                        content:
                          type: string
                        tags:
                          type: array
                          items:
                            type: string

  /user/profile:
    get:
      tags:
        - User
      summary: Get user profile
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/User'

    put:
      tags:
        - User
      summary: Update user profile
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                bio:
                  type: string
                organization:
                  type: string
      responses:
        '200':
          description: Profile updated
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/User'
```

---

## 使用示例

### 使用 cURL

```bash
# 登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 获取 AI Providers
curl -X GET http://localhost:5000/api/ai-providers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 创建 AI Provider
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"VolcEngine","type":"VOLCENGINE","apiKey":"your-api-key"}'

# 非流式聊天
curl -X POST http://localhost:5000/api/ai-providers/chat \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"providerId":"provider-123","model":"doubao-pro-128k","messages":[{"role":"user","content":"Hello"}]}'

# 流式聊天
curl -N -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"providerId":"provider-123","model":"doubao-pro-128k","messages":[{"role":"user","content":"Hello"}]}'
```

### 使用 JavaScript (Fetch)

```javascript
// 登录
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});
const { data: { accessToken } } = await loginResponse.json();

// 获取 AI Providers
const providersResponse = await fetch('http://localhost:5000/api/ai-providers', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
const providers = await providersResponse.json();

// 流式聊天
const streamResponse = await fetch('http://localhost:5000/api/ai-providers/chat-stream', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    providerId: 'provider-123',
    model: 'doubao-pro-128k',
    messages: [{ role: 'user', content: 'Hello' }],
  }),
});

const reader = streamResponse.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log(data.content);
    }
  }
}
```

### 使用 Python (requests)

```python
import requests

# 登录
login_response = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'user@example.com',
    'password': 'password123',
})
access_token = login_response.json()['data']['accessToken']

# 获取 AI Providers
headers = {'Authorization': f'Bearer {access_token}'}
providers_response = requests.get('http://localhost:5000/api/ai-providers', headers=headers)
providers = providers_response.json()

# 非流式聊天
chat_response = requests.post('http://localhost:5000/api/ai-providers/chat', 
    headers=headers,
    json={
        'providerId': 'provider-123',
        'model': 'doubao-pro-128k',
        'messages': [{'role': 'user', 'content': 'Hello'}]
    }
)
print(chat_response.json()['data']['content'])

# 流式聊天
import sseclient

stream_response = requests.post('http://localhost:5000/api/ai-providers/chat-stream',
    headers=headers,
    json={
        'providerId': 'provider-123',
        'model': 'doubao-pro-128k',
        'messages': [{'role': 'user', 'content': 'Hello'}]
    },
    stream=True
)

client = sseclient.SSEClient(stream_response)
for event in client.events():
    data = json.loads(event.data)
    print(data.get('content', ''), end='', flush=True)
```

---

## 速率限制

API 速率限制：每 IP 每分钟最多 10 个请求。

**响应头**：

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1609459200
```

---

**最后更新：2026-02-08**
