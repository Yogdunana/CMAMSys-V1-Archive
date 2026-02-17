# CMAMSys 开发指南

本文档面向想要参与 CMAMSys 开发的开发者。

---

## 目录

- [项目架构](#项目架构)
- [技术栈](#技术栈)
- [开发环境搭建](#开发环境搭建)
- [项目结构](#项目结构)
- [核心模块](#核心模块)
- [数据库设计](#数据库设计)
- [API 开发](#api-开发)
- [前端开发](#前端开发)
- [测试](#测试)
- [调试](#调试)
- [性能优化](#性能优化)

---

## 项目架构

### 整体架构

```
┌─────────────────────────────────────────────────┐
│                   前端层                          │
│           (Next.js 16 + React 19)                │
│         - shadcn/ui 组件库                        │
│         - 国际化 (next-intl)                     │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│                API 层                            │
│         (Next.js API Routes)                    │
│         - RESTful API                           │
│         - WebSocket (实时通信)                   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│               业务逻辑层                          │
│         - 用户管理                               │
│         - 团队管理                               │
│         - 建模任务                               │
│         - AI Provider 集成                       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│               数据访问层                          │
│         (Prisma ORM)                            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│               数据存储层                          │
│         - PostgreSQL (主数据库)                  │
│         - Redis (缓存/会话)                      │
│         - S3 (文件存储)                          │
└─────────────────────────────────────────────────┘
```

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.1 | React 框架 |
| React | 19.2.3 | UI 库 |
| TypeScript | 5.9.3 | 类型系统 |
| Tailwind CSS | 4 | 样式框架 |
| shadcn/ui | - | UI 组件库 |
| next-intl | 4.8.2 | 国际化 |
| React Hook Form | 7.70.0 | 表单管理 |
| Zustand | - | 状态管理 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 24+ | 运行时 |
| Prisma | 5.22.0 | ORM |
| PostgreSQL | 15+ | 主数据库 |
| Redis | 7+ | 缓存/会话 |
| jose | 6.1.3 | JWT 认证 |
| bcryptjs | 3.0.3 | 密码加密 |
| nodemailer | 8.0.1 | 邮件服务 |

### AI 集成

| Provider | SDK | 用途 |
|----------|-----|------|
| DeepSeek | coze-coding-dev-sdk | 数学建模 |
| 豆包 | coze-coding-dev-sdk | 通用任务 |
| 阿里云百炼 | coze-coding-dev-sdk | 企业场景 |

### 开发工具

| 工具 | 版本 | 用途 |
|------|------|------|
| pnpm | 9+ | 包管理器 |
| ESLint | - | 代码检查 |
| Prettier | - | 代码格式化 |
| Vitest | - | 测试框架 |
| Playwright | - | E2E 测试 |

---

## 开发环境搭建

### 前置要求

- Node.js 18.0+ (推荐 24.0+)
- PostgreSQL 12.0+
- Redis 6.0+ (可选)
- pnpm 8.0+

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/Yogdunana/CMAMSys.git
cd CMAMSys
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量（参考 [部署文档](DEPLOYMENT.md)）。

4. **初始化数据库**

```bash
# 生成 Prisma Client
pnpm prisma generate

# 运行迁移
pnpm prisma migrate dev

# 创建初始数据（可选）
pnpm prisma seed
```

5. **启动开发服务器**

```bash
pnpm dev
```

访问 `http://localhost:5000` 查看应用。

---

## 项目结构

```
cmamsys/
├── .github/
│   └── workflows/          # GitHub Actions 工作流
│       ├── ci.yml          # CI 工作流
│       ├── cd.yml          # CD 工作流
│       └── scheduled.yml   # 定时任务
├── prisma/
│   ├── schema.prisma       # 数据库模型定义
│   └── migrations/         # 数据库迁移文件
├── public/                 # 静态资源
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API Routes
│   │   │   ├── v1/         # API v1 版本
│   │   │   └── install/    # 安装向导 API
│   │   ├── (auth)/         # 认证相关页面
│   │   ├── (dashboard)/    # 仪表盘页面
│   │   ├── install/        # 安装向导页面
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── components/         # React 组件
│   │   ├── ui/             # shadcn/ui 组件
│   │   ├── auth/           # 认证组件
│   │   ├── tasks/          # 任务组件
│   │   └── teams/          # 团队组件
│   ├── lib/                # 工具库
│   │   ├── auth.ts         # 认证工具
│   │   ├── db.ts           # 数据库工具
│   │   ├── encryption.ts   # 加密工具
│   │   └── utils.ts        # 通用工具
│   ├── services/           # 业务逻辑
│   │   ├── ai/             # AI 服务
│   │   ├── auth/           # 认证服务
│   │   └── tasks/          # 任务服务
│   ├── hooks/              # React Hooks
│   ├── types/              # TypeScript 类型定义
│   └── styles/             # 全局样式
├── scripts/                # 脚本文件
│   ├── install-cli.js      # 命令行安装
│   ├── create-admin.js     # 创建管理员
│   └── test-db.js          # 测试数据库
├── docker-compose.yml      # Docker Compose 配置
├── Dockerfile              # Docker 镜像配置
├── next.config.ts          # Next.js 配置
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖
├── .env.example            # 环境变量模板
└── README.md               # 项目文档
```

---

## 核心模块

### 认证模块

**位置**: `src/lib/auth.ts`, `src/services/auth/`

**功能**:
- JWT Token 生成和验证
- 密码加密和验证
- 会话管理
- 权限控制

**使用示例**:

```typescript
import { generateToken, verifyToken } from '@/lib/auth';

// 生成 Token
const token = await generateToken({ userId: 'user_123' });

// 验证 Token
const payload = await verifyToken(token);
```

### AI Provider 模块

**位置**: `src/services/ai/`

**功能**:
- AI Provider 管理
- API 调用封装
- 重试和回溯机制
- 消耗统计

**使用示例**:

```typescript
import { AIProviderService } from '@/services/ai';

const aiService = new AIProviderService();

// 调用 AI
const response = await aiService.chat({
  providerId: 'provider_123',
  messages: [{ role: 'user', content: 'Hello' }]
});
```

### 任务管理模块

**位置**: `src/services/tasks/`

**功能**:
- 任务生命周期管理
- 流程编排
- 进度跟踪
- 错误处理

**使用示例**:

```typescript
import { TaskService } from '@/services/tasks';

const taskService = new TaskService();

// 创建任务
const task = await taskService.create({
  name: 'My Task',
  teamId: 'team_123'
});

// 启动任务
await taskService.start(task.id);
```

---

## 数据库设计

### 核心表

#### User（用户）

```prisma
model User {
  id            String   @id @default(cuid())
  username      String   @unique
  email         String   @unique
  passwordHash  String
  role          UserRole @default(USER)
  isVerified    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### Team（团队）

```prisma
model Team {
  id          String   @id @default(cuid())
  name        String
  description String?
  isPublic    Boolean  @default(false)
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner       User     @relation(fields: [ownerId], references: [id])
  members     TeamMember[]
}
```

#### AutoModelingTask（建模任务）

```prisma
model AutoModelingTask {
  id              String              @id @default(cuid())
  name            String
  description     String
  status          TaskStatus          @default(PENDING)
  progress        Int                 @default(0)
  competitionType CompetitionType
  deadline        DateTime?
  teamId          String
  providerId      String?
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  team            Team                @relation(fields: [teamId], references: [id])
  discussions     GroupDiscussion[]
  papers          GeneratedPaper[]
}
```

### 数据库迁移

创建新迁移：

```bash
pnpm prisma migrate dev --name add_new_field
```

应用迁移：

```bash
pnpm prisma migrate deploy
```

重置数据库：

```bash
pnpm prisma migrate reset
```

---

## API 开发

### 创建新 API 端点

1. 在 `src/app/api/v1/` 下创建路由文件

```typescript
// src/app/api/v1/examples/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 业务逻辑
    const data = { message: 'Hello, World!' };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 业务逻辑
    const result = await someService(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
```

2. 添加认证中间件（如需要）

```typescript
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  // ...
}
```

---

## 前端开发

### 创建新组件

1. 在 `src/components/` 下创建组件文件

```typescript
// src/components/example/ExampleComponent.tsx
'use client';

import React from 'react';

interface ExampleProps {
  title: string;
  onAction?: () => void;
}

export function ExampleComponent({ title, onAction }: ExampleProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-primary text-white rounded"
        >
          Action
        </button>
      )}
    </div>
  );
}
```

### 使用 shadcn/ui 组件

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

---

## 测试

### 单元测试

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01');
    const result = formatDate(date);
    expect(result).toBe('2024-01-01');
  });
});
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

---

## 调试

### VS Code 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5000"
    }
  ]
}
```

### 日志调试

```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: 'user_123' });
logger.error('Failed to connect to database', { error });
```

---

## 性能优化

### 前端优化

- 使用 React.memo 避免不必要的重渲染
- 使用 useMemo 和 useCallback 优化计算
- 使用 Next.js Image 组件优化图片加载
- 实现代码分割和懒加载

### 后端优化

- 使用数据库索引
- 实现查询结果缓存
- 使用连接池
- 批量操作数据库

### 数据库优化

```typescript
// 使用索引
model User {
  id    String @id @default(cuid())
  email String @unique
}

// 使用 select 减少查询字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true
  }
});
```

---

## 获取帮助

- 📚 [完整文档](README.md)
- 📖 [API 文档](API.md)
- 👥 [Discussions](https://github.com/Yogdunana/CMAMSys/discussions)
- 🐛 [Issues](https://github.com/Yogdunana/CMAMSys/issues)

---

**祝您开发愉快！** 🚀
