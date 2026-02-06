# CMAMSys 项目总结文档

## 项目概述

**CMAMSys** (CompetiMath AutoModel System) 是一个面向团队和个人的企业级数学建模竞赛平台，支持从数据预处理到报告生成的全流程自动化。

### 核心价值

- 🚀 **自动化建模流水线**：从数据处理到模型构建的全流程自动化
- 👥 **多用户协作**：支持团队协作、项目管理、权限控制
- 🔒 **私有化部署**：支持本地服务器/NAS 部署，数据完全自主可控
- 🤖 **AI 驱动**：集成 DeepSeek、VolcEngine、Aliyun 等主流 AI 服务
- 🌙 **夜间模式**：完整的暗色主题支持
- 📊 **数据可视化**：丰富的图表和数据展示

### 版本体系

| 版本 | 功能 | 授权 | 部署 |
|------|------|------|------|
| **Community** | 基础建模、团队协作、报告生成 | MIT 开源 | 自由部署 |
| **Professional** | 高级分析、智能模型选择 | 商业授权 | 付费订阅 |
| **Enterprise** | 全功能、SSO、无限存储、优先支持 | 商业授权 | 私有化部署 |

---

## 技术架构

### 前端技术栈

- **框架**：Next.js 16 (App Router)
- **UI 库**：React 19 + shadcn/ui + Tailwind CSS 4
- **状态管理**：React Context + Zustand
- **表单处理**：React Hook Form + Zod
- **图表库**：Recharts
- **代码编辑器**：Monaco Editor

### 后端技术栈

- **框架**：Next.js API Routes
- **ORM**：Prisma
- **数据库**：PostgreSQL 16
- **缓存**：Redis 7 (可选)
- **对象存储**：MinIO / S3 兼容 (企业版)

### 认证与安全

- **JWT 认证**：Access Token + Refresh Token 双令牌机制
- **密码加密**：BCrypt (12 rounds)
- **多因素认证**：TOTP (OTP) 支持
- **SSO 集成**：SAML / LDAP (企业版)
- **CSRF 保护**：内置 CSRF Token 验证
- **Rate Limiting**：API 速率限制

### 部署技术栈

- **容器化**：Docker + Docker Compose
- **反向代理**：Nginx (企业版)
- **SSL/TLS**：Let's Encrypt 自动证书
- **监控**：Sentry 错误追踪 + 自定义指标

---

## 核心功能清单

### 1. 用户管理系统

- ✅ 用户注册/登录（邮箱验证）
- ✅ JWT 双令牌认证（Access + Refresh）
- ✅ 密码重置（邮件发送）
- ✅ MFA 多因素认证（TOTP）
- ✅ 用户角色管理（USER/ADMIN）
- ✅ 用户资料编辑
- ✅ SSO 单点登录（企业版）

### 2. 团队协作系统

- ✅ 创建/管理团队
- ✅ 团队成员邀请/移除
- ✅ 团队角色分配（Owner/Admin/Member）
- ✅ 团队活动日志
- ✅ 团队权限控制

### 3. 竞赛管理系统

- ✅ 创建/发布竞赛
- ✅ 竞赛规则配置
- ✅ 竞赛时间管理
- ✅ 竞赛状态管理（草稿/进行中/已结束）
- ✅ 竞赛参与者管理

### 4. 项目管理系统

- ✅ 创建/管理项目
- ✅ 项目模板系统
- ✅ 项目进度跟踪
- ✅ 项目文件管理
- ✅ 项目协作功能

### 5. AI Provider 管理系统

- ✅ AI Provider 配置（DeepSeek/VolcEngine/Aliyun 等）
- ✅ 智能模型选择（基于上下文）
- ✅ API 密钥管理
- ✅ 请求配额控制
- ✅ 请求日志记录

### 6. 自动化建模功能

- ✅ 数据预处理
- ✅ 特征工程
- ✅ 模型选择
- ✅ 模型训练
- ✅ 模型评估
- ✅ 报告生成

### 7. 许可证管理系统

- ✅ License Key 验证
- ✅ 版本功能控制（Community/Professional/Enterprise）
- ✅ Feature Flags 管理
- ✅ 离线模式支持

### 8. 日志系统

