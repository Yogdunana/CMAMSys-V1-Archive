# CMAMSys - 企业级数学建模竞赛自动化平台

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg)
![React](https://img.shields.io/badge/React-19.2.4-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-6.19.2-2D3748.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)

**CompetiMath AutoModel System**

一站式解决方案，为团队和个人提供从数据预处理、模型训练、评估到报告生成的全流程自动化

[在线文档](#文档) | [演示站点](#演示) | [GitHub](https://github.com/Yogdunana/CMAMSys)

</div>

---

## 📑 目录

- [项目简介](#项目简介)
- [核心特性](#核心特性)
- [技术架构](#技术架构)
- [功能模块详解](#功能模块详解)
- [数据库设计](#数据库设计)
- [快速开始](#快速开始)
- [详细安装指南](#详细安装指南)
- [配置说明](#配置说明)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [API 文档](#api-文档)
- [测试指南](#测试指南)
- [故障排查](#故障排查)
- [常见问题](#常见问题)

---

## 📖 项目简介

### 什么是 CMAMSys？

**CMAMSys（CompetiMath AutoModel System）** 是一个企业级数学建模竞赛自动化平台，旨在为参赛者提供一站式解决方案，简化建模流程，提高竞赛效率。

数学建模竞赛（如 MCM/ICM、CUMCM 等）通常需要参赛者在有限时间内完成以下工作：

1. **题目解析与策略制定** - 理解题目要求，制定建模方案
2. **数据收集与预处理** - 获取数据，清洗和转换
3. **模型建立与求解** - 选择算法，训练模型
4. **结果分析与可视化** - 评估模型，展示结果
5. **论文撰写** - 撰写符合竞赛要求的论文

CMAMSys 通过自动化和智能化手段，大幅减少重复性工作，让参赛者能够专注于核心问题。

### 核心价值

- 🤖 **AI 驱动**：集成多个 AI Provider，智能辅助建模和代码生成
- 🔄 **自动化流程**：从讨论到论文生成的全流程自动化
- 👥 **团队协作**：支持多人实时协作，角色分工明确
- 📊 **数据可视化**：丰富的图表和报告生成功能
- 🔒 **企业级安全**：完善的权限控制和数据加密
- 🌐 **多语言支持**：支持中文、英文等多种语言

### 适用竞赛

| 竞赛名称 | 英文缩写 | 支持程度 |
|---------|---------|---------|
| 美国大学生数学建模竞赛 | MCM/ICM | ✅ 完整支持 |
| 全国大学生数学建模竞赛 | CUMCM | ✅ 完整支持 |
| 深圳杯数学建模挑战赛 | 深圳杯 | ✅ 完整支持 |
| 国际数学建模挑战赛 | IMMC | ✅ 完整支持 |
| MathorCup 数学建模挑战赛 | MathorCup | ✅ 基础支持 |
| 电工杯数学建模竞赛 | EMMC | ✅ 基础支持 |

---

## ✨ 核心特性

### 1. 自动化建模流程

CMAMSys 提供端到端的自动化建模流程，支持 4 个核心阶段：

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   讨论阶段   │ →  │   代码阶段   │ →  │   校验阶段   │ →  │   论文阶段   │
│ AI讨论分析   │    │ 代码生成执行 │    │ 结果验证优化 │    │ 论文生成导出 │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### 详细阶段说明

**阶段 1：讨论阶段**
- AI 驱动的题目分析
- 建模策略建议
- 团队讨论记录
- 文献资料检索

**阶段 2：代码阶段**
- 自动生成建模代码（Python）
- 代码执行和结果收集
- 多种算法支持（XGBoost, LightGBM, LSTM 等）
- 代码版本管理

**阶段 3：校验阶段**
- 结果自动验证
- 模型性能评估
- 异常检测和处理
- 结果可视化

**阶段 4：论文阶段**
- 自动生成学术论文
- 支持中文/英文论文
- PDF 导出
- 格式符合竞赛要求

### 2. AI Provider 集成

系统支持多个 AI Provider，可根据需求灵活切换：

| Provider | 模型 | 用途 | 配置 |
|----------|------|------|------|
| DeepSeek | DeepSeek-V3 | 通用对话、代码生成 | `DEEPSEEK_API_KEY` |
| OpenAI | GPT-4 / GPT-3.5 | 高质量文本生成 | `OPENAI_API_KEY` |
| 阿里云 | 通义千问 | 中文优化 | `ALIYUN_API_KEY` |
| 火山引擎 | 豆包大模型 | 中文对话 | `VOLCENGINE_API_KEY` |

**智能回溯机制**：当某个 AI Provider 失败时，系统会自动切换到备用 Provider，确保任务顺利完成。

### 3. 团队协作功能

- **团队管理**：创建和管理团队
- **成员管理**：添加/移除成员，分配角色
- **实时协作**：多人同时编辑项目
- **权限控制**：基于角色的访问控制（RBAC）

### 4. 视频学习模块

- **Bilibili 集成**：导入 Bilibili 视频教程
- **知识库管理**：视频知识点提取和关联
- **学习进度跟踪**：记录学习进度
- **笔记功能**：为视频添加笔记

### 5. 系统管理

- **用户管理**：查看和管理用户
- **日志监控**：系统日志查看
- **配置管理**：系统配置调整
- **数据库管理**：数据库备份和恢复

---

## 🏗️ 技术架构

### 技术栈

#### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.1.6 | React 框架 |
| **React** | 19.2.4 | UI 框架 |
| **TypeScript** | 5.9.3 | 类型系统 |
| **Tailwind CSS** | 4.0.0 | 样式框架 |
| **shadcn/ui** | Latest | UI 组件库 |
| **Recharts** | 3.7.0 | 数据可视化 |
| **React Hook Form** | 7.70.0 | 表单管理 |
| **Zod** | 4.3.5 | 数据验证 |
| **next-intl** | 4.8.3 | 国际化 |

#### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | 24+ | 运行时环境 |
| **Prisma** | 6.19.2 | ORM 框架 |
| **PostgreSQL** | 16 | 数据库 |
| **bcrypt** | 6.0.0 | 密码加密 |
| **jsonwebtoken** | 9.0.3 | JWT 认证 |
| **jose** | 6.1.3 | JWT 处理 |
| **nodemailer** | 8.0.1 | 邮件发送 |
| **ioredis** | 5.9.2 | Redis 客户端 |

#### AI 与机器学习

| 技术 | 版本 | 用途 |
|------|------|------|
| **coze-coding-dev-sdk** | 0.7.15 | AI Provider 集成 |
| **chart.js** | 4.5.1 | 图表绘制 |
| **katex** | 0.16.28 | 数学公式渲染 |
| **react-katex** | 3.1.0 | React KaTeX 组件 |

#### 工具与部署

| 技术 | 版本 | 用途 |
|------|------|------|
| **Docker** | Latest | 容器化部署 |
| **pnpm** | 9.0.0 | 包管理器 |
| **ESLint** | 9+ | 代码检查 |
| **Vitest** | 4.0.18 | 单元测试 |
| **Playwright** | 1.58.2 | E2E 测试 |
| **Sentry** | 10.39.0 | 错误追踪 |

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 管理后台  │  │ 工作台    │  │ 团队协作  │  │ 学习中心  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        API 路由层                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 认证 API  │  │ 任务 API  │  │ AI API   │  │ 管理 API  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        业务逻辑层                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 用户管理  │  │ 建模任务  │  │ AI 集成   │  │ 协作管理  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        数据访问层                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Prisma   │  │ Redis    │  │ S3 存储   │  │ 文件系统  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        外部服务层                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ AI Providers│ │ 邮件服务  │  │ 日志服务  │  │ 监控服务  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 功能模块详解

### 1. 认证与授权模块

#### 功能特性
- ✅ 用户注册（邮箱验证）
- ✅ 用户登录（JWT Token）
- ✅ 密码重置（邮件验证）
- ✅ 多因素认证（MFA）- 可选
- ✅ 会话管理（Refresh Token）
- ✅ 登录日志记录
- ✅ 账户锁定保护

#### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/auth/refresh` | POST | 刷新 Token |
| `/api/auth/verify` | POST | 验证 Token |
| `/api/auth/forgot-password` | POST | 忘记密码 |
| `/api/auth/reset-password` | POST | 重置密码 |
| `/api/v1/auth/csrf-token` | GET | 获取 CSRF Token |

#### 安全机制
- **密码加密**：使用 bcrypt（14 rounds）
- **JWT Token**：Access Token（15分钟）+ Refresh Token（7天）
- **CSRF 保护**：所有 POST/PUT/DELETE 请求需要 CSRF Token
- **速率限制**：防止暴力破解（每分钟 10 次请求）
- **账户锁定**：5 次失败后锁定 15 分钟

### 2. AI Provider 管理模块

#### 功能特性
- ✅ 添加/删除 AI Provider
- ✅ 测试 AI Provider 连接
- ✅ 查看使用统计
- ✅ API Key 加密存储
- ✅ 自动回溯机制

#### 支持的 Provider 类型
- `deepseek` - DeepSeek V3
- `openai` - OpenAI GPT 系列
- `aliyun` - 阿里云通义千问
- `volcengine` - 火山引擎豆包

#### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/ai-providers` | GET | 获取所有 Provider |
| `/api/ai-providers` | POST | 添加 Provider |
| `/api/ai-providers/[id]` | PUT | 更新 Provider |
| `/api/ai-providers/[id]` | DELETE | 删除 Provider |
| `/api/ai-providers/test` | POST | 测试连接 |
| `/api/ai-providers/types` | GET | 获取支持的类型 |
| `/api/ai-providers/[id]/usage` | GET | 获取使用统计 |
| `/api/ai-providers/chat-stream` | POST | 流式对话 |

### 3. 自动建模模块

#### 功能特性
- ✅ 创建建模任务
- ✅ 4 阶段自动化流程
- ✅ 代码生成和执行
- ✅ 结果验证和优化
- ✅ 论文自动生成
- ✅ 实时进度追踪
- ✅ 任务管理（暂停/继续/停止）

#### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auto-modeling/start` | POST | 开始建模任务 |
| `/api/auto-modeling/latest` | GET | 获取最新任务 |
| `/api/auto-modeling/[id]/status` | GET | 获取任务状态 |
| `/api/auto-modeling/[id]/manage` | POST | 管理任务（暂停/继续） |
| `/api/auto-modeling/[id]/stop` | POST | 停止任务 |
| `/api/auto-modeling/[id]/task-list` | GET | 获取任务列表 |
| `/api/auto-modeling/[id]/generate-paper` | POST | 生成论文 |
| `/api/auto-modeling/[id]/paper` | GET | 获取论文内容 |
| `/api/auto-modeling/[id]/regenerate-code` | POST | 重新生成代码 |
| `/api/auto-modeling/[id]/regenerate-paper` | POST | 重新生成论文 |
| `/api/auto-modeling/[id]/execution-logs` | GET | 获取执行日志 |
| `/api/auto-modeling/[id]/generation-logs` | GET | 获取生成日志 |
| `/api/auto-modeling/[id]/optimization` | GET | 获取优化结果 |
| `/api/auto-modeling/[id]/optimization/export` | GET | 导出优化结果 |

### 4. 团队协作模块

#### 功能特性
- ✅ 创建团队
- ✅ 添加/移除成员
- ✅ 成员角色管理
- ✅ 团队讨论
- ✅ 实时协作

#### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/teams` | GET | 获取团队列表 |
| `/api/teams` | POST | 创建团队 |
| `/api/teams/[id]/members` | GET | 获取成员列表 |
| `/api/teams/[id]/members` | POST | 添加成员 |
| `/api/collaboration/[id]` | GET | 获取协作信息 |
| `/api/discussion/[id]/messages` | GET | 获取讨论消息 |
| `/api/discussion/stream/[id]` | GET | 流式讨论消息 |

### 5. 视频学习模块

#### 功能特性
- ✅ 视频导入（Bilibili）
- ✅ 知识库管理
- ✅ 视频笔记
- ✅ 学习进度跟踪

#### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/learning/videos` | GET | 获取视频列表 |
| `/api/learning/videos` | POST | 添加视频 |
| `/api/learning/videos/[id]` | PUT | 更新视频 |
| `/api/learning/videos/[id]/knowledge` | GET | 获取知识点 |
| `/api/learning/knowledge` | GET | 获取知识库 |
| `/api/learning/config` | GET | 获取配置 |
| `/api/learning/control` | POST | 控制播放 |
| `/api/learning/tasks` | GET | 获取学习任务 |

### 6. 系统管理模块

#### 功能特性
- ✅ 用户管理（查看、禁用、删除）
- ✅ 日志查看（登录日志、操作日志）
- ✅ 系统配置
- ✅ 数据库管理
- ✅ 成本统计

#### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/admin/users` | GET | 获取用户列表 |
| `/api/admin/logs` | GET | 获取日志 |
| `/api/settings/system` | GET | 获取系统配置 |
| `/api/settings/system` | PUT | 更新系统配置 |
| `/api/settings/database` | POST | 数据库操作 |
| `/api/cost/stats` | GET | 获取成本统计 |
| `/api/cost/anomaly` | GET | 获取成本异常 |

### 7. 安装向导模块

#### 功能特性
- ✅ 一键安装向导
- ✅ 环境检查
- ✅ 数据库配置
- ✅ 管理员账户创建
- ✅ 安装锁机制
- ✅ SSE 实时进度

#### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/install/lock` | GET | 检查安装锁 |
| `/api/install/check-env` | GET | 检查环境 |
| `/api/install/test-db` | POST | 测试数据库连接 |
| `/api/install` | POST | 执行安装（SSE） |

### 8. 调试工具模块

#### 功能特性
- ✅ 任务状态检查
- ✅ 代码生成调试
- ✅ Token 清理
- ✅ 异常处理

#### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/debug/tasks-status` | GET | 检查任务状态 |
| `/api/debug/test-code-generation` | POST | 测试代码生成 |
| `/api/debug/clear-tokens` | POST | 清理 Tokens |
| `/api/debug/fix-task-status` | POST | 修复任务状态 |

---

## 🗄️ 数据库设计

### 数据模型

#### 核心表

**1. User（用户表）**
```prisma
model User {
  id                  String               @id @default(cuid())
  email               String               @unique
  username            String               @unique
  passwordHash        String?
  role                UserRole             @default(USER)
  authProvider        AuthProvider         @default(LOCAL)
  isVerified          Boolean              @default(false)
  isMfaEnabled        Boolean              @default(false)
  avatar              String?
  bio                 String?
  organization        String?
  failedLoginAttempts Int                  @default(0)
  lockedUntil         DateTime?
  lastLoginAt         DateTime?
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  deletedAt           DateTime?
  aiProviders         AIProvider[]
  competitions        Competition[]
  loginLogs           LoginLog[]
  passwordResetTokens PasswordResetToken[]
  refreshTokens       RefreshToken[]
  teamMemberships     TeamMember[]
  ownedTeams          Team[]
}
```

**2. AIProvider（AI Provider 表）**
```prisma
model AIProvider {
  id          String      @id @default(cuid())
  name        String
  type        AIProviderType
  apiKey      String      // 加密存储
  endpoint    String?
  config      Json?
  userId      String
  enabled     Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  user        User        @relation(fields: [userId], references: [id])
}
```

**3. Competition（竞赛表）**
```prisma
model Competition {
  id          String            @id @default(cuid())
  name        String
  type        CompetitionType
  year        Int
  status      CompetitionStatus @default(DRAFT)
  description String?
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  ownerId     String
  problems    Problem[]
  teams       Team[]
  owner       User              @relation("UserCompetitions", fields: [ownerId], references: [id])
}
```

**4. AutoModelingTask（自动建模任务表）**
```prisma
model AutoModelingTask {
  id              String                @id @default(cuid())
  name            String
  description     String?
  status          TaskStatus            @default(PENDING)
  currentPhase    TaskPhase             @default(DISCUSSION)
  config          Json?
  discussionData  Json?
  codeData        Json?
  validationData  Json?
  paperData       Json?
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
  completedAt     DateTime?
  executionLogs   ExecutionLog[]
  generationLogs  GenerationLog[]
}
```

**5. DiscussionMessage（讨论消息表）**
```prisma
model DiscussionMessage {
  id        String   @id @default(cuid())
  content   String
  role      MessageRole @default(USER)
  tokens    Int?
  taskId    String
  createdAt DateTime @default(now())
  task      AutoModelingTask @relation(fields: [taskId], references: [id])
}
```

**6. ExecutionLog（执行日志表）**
```prisma
model ExecutionLog {
  id          String   @id @default(cuid())
  level       LogLevel @default(INFO)
  message     String
  metadata    Json?
  taskId      String
  createdAt   DateTime @default(now())
  task        AutoModelingTask @relation(fields: [taskId], references: [id])
}
```

#### 枚举类型

```prisma
enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum AuthProvider {
  LOCAL
  GOOGLE
  GITHUB
}

enum AIProviderType {
  DEEPSEEK
  OPENAI
  ALIYUN
  VOLCENGINE
}

enum CompetitionType {
  MCM
  ICM
  CUMCM
  SHENZHEN_CUP
  IMMC
}

enum CompetitionStatus {
  DRAFT
  ONGOING
  COMPLETED
  CANCELLED
}

enum TaskStatus {
  PENDING
  RUNNING
  PAUSED
  COMPLETED
  FAILED
  CANCELLED
}

enum TaskPhase {
  DISCUSSION    // 讨论阶段
  CODE          // 代码阶段
  VALIDATION    // 校验阶段
  PAPER         // 论文阶段
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}
```

### 数据库索引

```prisma
// User 表索引
@@index([email])
@@index([username])
@@index([role])

// LoginLog 表索引
@@index([userId])
@@index([email])
@@index([success])
@@index([createdAt])

// PasswordResetToken 表索引
@@index([token])
@@index([userId])
@@index([expiresAt])

// AutoModelingTask 表索引
@@index([status])
@@index([currentPhase])
@@index([createdAt])

// DiscussionMessage 表索引
@@index([taskId])
@@index([role])
@@index([createdAt])
```

---

## 🚀 快速开始

### 环境要求

| 软件 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 20.x | 24.x |
| pnpm | 8.x | 9.0.0+ |
| PostgreSQL | 14.x | 16.x |
| Redis | 6.x | 7.x (可选) |
| Docker | 20.x | Latest (可选) |

### 方式一：Web 安装向导（推荐）

1. **克隆仓库**
   ```bash
   git clone https://github.com/Yogdunana/CMAMSys.git
   cd CMAMSys
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm dev
   ```

4. **访问安装向导**
   ```
   http://localhost:5000/install
   ```

5. **按照向导完成安装**
   - 环境检查
   - 数据库配置
   - 管理员账户创建
   - 系统配置

### 方式二：命令行安装

1. **克隆仓库**
   ```bash
   git clone https://github.com/Yogdunana/CMAMSys.git
   cd CMAMSys
   ```

2. **运行安装脚本**
   ```bash
   pnpm install:system
   ```

3. **按照提示输入管理员信息**
   ```
   管理员邮箱: admin@example.com
   管理员用户名: admin
   管理员密码: ********
   ```

4. **启动服务**
   ```bash
   pnpm start
   ```

5. **访问系统**
   ```
   http://localhost:5000
   ```

### 方式三：Docker 部署

1. **克隆仓库**
   ```bash
   git clone https://github.com/Yogdunana/CMAMSys.git
   cd CMAMSys
   ```

2. **配置环境变量**
   ```bash
   cp docker/.env.community docker/.env
   # 编辑 docker/.env 文件，填入你的配置
   ```

3. **启动服务**
   ```bash
   docker compose -f docker/docker-compose.community.yml up -d
   ```

4. **访问系统**
   ```
   http://localhost:5000
   ```

---

## 📝 详细安装指南

### 步骤 1：安装依赖

#### 使用 pnpm（推荐）

```bash
# 全局安装 pnpm（如果尚未安装）
npm install -g pnpm@9.0.0

# 安装项目依赖
pnpm install
```

#### 使用 npm（不推荐）

```bash
npm install
```

### 步骤 2：配置环境变量

1. **复制环境变量模板**
   ```bash
   cp .env.example .env
   ```

2. **编辑 `.env` 文件**

   **必填配置**：
   ```env
   # 数据库
   DATABASE_URL="postgresql://postgres:password@localhost:5432/cmamsys"

   # JWT 密钥（使用以下命令生成）
   # openssl rand -base64 32
   JWT_SECRET="your-jwt-secret-here"
   REFRESH_TOKEN_SECRET="your-refresh-secret-here"

   # 加密密钥（非常重要！）
   # openssl rand -base64 32
   ENCRYPTION_KEY="your-encryption-key-here"

   # CSRF 密钥
   # openssl rand -base64 32
   CSRF_SECRET="your-csrf-secret-here"

   # Session 密钥
   # openssl rand -base64 32
   SESSION_SECRET="your-session-secret-here"
   ```

   **可选配置**：
   ```env
   # 邮件服务（用于密码重置）
   SMTP_ENABLED="true"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   SMTP_FROM="noreply@example.com"
   SMTP_FROM_NAME="CMAMSys"

   # Redis（用于缓存和会话管理）
   REDIS_URL="redis://localhost:6379"

   # AI Providers
   DEEPSEEK_API_KEY="your-deepseek-api-key"
   OPENAI_API_KEY="your-openai-api-key"
   ALIYUN_API_KEY="your-aliyun-api-key"
   VOLCENGINE_API_KEY="your-volcengine-api-key"

   # Sentry（错误追踪）
   SENTRY_DSN="your-sentry-dsn"
   NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
   ```

### 步骤 3：初始化数据库

```bash
# 运行数据库迁移
pnpm prisma migrate deploy

# 生成 Prisma Client
pnpm prisma generate
```

### 步骤 4：创建管理员账户

#### 方式 1：使用安装向导

访问 `http://localhost:5000/install`，按照向导创建管理员账户。

#### 方式 2：使用脚本

```bash
# 运行创建管理员脚本
node scripts/create-admin.js
```

#### 方式 3：手动创建

```bash
# 进入 Prisma Studio
pnpm prisma studio

# 在 User 表中手动创建管理员账户
# - role: ADMIN
# - isVerified: true
# - passwordHash: 使用 bcrypt 加密的密码
```

### 步骤 5：构建项目

```bash
# 开发环境构建
pnpm build

# 生产环境构建
NODE_ENV=production pnpm build
```

### 步骤 6：启动服务

#### 开发环境

```bash
pnpm dev
```

服务将在 `http://localhost:5000` 启动。

#### 生产环境

```bash
pnpm start
```

服务将在 `http://localhost:5000` 启动。

### 步骤 7：验证安装

1. **访问系统**
   ```
   http://localhost:5000
   ```

2. **使用管理员账户登录**

3. **检查系统状态**
   - 访问 `/settings/system` 查看系统配置
   - 访问 `/admin/users` 查看用户列表
   - 访问 `/admin/logs` 查看系统日志

---

## ⚙️ 配置说明

### 环境变量完整列表

#### 数据库配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | - | ✅ |

#### 认证配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `JWT_SECRET` | JWT 签名密钥 | - | ✅ |
| `JWT_ACCESS_TOKEN_EXPIRY` | Access Token 过期时间 | `15m` | - |
| `JWT_REFRESH_TOKEN_EXPIRY` | Refresh Token 过期时间 | `7d` | - |
| `REFRESH_TOKEN_SECRET` | Refresh Token 签名密钥 | - | ✅ |
| `SESSION_SECRET` | Session 加密密钥 | - | ✅ |
| `SESSION_MAX_AGE` | Session 最大时长（毫秒） | `604800000` | - |

#### 安全配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `ENCRYPTION_KEY` | 数据加密密钥 | - | ✅ |
| `CSRF_SECRET` | CSRF 保护密钥 | - | ✅ |
| `BCRYPT_ROUNDS` | bcrypt 加密轮数 | `14` | - |
| `MAX_LOGIN_ATTEMPTS` | 最大登录尝试次数 | `5` | - |
| `LOCKOUT_DURATION_MS` | 账户锁定时长（毫秒） | `900000` | - |

#### 应用配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `APP_NAME` | 应用名称 | `CMAMSys` | - |
| `APP_URL` | 应用 URL | `http://localhost:5000` | - |
| `APP_PORT` | 应用端口 | `5000` | - |
| `NODE_ENV` | 运行环境 | `development` | - |

#### 邮件配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `SMTP_ENABLED` | 是否启用邮件 | `false` | - |
| `SMTP_HOST` | SMTP 服务器地址 | `smtp.gmail.com` | - |
| `SMTP_PORT` | SMTP 端口 | `587` | - |
| `SMTP_SECURE` | 是否使用 SSL/TLS | `false` | - |
| `SMTP_USER` | SMTP 用户名 | - | - |
| `SMTP_PASSWORD` | SMTP 密码 | - | - |
| `SMTP_FROM` | 发件人邮箱 | `noreply@example.com` | - |
| `SMTP_FROM_NAME` | 发件人名称 | `CMAMSys` | - |

#### Redis 配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `REDIS_URL` | Redis 连接字符串 | - | - |

#### AI Provider 配置

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key | - |
| `OPENAI_API_KEY` | OpenAI API Key | - |
| `ALIYUN_API_KEY` | 阿里云 API Key | - |
| `VOLCENGINE_API_KEY` | 火山引擎 API Key | - |

#### 对象存储配置（S3）

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `S3_ENDPOINT` | S3 端点 | `https://s3.amazonaws.com` | - |
| `S3_ACCESS_KEY_ID` | S3 访问密钥 ID | - | - |
| `S3_SECRET_ACCESS_KEY` | S3 访问密钥 | - | - |
| `S3_REGION` | S3 区域 | `us-east-1` | - |
| `S3_BUCKET` | S3 存储桶名称 | - | - |

#### 监控配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `SENTRY_DSN` | Sentry DSN | - | - |
| `SENTRY_AUTH_TOKEN` | Sentry 认证 Token | - | - |
| `SENTRY_ENVIRONMENT` | Sentry 环境 | `production` | - |
| `NEXT_PUBLIC_SENTRY_DSN` | 客户端 Sentry DSN | - | - |

#### 日志配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `LOG_LEVEL` | 日志级别 | `info` | - |
| `LOG_FILE` | 日志文件路径 | `/app/work/logs/bypass/app.log` | - |

#### CORS 配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `ALLOWED_ORIGINS` | 允许的源 | `http://localhost:5000` | - |
| `ALLOWED_METHODS` | 允许的方法 | `GET,POST,PUT,DELETE,PATCH,OPTIONS` | - |
| `ALLOWED_HEADERS` | 允许的请求头 | `Content-Type,Authorization,X-CSRF-Token` | - |

#### 文件上传配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `MAX_FILE_SIZE` | 最大文件大小（字节） | `10485760` | - |
| `ALLOWED_FILE_TYPES` | 允许的文件类型 | `.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif` | - |

#### 路径配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `INSTALL_PATH` | 安装路径 | `./` | - |
| `DATA_PATH` | 数据路径 | `./data` | - |
| `LOG_PATH` | 日志路径 | `./logs` | - |
| `UPLOAD_PATH` | 上传路径 | `./uploads` | - |
| `TEMP_PATH` | 临时路径 | `./temp` | - |

### 配置文件说明

#### `.env` - 环境变量

主配置文件，包含所有环境变量。

#### `prisma/schema.prisma` - 数据库模型

定义数据库结构和关系。

#### `tsconfig.json` - TypeScript 配置

TypeScript 编译选项和路径别名。

#### `next.config.js` - Next.js 配置

Next.js 框架配置。

#### `tailwind.config.js` - Tailwind CSS 配置

Tailwind CSS 主题和插件配置。

---

## 👨‍💻 开发指南

### 项目结构

```
CMAMSys/
├── .coze/                    # Coze CLI 配置
├── docker/                   # Docker 配置
│   ├── docker-compose.yml    # Docker Compose 配置
│   ├── Dockerfile            # Docker 镜像构建文件
│   └── .env                  # Docker 环境变量
├── prisma/                   # Prisma ORM
│   ├── schema.prisma         # 数据库模型
│   ├── seed.ts               # 数据库种子数据
│   └── migrations/           # 数据库迁移文件
├── public/                   # 静态资源
│   ├── logo.svg             # Logo 图片
│   └── favicon.ico          # 网站图标
├── scripts/                  # 脚本文件
│   ├── install.sh           # 安装脚本
│   ├── build.sh             # 构建脚本
│   ├── start.sh             # 启动脚本
│   └── dev.sh               # 开发脚本
├── src/                      # 源代码
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # 认证相关页面
│   │   │   ├── login/       # 登录页面
│   │   │   ├── register/    # 注册页面
│   │   │   └── forgot-password/ # 忘记密码
│   │   ├── admin/           # 管理后台
│   │   │   ├── users/       # 用户管理
│   │   │   └── logs/        # 日志查看
│   │   ├── api/             # API 路由
│   │   │   ├── auth/        # 认证 API
│   │   │   ├── ai-providers/# AI Provider API
│   │   │   ├── auto-modeling/ # 自动建模 API
│   │   │   ├── teams/       # 团队 API
│   │   │   ├── learning/    # 学习 API
│   │   │   └── install/     # 安装 API
│   │   ├── dashboard/       # 工作台
│   │   ├── install/         # 安装向导
│   │   ├── settings/        # 系统设置
│   │   ├── learning/        # 学习中心
│   │   └── layout.tsx       # 根布局
│   ├── components/          # React 组件
│   │   ├── ui/             # shadcn/ui 组件
│   │   ├── auth/           # 认证组件
│   │   └── dashboard/      # 工作台组件
│   ├── lib/                 # 工具库
│   │   ├── prisma.ts       # Prisma 客户端
│   │   ├── auth.ts         # 认证工具
│   │   ├── ai-providers.ts # AI Provider 集成
│   │   ├── rate-limit.ts   # 速率限制
│   │   └── utils.ts        # 工具函数
│   └── types/              # TypeScript 类型定义
├── .env.example             # 环境变量示例
├── .eslintrc.json           # ESLint 配置
├── .gitignore               # Git 忽略文件
├── next.config.js           # Next.js 配置
├── package.json             # 项目依赖
├── pnpm-lock.yaml           # pnpm 锁文件
├── README.md                # 项目文档
├── tailwind.config.js       # Tailwind CSS 配置
└── tsconfig.json            # TypeScript 配置
```

### 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器（热重载）
pnpm dev

# 构建项目
pnpm build

# 启动生产服务器
pnpm start

# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:coverage

# 运行类型检查
pnpm ts-check

# 代码检查
pnpm lint

# 数据库迁移
pnpm prisma migrate dev

# 数据库迁移（生产环境）
pnpm prisma migrate deploy

# 生成 Prisma Client
pnpm prisma generate

# 打开 Prisma Studio（数据库可视化工具）
pnpm prisma studio

# 填充种子数据
pnpm prisma seed

# 重置数据库（删除所有数据）
pnpm prisma migrate reset

# Docker 构建
pnpm docker:build

# Docker 部署
pnpm docker:deploy

# Docker 开发环境
pnpm docker:dev

# Docker 生产环境
pnpm docker:prod
```

### 代码规范

#### 命名规范

- **文件名**：kebab-case（如 `user-profile.tsx`）
- **组件名**：PascalCase（如 `UserProfile`）
- **函数名**：camelCase（如 `getUserProfile`）
- **常量名**：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- **类型名**：PascalCase（如 `UserProfile`）

#### 导入顺序

```typescript
// 1. 外部库
import { useState, useEffect } from 'react';
import { NextResponse } from 'next/server';

// 2. 内部模块
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';

// 3. 类型定义
import type { User } from '@/types';

// 4. 相对路径导入
import { formatDate } from '../utils';
```

#### TypeScript 规范

```typescript
// 使用接口定义对象结构
interface User {
  id: string;
  name: string;
  email: string;
}

// 使用类型别名定义联合类型
type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

// 使用泛型提高代码复用性
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 避免使用 any，使用 unknown 或具体类型
function processData(data: unknown) {
  if (typeof data === 'string') {
    // ...
  }
}
```

### API 路由开发

#### 创建 API 路由

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 定义请求验证 schema
const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// GET 请求
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取用户失败' },
      { status: 500 }
    );
  }
}

// POST 请求
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);

    const user = await prisma.user.create({
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '创建用户失败' },
      { status: 500 }
    );
  }
}
```

### 组件开发

#### 使用 shadcn/ui 组件

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UserProfileForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 处理表单提交
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户资料</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit">保存</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 状态管理

#### 使用 React Hooks

```typescript
'use client';

import { useState, useEffect } from 'react';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data.data);
      } catch (error) {
        console.error('获取用户失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 错误处理

#### API 错误处理

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 处理逻辑
    return NextResponse.json({ success: true });
  } catch (error) {
    // 记录错误
    console.error('API 错误:', error);

    // 返回错误响应
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
```

#### 前端错误处理

```typescript
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function CreateUserForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('创建用户失败');
      }

      const data = await response.json();
      toast.success('用户创建成功');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🐳 部署指南

### Docker 部署

#### 1. 使用 Docker Compose（推荐）

```bash
# 复制环境变量文件
cp docker/.env.community docker/.env

# 编辑环境变量
vim docker/.env

# 启动服务
docker compose -f docker/docker-compose.community.yml up -d

# 查看日志
docker compose -f docker/docker-compose.community.yml logs -f

# 停止服务
docker compose -f docker/docker-compose.community.yml down

# 重启服务
docker compose -f docker/docker-compose.community.yml restart
```

#### 2. 自定义部署

```bash
# 构建 Docker 镜像
docker build -f docker/Dockerfile -t cmamsys:latest .

# 运行容器
docker run -d \
  --name cmamsys \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  --restart unless-stopped \
  cmamsys:latest
```

### 服务器部署

#### 1. 准备服务器

```bash
# 安装 Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm@9.0.0

# 安装 PostgreSQL 16
sudo apt install -y postgresql-16

# 安装 Redis（可选）
sudo apt install -y redis-server
```

#### 2. 克隆代码

```bash
# 克隆仓库
git clone https://github.com/Yogdunana/CMAMSys.git
cd CMAMSys

# 安装依赖
pnpm install
```

#### 3. 配置环境

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑环境变量
vim .env
```

#### 4. 初始化数据库

```bash
# 运行数据库迁移
pnpm prisma migrate deploy

# 生成 Prisma Client
pnpm prisma generate
```

#### 5. 构建和启动

```bash
# 构建项目
pnpm build

# 启动服务
pnpm start
```

#### 6. 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start pnpm --name "cmamsys" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs cmamsys

# 重启应用
pm2 restart cmamsys

# 停止应用
pm2 stop cmamsys

# 开机自启
pm2 startup
pm2 save
```

#### 7. 配置 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/cmamsys
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/cmamsys /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 8. 配置 SSL（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 云平台部署

#### 1. Vercel 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

#### 2. Railway 部署

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

#### 3. Render 部署

1. 连接 GitHub 仓库
2. 配置环境变量
3. 部署应用

---

## 📚 API 文档

### 认证相关

#### 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "username": "username"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

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
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "username": "username"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

#### 刷新 Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### AI Provider 相关

#### 获取所有 Provider

```http
GET /api/ai-providers
Authorization: Bearer {accessToken}
```

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "name": "DeepSeek",
      "type": "deepseek",
      "enabled": true
    }
  ]
}
```

#### 添加 Provider

```http
POST /api/ai-providers
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "DeepSeek",
  "type": "deepseek",
  "apiKey": "your-api-key",
  "enabled": true
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "DeepSeek",
    "type": "deepseek",
    "enabled": true
  }
}
```

#### 测试连接

```http
POST /api/ai-providers/test
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "deepseek",
  "apiKey": "your-api-key"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "连接成功"
  }
}
```

### 自动建模相关

#### 开始建模任务

```http
POST /api/auto-modeling/start
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "数学建模任务",
  "description": "任务描述",
  "config": {
    "competitionType": "MCM",
    "aiProviderId": "cuid",
    "phases": ["discussion", "code", "validation", "paper"]
  }
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "数学建模任务",
    "status": "RUNNING",
    "currentPhase": "DISCUSSION"
  }
}
```

#### 获取任务状态

```http
GET /api/auto-modeling/{id}/status
Authorization: Bearer {accessToken}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "数学建模任务",
    "status": "RUNNING",
    "currentPhase": "CODE",
    "progress": 50,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:30:00Z"
  }
}
```

#### 生成论文

```http
POST /api/auto-modeling/{id}/generate-paper
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "language": "chinese",
  "format": "pdf"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "paperId": "cuid",
    "downloadUrl": "/api/auto-modeling/{id}/paper?download=true"
  }
}
```

---

## 🧪 测试指南

### 单元测试

#### 使用 Vitest

```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '../utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01');
    const formatted = formatDate(date);
    expect(formatted).toBe('2024-01-01');
  });
});
```

### 集成测试

#### 测试 API 路由

```typescript
// src/app/api/__tests__/users.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('User API', () => {
  beforeAll(async () => {
    // 初始化测试数据库
    await prisma.$executeRawUnsafe('TRUNCATE TABLE users CASCADE');
  });

  it('should create a user', async () => {
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
      }),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Test User');
  });
});
```

### E2E 测试

#### 使用 Playwright

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:5000/auth/login');

  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:5000/dashboard');
});
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test --run

# 运行测试（监听模式）
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# 运行 E2E 测试
npx playwright test
```

---

## 🔧 故障排查

### 常见问题

#### 1. 数据库连接失败

**问题**：`Error: P1001: Can't reach database server`

**解决方案**：
```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 启动 PostgreSQL
sudo systemctl start postgresql

# 检查 DATABASE_URL 配置
echo $DATABASE_URL
```

#### 2. Prisma Client 生成失败

**问题**：`Error: P5006`

**解决方案**：
```bash
# 重新生成 Prisma Client
pnpm prisma generate

# 清理缓存
rm -rf node_modules/.prisma
pnpm prisma generate
```

#### 3. 安装依赖失败

**问题**：`npm ERR! code ERESOLVE`

**解决方案**：
```bash
# 使用 pnpm 安装（推荐）
pnpm install

# 或强制解决依赖冲突
npm install --legacy-peer-deps
```

#### 4. 端口被占用

**问题**：`Error: listen EADDRINUSE: address already in use :::5000`

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :5000

# 杀死进程
kill -9 <PID>

# 或使用其他端口
PORT=3000 pnpm dev
```

#### 5. JWT Token 无效

**问题**：`Error: Invalid token`

**解决方案**：
```bash
# 检查 JWT_SECRET 是否正确配置
echo $JWT_SECRET

# 重新生成密钥
openssl rand -base64 32

# 更新 .env 文件
# 重启服务
```

#### 6. AI Provider 连接失败

**问题**：`Error: AI Provider connection failed`

**解决方案**：
```bash
# 检查 API Key 是否正确
# 检查网络连接
# 测试连接
curl -X POST http://localhost:5000/api/ai-providers/test \
  -H "Content-Type: application/json" \
  -d '{"type":"deepseek","apiKey":"your-key"}'
```

### 日志查看

```bash
# 查看应用日志
tail -f /app/work/logs/bypass/app.log

# 查看 Docker 日志
docker compose -f docker/docker-compose.yml logs -f app

# 查看 PM2 日志
pm2 logs cmamsys
```

### 性能问题

#### 1. 数据库查询慢

**解决方案**：
```bash
# 添加索引
# 在 prisma/schema.prisma 中添加
@@index([fieldName])

# 生成迁移
pnpm prisma migrate dev
```

#### 2. 内存占用高

**解决方案**：
```bash
# 检查内存使用
node --max-old-space-size=4096 pnpm start

# 或在 package.json 中配置
{
  "scripts": {
    "start": "node --max-old-space-size=4096 node_modules/.bin/next start"
  }
}
```

---

## ❓ 常见问题

### 一般问题

**Q: CMAMSys 支持哪些竞赛？**

A: 目前支持 MCM/ICM、CUMCM、深圳杯、IMMC 等主流竞赛，其他竞赛可通过自定义模板支持。

**Q: 可以离线使用吗？**

A: 可以，但 AI 功能需要联网。您可以配置本地 AI Provider 或使用离线模式。

**Q: 如何备份数据？**

A: 使用 PostgreSQL 的备份工具：
```bash
pg_dump cmamsys > backup.sql
```

**Q: 如何升级到新版本？**

A: 拉取最新代码并运行迁移：
```bash
git pull origin main
pnpm install
pnpm prisma migrate deploy
pnpm build
pnpm start
```

### 技术问题

**Q: 如何自定义主题？**

A: 修改 `tailwind.config.js` 中的主题配置。

**Q: 如何添加新的 AI Provider？**

A: 在 `src/lib/ai-providers.ts` 中添加新的 Provider 配置。

**Q: 如何优化性能？**

A: 
1. 启用 Redis 缓存
2. 添加数据库索引
3. 使用 CDN 加速静态资源
4. 启用 Gzip 压缩

### 部署问题

**Q: Docker 部署后无法访问？**

A: 检查端口映射和网络配置：
```bash
docker ps
docker network inspect cmamsys-network
```

**Q: 如何配置 HTTPS？**

A: 使用 Nginx + Let's Encrypt：
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 📄 许可证

MIT License

Copyright (c) 2024 CMAMSys Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 📞 联系方式

- **GitHub**: https://github.com/Yogdunana/CMAMSys
- **Issues**: https://github.com/Yogdunana/CMAMSys/issues
- **Email**: support@cmamsys.com

---

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 📝 更新日志

### v1.0.0 (2024-01-01)

#### 新功能
- ✅ 完整的安装向导
- ✅ AI Provider 集成（DeepSeek, OpenAI, 阿里云, 火山引擎）
- ✅ 自动建模流程（讨论、代码、校验、论文）
- ✅ 团队协作功能
- ✅ 视频学习模块
- ✅ 系统管理后台
- ✅ JWT 认证系统
- ✅ MFA 支持
- ✅ Docker 部署支持

#### 技术栈
- Next.js 16.1.6
- React 19.2.4
- TypeScript 5.9.3
- Prisma 6.19.2
- PostgreSQL 16

#### 文档
- ✅ 完整的 API 文档
- ✅ 部署指南
- ✅ 开发指南
- ✅ 故障排查

---

<div align="center">

**如果这个项目对您有帮助，请给我们一个 ⭐️**

Made with ❤️ by CMAMSys Team

</div>
