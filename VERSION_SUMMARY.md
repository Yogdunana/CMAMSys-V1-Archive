# 压缩摘要

## 用户需求与目标
- 原始目标: 构建一个企业级数学建模竞赛自动化系统 (CMAMSys)，支持从数据预处理到报告生成的全流程。
- 当前目标: 完善 v2.2.0 及 v2.3.0 版本规划，包括移动端应用文档、插件开发文档、国际化文档及 UI 组件库文档。

## 项目概览
- 概述: CMAMSys 是一个基于 Next.js 的企业级数学建模竞赛平台，支持竞赛管理、建模任务、AI Provider 集成、用户认证、视频学习及多语言国际化。
- 技术栈:
  - Next.js 16 (App Router)
  - React 19
  - TypeScript 5
  - Prisma 5 (ORM)
  - PostgreSQL (数据库配置见 .env)
  - Tailwind CSS 4
  - shadcn/ui (组件库)
  - next-intl (国际化)
  - coze-coding-dev-sdk (LLM SDK)
- 编码规范: ESLint + TypeScript strict mode

## 关键决策
- 采用 Prisma ORM 进行数据库管理，支持复杂的关联查询。
- 使用 PostgreSQL 作为生产数据库，已配置远程连接。
- 实现中英双语国际化系统，使用 `next-intl`，支持在设置中切换语言。
- 数据库 Schema 设计采用关系型模型，新增 `AutoModelingTask`, `GroupDiscussion`, `DiscussionMessage`, `CodeGeneration`, `CodeValidation`, `GeneratedPaper`, `CostControl`, `DiscussionCache` 表以支持全自动化流程。
- 采用 SSE (Server-Sent Events) 实现建模任务实时日志流，模拟 AI 思考过程。
- 移除团队协作功能，专注于单人管理场景。
- 接入阿里云百炼平台、火山引擎（豆包）及 DeepSeek 作为 LLM Provider，使用 `coze-coding-dev-sdk` 进行集成。
- 支持火山引擎推理接入点（Endpoint）映射，允许用户通过配置将通用模型名称映射为具体的接入点名称。
- 实现 API Key 加密存储（AES-256-GCM），提升安全性。
- 实现全局认证状态管理（AuthContext），支持自动 Token 刷新和路由保护。
- 修复管理员账户为 `Yogdunana`（原为 `admin`）。
- AI Provider 支持手动选择模式和首选设置，通过 localStorage 和数据库 `isDefault` 字段控制。
- 实现全自动化流程：群聊讨论 → 代码生成 → 自动校验 → 回溯（最多3次）→ 论文生成。
- 修复 Hydration 错误，为 `body` 元素添加 `suppressHydrationWarning` 属性。
- 适配 Next.js 16 动态路由异步 params 变更，所有动态路由已迁移至 `{ params }: { params: Promise<{ id: string }> }` 模式。

## 核心文件修改
- 文件操作:
  - create: `docs/architecture-diagrams.md` (系统架构图和流程图)
  - create: `docs/testing-guide.md` (测试指南)
  - create: `docs/api-reference.md` (API 参考文档)
  - create: `README.en.md` (英文版 README)
  - create: `docs/documentation-versioning.md` (文档版本管理规范)
  - create: `CHANGELOG.md` (更新日志)
  - create: `docs/v2.2.0-implementation-guide.md` (v2.2.0 实施指南)
  - create: `docs/v2.3.0-planning-guide.md` (v2.3.0 规划指南)
- 关键修改:
  - 创建了完整的架构图和流程图文档，包含系统架构、数据流向、认证流程等。
  - 创建了详细的测试指南，涵盖单元测试、集成测试、E2E 测试及最佳实践。
  - 创建了完整的 API 参考文档和 OpenAPI 规范。
  - 创建了英文版 README，支持国际化。
  - 创建了文档版本管理规范和更新日志。
  - 完成了 v2.2.0 高级功能（Swagger UI、在线预览、搜索、统计）的规划和实施指南编写。
  - 完成了 v2.3.0 扩展功能（移动端、插件、国际化、UI 组件）的规划和指南编写。

## 问题或错误及解决方案
- 无新问题。

## TODO
- ✅ 移动端应用文档
- ✅ 插件开发文档
- ✅ 完整国际化（i18n）文档
- ✅ UI 组件库文档