- ✅ 全局日志记录（DEBUG/INFO/WARN/ERROR/FATAL）
- ✅ 日志分级存储
- ✅ 日志轮转
- ✅ 错误追踪
- ✅ 审计日志（企业版）

### 9. 系统设置

- ✅ 站点基本信息配置
- ✅ 注册开关控制
- ✅ 文件上传限制
- ✅ 邮件配置
- ✅ 备份配置

### 10. UI/UX 功能

- ✅ 响应式设计（桌面/平板/手机）
- ✅ 夜间模式（深色主题）
- ✅ 国际化（i18n）框架
- ✅ 通知系统
- ✅ 加载状态提示

---

## 数据库架构

### 核心表结构

#### 用户系统

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `User` | 用户表 | id, email, passwordHash, name, role |
| `Team` | 团队表 | id, name, ownerId, maxMembers |
| `TeamMember` | 团队成员表 | id, teamId, userId, role |

#### 业务系统

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `Competition` | 竞赛表 | id, title, description, status |
| `Project` | 项目表 | id, name, teamId, status |
| `Model` | 模型表 | id, projectId, type, metrics |
| `Report` | 报告表 | id, projectId, content, format |

#### AI 系统

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `AIProvider` | AI Provider 表 | id, name, provider, apiKey |
| `AIRequest` | AI 请求日志表 | id, provider, model, status |
| `AIResponse` | AI 响应表 | id, requestId, content, tokens |

#### 系统管理

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `SystemSetting` | 系统设置表 | id, key, value, category |
| `SystemLog` | 系统日志表 | id, level, message, context |
| `LicenseInfo` | 许可证信息表 | id, licenseKey, plan, status |

### 数据库索引

```sql
-- 用户相关索引
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);

-- 团队相关索引
CREATE INDEX idx_team_owner ON "Team"(ownerId);
CREATE INDEX idx_team_member_team ON "TeamMember"(teamId);
CREATE INDEX idx_team_member_user ON "TeamMember"(userId);

-- 业务相关索引
CREATE INDEX idx_competition_status ON "Competition"(status);
CREATE INDEX idx_project_team ON "Project"(teamId);
CREATE INDEX idx_project_status ON "Project"(status);

-- AI 相关索引
CREATE INDEX idx_ai_request_provider ON "AIRequest"(provider);
CREATE INDEX idx_ai_request_created ON "AIRequest"(createdAt);

-- 日志相关索引
CREATE INDEX idx_log_level ON "SystemLog"(level);
CREATE INDEX idx_log_created ON "SystemLog"(createdAt);
```

---

## 项目目录结构

```
cmamsys/
├── docker/                      # Docker 部署配置
│   ├── Dockerfile.community    # 社区版镜像
│   ├── Dockerfile.enterprise   # 企业版镜像
│   ├── docker-compose.community.yml  # 社区版 Compose 配置
│   ├── docker-compose.enterprise.yml # 企业版 Compose 配置
│   ├── build.sh                # 构建脚本
│   ├── deploy.sh               # 部署脚本
│   ├── init-db.sql             # 数据库初始化脚本
│   ├── nginx.conf              # Nginx 配置
│   ├── .env.community.example  # 社区版环境变量示例
│   └── .env.enterprise.example # 企业版环境变量示例
├── docs/                        # 文档目录
│   ├── deployment-guide.md     # 部署指南
│   ├── api-guide.md            # API 文档
│   └── architecture.md         # 架构文档
├── src/                         # 源代码
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # 认证相关 API
│   │   │   ├── teams/          # 团队管理 API
│   │   │   ├── competitions/   # 竞赛管理 API
│   │   │   ├── projects/       # 项目管理 API
│   │   │   ├── ai-providers/   # AI Provider API
│   │   │   ├── settings/       # 系统设置 API
│   │   │   └── health/         # 健康检查 API
│   │   ├── dashboard/          # 仪表盘页面
│   │   ├── teams/              # 团队管理页面
│   │   ├── competitions/       # 竞赛管理页面
│   │   ├── projects/           # 项目管理页面
│   │   ├── settings/           # 设置页面
│   │   ├── login/              # 登录页面
│   │   └── layout.tsx          # 根布局
│   ├── components/             # 组件
│   │   ├── ui/                 # shadcn/ui 组件
│   │   ├── dashboard/          # 仪表盘组件
│   │   ├── teams/              # 团队组件
│   │   └── shared/             # 共享组件
│   ├── lib/                    # 工具库
│   │   ├── logger.ts           # 日志系统
│   │   ├── license.ts          # 许可证管理
│   │   ├── features.ts         # Feature Flags
│   │   └── utils.ts            # 工具函数
│   ├── services/               # 服务层
│   │   ├── ai-provider.ts      # AI Provider 服务
│   │   ├── auth.ts             # 认证服务
│   │   └── database.ts         # 数据库服务
│   ├── middleware/             # 中间件
│   │   ├── auth.ts             # 认证中间件
│   │   └── error-handler.ts    # 错误处理中间件
│   └── types/                  # TypeScript 类型定义
│       ├── models/             # 数据模型类型
│       └── api/                # API 类型
├── prisma/                      # Prisma 配置
│   ├── schema.prisma           # 数据库模型定义
│   └── migrations/             # 数据库迁移
├── public/                      # 静态资源
│   ├── images/                 # 图片资源
│   └── fonts/                  # 字体文件
├── .coze                        # Coze 配置
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git 忽略文件
├── package.json                 # 项目依赖
├── pnpm-lock.yaml              # pnpm 锁定文件
├── tsconfig.json               # TypeScript 配置
├── tailwind.config.ts          # Tailwind CSS 配置
├── next.config.ts              # Next.js 配置
└── README.md                   # 项目说明
```

