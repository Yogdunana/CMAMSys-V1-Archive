# CMAMSys 架构图和流程图

本文档包含 CMAMSys 系统的架构图和关键流程图，帮助开发者更好地理解系统设计和数据流向。

## 📋 目录

- [系统架构图](#系统架构图)
- [数据流向图](#数据流向图)
- [认证流程](#认证流程)
- [AI Provider 调用流程](#ai-provider-调用流程)
- [建模任务流程](#建模任务流程)
- [学习模块流程](#学习模块流程)
- [数据库架构图](#数据库架构图)
- [部署架构图](#部署架构图)

---

## 系统架构图

### 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                           客户端层 (Client)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Web 浏览器│  │ 移动应用  │  │ API 客户端│  │ 第三方集成│            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────────┐
│                         前端层 (Next.js 16)                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   App Router & Pages                           │   │
│  │  Dashboard  |  Settings  |  Modeling  |  Learning  |  Auth    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   React Components                            │   │
│  │  UI Components  |  Shared Components  |  Feature Components  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   State Management                            │   │
│  │  Context API  |  React Hooks  |  Local Storage  |  Session    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓ HTTP/REST/SSE
┌─────────────────────────────────────────────────────────────────────┐
│                         API 层 (Next.js API Routes)                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Authentication API  │  AI Provider API  │  Modeling API      │   │
│  │  - login/logout      │  - chat          │  - tasks            │   │
│  │  - register          │  - stream        │  - execute          │   │
│  │  - refresh/verify    │  - test          │  - report           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Learning API      │  Settings API      │  User API           │   │
│  │  - knowledge        │  - system         │  - profile          │   │
│  │  - videos/extract   │  - database       │  - preferences      │   │
│  │  - materials/upload │  - providers      │  - teams            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓ Service Calls
┌─────────────────────────────────────────────────────────────────────┐
│                         服务层 (Services)                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  AuthService       │  AIProviderService │  ModelingService   │   │
│  │  - JWT 管理         │  - AI 调用         │  - 任务管理         │   │
│  │  - Token 刷新       │  - 流式输出        │  - 流程编排         │   │
│  │  - 密码加密         │  - 错误处理        │  - 报告生成         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  LearningService   │  DatabaseService    │  CacheService      │   │
│  │  - Bilibili 集成    │  - Prisma ORM       │  - Redis 缓存       │   │
│  │  - 知识提取         │  - 查询优化        │  - 会话存储         │   │
│  │  - 定时任务         │  - 事务处理        │  - 性能优化         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         数据层 (Data Layer)                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL 数据库                          │   │
│  │  Users  |  AIProviders  |  ModelingTasks  |  Knowledge        │   │
│  │  Teams  |  Competitions |  Reports        |  Discussions       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    对象存储 (MinIO/S3)                        │   │
│  │  上传文件  |  生成的报告  |  用户附件  |  视频文件             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    缓存层 (Redis - 可选)                      │   │
│  │  Session  |  API Cache  |  Rate Limiting  |  Pub/Sub          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         外部服务 (External Services)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ 阿里云百炼│  │火山引擎  │  │ DeepSeek │  │ Bilibili │           │
│  │   API    │  │   API    │  │   API    │  │   API    │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│  ┌──────────┐  ┌──────────┐                                       │
│  │ SMTP     │  │ OAuth2   │                                       │
│  │  邮件服务│  │  提供商   │                                       │
│  └──────────┘  └──────────┘                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 模块架构

```
CMAMSys/
│
├── 前端模块 (Frontend)
│   ├── 页面层 (Pages)
│   │   ├── Dashboard          - 仪表盘
│   │   ├── Auth               - 认证页面
│   │   ├── Settings           - 设置页面
│   │   ├── Modeling           - 建模页面
│   │   └── Learning           - 学习页面
│   │
│   ├── 组件层 (Components)
│   │   ├── UI Components      - shadcn/ui 组件
│   │   ├── Feature Components - 功能组件
│   │   └── Layout Components  - 布局组件
│   │
│   └── 状态层 (State)
│       ├── Contexts           - React Context
│       ├── Hooks              - 自定义 Hooks
│       └── Stores             - 本地存储
│
├── 后端模块 (Backend)
│   ├── API 层 (API Routes)
│   │   ├── Auth API           - 认证 API
│   │   ├── AI Provider API    - AI Provider API
│   │   ├── Modeling API       - 建模 API
│   │   ├── Learning API       - 学习 API
│   │   ├── Settings API       - 设置 API
│   │   └── User API           - 用户 API
│   │
│   ├── 服务层 (Services)
│   │   ├── AuthService        - 认证服务
│   │   ├── AIProviderService  - AI Provider 服务
│   │   ├── ModelingService    - 建模服务
│   │   ├── LearningService    - 学习服务
│   │   └── DatabaseService    - 数据库服务
│   │
│   └── 工具层 (Utils)
│       ├── Validators         - 验证器
│       ├── Helpers            - 助手函数
│       └── Constants          - 常量
│
├── 数据层 (Data)
│   ├── Database               - PostgreSQL
│   ├── Object Storage         - MinIO/S3
│   └── Cache                  - Redis
│
└── 基础设施 (Infrastructure)
    ├── Docker                 - 容器化
    ├── Nginx                  - 反向代理
    └── Monitoring             - 监控告警
```

---

## 数据流向图

### 用户请求流程

```
用户浏览器
    ↓
    [1] 发起 HTTP 请求
    ↓
Next.js 前端层
    ↓
    [2] 验证用户身份 (JWT Token)
    ↓
    [3] 渲染页面组件
    ↓
    [4] 发起 API 请求
    ↓
Next.js API 层
    ↓
    [5] 验证请求头和权限
    ↓
服务层
    ↓
    [6] 执行业务逻辑
    ↓
数据层
    ↓
    [7] 查询/更新数据库
    ↓
    [8] 返回数据
    ↓
服务层
    ↓
    [9] 处理数据
    ↓
API 层
    ↓
    [10] 返回 JSON 响应
    ↓
前端层
    ↓
    [11] 更新 UI
    ↓
用户浏览器
```

### AI 调用数据流

```
用户输入 Prompt
    ↓
前端层
    ↓
[1] 发送 POST /api/ai-providers/chat-stream
    ↓
API 层
    ↓
[2] 验证用户身份和权限
    ↓
[3] 获取 AI Provider 配置
    ↓
服务层
    ↓
[4] 解密 API Key
    ↓
[5] 映射模型名称（如：doubao-pro-128k → ep-xxx）
    ↓
[6] 构建 AI 请求
    ↓
[7] 调用外部 AI 服务
    ↓
外部 AI 服务
    ↓
[8] 流式返回响应 (SSE)
    ↓
服务层
    ↓
[9] 处理流式数据
    ↓
[10] 转换为 SSE 格式
    ↓
API 层
    ↓
[11] 返回 SSE 流
    ↓
前端层
    ↓
[12] 逐块接收并渲染
    ↓
用户看到打字机效果
```

---

## 认证流程

### 用户登录流程

```
用户
    ↓
[1] 输入邮箱和密码
    ↓
前端: /auth/login
    ↓
[2] 发送 POST /api/auth/login
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ↓
API: /api/auth/login
    ↓
[3] 验证请求格式
    ↓
服务层: AuthService.login()
    ↓
[4] 查询用户
    ↓
[5] 验证密码 (BCrypt)
    ↓
[6] 生成 Access Token (JWT, 15分钟)
    ↓
[7] 生成 Refresh Token (JWT, 7天)
    ↓
[8] 存储 Refresh Token 到数据库
    ↓
[9] 返回响应
    {
      "success": true,
      "data": {
        "accessToken": "eyJhbGci...",
        "refreshToken": "eyJhbGci...",
        "user": { ... }
      }
    }
    ↓
前端
    ↓
[10] 存储 Tokens 到 localStorage
    ↓
[11] 重定向到 Dashboard
    ↓
用户已登录
```

### Token 自动刷新流程

```
前端组件
    ↓
[1] 检测到 Access Token 即将过期 (剩余 1 分钟)
    ↓
[2] 自动调用刷新逻辑
    ↓
发送 POST /api/auth/refresh
{
  "refreshToken": "eyJhbGci..."
}
    ↓
API: /api/auth/refresh
    ↓
[3] 验证 Refresh Token
    ↓
服务层: AuthService.refreshToken()
    ↓
[4] 查询数据库中的 Refresh Token
    ↓
[5] 验证 Token 有效性
    ↓
[6] 生成新的 Access Token
    ↓
[7] 生成新的 Refresh Token
    ↓
[8] 更新数据库中的 Refresh Token
    ↓
[9] 返回新的 Tokens
    ↓
前端
    ↓
[10] 更新 localStorage 中的 Tokens
    ↓
[11] 继续正常使用
```

### 用户登出流程

```
用户
    ↓
[1] 点击"退出登录"
    ↓
前端
    ↓
[2] 清除 localStorage 中的数据
    ↓
[3] 调用 POST /api/auth/logout
    ↓
API: /api/auth/logout
    ↓
服务层: AuthService.logout()
    ↓
[4] 验证 Access Token
    ↓
[5] 删除数据库中的所有 Refresh Tokens
    ↓
[6] 返回成功响应
    ↓
前端
    ↓
[7] 重定向到登录页
    ↓
用户已登出
```

---

## AI Provider 调用流程

### 非流式调用流程

```
用户输入
    ↓
前端
    ↓
[1] POST /api/ai-providers/chat
{
  "providerId": "provider-123",
  "model": "doubao-pro-128k",
  "messages": [...]
}
    ↓
API: /api/ai-providers/chat
    ↓
[2] 验证用户身份
    ↓
[3] 获取 AI Provider 配置
    ↓
服务层: AIProviderService.call()
    ↓
[4] 解密 API Key
    ↓
[5] 映射模型名称（如：doubao-pro-128k → ep-xxx）
    ↓
[6] 构建请求
    ↓
[7] 调用外部 AI API
    ↓
外部 AI 服务
    ↓
[8] 返回完整响应
    ↓
服务层
    ↓
[9] 解析响应
    ↓
[10] 记录 Token 使用情况
    ↓
[11] 返回结果
    ↓
API
    ↓
[12] 返回 JSON 响应
    ↓
前端
    ↓
[13] 显示结果
```

### 流式调用流程

```
用户输入
    ↓
前端
    ↓
[1] POST /api/ai-providers/chat-stream
{
  "providerId": "provider-123",
  "model": "doubao-pro-128k",
  "messages": [...]
}
    ↓
API: /api/ai-providers/chat-stream
    ↓
[2] 验证用户身份
    ↓
[3] 设置 SSE 响应头
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
    ↓
服务层: AIProviderService.callStream()
    ↓
[4] 解密 API Key
    ↓
[5] 映射模型名称
    ↓
[6] 构建请求 (stream: true)
    ↓
[7] 调用外部 AI API
    ↓
外部 AI 服务
    ↓
[8] 流式返回数据块 (chunks)
    ↓
服务层
    ↓
[9] 逐块处理数据
    ↓
[10] 转换为 SSE 格式
data: {"content": "..."}
    ↓
[11] 通过 SSE 推送给前端
    ↓
前端
    ↓
[12] 使用 ReadableStream 接收
    ↓
[13] 逐块渲染（打字机效果）
    ↓
用户看到实时生成
```

---

## 建模任务流程

### 完整建模流程

```
用户创建建模任务
    ↓
[1] POST /api/modeling/tasks
{
  "competitionId": "comp-123",
  "problemId": "A",
  "description": "..."
}
    ↓
API: /api/modeling/tasks
    ↓
服务层: ModelingService.createTask()
    ↓
[2] 创建任务记录（状态: PENDING）
    ↓
[3] 返回任务 ID
    ↓
任务启动
    ↓
[4] 更新状态为 RUNNING
    ↓
阶段 1: 数据预处理
    ↓
    [4.1] 上传数据文件
    ↓
    [4.2] 数据清洗
    ↓
    [4.3] 特征工程
    ↓
阶段 2: 模型选择
    ↓
    [5.1] AI 分析问题类型
    ↓
    [5.2] 推荐适合的算法
    ↓
    [5.3] 用户选择算法
    ↓
阶段 3: 模型训练
    ↓
    [6.1] 准备训练数据
    ↓
    [6.2] 训练模型
    ↓
    [6.3] 评估模型性能
    ↓
阶段 4: 结果分析
    ↓
    [7.1] 生成可视化图表
    ↓
    [7.2] 计算评估指标
    ↓
    [7.3] 模型解释
    ↓
阶段 5: 报告生成
    ↓
    [8.1] 生成 Markdown 报告
    ↓
    [8.2] 添加数学公式
    ↓
    [8.3] 生成图表
    ↓
    [8.4] 导出 PDF
    ↓
[9] 更新状态为 COMPLETED
    ↓
[10] 返回结果
    ↓
用户查看结果
```

### 自动化建模流程（AI 驱动）

```
用户上传问题描述
    ↓
[1] AI 分析问题
    ↓
[2] 识别问题类型
    (分类 / 回归 / 优化 / 预测)
    ↓
[3] 推荐算法
    ↓
[4] 自动选择模型
    ↓
[5] 自动训练
    ↓
[6] 自动评估
    ↓
[7] 自动生成报告
    ↓
用户查看自动化结果
```

---

## 学习模块流程

### Bilibili 知识提取流程

```
用户添加 Bilibili 视频
    ↓
[1] POST /api/learning/videos/extract
{
  "videoUrl": "https://www.bilibili.com/video/BV123456",
  "competitionId": "comp-123"
}
    ↓
API: /api/learning/videos/extract
    ↓
服务层: LearningService.extractFromBilibili()
    ↓
[2] 获取视频信息
    ↓
[3] 获取视频字幕
    ↓
[4] 调用 AI 提取知识点
    ↓
AI Provider
    ↓
[5] 分析字幕内容
    ↓
[6] 提取关键知识点
    ↓
[7] 分类知识点
    ↓
[8] 存储到知识库
    ↓
[9] 返回提取结果
    ↓
用户查看知识点
```

### 学习材料处理流程

```
用户上传学习材料
    ↓
[1] 选择文件类型
    (PDF / 视频 / 文档)
    ↓
[2] POST /api/learning/materials/upload
    ↓
API: /api/learning/materials/upload
    ↓
[3] 验证文件类型
    ↓
[4] 上传到对象存储
    ↓
[5] 根据类型处理
    ↓
    ├─ PDF: 提取文本
    ↓
    ├─ 视频: 提取字幕
    ↓
    └─ 文档: 直接读取
    ↓
[6] AI 分析内容
    ↓
[7] 提取知识点
    ↓
[8] 分类存储
    ↓
[9] 添加到知识库
    ↓
用户可以搜索和使用
```

---

## 数据库架构图

### 主要数据表关系

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │ AIProvider      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ userId (FK)     │
│ email           │ 1:N   │ id (PK)         │
│ username        │       │ name            │
│ passwordHash    │       │ type            │
│ role            │       │ apiKey (加密)   │
│ isVerified      │       │ status          │
│ createdAt       │       │ priority        │
│ updatedAt       │       │ isDefault       │
└────────┬────────┘       └─────────────────┘
         │ 1:N
         │
┌────────▼────────┐       ┌─────────────────┐
│ ModelingTask    │       │ Competition     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ userId (FK)     │◄──────│ competitionId   │
│ competitionId   │ N:1   │ name            │
│ (FK)            │       │ type            │
│ name            │       │ year            │
│ status          │       │ startDate       │
│ progress        │       │ endDate         │
│ createdAt       │       └─────────────────┘
│ updatedAt       │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────┐
│ GeneratedPaper  │
├─────────────────┤
│ id (PK)         │
│ taskId (FK)     │
│ content         │
│ format          │
│ createdAt       │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│ Discussion      │       │ DiscussionMsg   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ discussionId(FK)│
│ taskId (FK)     │ 1:N   │ id (PK)         │
│ title           │       │ role            │
│ createdAt       │       │ content         │
└─────────────────┘       │ timestamp       │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│ Knowledge       │       │ CostControl     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ sourceType      │       │ userId (FK)     │
│ sourceId        │       │ dailyLimit      │
│ competitionId   │       │ monthlyLimit    │
│ (FK)            │       │ providerId (FK) │
│ title           │       │ alertThreshold  │
│ content         │       └─────────────────┘
│ tags            │
│ createdAt       │
└─────────────────┘
```

### 数据表说明

| 表名 | 用途 | 主要字段 |
|------|------|---------|
| `User` | 用户信息 | id, email, username, passwordHash, role |
| `AIProvider` | AI Provider 配置 | id, userId, name, type, apiKey, status |
| `Competition` | 竞赛信息 | id, name, type, year, startDate, endDate |
| `ModelingTask` | 建模任务 | id, userId, competitionId, status, progress |
| `GeneratedPaper` | 生成的报告 | id, taskId, content, format |
| `Discussion` | 群聊讨论 | id, taskId, title |
| `DiscussionMessage` | 讨论消息 | id, discussionId, role, content |
| `Knowledge` | 知识库 | id, sourceType, sourceId, title, content |
| `CostControl` | 成本控制 | id, userId, dailyLimit, monthlyLimit |

---

## 部署架构图

### Docker Compose 部署架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Docker Host                                  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Nginx (反向代理)                            │  │
│  │  - HTTPS 终止                                                  │  │
│  │  - 负载均衡                                                    │  │
│  │  - 静态文件服务                                                │  │
│  │  Port: 80, 443                                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Next.js App (Web 应用)                            │  │
│  │  - 前端渲染                                                    │  │
│  │  - API 服务                                                    │  │
│  │  Port: 3000                                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ PostgreSQL       │  │ Redis (可选)     │  │ MinIO (可选)     │  │
│  │ - 数据库         │  │ - 缓存           │  │ - 对象存储       │  │
│  │ - Port: 5432     │  │ - Port: 6379     │  │ - Port: 9000     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Docker Networks                                  │  │
│  │  - cmamsys-network (内部网络)                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Docker Volumes                                   │  │
│  │  - postgres_data (数据库数据)                                  │  │
│  │  - redis_data (缓存数据)                                      │  │
│  │  - minio_data (对象存储数据)                                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                    外部网络 (Internet)
                              ↓
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │ AI APIs │  │ Bilibili│  │ SMTP    │
        └─────────┘  └─────────┘  └─────────┘
```

### 生产环境架构（带负载均衡）

```
                    用户
                      ↓
              ┌───────────────┐
              │   CDN (可选)  │
              └───────────────┘
                      ↓
              ┌───────────────┐
              │  负载均衡器    │
              │   (Nginx)     │
              └───────────────┘
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
┌───────────────┐          ┌───────────────┐
│  Next.js 实例 1│          │  Next.js 实例 2│
│   (Worker 1)  │          │   (Worker 2)  │
└───────────────┘          └───────────────┘
        ↓                           ↓
        └─────────────┬─────────────┘
                      ↓
              ┌───────────────┐
              │   PostgreSQL  │
              │   (主从复制)  │
              └───────────────┘
                      ↓
              ┌───────────────┐
              │  Redis 集群   │
              └───────────────┘
                      ↓
              ┌───────────────┐
              │   MinIO 集群  │
              └───────────────┘
```

---

## 网络架构

### 端口映射

```
外部端口  →  内部容器
──────────────────────
80 (HTTP)   →  Nginx:80
443 (HTTPS) →  Nginx:443
5432 (DB)    →  PostgreSQL:5432 (仅限内网)
6379 (Redis) →  Redis:6379 (仅限内网)
9000 (MinIO) →  MinIO:9000 (仅限内网)
```

### 网络安全

```
┌─────────────────────────────────────────┐
│          防火墙规则                      │
├─────────────────────────────────────────┤
│  ✓ 允许 80/443 (HTTP/HTTPS)            │
│  ✓ 允许 SSH (仅限管理 IP)              │
│  ✋ 阻止 5432 (PostgreSQL)              │
│  ✋ 阻止 6379 (Redis)                   │
│  ✋ 阻止 9000 (MinIO)                   │
└─────────────────────────────────────────┘
```

---

## 监控架构

```
┌─────────────────────────────────────────────────────────┐
│                    监控系统                              │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  日志收集   │  │  指标监控   │  │  告警系统   │    │
│  │ (Filebeat)  │  │ (Prometheus)│  │ (AlertMgr)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         ↓                ↓                ↓             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   ELK Stack │  │  Grafana    │  │  邮件/短信   │    │
│  │ (日志分析)  │  │  (可视化)   │  │  (告警通知)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

**最后更新：2026-02-08**
