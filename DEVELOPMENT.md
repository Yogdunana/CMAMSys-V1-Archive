# CMAMSys 开发指南

本文档为 CMAMSys 项目的开发者提供详细的开发指南，包括项目架构、开发环境、常用命令、调试技巧等。

## 📋 目录

- [项目架构](#项目架构)
- [技术栈](#技术栈)
- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [核心模块](#核心模块)
- [数据库设计](#数据库设计)
- [API 设计](#api-设计)
- [前端开发](#前端开发)
- [测试](#测试)
- [调试](#调试)
- [性能优化](#性能优化)
- [部署](#部署)

---

## 项目架构

CMAMSys 采用前后端分离的架构，基于 Next.js 的 App Router 模式。

### 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Pages & Components                       │  │
│  │  (Dashboard, Settings, Modeling, Learning, etc.)   │  │
│  └───────────────────────────────────────────────────┘  │
│                         ↓                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │           API Routes (Backend)                     │  │
│  │  (Auth, AI Providers, Modeling, Learning, etc.)    │  │
│  └───────────────────────────────────────────────────┘  │
│                         ↓                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Services Layer                           │  │
│  │  (AI, Auth, Database, Learning, etc.)              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                    │
└─────────────────────────────────────────────────────────┘
```

---

## 技术栈

### 前端

- **框架**: Next.js 16 (App Router)
- **UI 库**: React 19 + shadcn/ui
- **样式**: Tailwind CSS 4
- **状态管理**: React Hooks + Context API
- **表单**: React Hook Form + Zod
- **国际化**: next-intl

### 后端

- **运行时**: Next.js API Routes
- **数据库**: PostgreSQL 14+
- **ORM**: Prisma 5
- **认证**: JWT + BCrypt
- **验证**: Zod
- **AI SDK**: coze-coding-dev-sdk

### 开发工具

- **包管理器**: pnpm 9.0.0+
- **代码检查**: ESLint + Prettier
- **类型检查**: TypeScript 5
- **测试**: Jest + React Testing Library
- **版本控制**: Git

---

## 开发环境设置

### 前置要求

- Node.js 24+
- pnpm 9.0.0+
- PostgreSQL 14+
- Git

### 设置步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/cmamsys.git
cd cmamsys

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的配置

# 4. 初始化数据库
pnpm prisma migrate dev

# 5. 生成 Prisma Client
npx prisma generate

# 6. 启动开发服务器
coze dev
```

访问 [http://localhost:5000](http://localhost:5000) 查看应用。

---

## 项目结构

```
cmamsys/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API 路由
│   │   │   ├── auth/                 # 认证相关 API
│   │   │   │   ├── login/            # 登录
│   │   │   │   ├── register/         # 注册
│   │   │   │   ├── refresh/          # 刷新 Token
│   │   │   │   ├── logout/           # 登出
│   │   │   │   └── verify/           # 验证 Token
│   │   │   ├── ai-providers/         # AI Provider 管理
│   │   │   ├── modeling/             # 建模任务
│   │   │   ├── learning/             # 学习模块
│   │   │   ├── settings/             # 系统设置
│   │   │   └── user/                 # 用户管理
│   │   ├── dashboard/                # 仪表盘页面
│   │   │   ├── competitions/         # 竞赛管理
│   │   │   ├── modeling-tasks/       # 建模任务
│   │   │   ├── ai-providers/         # AI Providers
│   │   │   └── settings/             # 设置
│   │   ├── learning/                 # 学习模块页面
│   │   ├── settings/                 # 设置页面
│   │   ├── auth/                     # 认证页面
│   │   ├── layout.tsx                # 根布局
│   │   └── page.tsx                  # 首页
│   ├── components/                   # React 组件
│   │   ├── ui/                       # shadcn/ui 组件
│   │   ├── auth/                     # 认证相关组件
│   │   ├── dashboard/                # 仪表盘组件
│   │   └── shared/                   # 共享组件
│   ├── contexts/                     # React Context
│   │   └── auth-context.tsx          # 认证上下文
│   ├── lib/                          # 工具库
│   │   ├── db.ts                     # Prisma 客户端
│   │   ├── utils.ts                  # 工具函数
│   │   └── validations.ts            # 验证规则
│   ├── services/                     # 业务逻辑服务
│   │   ├── auth.ts                   # 认证服务
│   │   ├── ai-provider.ts            # AI Provider 服务
│   │   ├── modeling.ts               # 建模服务
│   │   └── learning.ts               # 学习服务
│   ├── hooks/                        # 自定义 Hooks
│   │   ├── use-auth.ts               # 认证 Hook
│   │   ├── use-toast.ts              # Toast Hook
│   │   └── use-sse-stream.ts         # SSE 流式 Hook
│   └── types/                        # TypeScript 类型定义
├── prisma/                           # Prisma 配置
│   ├── schema.prisma                 # 数据库 Schema
│   └── migrations/                   # 数据库迁移文件
├── public/                           # 静态资源
├── docs/                             # 文档
├── scripts/                          # 脚本文件
├── docker/                           # Docker 配置
└── tests/                            # 测试文件
```

---

## 核心模块

### 1. 认证模块 (`src/services/auth.ts`)

负责用户认证和授权。

**主要功能**：
- 用户注册和登录
- JWT Token 生成和验证
- Token 自动刷新
- 密码加密（BCrypt）

**示例**：

```typescript
import { AuthService } from '@/services/auth';

// 用户登录
const result = await AuthService.login({
  email: 'user@example.com',
  password: 'password123',
});

// 验证 Token
const user = await AuthService.verifyToken(accessToken);
```

### 2. AI Provider 模块 (`src/services/ai-provider.ts`)

管理多个 AI Provider 的调用。

**主要功能**：
- 支持多个 AI Provider（阿里云、火山引擎、DeepSeek 等）
- 统一的调用接口
- 流式和非流式调用
- 自动重试和错误处理

**示例**：

```typescript
import { callAIStream } from '@/services/ai-provider';

// 流式调用
const stream = await callAIStream(
  providerId,
  'doubao-pro-128k',
  messages,
  options,
  userId
);

for await (const chunk of stream) {
  console.log(chunk.content);
}
```

### 3. 建模模块 (`src/services/modeling.ts`)

管理建模任务的创建和执行。

**主要功能**：
- 创建建模任务
- 执行建模流程
- 生成报告
- 任务状态跟踪

**示例**：

```typescript
import { ModelingService } from '@/services/modeling';

// 创建建模任务
const task = await ModelingService.createTask({
  competitionId: 'comp-123',
  problemId: 'A',
  description: '数学建模任务描述',
});
```

### 4. 学习模块 (`src/services/learning.ts`)

管理从 Bilibili 和其他来源的学习内容。

**主要功能**：
- 从 Bilibili 提取知识
- 处理用户上传的材料
- 构建知识库
- 定时任务调度

**示例**：

```typescript
import { LearningService } from '@/services/learning';

// 从 Bilibili 提取知识
const knowledge = await LearningService.extractFromBilibili({
  videoId: 'BV123456789',
  competitionId: 'comp-123',
});
```

---

## 数据库设计

### Prisma Schema

主要数据模型：

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  role          Role      @default(USER)
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  aiProviders   AIProvider[]
  tasks         ModelingTask[]
}

model AIProvider {
  id            String    @id @default(cuid())
  name          String
  type          ProviderType
  apiKey        String
  status        ProviderStatus
  priority      Int       @default(0)
  isDefault     Boolean   @default(false)
  userId        String

  // Relations
  user          User      @relation(fields: [userId], references: [id])
}

model ModelingTask {
  id            String    @id @default(cuid())
  name          String
  status        TaskStatus
  progress      Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  userId        String

  // Relations
  user          User      @relation(fields: [userId], references: [id])
}

enum Role {
  ADMIN
  TEAM_LEAD
  TEAM_MEMBER
  USER
}

enum ProviderType {
  ALIYUN
  VOLCENGINE
  DEEPSEEK
  OPENAI
  ANTHROPIC
}

enum ProviderStatus {
  ACTIVE
  INACTIVE
  ERROR
}

enum TaskStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

### 常用数据库操作

```typescript
import { prisma } from '@/lib/db';

// 查询用户
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { aiProviders: true },
});

// 创建 AI Provider
const provider = await prisma.aiProvider.create({
  data: {
    name: '火山引擎豆包',
    type: 'VOLCENGINE',
    apiKey: 'your-api-key',
    userId: 'user-123',
  },
});

// 更新任务状态
const task = await prisma.modelingTask.update({
  where: { id: 'task-123' },
  data: { status: 'COMPLETED', progress: 100 },
});
```

---

## API 设计

### API 路由结构

```
/api/
├── auth/
│   ├── POST /register          # 用户注册
│   ├── POST /login             # 用户登录
│   ├── POST /refresh           # 刷新 Token
│   ├── POST /logout            # 用户登出
│   └── GET  /verify            # 验证 Token
├── ai-providers/
│   ├── GET  /                  # 获取 AI Providers 列表
│   ├── POST /                  # 创建 AI Provider
│   ├── POST /test              # 测试 AI Provider
│   ├── POST /chat              # 非流式聊天
│   └── POST /chat-stream       # 流式聊天
├── modeling/
│   ├── GET  /tasks             # 获取建模任务列表
│   ├── POST /tasks             # 创建建模任务
│   └── GET  /tasks/[id]        # 获取任务详情
├── learning/
│   ├── GET  /knowledge         # 获取知识库
│   ├── POST /videos/extract    # 从视频提取知识
│   └── POST /materials/upload  # 上传学习材料
└── settings/
    ├── GET  /system            # 获取系统设置
    └── PUT  /system            # 更新系统设置
```

### API 响应格式

**成功响应**：

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

**错误响应**：

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### API 路由示例

```typescript
// src/app/api/ai-providers/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { testAIProvider } from '@/services/ai-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, apiKey, model } = body;

    const result = await testAIProvider({ type, apiKey, model });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TEST_FAILED',
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
}
```

---

## 前端开发

### 组件开发

使用 shadcn/ui 组件库，遵循 React Hooks 规范。

**示例**：

```typescript
// src/components/modeling/TaskList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Task {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const response = await fetch('/api/modeling/tasks');
    const data = await response.json();
    setTasks(data.data);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{task.name}</h3>
                <p className="text-sm text-gray-500">{task.status}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{task.progress}%</p>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
```

### 状态管理

使用 React Context API 管理全局状态。

**示例**：

```typescript
// src/contexts/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 从 localStorage 加载用户信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  async function login(credentials: LoginCredentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    setUser(data.data.user);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 测试

### 单元测试

使用 Jest 测试工具函数和服务。

**示例**：

```typescript
// src/services/auth.test.ts
import { AuthService } from './auth';

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hash = await AuthService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toHaveLength(60); // BCrypt hash length
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'password123';
      const hash = await AuthService.hashPassword(password);

      const isValid = await AuthService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });
});
```

### 集成测试

测试 API 路由和数据库操作。

**示例**：

```typescript
// src/app/api/auth/login.test.ts
import { POST } from './route';

describe('/api/auth/login', () => {
  it('should login a user with valid credentials', async () => {
    const request = new Request('http://localhost:5000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.accessToken).toBeDefined();
  });
});
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test auth.test.ts

# 监听模式
pnpm test --watch

# 生成覆盖率报告
pnpm test --coverage
```

---

## 调试

### 调试技巧

1. **使用 console.log**：

```typescript
console.log('User data:', user);
console.log('API response:', response);
```

2. **使用 VS Code Debugger**：

在 `src/app/api/` 目录下的 `.vscode/launch.json` 中配置：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Next.js: debug server-side",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

3. **使用 Prisma Studio**：

```bash
pnpm prisma studio
```

4. **查看日志**：

```bash
# 应用日志
tail -f /app/work/logs/bypass/app.log

# 开发日志
tail -f /app/work/logs/bypass/dev.log
```

---

## 性能优化

### 前端优化

1. **使用 React.memo**：

```typescript
export const UserProfile = React.memo(({ user }: { user: User }) => {
  return <div>{user.username}</div>;
});
```

2. **使用 useMemo 和 useCallback**：

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(data);
}, [data]);
```

3. **代码分割**：

```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

### 后端优化

1. **数据库索引**：

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  @@index([email])  // 添加索引
}
```

2. **查询优化**：

```typescript
// 只选择需要的字段
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    username: true,
    email: true,
  },
});
```

3. **使用缓存**：

```typescript
import { cache } from '@/lib/cache';

const user = await cache.get(`user:${userId}`, async () => {
  return await prisma.user.findUnique({ where: { id: userId } });
});
```

---

## 部署

### 构建生产版本

```bash
# 构建项目
coze build

# 启动生产服务器
coze start
```

### Docker 部署

```bash
# 构建镜像
docker build -t cmamsys:latest .

# 运行容器
docker run -d \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  cmamsys:latest
```

### 环境变量

确保在生产环境设置以下环境变量：

```env
# 数据库
DATABASE_URL="postgresql://user:password@host:5432/cmamsys"

# JWT 密钥
JWT_SECRET="your-super-secret-jwt-key"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-key"

# 应用配置
NODE_ENV="production"
PORT="5000"
```

---

## 资源链接

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Prisma 文档](https://www.prisma.io/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

**最后更新：2026-02-08**