---

## API 接口规范

### 认证相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| POST | `/api/auth/logout` | 用户登出 | ✅ |
| POST | `/api/auth/refresh` | 刷新 Token | ❌ |
| POST | `/api/auth/forgot-password` | 忘记密码 | ❌ |
| POST | `/api/auth/reset-password` | 重置密码 | ❌ |
| GET | `/api/auth/me` | 获取当前用户信息 | ✅ |
| POST | `/api/auth/mfa/enable` | 启用 MFA | ✅ |
| POST | `/api/auth/mfa/verify` | 验证 MFA | ✅ |

### 团队管理

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/teams` | 获取团队列表 | ✅ |
| POST | `/api/teams` | 创建团队 | ✅ |
| GET | `/api/teams/[id]` | 获取团队详情 | ✅ |
| PUT | `/api/teams/[id]` | 更新团队信息 | ✅ |
| DELETE | `/api/teams/[id]` | 删除团队 | ✅ |
| POST | `/api/teams/[id]/members` | 添加团队成员 | ✅ |
| DELETE | `/api/teams/[id]/members/[userId]` | 移除团队成员 | ✅ |

### 竞赛管理

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/competitions` | 获取竞赛列表 | ✅ |
| POST | `/api/competitions` | 创建竞赛 | ✅ |
| GET | `/api/competitions/[id]` | 获取竞赛详情 | ✅ |
| PUT | `/api/competitions/[id]` | 更新竞赛信息 | ✅ |
| DELETE | `/api/competitions/[id]` | 删除竞赛 | ✅ |

### 项目管理

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/projects` | 获取项目列表 | ✅ |
| POST | `/api/projects` | 创建项目 | ✅ |
| GET | `/api/projects/[id]` | 获取项目详情 | ✅ |
| PUT | `/api/projects/[id]` | 更新项目信息 | ✅ |
| DELETE | `/api/projects/[id]` | 删除项目 | ✅ |
| POST | `/api/projects/[id]/run` | 运行项目 | ✅ |

### AI Provider 管理

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/ai-providers` | 获取 AI Provider 列表 | ✅ |
| POST | `/api/ai-providers` | 创建 AI Provider | ✅ (ADMIN) |
| GET | `/api/ai-providers/[id]` | 获取 AI Provider 详情 | ✅ |
| PUT | `/api/ai-providers/[id]` | 更新 AI Provider | ✅ (ADMIN) |
| DELETE | `/api/ai-providers/[id]` | 删除 AI Provider | ✅ (ADMIN) |
| GET | `/api/ai-providers/types` | 获取支持的 Provider 类型 | ✅ |

