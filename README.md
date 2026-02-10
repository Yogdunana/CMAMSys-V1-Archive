# CMAMSys - 竞赛数学自动化建模系统

<div align="center">

**CompetiMath AutoModel System**

企业级数学建模竞赛自动化平台，为团队和个人提供一站式解决方案。

[![许可证](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)

[网站](https://cmamsys.com) | [文档](#) | [演示](#)

</div>

---

## 📋 项目简介

CMAMSys 是一个全栈企业级平台，专为数学建模竞赛设计，支持包括：
- MCM/ICM（美国大学生数学建模竞赛）
- CUMCM（全国大学生数学建模竞赛）
- 深圳杯
- IMMC（国际数学建模挑战赛）
- MathorCup（ MathorCup 高校数学建模挑战赛）
- EMMC（电工杯）
- 泰迪杯
- 蓝桥杯
- 以及其他各类区域性竞赛

### 🎯 核心特性

- **自动化建模流程**：从数据预处理、模型训练、评估到报告生成，全流程自动化
- **多算法支持**：集成 Scikit-learn、XGBoost、LightGBM、PyTorch 等主流算法库
- **竞赛专用模板**：针对不同竞赛类型预配置模板
- **AI 集成**：支持多个 AI 提供商（DeepSeek、火山引擎豆包、阿里云通义千问、OpenAI 等）
- **流式输出**：支持 SSE 实时 AI 响应流式输出
- **团队协作**：多用户支持，基于角色的访问控制（RBAC）
- **每日学习模块**：自动从 Bilibili 和用户提供的资料中学习，构建知识库
- **精美可视化**：竞赛主题图表（MCM 红色、CUMCM 蓝色），支持 UML 和业务流程图
- **企业级安全**：JWT 认证、MFA 多因素认证、SSO 单点登录、防攻击措施
- **API 优先设计**：提供 REST API 支持第三方集成
- **Docker 一键部署**：支持快速部署到 NAS/服务器
- **Bilibili 学习系统**：自动从 Bilibili 视频中学习，构建专业知识库

---

## 🚀 快速开始

### 环境要求

- Node.js 24+
- pnpm 9.0.0+
- PostgreSQL 14+

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/your-org/cmamsys.git
cd cmamsys

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的配置

# 初始化数据库
pnpm prisma migrate dev

# 启动开发服务器
coze dev
```

在浏览器中打开 [http://localhost:5000](http://localhost:5000)

### 生产构建

```bash
# 构建生产版本
coze build

# 启动生产服务器
coze start
```

---

## 🏗️ 技术架构

### 技术栈

**前端**
- 框架：Next.js 16 (App Router)
- UI 库：React 19 + shadcn/ui
- 样式：Tailwind CSS 4
- 状态管理：React Hooks + Context API
- 深色模式：next-themes

**后端**
- 运行时：Next.js API Routes
- 认证：JWT + BCrypt + MFA
- 速率限制：令牌桶算法
- 数据验证：Zod

**数据库**
- ORM：Prisma
- 数据库：PostgreSQL
- 缓存：Redis（可选）

**部署**
- 容器化：Docker + Docker Compose
- 平台：Linux（兼容 NAS/服务器）

---

## 📁 项目结构

```
cmamsys/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由（微服务）
│   │   │   ├── auth/          # 认证服务
│   │   │   ├── modeling/      # 建模流程服务
│   │   │   ├── learning/      # Bilibili 学习系统
│   │   │   ├── competitions/  # 竞赛管理
│   │   │   ├── teams/         # 团队管理
│   │   │   ├── ai-providers/  # AI 提供商管理
│   │   │   ├── settings/      # 系统设置
│   │   │   └── init/          # 应用初始化
│   │   ├── dashboard/         # 主仪表盘
│   │   │   ├── competitions/  # 竞赛页面
│   │   │   ├── teams/         # 团队页面
│   │   │   └── ai-providers/  # AI 提供商页面
│   │   ├── learning/          # 学习模块
│   │   │   ├── knowledge/     # 知识库页面
│   │   │   └── settings/      # 学习设置页面
│   │   ├── settings/          # 系统设置
│   │   ├── auth/              # 登录/注册
│   │   └── layout.tsx         # 根布局
│   ├── components/            # React 组件
│   │   └── ui/                # shadcn/ui 组件
│   ├── lib/                   # 工具库
│   ├── services/              # 业务逻辑
│   │   ├── bilibili-learning.ts # Bilibili 学习服务
│   │   └── learning-cron.ts  # 定时学习任务
│   └── hooks/                 # 自定义 Hooks
├── prisma/                    # 数据库模式
│   └── schema.prisma
├── docker/                    # Docker 配置
│   ├── Dockerfile
│   └── docker-compose.yml
└── docs/                      # 文档
```

---

## 🔐 安全特性

### 认证与授权
- **密码加密**：BCrypt/Argon2 带盐哈希
- **令牌管理**：JWT（访问令牌 + 刷新令牌）
- **多因素认证**：短信/邮箱验证码
- **单点登录（SSO）**：统一认证中心
- **会话管理**：支持 Redis 集群
- **账户锁定**：失败尝试次数限制

### 防攻击措施
- **SQL 注入防护**：参数化查询
- **XSS 防护**：输入清理 + CSP（内容安全策略）
- **CSRF 防护**：CSRF Token + SameSite Cookie
- **速率限制**：令牌桶（每个 IP ≤ 10 请求/分钟）
- **输入验证**：Zod Schema 验证

---

## 🐳 Docker 部署

CMAMSys 支持两个版本的 Docker 部署：

### 版本对比

| 版本 | 功能 | 许可证 | 部署方式 |
|------|------|--------|----------|
| **社区版** | 基础建模、团队协作、报告生成 | MIT（免费） | 自托管 |
| **企业版** | 全功能 + SSO + 无限存储 + 优先支持 | 商业版 | 自托管（付费） |

### Docker 快速开始

```bash
cd docker

# 社区版（免费）
cp .env.community.example .env.community
./deploy.sh community up

# 企业版（付费）
cp .env.enterprise.example .env.enterprise
./deploy.sh enterprise up --with-redis --with-minio
```

### 详细部署文档

请参阅 [部署指南](docs/deployment-guide.md) 获取详细的部署说明，包括：
- 环境变量配置
- 数据库设置
- Redis 配置
- 对象存储配置（MinIO/S3）
- 反向代理配置（Nginx）
- SSL/HTTPS 配置
- 性能优化建议
- 故障排查指南

---

## 🌐 国际化支持

CMAMSys 支持多语言，当前支持：

- 🇨🇳 简体中文（默认）
- 🇺🇸 English

语言切换在用户设置中配置，系统会自动保存语言偏好。

---

## 📚 文档

- [安装指南](docs/installation-guide.md) - 详细的安装步骤
- [部署指南](docs/deployment-guide.md) - Docker 部署详细说明
- [开发指南](docs/development-guide.md) - 开发环境配置和代码规范
- [贡献指南](CONTRIBUTING.md) - 如何贡献代码
- [架构图](docs/architecture-diagrams.md) - 系统架构图
- [测试指南](docs/testing-guide.md) - 测试框架和规范

---

## 🤝 贡献

我们欢迎各种形式的贡献！请查看我们的[贡献指南](CONTRIBUTING.md)。

### 贡献方式

- 报告 Bug
- 提出新功能建议
- 提交代码改进
- 改进文档
- 分享使用经验

---

## 📄 许可证

- **社区版**：MIT License - 免费使用、修改和分发
- **企业版**：商业 License - 需要商业授权

许可证详情请查看 [LICENSE](LICENSE) 文件。

商业授权咨询：[license@cmamsys.com](mailto:license@cmamsys.com)

---

## 📞 技术支持

- 📧 邮箱：[support@cmamsys.com](mailto:support@cmamsys.com)
- 📚 文档：[docs.cmamsys.com](https://docs.cmamsys.com)
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-org/cmamsys/issues)
- 💬 社区讨论：[GitHub Discussions](https://github.com/your-org/cmamsys/discussions)

---

## 🌟 项目亮点

### 竞赛支持

系统针对以下竞赛进行了特别优化：

| 竞赛名称 | 英文缩写 | 主题色 | 模板支持 |
|---------|---------|--------|---------|
| 美国大学生数学建模竞赛 | MCM/ICM | 红色 | ✅ |
| 全国大学生数学建模竞赛 | CUMCM | 蓝色 | ✅ |
| 深圳杯数学建模挑战赛 | 深圳杯 | 紫色 | ✅ |
| 国际数学建模挑战赛 | IMMC | 绿色 | ✅ |
| MathorCup 数学建模挑战赛 | MathorCup | 橙色 | ✅ |
| 电工杯数学建模竞赛 | EMMC | 青色 | ✅ |
| 泰迪杯数据挖掘挑战赛 | 泰迪杯 | 黄色 | ✅ |

### AI 能力

- **多模型支持**：DeepSeek、豆包、通义千问、OpenAI GPT
- **流式响应**：SSE 实时输出，提升用户体验
- **成本控制**：智能 Token 计费和预算控制
- **提供商切换**：灵活切换不同的 AI 提供商

### 学习系统

- **Bilibili 集成**：自动爬取和分析 Bilibili 学习视频
- **知识库构建**：基于视频内容自动生成知识点
- **学习进度跟踪**：可视化学习进度和成果
- **个性化推荐**：基于学习历史推荐相关内容

---

## 🔗 相关链接

- [官方网站](https://cmamsys.com)
- [在线文档](https://docs.cmamsys.com)
- [GitHub 仓库](https://github.com/your-org/cmamsys)
- [更新日志](CHANGELOG.md)

---

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

特别感谢：
- Next.js 团队提供的优秀框架
- shadcn/ui 提供的精美组件库
- Prisma 团队提供的优秀 ORM
- 所有开源社区的贡献者

---

<div align="center">

**用 ❤️ 为数学建模社区构建**

[⬆ 回到顶部](#cmamsys---竞赛数学自动化建模系统)

</div>
