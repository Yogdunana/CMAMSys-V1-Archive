> ⚠️ **安全提示**
>
> 本仓库为归档版本，代码中可能包含测试用硬编码配置（如数据库密码、本地路径），仅用于学习参考，请勿直接部署到生产环境。
> 生产环境使用前，请替换所有硬编码配置为自己的安全配置。

---

# CMAMSys - Competitive Mathematics AutoModel System

<div align="center">

**企业级数学建模竞赛平台**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)

</div>

---

## 📖 项目简介

CMAMSys 是一个功能完备的企业级数学建模竞赛平台，支持竞赛管理、团队协作、AI 辅助建模、作品提交、评审打分等全流程管理。

### 核心功能

- 🔐 **用户认证** - 完整的认证系统，支持邮箱注册、多因素认证、密码重置
- 👥 **用户管理** - 角色权限管理、团队管理、用户资料管理
- 📊 **竞赛管理** - 创建竞赛、设置规则、管理参赛者
- 🤖 **AI 辅助** - 集成多种 AI Provider，辅助建模任务
- 📝 **作品管理** - 在线编辑、文档管理、版本控制
- 📈 **数据分析** - 统计分析、可视化报表
- 🔍 **审计日志** - 完整的操作日志追踪
- 🌐 **多语言** - 支持国际化 (i18n)

---

## 🚀 快速开始

### 环境要求

- Node.js 24+
- PostgreSQL 16
- pnpm 9+
- Redis 7+ (可选)

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/Yogdunana/CMAMSys-V1-Archive.git
cd CMAMSys-V1-Archive
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

4. **初始化数据库**

```bash
# 生成 Prisma Client
pnpm prisma generate

# 运行数据库迁移
pnpm prisma migrate deploy

# 填充初始数据
pnpm prisma seed
```

5. **启动开发服务器**

```bash
pnpm dev
```

访问 http://localhost:5000

### 默认账户

- 邮箱: `admin@cmamsys.com`
- 密码: `REDACTED_PASSWORD`

**⚠️ 请在生产环境中立即修改默认密码！**

---

## 🛠️ 技术栈

### 前端

- **框架**: Next.js 16 (App Router)
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **语言**: TypeScript 5
- **状态管理**: React Context + Hooks

### 后端

- **框架**: Next.js API Routes
- **ORM**: Prisma 6
- **数据库**: PostgreSQL 16
- **缓存**: Redis (可选)
- **认证**: JWT + Refresh Tokens

### 开发工具

- **包管理器**: pnpm
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript
- **测试**: Vitest

---

## 📁 项目结构

```
CMAMSys/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes
│   │   ├── auth/         # 认证页面
│   │   ├── dashboard/    # 仪表盘
│   │   └── layout.tsx    # 根布局
│   ├── components/       # React 组件
│   │   └── ui/           # shadcn/ui 组件
│   ├── lib/              # 工具函数
│   ├── services/         # 业务逻辑
│   └── styles/           # 样式文件
├── prisma/
│   ├── schema.prisma     # 数据库模型
│   └── migrations/       # 迁移文件
├── docs/                 # 项目文档
├── scripts/              # 脚本工具
└── docker/               # Docker 配置
```

---

## 🔧 开发指南

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

### Git 工作流

1. 从 main 分支创建功能分支
2. 提交代码前运行测试
3. 创建 Pull Request
4. 等待 Code Review
5. 合并到 main 分支

### 提交规范

遵循 Conventional Commits 规范:

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式
refactor: 代码重构
test: 测试相关
chore: 构建/工具
```

---

## 📚 功能文档

- [API 文档](./API.md)
- [开发指南](./DEVELOPMENT.md)
- [部署指南](./DEPLOYMENT.md)
- [贡献指南](./CONTRIBUTING.md)
- [快速开始](./QUICKSTART.md)

---

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

### 贡献步骤

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

## 📮 联系方式

- 项目主页: [https://github.com/Yogdunana/CMAMSys-V1-Archive](https://github.com/Yogdunana/CMAMSys-V1-Archive)
- 问题反馈: [GitHub Issues](https://github.com/Yogdunana/CMAMSys-V1-Archive/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by CMAMSys Team

</div>