### 系统设置

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/settings` | 获取系统设置 | ✅ (ADMIN) |
| PUT | `/api/settings` | 更新系统设置 | ✅ (ADMIN) |
| GET | `/api/settings/license` | 获取许可证信息 | ✅ (ADMIN) |
| POST | `/api/settings/license/activate` | 激活许可证 | ✅ (ADMIN) |

### 健康检查

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/health` | 系统健康检查 | ❌ |

---

## 安全设计

### 1. 认证安全

- JWT 双令牌机制（Access Token: 15 分钟，Refresh Token: 7 天）
- 密码 BCrypt 加密（12 rounds）
- MFA 多因素认证（TOTP）
- CSRF Token 验证
- 登录失败次数限制

### 2. API 安全

- Role-Based Access Control (RBAC)
- API 速率限制
- 请求签名验证
- SQL 注入防护（Prisma ORM）
- XSS 防护

### 3. 数据安全

- 数据库加密（PostgreSQL SSL）
- 敏感数据脱敏
- 文件上传限制
- HTTPS 强制跳转

### 4. 日志安全

- 敏感信息过滤
- 日志文件权限控制
- 审计日志（企业版）

---

## 性能优化

### 1. 前端优化

- Next.js SSG/SSR
- 图片懒加载
- 代码分割
- 缓存策略
- Service Worker

### 2. 后端优化

- Redis 缓存
- 数据库索引优化
- 连接池管理
- 异步任务处理

### 3. 部署优化

- Docker 多阶段构建
- Nginx 反向代理
- CDN 加速
- 负载均衡（企业版）

---

## 监控与运维

### 1. 健康检查

```bash
# API 健康检查
curl http://localhost:5000/api/health
```

### 2. 日志查看

```bash
# 应用日志
docker logs cmamsys-community-app

# 数据库日志
docker logs cmamsys-community-postgres
```

### 3. 指标监控

- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络流量
- API 响应时间

### 4. 错误追踪

- Sentry 集成
- 错误日志聚合
- 自动告警（企业版）

---

## 测试策略

### 1. 单元测试

- 工具：Jest + React Testing Library
- 覆盖率：> 80%

### 2. 集成测试

- API 测试
- 数据库测试
- 第三方服务测试

### 3. E2E 测试

- 工具：Playwright
- 覆盖核心流程

---

## 部署清单

### 社区版部署

- [x] Dockerfile 社区版
- [x] Docker Compose 配置
- [x] 数据库初始化脚本
- [x] 环境变量配置
- [x] 部署脚本

### 企业版部署

- [x] Dockerfile 企业版
- [x] Docker Compose 配置（含 Redis/MinIO/Nginx）
- [x] Nginx 配置
- [x] SSL 证书配置
- [x] 许可证验证
- [x] 备份脚本

---

## 未来规划

### Phase 1: 核心功能完善（Q1 2025）

- [ ] 完善自动化建模流水线
- [ ] 优化 AI 模型选择算法
- [ ] 增强数据分析可视化

### Phase 2: 高级功能（Q2 2025）

- [ ] Webhook 支持
- [ ] API 访问控制
- [ ] 自定义模型训练

### Phase 3: 生态扩展（Q3 2025）

- [ ] 插件系统
- [ ] 第三方集成（Slack、Teams）
- [ ] 移动端应用

### Phase 4: 企业级功能（Q4 2025）

- [ ] 多租户支持
- [ ] 私有模型部署
- [ ] 数据分析报表

---

## 贡献指南

### 开发环境搭建

```bash
# 1. 克隆项目
git clone https://github.com/your-org/cmamsys.git
cd cmamsys

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 4. 初始化数据库
pnpm prisma migrate dev

# 5. 启动开发服务器
pnpm dev
```

### 代码规范

- ESLint + Prettier
- Airbnb Style Guide
- Conventional Commits

### 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

---

## 许可证

- 社区版：MIT License
- 企业版：商业许可证

---

## 联系方式

- 📧 邮件：contact@cmamsys.com
- 📚 文档：https://docs.cmamsys.com
- 💬 社区：https://community.cmamsys.com
- 🐛 问题反馈：https://github.com/your-org/cmamsys/issues

---

*项目总结文档最后更新：2025-01-15*
