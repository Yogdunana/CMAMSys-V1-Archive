# CMAMSys - 竞赛数学自动化建模系统

<div align="center">

**CompetiMath AutoModel System v1.0.0**

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)
![React](https://img.shields.io/badge/React-19.2.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748.svg)

</div>

**企业级数学建模竞赛自动化平台**

一站式解决方案，为团队和个人提供从数据预处理、模型训练、评估到报告生成的全流程自动化

[官方网站](https://cmamsys.com) | [在线文档](https://docs.cmamsys.com) | [演示站点](https://demo.cmamsys.com) | [GitHub](https://github.com/your-org/cmamsys)

</div>

---

## 📑 目录

- [项目简介](#项目简介)
- [核心特性](#核心特性)
- [技术架构](#技术架构)
- [功能模块详解](#功能模块详解)
- [数据库设计](#数据库设计)
- [API 文档](#api-文档)
- [快速开始](#快速开始)
- [详细安装指南](#详细安装指南)
- [配置说明](#配置说明)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [测试指南](#测试指南)
- [性能优化](#性能优化)
- [故障排查](#故障排查)
- [常见问题](#常见问题)
- [更新日志](#更新日志)
- [贡献指南](#贡献指南)
- [许可证](#许可证)
- [联系方式](#联系方式)

---

## 📖 项目简介

### 背景与愿景

CMAMSys（CompetiMath AutoModel System）是一个企业级数学建模竞赛自动化平台，旨在为参赛者提供一站式解决方案，简化建模流程，提高竞赛效率。

数学建模竞赛（如 MCM/ICM、CUMCM 等）通常需要参赛者在有限时间内完成以下工作：
1. 理解题目并制定策略
2. 数据收集和预处理
3. 模型建立和求解
4. 结果分析和可视化
5. 论文撰写

这个过程非常耗时且复杂，CMAMSys 通过自动化和智能化手段，大幅减少重复性工作，让参赛者能够专注于核心问题。

### 设计理念

- **自动化优先**：尽可能自动化重复性工作
- **智能辅助**：AI 驱动的智能推荐和优化
- **团队协作**：支持多人协作和角色分工
- **开箱即用**：提供竞赛专用模板和预设
- **企业级质量**：完善的测试、文档和部署方案

### 适用竞赛

| 竞赛名称 | 英文缩写 | 主办方 | 难度 | 模板支持 |
|---------|---------|--------|------|---------|
| 美国大学生数学建模竞赛 | MCM/ICM | COMAP | ⭐⭐⭐⭐⭐ | ✅ 完整支持 |
| 全国大学生数学建模竞赛 | CUMCM | 中国工业与应用数学学会 | ⭐⭐⭐⭐ | ✅ 完整支持 |
| 深圳杯数学建模挑战赛 | 深圳杯 | 深圳市科协 | ⭐⭐⭐⭐ | ✅ 完整支持 |
| 国际数学建模挑战赛 | IMMC | IMMC委员会 | ⭐⭐⭐⭐⭐ | ✅ 完整支持 |
| MathorCup 数学建模挑战赛 | MathorCup | 中国优选法统筹法研究会 | ⭐⭐⭐ | ✅ 基础支持 |
| 电工杯数学建模竞赛 | EMMC | 中国电机工程学会 | ⭐⭐⭐ | ✅ 基础支持 |
| 泰迪杯数据挖掘挑战赛 | 泰迪杯 | 泰迪杯组委会 | ⭐⭐⭐⭐ | ✅ 完整支持 |
| 蓝桥杯数学建模 | 蓝桥杯 | 工业和信息化部人才交流中心 | ⭐⭐ | ✅ 基础支持 |

### 版本说明

#### 社区版（Community Edition）

**免费开源，MIT 许可证**

- ✅ 基础建模功能
- ✅ 团队协作（最多 10 人）
- ✅ 报告生成
- ✅ 3 个 AI Provider
- ✅ 基础模板库
- ✅ 社区支持

**适用场景**：个人学习、小型团队、教学演示

#### 企业版（Enterprise Edition）

**商业授权，付费使用**

- ✅ 所有社区版功能
- ✅ 无限团队成员
- ✅ 无限 AI Provider
- ✅ 高级模板库
- ✅ SSO 单点登录
- ✅ 私有化部署
- ✅ 优先技术支持
- ✅ 定制化开发
- ✅ SLA 服务保障

**适用场景**：高校实验室、培训机构、企业研发团队

---

## ✨ 核心特性

### 1. 自动化建模流程

CMAMSys 提供端到端的自动化建模流程，从数据输入到报告输出，全流程无需人工干预。

#### 流程阶段

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  题目解析    │ →  │  数据预处理  │ →  │  模型训练    │ →  │  结果评估    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        ↓                   ↓                   ↓                   ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 策略制定     │    │ 特征工程     │    │ 超参数优化   │    │ 可视化展示   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              ↓
                                                    ┌─────────────┐
                                                    │  报告生成    │
                                                    └─────────────┘
```

#### 支持的建模类型

| 建模类型 | 支持算法 | 适用场景 | 模板 |
|---------|---------|---------|------|
| **预测模型** | 线性回归、XGBoost、LightGBM、LSTM、Transformer | 时间序列预测、销售预测 | ✅ |
| **分类模型** | 逻辑回归、随机森林、SVM、深度学习 | 图像识别、文本分类 | ✅ |
| **聚类模型** | K-Means、DBSCAN、层次聚类 | 客户分群、异常检测 | ✅ |
| **优化模型** | 线性规划、整数规划、遗传算法 | 资源调度、路径优化 | ✅ |
| **评价模型** | AHP、TOPSIS、模糊综合评价 | 方案评价、决策支持 | ✅ |
| **仿真模型** | 蒙特卡洛、元胞自动机、系统动力学 | 风险评估、趋势预测 | ✅ |

### 2. 多算法支持

集成了业界主流的机器学习和深度学习库：

#### 传统机器学习

- **Scikit-learn**：提供 100+ 传统算法
  - 监督学习：回归、分类
  - 无监督学习：聚类、降维
  - 模型选择：交叉验证、网格搜索

- **XGBoost**：梯度提升决策树
  - 支持 GPU 加速
  - 自动处理缺失值
  - 特征重要性分析

- **LightGBM**：轻量级梯度提升
  - 内存占用低
  - 训练速度快
  - 支持 categorical 特征

#### 深度学习

- **PyTorch**：灵活的深度学习框架
  - 支持自定义网络结构
  - 分布式训练
  - 模型导出（ONNX）

- **TensorFlow/Keras**：易用的深度学习接口
  - 预训练模型库
  - 自动微分
  - 模型部署工具

#### 统计建模

- **Statsmodels**：统计建模和计量经济学
  - 线性回归、时间序列分析
  - 假设检验、方差分析
  - 结果解释性强

### 3. AI 集成

#### 支持的 AI Provider

| Provider | 模型 | 用途 | 计费 |
|----------|------|------|------|
| **DeepSeek** | DeepSeek-V3 | 通用对话、代码生成 | 按 Tokens |
| **火山引擎（豆包）** | Doubao-Pro | 中文优化、多模态 | 按请求 |
| **阿里云通义千问** | Qwen-Max | 中文理解、长文本 | 按调用次数 |
| **OpenAI** | GPT-4 | 通用推理、复杂任务 | 按 Tokens |
| **智谱AI** | ChatGLM-4 | 中文对话、知识问答 | 按调用次数 |
| **Moonshot AI** | Kimi | 长文本处理 | 按输入长度 |

#### AI 功能

- **智能策略制定**：根据题目自动推荐建模策略
- **代码生成**：自动生成建模代码（Python/Matlab）
- **结果解释**：AI 辅助解释模型结果
- **论文润色**：论文语法和逻辑优化
- **方案对比**：多方案对比和推荐

#### 流式输出

采用 SSE（Server-Sent Events）技术，实现实时流式输出：

```javascript
// 客户端示例
const eventSource = new EventSource('/api/ai/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.content); // 实时输出内容
};
```

**优势**：
- 实时反馈，提升用户体验
- 降低服务器内存压力
- 支持长文本输出
- 自动断线重连

### 4. 团队协作

#### 角色系统

| 角色 | 权限 | 说明 |
|------|------|------|
| **管理员（ADMIN）** | 所有权限 | 系统管理、用户管理、配置管理 |
| **队长（CAPTAIN）** | 团队管理 | 创建团队、邀请成员、分配任务 |
| **成员（MEMBER）** | 基本权限 | 参与任务、查看结果、提交代码 |
| **观察者（OBSERVER）** | 只读权限 | 查看进度、阅读报告 |

#### 协作功能

- **实时协作**：多人同时编辑同一文档
- **任务分配**：将建模任务分解并分配给成员
- **进度跟踪**：可视化展示任务进度
- **代码共享**：代码库版本管理
- **消息通知**：任务变更实时通知
- **评论系统**：对结果进行讨论和反馈

### 5. 每日学习模块

#### Bilibili 学习系统

自动从 Bilibili 学习数学建模相关知识，构建专业知识库。

**功能特点**：

1. **自动爬取**：定期爬取指定 UP 主的视频
2. **内容解析**：提取视频标题、简介、弹幕
3. **知识抽取**：AI 提取关键知识点
4. **智能分类**：按算法、竞赛类型分类
5. **进度跟踪**：记录学习进度
6. **知识图谱**：构建知识点关联图

**配置示例**：

```typescript
// bilibili-learning-config.json
{
  "upUsers": [
    "数学建模学习交流",
    "老哥教你学建模"
  ],
  "keywords": [
    "数学建模",
    "Matlab",
    "Python",
    "机器学习"
  ],
  "schedule": {
    "frequency": "daily",
    "time": "02:00"
  }
}
```

#### 用户资料学习

支持用户上传自己的学习资料（PDF、视频、文档），系统会自动整理和分类。

### 6. 精美可视化

#### 竞赛主题图表

根据竞赛类型自动应用不同的主题色：

```typescript
// 主题配置
const competitionThemes = {
  MCM: { primary: '#DC2626', secondary: '#FECACA' },      // 红色
  CUMCM: { primary: '#2563EB', secondary: '#DBEAFE' },     // 蓝色
  SHENZHEN: { primary: '#7C3AED', secondary: '#DDD6FE' },  // 紫色
  IMMC: { primary: '#059669', secondary: '#D1FAE5' },      // 绿色
  MathorCup: { primary: '#EA580C', secondary: '#FFEDD5' }, // 橙色
};
```

#### 支持的图表类型

| 图表类型 | 用途 | 库 |
|---------|------|------|
| **折线图** | 趋势分析、时间序列 | Recharts |
| **柱状图** | 对比分析、分类统计 | Recharts |
| **散点图** | 相关性分析、聚类可视化 | Recharts |
| **热力图** | 数据分布、相关性矩阵 | Recharts |
| **饼图** | 占比分析、构成分析 | Recharts |
| **雷达图** | 多维度评价 | Recharts |
| **3D 图** | 空间数据、复杂模型 | Three.js |
| **流程图** | 业务流程、算法流程 | React Flow |
| **UML 图** | 系统设计、类图 | Mermaid |
| **甘特图** | 项目管理、进度跟踪 | Recharts |

### 7. 企业级安全

#### 认证与授权

**认证方式**：

1. **JWT 认证**
   - Access Token：15 分钟有效期
   - Refresh Token：7 天有效期
   - 自动刷新机制

2. **多因素认证（MFA）**
   - 短信验证码
   - 邮箱验证码
   - TOTP（基于时间的一次性密码）

3. **单点登录（SSO）**
   - OAuth 2.0 / OpenID Connect
   - 支持 SAML 2.0（企业版）
   - LDAP 集成（企业版）

**权限控制**：

```typescript
// 基于角色的访问控制（RBAC）
const permissions = {
  ADMIN: ['*'], // 所有权限
  CAPTAIN: [
    'team:create',
    'team:invite',
    'task:assign',
    'task:delete',
  ],
  MEMBER: [
    'task:view',
    'task:update',
    'result:view',
  ],
  OBSERVER: [
    'task:view',
    'result:view',
  ],
};
```

#### 防攻击措施

| 威胁类型 | 防护措施 | 实现方式 |
|---------|---------|---------|
| **SQL 注入** | 参数化查询 | Prisma ORM |
| **XSS 攻击** | 输入清理 + CSP | DOMPurify + Helmet |
| **CSRF 攻击** | CSRF Token + SameSite | 中间件验证 |
| **暴力破解** | 速率限制 + 账户锁定 | 令牌桶算法 |
| **DDoS 攻击** | CDN + 速率限制 | Cloudflare |
| **敏感数据泄露** | 加密存储 | AES-256-GCM |

#### 数据加密

```typescript
// API Key 加密存储
const encryptedKey = await encrypt(apiKey, {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 12,
});

// 密码哈希
const hashedPassword = await bcrypt.hash(password, 12);
```

### 8. API 优先设计

提供完整的 REST API，支持第三方集成。

#### API 版本

- **v1**：稳定版，长期维护
- **v2**：最新版，推荐使用

#### API 特性

- RESTful 风格
- JSON 数据格式
- JWT 认证
- 速率限制（100 请求/分钟）
- 自动文档生成（OpenAPI）
- SDK 支持（Python、Java、JavaScript）

### 9. Docker 一键部署

支持 Docker 和 Docker Compose，快速部署到任意环境。

#### 支持的平台

- Linux（x86_64、ARM64）
- macOS
- Windows（WSL2）
- NAS（Synology、QNAP）

#### 部署方式

```bash
# 快速部署
cd docker
./deploy.sh community up

# 自定义配置
./deploy.sh enterprise up --with-redis --with-minio
```

### 10. 国际化支持

#### 支持的语言

- 🇨🇳 简体中文（默认）
- 🇺🇸 English
- 🇯🇵 日本語（计划中）
- 🇰🇷 한국어（计划中）

#### 国际化实现

```typescript
// next-intl 配置
const locales = ['zh', 'en'] as const;
const defaultLocale = 'zh';

// 翻译文件
// messages/zh.json
{
  "common": {
    "login": "登录",
    "register": "注册",
  }
}

// messages/en.json
{
  "common": {
    "login": "Login",
    "register": "Register",
  }
}
```

---

## 🏗️ 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                               │
├─────────────────────────────────────────────────────────────┤
│  Web 浏览器     │  移动端（计划中）  │  桌面端（计划中）      │
│  (React 19)     │  (React Native)   │  (Electron)            │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS
┌────────────▼────────────────────────────────────────────────┐
│                       网关层（Nginx）                        │
│  SSL 终止  │  负载均衡  │  静态资源  │  速率限制              │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                       应用层（Next.js 16）                   │
├─────────────────────────────────────────────────────────────┤
│  前端渲染     │  API 路由  │  中间件  │  服务端组件          │
│  (SSR/ISR)    │  (REST)   │  (Auth)  │  (RSC)                │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                       业务逻辑层                              │
├─────────────────────────────────────────────────────────────┤
│  认证服务  │  建模服务  │  学习服务  │  团队服务  │  AI 服务  │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                       数据访问层（Prisma）                   │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                       数据存储层                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis（缓存）  │  S3（对象存储）             │
└─────────────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                       外部服务层                              │
├─────────────────────────────────────────────────────────────┤
│  AI Provider  │  Bilibili  │  短信服务  │  邮件服务          │
└─────────────────────────────────────────────────────────────┘
```

### 前端架构

#### 技术栈

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 (App Router)              │
├─────────────────────────────────────────────────────────┤
│  React 19              │  TypeScript 5                 │
├─────────────────────────────────────────────────────────┤
│  状态管理                                            │
│  ├─ React Hooks      │  ├─ Context API                │
│  ├─ Zustand（可选）   │  └─ React Query（数据获取）     │
├─────────────────────────────────────────────────────────┤
│  UI 组件库                                            │
│  ├─ shadcn/ui         │  ├─ Radix UI                  │
│  ├─ Lucide Icons      │  └─ Tailwind CSS 4            │
├─────────────────────────────────────────────────────────┤
│  数据可视化                                          │
│  ├─ Recharts          │  ├─ Three.js                  │
│  ├─ React Flow        │  └─ Mermaid                   │
├─────────────────────────────────────────────────────────┤
│  表单处理                                            │
│  ├─ React Hook Form   │  ├─ Zod（验证）               │
│  └─ TanStack Form     │                               │
├─────────────────────────────────────────────────────────┤
│  国际化                                              │
│  └─ next-intl                                         │
└─────────────────────────────────────────────────────────┘
```

#### 页面结构

```
src/app/
├── (auth)/                 # 认证相关页面
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/            # 仪表盘布局
│   ├── dashboard/          # 主仪表盘
│   ├── competitions/       # 竞赛管理
│   ├── modeling/           # 建模任务
│   ├── teams/              # 团队管理
│   ├── learning/           # 学习模块
│   ├── ai-providers/       # AI Provider
│   └── settings/           # 系统设置
├── api/                    # API 路由
│   ├── auth/
│   ├── competitions/
│   ├── modeling/
│   ├── teams/
│   └── ...
├── admin/                  # 管理员页面
│   └── users/
├── layout.tsx              # 根布局
└── page.tsx                # 首页
```

### 后端架构

#### 技术栈

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js API Routes                     │
├─────────────────────────────────────────────────────────┤
│  认证授权                                            │
│  ├─ JWT               │  ├─ BCrypt                     │
│  ├─ OAuth 2.0         │  └─ MFA                        │
├─────────────────────────────────────────────────────────┤
│  数据验证                                            │
│  └─ Zod Schema                                       │
├─────────────────────────────────────────────────────────┤
│  ORM 层                                              │
│  └─ Prisma 5                                         │
├─────────────────────────────────────────────────────────┤
│  缓存层                                              │
│  └─ Redis（可选）                                     │
├─────────────────────────────────────────────────────────┤
│  文件存储                                            │
│  └─ AWS S3 / MinIO                                   │
├─────────────────────────────────────────────────────────┤
│  任务队列                                            │
│  └─ BullMQ（计划中）                                  │
└─────────────────────────────────────────────────────────┘
```

#### API 路由设计

```
/api
├── v1/                     # API v1（稳定版）
│   ├── auth/              # 认证
│   │   ├── login
│   │   ├── register
│   │   ├── refresh
│   │   └── logout
│   ├── user/              # 用户
│   │   └── profile
│   ├── competitions/      # 竞赛
│   ├── modeling-tasks/    # 建模任务
│   ├── teams/             # 团队
│   ├── ai-providers/      # AI Provider
│   ├── dashboard/         # 仪表盘
│   └── learning/          # 学习
└── /                      # 无版本 API（内部使用）
    ├── init/
    ├── settings/
    └── ...
```

### 数据库架构

#### 数据库选型

- **主数据库**：PostgreSQL 14+
  - 关系型数据
  - JSON 支持
  - 全文搜索
  - 事务支持

- **缓存数据库**：Redis 7+（可选）
  - 会话存储
  - API 缓存
  - 速率限制
  - 发布订阅

- **对象存储**：S3 / MinIO
  - 文件上传
  - 报告存储
  - 静态资源

#### 连接池配置

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // 连接池配置
  pool_timeout = 10
  connection_limit = 10
}
```

### 部署架构

#### 生产环境部署

```
┌─────────────────────────────────────────────────────────┐
│                    负载均衡器（Nginx）                   │
│           SSL 终止 / 反向代理 / 静态资源                 │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────────┐  ┌────▼─────┐
│  容器 1    │  │ 容器 2   │
│  Next.js   │  │ Next.js  │
└───┬────────┘  └────┬─────┘
    │                 │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────────┐  ┌────▼─────┐
│ PostgreSQL │  │ Redis    │
│ (主节点)   │  │ (缓存)   │
└────────────┘  └──────────┘
```

---

## 📦 功能模块详解

### 1. 竞赛管理模块

#### 功能列表

- 竞赛创建和编辑
- 竞赛模板管理
- 问题库管理
- 解决方案库
- 竞赛进度跟踪
- 历史竞赛查询

#### 数据模型

```prisma
model Competition {
  id          String    @id @default(cuid())
  name        String
  type        CompetitionType
  year        Int
  startDate   DateTime
  endDate     DateTime
  status      CompetitionStatus
  description String?   @db.Text
  ownerId     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  owner       User      @relation("UserCompetitions", fields: [ownerId], references: [id])
  problems    Problem[]
  solutions   Solution[]

  @@index([type])
  @@index([year])
  @@map("competitions")
}
```

### 2. 建模任务模块

#### 功能列表

- 任务创建和管理
- 任务状态跟踪
- 子任务分解
- 任务分配
- 任务日志
- 结果导出

#### 任务流程

```
PENDING（待处理）
    ↓
RUNNING（运行中）
    ↓
PAUSED（已暂停）
    ↓
COMPLETED（已完成）
    ↓
FAILED（失败）
```

#### 数据模型

```prisma
model ModelingTask {
  id            String          @id @default(cuid())
  title         String
  description   String?         @db.Text
  competitionId String?
  userId        String
  status        TaskStatus      @default(PENDING)
  progress      Int             @default(0)
  config        Json?
  result        Json?
  errorLog      String?         @db.Text
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  user          User            @relation("UserTasks", fields: [userId], references: [id])
  competition   Competition?    @relation(fields: [competitionId], references: [id])

  @@index([status])
  @@index([userId])
  @@map("modeling_tasks")
}
```

### 3. AI Provider 模块

#### 功能列表

- Provider 配置管理
- API Key 加密存储
- Provider 测试连接
- 使用统计
- 成本控制
- 自动切换

#### 支持的 Provider

```typescript
enum AIProviderType {
  DEEPSEEK = 'DEEPSEEK',
  DOUBAO = 'DOUBAO',
  QWEN = 'QWEN',
  OPENAI = 'OPENAI',
  CHATGLM = 'CHATGLM',
  KIMI = 'KIMI',
}
```

#### API Key 加密

```typescript
// 使用 AES-256-GCM 加密
const encrypted = await encrypt(apiKey, {
  key: process.env.ENCRYPTION_KEY!,
  algorithm: 'aes-256-gcm',
});

// 解密
const decrypted = await decrypt(encrypted, {
  key: process.env.ENCRYPTION_KEY!,
});
```

### 4. 学习模块

#### 功能列表

- Bilibili 视频学习
- 知识点抽取
- 知识库管理
- 学习进度跟踪
- 个性化推荐
- 学习报告

#### 定时任务

```typescript
// 每天凌晨 2 点执行
cron.schedule('0 2 * * *', async () => {
  await bilibiliLearningService.fetchNewVideos();
  await bilibiliLearningService.extractKnowledge();
  await bilibiliLearningService.updateProgress();
});
```

### 5. 团队管理模块

#### 功能列表

- 团队创建和加入
- 成员管理
- 角色分配
- 权限控制
- 团队消息
- 活动记录

#### 团队角色

```typescript
enum TeamRole {
  CAPTAIN = 'CAPTAIN',  // 队长
  MEMBER = 'MEMBER',    // 成员
  OBSERVER = 'OBSERVER', // 观察者
}
```

### 6. 系统设置模块

#### 功能列表

- 用户设置
- 系统配置
- 数据库配置
- AI Provider 配置
- 通知设置
- 安全设置

---

## 💾 数据库设计

### 核心数据模型

#### 1. User（用户表）

```prisma
model User {
  id                  String         @id @default(cuid())
  email               String         @unique
  username            String         @unique
  passwordHash        String?
  role                UserRole       @default(USER)
  authProvider        AuthProvider   @default(LOCAL)
  isVerified          Boolean        @default(false)
  isMfaEnabled        Boolean        @default(false)
  mfaSecret           String?
  avatar              String?
  bio                 String?
  organization        String?
  failedLoginAttempts Int            @default(0)
  lockedUntil         DateTime?
  lastLoginAt         DateTime?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
  deletedAt           DateTime?

  aiProviders         AIProvider[]
  competitions        Competition[]
  modelingTasks       ModelingTask[]
  refreshTokens       RefreshToken[]
  teamMemberships     TeamMember[]
  ownedTeams          Team[]

  @@index([email])
  @@index([username])
  @@map("users")
}
```

**字段说明**：

- `id`：用户唯一标识（CUID）
- `email`：邮箱地址（唯一）
- `username`：用户名（唯一）
- `passwordHash`：密码哈希（BCrypt）
- `role`：用户角色（USER/ADMIN）
- `authProvider`：认证提供商（LOCAL/OAUTH）
- `isVerified`：邮箱是否已验证
- `isMfaEnabled`：是否启用多因素认证
- `mfaSecret`：MFA 密钥（TOTP）
- `failedLoginAttempts`：失败登录次数
- `lockedUntil`：账户锁定到期时间
- `lastLoginAt`：最后登录时间

**索引**：
- `email`：加速邮箱查询
- `username`：加速用户名查询

#### 2. AIProvider（AI Provider 表）

```prisma
model AIProvider {
  id               String           @id @default(cuid())
  name             String
  type             AIProviderType
  apiKey           String
  endpoint         String?
  region           String?
  priority         Int              @default(0)
  isDefault        Boolean          @default(false)
  status           AIProviderStatus @default(ACTIVE)
  supportedModels  String[]
  capabilities     String[]
  config           Json?
  totalRequests    Int              @default(0)
  totalTokensUsed  Int              @default(0)
  lastUsedAt       DateTime?
  userId           String
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([type])
  @@index([status])
  @@index([userId])
  @@map("ai_providers")
}
```

**字段说明**：

- `id`：Provider 唯一标识
- `name`：Provider 名称
- `type`：Provider 类型（DEEPSEEK/DOUBAO/QWEN等）
- `apiKey`：API Key（加密存储）
- `endpoint`：自定义端点
- `region`：区域
- `priority`：优先级（自动切换时使用）
- `isDefault`：是否为默认 Provider
- `status`：状态（ACTIVE/INACTIVE）
- `supportedModels`：支持的模型列表
- `capabilities`：能力列表（chat/code/image等）
- `config`：额外配置（JSON）
- `totalRequests`：总请求数
- `totalTokensUsed`：总使用 Tokens
- `lastUsedAt`：最后使用时间

**枚举类型**：

```typescript
enum AIProviderType {
  DEEPSEEK = 'DEEPSEEK',
  DOUBAO = 'DOUBAO',
  QWEN = 'QWEN',
  OPENAI = 'OPENAI',
  CHATGLM = 'CHATGLM',
  KIMI = 'KIMI',
}

enum AIProviderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
}
```

#### 3. Competition（竞赛表）

```prisma
model Competition {
  id          String             @id @default(cuid())
  name        String
  type        CompetitionType
  year        Int
  startDate   DateTime
  endDate     DateTime
  status      CompetitionStatus  @default(UPCOMING)
  description String?            @db.Text
  ownerId     String
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  owner       User               @relation("UserCompetitions", fields: [ownerId], references: [id])
  problems    Problem[]
  solutions   Solution[]

  @@index([type])
  @@index([year])
  @@index([status])
  @@map("competitions")
}
```

**枚举类型**：

```typescript
enum CompetitionType {
  MCM = 'MCM',
  ICM = 'ICM',
  CUMCM = 'CUMCM',
  SHENZHEN = 'SHENZHEN',
  IMMC = 'IMMC',
  MATHORCUP = 'MATHORCUP',
  EMMC = 'EMMC',
  TEDDYCUP = 'TEDDYCUP',
  BLUEBRIDGE = 'BLUEBRIDGE',
}

enum CompetitionStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
```

#### 4. ModelingTask（建模任务表）

```prisma
model ModelingTask {
  id            String      @id @default(cuid())
  title         String
  description   String?     @db.Text
  competitionId String?
  userId        String
  status        TaskStatus  @default(PENDING)
  progress      Int         @default(0)
  config        Json?
  result        Json?
  errorLog      String?     @db.Text
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  user          User        @relation("UserTasks", fields: [userId], references: [id])
  competition   Competition? @relation(fields: [competitionId], references: [id])

  @@index([status])
  @@index([userId])
  @@map("modeling_tasks")
}
```

**枚举类型**：

```typescript
enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
```

#### 5. Team（团队表）

```prisma
model Team {
  id          String   @id @default(cuid())
  name        String
  description String?
  ownerId     String
  maxMembers  Int      @default(10)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     TeamMember[]
  owner       User     @relation("TeamOwner", fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId])
  @@map("teams")
}
```

#### 6. TeamMember（团队成员表）

```prisma
model TeamMember {
  id       String   @id @default(cuid())
  teamId   String
  userId   String
  role     TeamRole @default(MEMBER)
  joinedAt DateTime @default(now())

  team     Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
  @@map("team_members")
}
```

**枚举类型**：

```typescript
enum TeamRole {
  CAPTAIN = 'CAPTAIN',
  MEMBER = 'MEMBER',
  OBSERVER = 'OBSERVER',
}
```

#### 7. RefreshToken（刷新令牌表）

```prisma
model RefreshToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime  @default(now())
  revokedAt DateTime?

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("refresh_tokens")
}
```

### 数据库关系图

```
User (用户)
├── RefreshToken (1:N)
├── AIProvider (1:N)
├── Competition (1:N)
├── ModelingTask (1:N)
├── Team (1:N, as owner)
└── TeamMember (1:N)

Team (团队)
└── TeamMember (1:N)

Competition (竞赛)
├── Problem (1:N)
└── Solution (1:N)
```

### 索引策略

#### 主键索引

- 所有表使用 `@id` 定义主键
- 使用 `cuid()` 生成唯一标识

#### 唯一索引

- `User.email`：邮箱唯一
- `User.username`：用户名唯一
- `RefreshToken.token`：令牌唯一
- `TeamMember.teamId + userId`：团队成员唯一

#### 普通索引

- `User.email`：加速邮箱登录
- `User.username`：加速用户名查询
- `AIProvider.type`：加速按类型查询
- `AIProvider.status`：加速按状态查询
- `Competition.type`：加速按类型查询
- `ModelingTask.status`：加速按状态查询

### 数据迁移

#### 创建迁移

```bash
# 开发环境
pnpm prisma migrate dev --name add_user_preferences

# 生产环境
pnpm prisma migrate deploy
```

#### 回滚迁移

```bash
# 查看迁移历史
pnpm prisma migrate status

# 回滚到指定迁移
pnpm prisma migrate resolve --rolled-back [migration-name]
```

#### 重置数据库

```bash
# 开发环境：删除所有数据并重新应用迁移
pnpm prisma migrate reset

# 生产环境：慎用！会删除所有数据
```

---

## 🔌 API 文档

### API 概览

- **Base URL**: `http://localhost:5000/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8
- **速率限制**: 100 请求/分钟

### 认证

#### 获取 Token

**请求**：

```http
POST /api/v1/auth/login
Content-Type: application/json
X-CSRF-Token: <csrf-token>

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
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### 刷新 Token

**请求**：

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### 用户 API

#### 获取用户信息

**请求**：

```http
GET /api/v1/user/profile
Authorization: Bearer <access-token>
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "数学建模爱好者",
    "organization": "清华大学",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### 更新用户信息

**请求**：

```http
PUT /api/v1/user/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "username": "newusername",
  "bio": "新的个人简介",
  "organization": "北京大学"
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "newusername",
    "bio": "新的个人简介",
    "organization": "北京大学"
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### 建模任务 API

#### 获取任务列表

**请求**：

```http
GET /api/v1/modeling-tasks?status=RUNNING&page=1&limit=20
Authorization: Bearer <access-token>
```

**响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": "task-123",
      "title": "MCM 2026 Problem A",
      "description": "...",
      "status": "RUNNING",
      "progress": 45,
      "createdAt": "2026-02-10T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### 创建任务

**请求**：

```http
POST /api/v1/modeling-tasks
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "新建模任务",
  "description": "任务描述",
  "competitionId": "comp-123",
  "config": {
    "algorithm": "xgboost",
    "parameters": {
      "max_depth": 6,
      "learning_rate": 0.1
    }
  }
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "task-456",
    "title": "新建模任务",
    "status": "PENDING",
    "createdAt": "2026-02-10T12:00:00.000Z"
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### AI Provider API

#### 获取 Provider 列表

**请求**：

```http
GET /api/v1/ai-providers
Authorization: Bearer <access-token>
```

**响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": "provider-123",
      "name": "DeepSeek",
      "type": "DEEPSEEK",
      "status": "ACTIVE",
      "isDefault": true,
      "supportedModels": ["deepseek-chat", "deepseek-coder"],
      "totalRequests": 1000,
      "totalTokensUsed": 500000
    }
  ],
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### 创建 Provider

**请求**：

```http
POST /api/v1/ai-providers
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "我的 DeepSeek",
  "type": "DEEPSEEK",
  "apiKey": "sk-xxx",
  "endpoint": "https://api.deepseek.com",
  "isDefault": false
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "provider-456",
    "name": "我的 DeepSeek",
    "type": "DEEPSEEK",
    "status": "ACTIVE",
    "createdAt": "2026-02-10T12:00:00.000Z"
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### 仪表盘 API

#### 获取统计数据

**请求**：

```http
GET /api/v1/dashboard/stats?days=7
Authorization: Bearer <access-token>
```

**响应**：

```json
{
  "success": true,
  "data": {
    "activeCompetitions": 5,
    "modelingTasks": 20,
    "teamMembers": 3,
    "aiRequests": 1500,
    "aiProviders": 3,
    "totalTasks": 100,
    "completedTasks": 80,
    "successRate": 0.8,
    "avgProgress": 0.65,
    "period": {
      "days": 7,
      "startDate": "2026-02-03T00:00:00.000Z",
      "endDate": "2026-02-10T00:00:00.000Z"
    }
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### 获取活动日志

**请求**：

```http
GET /api/v1/dashboard/activities?type=tasks&limit=10
Authorization: Bearer <access-token>
```

**响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": "activity-123",
      "type": "task",
      "action": "created",
      "message": "创建了任务 'MCM 2026 Problem A'",
      "userId": "user-123",
      "createdAt": "2026-02-10T11:00:00.000Z"
    }
  ],
  "meta": {
    "count": 10,
    "type": "tasks",
    "limit": 10
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### 错误码

| 错误码 | HTTP 状态码 | 说明 |
|-------|-----------|------|
| `SUCCESS` | 200 | 成功 |
| `UNAUTHORIZED` | 401 | 未授权 |
| `FORBIDDEN` | 403 | 禁止访问 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 验证错误 |
| `TOO_MANY_REQUESTS` | 429 | 请求过多 |
| `INTERNAL_ERROR` | 500 | 内部错误 |

**错误响应格式**：

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### 速率限制

- **限制规则**：每个 IP 每分钟最多 100 个请求
- **响应头**：

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1644480000
```

- **超出限制**：返回 `429 Too Many Requests`

```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: 24.0.0 或更高版本
- **pnpm**: 9.0.0 或更高版本
- **PostgreSQL**: 14.0 或更高版本
- **Redis**: 7.0 或更高版本（可选，用于缓存）
- **Docker**: 20.10 或更高版本（用于部署）

### 验证环境

```bash
# 检查 Node.js 版本
node --version  # 应该输出 v24.x.x

# 检查 pnpm 版本
pnpm --version  # 应该输出 9.x.x

# 检查 PostgreSQL 版本
psql --version  # 应该输出 14.x 或更高

# 检查 Redis 版本（可选）
redis-server --version  # 应该输出 7.x 或更高
```

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/your-org/cmamsys.git
cd cmamsys
```

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env
```

**必需的环境变量**：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/cmamsys"

# JWT
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# 加密
ENCRYPTION_KEY="your-32-character-encryption-key"

# 应用
NEXT_PUBLIC_APP_URL="http://localhost:5000"
NEXT_PUBLIC_APP_NAME="CMAMSys"

# AI Provider（可选）
DEEPSEEK_API_KEY=""
DOUBAO_API_KEY=""
```

#### 4. 初始化数据库

```bash
# 运行数据库迁移
pnpm prisma migrate dev

# （可选）填充测试数据
pnpm prisma seed
```

#### 5. 启动开发服务器

```bash
pnpm dev
```

服务器将运行在 `http://localhost:5000`

#### 6. 访问应用

在浏览器中打开 `http://localhost:5000`

默认管理员账户：
- 邮箱：`admin@cmamsys.com`
- 密码：`admin123`

**⚠️ 请立即修改默认密码！**

### Docker 快速开始

#### 使用 Docker Compose

```bash
# 启动所有服务（包括数据库）
cd docker
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 仅启动应用

```bash
# 构建镜像
docker build -t cmamsys:latest .

# 运行容器
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/cmamsys" \
  -e JWT_SECRET="your-secret" \
  cmamsys:latest
```

---

## 📖 详细安装指南

### 前置安装

#### 安装 Node.js

**使用 nvm（推荐）**：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc

# 安装 Node.js 24
nvm install 24
nvm use 24

# 设置为默认版本
nvm alias default 24
```

**官方安装包**：

访问 [Node.js 官网](https://nodejs.org/) 下载并安装。

#### 安装 pnpm

```bash
# 使用 npm 安装
npm install -g pnpm@latest

# 或使用 corepack（Node.js 16.10+）
corepack enable
corepack prepare pnpm@latest --activate
```

#### 安装 PostgreSQL

**Ubuntu/Debian**：

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS（Homebrew）**：

```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows**：

下载 [PostgreSQL 安装包](https://www.postgresql.org/download/windows/)

#### 创建数据库

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE cmamsys;
CREATE USER cmamsys_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cmamsys TO cmamsys_user;

# 退出
\q
```

### 详细配置

#### 环境变量详解

```env
# ============================================
# 应用配置
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:5000"
NEXT_PUBLIC_APP_NAME="CMAMSys"
NODE_ENV="development"

# ============================================
# 数据库配置
# ============================================
DATABASE_URL="postgresql://cmamsys_user:password@localhost:5432/cmamsys"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# ============================================
# JWT 配置
# ============================================
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# ============================================
# 加密配置
# ============================================
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# ============================================
# Redis 配置（可选）
# ============================================
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# ============================================
# AI Provider 配置
# ============================================
# DeepSeek
DEEPSEEK_API_KEY="sk-xxx"
DEEPSEEK_ENDPOINT="https://api.deepseek.com"

# 火山引擎（豆包）
DOUBAO_API_KEY="xxx"
DOUBAO_ENDPOINT="https://ark.cn-beijing.volces.com/api/v3"

# 阿里云通义千问
QWEN_API_KEY="sk-xxx"
QWEN_ENDPOINT="https://dashscope.aliyuncs.com/api/v1"

# OpenAI
OPENAI_API_KEY="sk-xxx"
OPENAI_ENDPOINT="https://api.openai.com/v1"

# ============================================
# Bilibili 学习配置
# ============================================
BILIBILI_LEARNING_ENABLED="true"
BILIBILI_LEARNING_SCHEDULE="0 2 * * *"  # 每天凌晨 2 点

# ============================================
# 对象存储配置（可选）
# ============================================
# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET="cmamsys-uploads"

# MinIO
MINIO_ENDPOINT="localhost:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="cmamsys"
MINIO_USE_SSL="false"

# ============================================
# 邮件配置（可选）
# ============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@cmamsys.com"

# ============================================
# 短信配置（可选）
# ============================================
SMS_PROVIDER="aliyun"  # aliyun / tencent
SMS_ACCESS_KEY="your-access-key"
SMS_SECRET_KEY="your-secret-key"
SMS_SIGN_NAME="CMAMSys"
SMS_TEMPLATE_CODE="SMS_123456789"

# ============================================
# Sentry 错误追踪（可选）
# ============================================
SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_ENVIRONMENT="development"

# ============================================
# 安全配置
# ============================================
CSRF_SECRET="your-csrf-secret-key"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# ============================================
# 日志配置
# ============================================
LOG_LEVEL="info"  # debug / info / warn / error
LOG_FORMAT="json"  # json / pretty

# ============================================
# 功能开关
# ============================================
ENABLE_REGISTRATION="true"
ENABLE_MFA="false"
ENABLE_SSO="false"
ENABLE_BILIBILI_LEARNING="true"
```

#### 生成密钥

```bash
# 生成 JWT_SECRET
openssl rand -base64 32

# 生成 ENCRYPTION_KEY
openssl rand -base64 32

# 生成 CSRF_SECRET
openssl rand -base64 32
```

### 数据库迁移

#### 创建迁移

```bash
# 创建新的迁移
pnpm prisma migrate dev --name add_user_preferences

# 查看迁移状态
pnpm prisma migrate status
```

#### 应用迁移

```bash
# 开发环境
pnpm prisma migrate dev

# 生产环境
pnpm prisma migrate deploy
```

#### 重置数据库

```bash
# 删除所有数据并重新应用迁移（仅开发环境）
pnpm prisma migrate reset

# 使用 Seed 填充数据
pnpm prisma db seed
```

### 验证安装

```bash
# 运行类型检查
pnpm ts-check

# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm exec playwright test

# 启动开发服务器
pnpm dev
```

访问 `http://localhost:5000`，如果看到登录页面，说明安装成功！

---

## ⚙️ 配置说明

### 应用配置

#### 应用设置

位于 `src/config/app.ts`：

```typescript
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'CMAMSys',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
};
```

#### 功能开关

位于 `src/config/features.ts`：

```typescript
export const features = {
  registration: process.env.ENABLE_REGISTRATION === 'true',
  mfa: process.env.ENABLE_MFA === 'true',
  sso: process.env.ENABLE_SSO === 'true',
  bilibiliLearning: process.env.ENABLE_BILIBILI_LEARNING === 'true',
};
```

### 数据库配置

#### Prisma 配置

位于 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // 连接池配置
  pool_timeout = 10
  connection_limit = 10
}

generator client {
  provider = "prisma-client-js"
}
```

#### 优化配置

```prisma
// 索引优化
@@index([field1, field2])

// 复合唯一索引
@@unique([field1, field2])

// 忽略字段（不生成）
@@ignore([deprecatedField])
```

### Redis 配置

#### Redis 客户端配置

位于 `src/lib/redis.ts`：

```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

export default redis;
```

#### 缓存策略

```typescript
// 会话缓存（15 分钟）
await redis.setex(`session:${userId}`, 900, sessionData);

// API 缓存（5 分钟）
await redis.setex(`api:${url}`, 300, responseData);

// 速率限制（每分钟 100 次）
const key = `ratelimit:${ip}`;
const count = await redis.incr(key);
if (count === 1) {
  await redis.expire(key, 60);
}
```

### AI Provider 配置

#### Provider 配置示例

```typescript
// DeepSeek 配置
const deepseekConfig = {
  type: 'DEEPSEEK',
  apiKey: process.env.DEEPSEEK_API_KEY,
  endpoint: process.env.DEEPSEEK_ENDPOINT || 'https://api.deepseek.com',
  models: ['deepseek-chat', 'deepseek-coder'],
};

// 豆包配置
const doubaoConfig = {
  type: 'DOUBAO',
  apiKey: process.env.DOUBAO_API_KEY,
  endpoint: process.env.DOUBAO_ENDPOINT,
  models: ['doubao-pro', 'doubao-lite'],
};
```

#### 加密存储

```typescript
// 加密 API Key
import { encrypt } from '@/lib/encryption';

const encryptedKey = await encrypt(apiKey, {
  key: process.env.ENCRYPTION_KEY!,
  algorithm: 'aes-256-gcm',
});

// 存储到数据库
await prisma.aIProvider.create({
  data: {
    name: 'My DeepSeek',
    type: 'DEEPSEEK',
    apiKey: encryptedKey,
  },
});
```

### 日志配置

#### Pino 配置

位于 `src/lib/logger.ts`：

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
        },
      }
    : undefined,
});

export default logger;
```

#### 使用示例

```typescript
import logger from '@/lib/logger';

// 信息日志
logger.info({ userId, action: 'login' }, 'User logged in');

// 错误日志
logger.error({ error, userId }, 'Login failed');

// 调试日志
logger.debug({ data }, 'Processing request');
```

### Sentry 配置

#### Sentry 初始化

位于 `sentry.server.config.ts`：

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // 过滤敏感信息
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

#### 错误追踪

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // 可能出错的操作
} catch (error) {
  Sentry.captureException(error);
  logger.error({ error }, 'Operation failed');
}
```

---

## 🛠️ 开发指南

### 开发环境设置

#### 安装开发依赖

```bash
# 全局安装依赖
pnpm install

# 安装 Playwright 浏览器（用于 E2E 测试）
pnpm exec playwright install --with-deps chromium
```

#### 代码规范

```bash
# ESLint 检查
pnpm lint

# 自动修复
pnpm lint --fix

# TypeScript 类型检查
pnpm ts-check
```

### 项目结构

```
cmamsys/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证页面组
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # 仪表盘布局组
│   │   │   ├── dashboard/
│   │   │   ├── competitions/
│   │   │   ├── modeling/
│   │   │   ├── teams/
│   │   │   ├── learning/
│   │   │   ├── ai-providers/
│   │   │   └── settings/
│   │   ├── api/               # API 路由
│   │   │   ├── v1/           # API v1
│   │   │   │   ├── auth/
│   │   │   │   ├── user/
│   │   │   │   ├── modeling-tasks/
│   │   │   │   ├── ai-providers/
│   │   │   │   └── dashboard/
│   │   │   └── init/
│   │   ├── admin/             # 管理员页面
│   │   │   └── users/
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── auth/              # 认证组件
│   │   ├── dashboard/         # 仪表盘组件
│   │   ├── modeling/          # 建模组件
│   │   └── common/            # 通用组件
│   ├── lib/                   # 工具库
│   │   ├── auth.ts           # 认证逻辑
│   │   ├── db.ts             # Prisma 客户端
│   │   ├── cache.ts          # 缓存工具
│   │   ├── encryption.ts     # 加密工具
│   │   ├── logger.ts         # 日志工具
│   │   └── validators.ts     # 验证器
│   ├── services/              # 业务逻辑
│   │   ├── auth.service.ts
│   │   ├── modeling.service.ts
│   │   ├── ai.service.ts
│   │   └── learning.service.ts
│   ├── types/                 # TypeScript 类型
│   │   ├── auth.ts
│   │   ├── modeling.ts
│   │   └── api.ts
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── useModeling.ts
│   │   └── useAI.ts
│   ├── store/                 # 状态管理（可选）
│   │   └── auth.ts
│   ├── config/                # 配置文件
│   │   ├── app.ts
│   │   ├── features.ts
│   │   └── ai.ts
│   ├── middleware.ts          # Next.js 中间件
│   └── __tests__/            # 单元测试
├── prisma/
│   ├── schema.prisma         # 数据库模式
│   └── seed.ts               # 数据种子
├── e2e/                       # E2E 测试
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── ...
├── public/                    # 静态资源
│   ├── images/
│   └── fonts/
├── docs/                      # 文档
├── docker/                    # Docker 配置
├── scripts/                   # 脚本
├── .env.example              # 环境变量示例
├── .coze                     # Coze 配置
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── playwright.config.ts
├── vitest.config.ts
└── README.md
```

### 开发工作流

#### 创建新功能

1. **创建分支**

```bash
git checkout -b feature/your-feature-name
```

2. **开发功能**

```bash
# 启动开发服务器
pnpm dev

# 在另一个终端运行测试
pnpm test:watch
```

3. **提交代码**

```bash
# 添加文件
git add .

# 提交
git commit -m "feat: add new feature"

# 推送
git push origin feature/your-feature-name
```

4. **创建 Pull Request**

#### 代码审查清单

- [ ] 代码符合 ESLint 规范
- [ ] TypeScript 类型检查通过
- [ ] 单元测试通过
- [ ] E2E 测试通过
- [ ] 代码有适当的注释
- [ ] 更新了相关文档

### 调试技巧

#### VS Code 调试配置

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

#### 日志调试

```typescript
import logger from '@/lib/logger';

// 开发环境输出详细信息
if (process.env.NODE_ENV === 'development') {
  logger.debug({ data }, 'Detailed debug info');
}

// 生产环境只输出关键信息
logger.info({ userId, action }, 'User action');
```

#### 数据库调试

```bash
# 查看 SQL 查询
pnpm prisma studio

# 启用查询日志
# 在 .env 中添加
DIRECT_URL="postgresql://user:password@localhost:5432/cmamsys?statement_cache_size=0"
```

### 测试

#### 单元测试

使用 Vitest：

```typescript
// src/__tests__/lib/auth.test.ts
import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '@/lib/auth';

describe('Auth Utils', () => {
  it('should generate and verify token', () => {
    const payload = { userId: '123' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe('123');
  });
});
```

运行测试：

```bash
# 运行所有测试
pnpm test

# 运行特定文件
pnpm test auth.test.ts

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

#### E2E 测试

使用 Playwright：

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

运行测试：

```bash
# 运行所有 E2E 测试
pnpm exec playwright test

# 运行特定测试
pnpm exec playwright test login.spec.ts

# UI 模式
pnpm exec playwright test --ui
```

### 性能优化

#### 代码分割

```typescript
// 动态导入大组件
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

#### 图片优化

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  loading="lazy"
/>
```

#### 缓存策略

```typescript
// API 路由缓存
export const revalidate = 60; // 缓存 60 秒

// ISR 增量静态再生成
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}
```

---

## 🚀 部署指南

### 开发环境部署

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:5000
```

### 生产环境部署

#### 方式一：直接部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

#### 方式二：Docker 部署

**构建镜像**：

```bash
docker build -t cmamsys:latest .
```

**运行容器**：

```bash
docker run -d \
  --name cmamsys \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/cmamsys" \
  -e JWT_SECRET="your-secret" \
  cmamsys:latest
```

**Docker Compose**：

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/cmamsys
      - JWT_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=cmamsys
      - POSTGRES_USER=cmamsys
      - POSTGRES_PASSWORD=cmamsys
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

#### 方式三：PM2 部署

```bash
# 安装 PM2
pnpm add -g pm2

# 启动应用
pm2 start pnpm --name "cmamsys" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs cmamsys

# 重启
pm2 restart cmamsys
```

**PM2 配置文件**：

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cmamsys',
    script: 'pnpm',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
  }],
};
```

### Nginx 反向代理

#### 配置示例

```nginx
# /etc/nginx/sites-available/cmamsys
upstream cmamsys {
    server localhost:5000;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://cmamsys;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/cmamsys /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL/HTTPS 配置

#### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d example.com

# 自动续期
sudo certbot renew --dry-run
```

#### Nginx SSL 配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://cmamsys;
        # ... 其他配置
    }
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

### 负载均衡

#### Nginx 负载均衡

```nginx
upstream cmamsys_cluster {
    least_conn;
    server localhost:5001 weight=3;
    server localhost:5002 weight=2;
    server localhost:5003 weight=1;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://cmamsys_cluster;
        # ... 其他配置
    }
}
```

### 监控和日志

#### 日志管理

```bash
# 查看应用日志
pm2 logs cmamsys

# 查看错误日志
pm2 logs cmamsys --err

# 清除日志
pm2 flush
```

#### 性能监控

使用 PM2 Plus：

```bash
# 安装 PM2 Plus
pm2 link <public_key> <secret_key>
```

### 备份和恢复

#### 数据库备份

```bash
# 备份
pg_dump -U cmamsys cmamsys > backup.sql

# 恢复
psql -U cmamsys cmamsys < backup.sql
```

#### 自动备份脚本

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cmamsys_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump -U cmamsys cmamsys > $BACKUP_FILE

# 保留最近 7 天的备份
find $BACKUP_DIR -name "cmamsys_*.sql" -mtime +7 -delete
```

添加到 crontab：

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

---

## 🧪 测试指南

### 单元测试

#### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定文件
pnpm test auth.test.ts

# 监听模式
pnpm test:watch

# 覆盖率报告
pnpm test:coverage

# UI 模式
pnpm test:ui
```

#### 编写测试

```typescript
// src/__tests__/lib/password.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/password';

describe('Password Utils', () => {
  it('should hash and verify password', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);

    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword('wrong', hash);

    expect(isValid).toBe(false);
  });
});
```

### E2E 测试

#### 运行测试

```bash
# 运行所有测试
pnpm exec playwright test

# 运行特定测试
pnpm exec playwright test login.spec.ts

# UI 模式
pnpm exec playwright test --ui

# 调试模式
pnpm exec playwright test --debug
```

#### 编写测试

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should display dashboard', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show statistics', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('[data-testid="active-competitions"]')).toBeVisible();
    await expect(page.locator('[data-testid="modeling-tasks"]')).toBeVisible();
  });
});
```

### API 测试

#### 使用 curl

```bash
# 测试登录
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 测试受保护的端点
curl -X GET http://localhost:5000/api/v1/user/profile \
  -H "Authorization: Bearer <token>"
```

#### 使用 Postman

导入 API 集合：`docs/postman-collection.json`

### 测试覆盖率

```bash
# 生成覆盖率报告
pnpm test:coverage

# 查看报告
open coverage/index.html
```

目标覆盖率：
- 语句覆盖率：> 80%
- 分支覆盖率：> 75%
- 函数覆盖率：> 80%
- 行覆盖率：> 80%

---

## ⚡ 性能优化

### 前端优化

#### 代码分割

```typescript
// 路由级别代码分割（自动）
// Next.js App Router 自动分割

// 组件级别代码分割
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

#### 图片优化

```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

#### 缓存策略

```typescript
// 静态资源缓存
// next.config.ts
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
};

// API 缓存
export const revalidate = 60; // 缓存 60 秒
```

### 后端优化

#### 数据库优化

```prisma
// 添加索引
@@index([field1, field2])

// 选择性查询
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    username: true,
  },
});
```

#### Redis 缓存

```typescript
// 缓存查询结果
const cacheKey = `users:page:${page}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const users = await prisma.user.findMany();
await redis.setex(cacheKey, 300, JSON.stringify(users));

return users;
```

#### 连接池优化

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  pool_timeout = 10
  connection_limit = 10
}
```

### 性能监控

#### Lighthouse

```bash
# 安装 Lighthouse
pnpm add -g lighthouse

# 运行审计
lighthouse http://localhost:5000 --view
```

#### Web Vitals

```typescript
// 使用 next/web-vitals
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
  });

  return null;
}
```

---

## 🔍 故障排查

### 常见问题

#### 1. 数据库连接失败

**错误信息**：
```
Error: Can't reach database server at `localhost:5432`
```

**解决方案**：

```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 启动 PostgreSQL
sudo systemctl start postgresql

# 检查连接
psql -U cmamsys -d cmamsys -c "SELECT 1"
```

#### 2. JWT Token 无效

**错误信息**：
```
Error: Invalid or expired token
```

**解决方案**：

1. 检查 JWT_SECRET 是否配置正确
2. 检查 Token 是否过期
3. 重新登录获取新 Token

#### 3. 端口被占用

**错误信息**：
```
Error: Port 5000 is already in use
```

**解决方案**：

```bash
# 查找占用端口的进程
lsof -i :5000

# 杀死进程
kill -9 <PID>

# 或使用其他端口
PORT=5001 pnpm dev
```

#### 4. 内存溢出

**错误信息**：
```
JavaScript heap out of memory
```

**解决方案**：

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm dev
```

#### 5. API 速率限制

**错误信息**：
```
429 Too Many Requests
```

**解决方案**：

1. 等待速率限制重置
2. 增加速率限制（谨慎）
3. 使用 Redis 缓存减少请求

### 日志分析

#### 查看应用日志

```bash
# 开发环境日志
pnpm dev 2>&1 | tee app.log

# 生产环境日志（PM2）
pm2 logs cmamsys

# Docker 日志
docker logs cmamsys
```

#### 查看数据库日志

```bash
# PostgreSQL 日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 错误追踪

查看 Sentry 错误报告：`https://sentry.io/`

### 性能问题

#### 数据库查询慢

```bash
# 开启查询日志
# prisma/schema.prisma
datasource db {
  logLevel = "query"
}
```

#### 前端加载慢

```bash
# 分析 Bundle 大小
pnpm build
pnpm analyze
```

---

## ❓ 常见问题

### Q1: 如何升级到最新版本？

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
pnpm install

# 运行数据库迁移
pnpm prisma migrate deploy

# 重新构建
pnpm build

# 重启服务
pm2 restart cmamsys
```

### Q2: 如何备份数据？

```bash
# 备份数据库
pg_dump -U cmamsys cmamsys > backup.sql

# 备份上传文件
tar -czf uploads-backup.tar.gz public/uploads/
```

### Q3: 如何更改管理员密码？

```bash
# 使用 Prisma Studio
pnpm prisma studio

# 或使用脚本
node scripts/reset-admin-password.js
```

### Q4: 如何启用 HTTPS？

参考 [SSL/HTTPS 配置](#sslhttps-配置) 章节。

### Q5: 如何添加新的 AI Provider？

1. 在 `src/lib/ai/` 目录下创建新的 Provider
2. 实现统一的接口
3. 在数据库中添加配置
4. 测试连接

### Q6: 如何自定义主题？

编辑 `src/styles/globals.css` 和 `tailwind.config.ts`。

### Q7: 如何禁用某些功能？

在 `.env` 文件中设置功能开关：

```env
ENABLE_REGISTRATION="false"
ENABLE_MFA="false"
ENABLE_BILIBILI_LEARNING="false"
```

---

## 📝 更新日志

### v1.0.0 (2026-02-10)

#### 新增功能

- ✨ 完整的自动化建模流程
- ✨ 多 AI Provider 支持（DeepSeek、豆包、通义千问、OpenAI）
- ✨ Bilibili 学习系统
- ✨ 团队协作功能
- ✨ 竞赛管理
- ✨ 精美可视化
- ✨ 企业级安全
- ✨ 国际化支持（中英双语）
- ✨ Docker 部署

#### 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Prisma 5
- PostgreSQL
- shadcn/ui
- Tailwind CSS 4

#### 测试

- 126 个单元测试全部通过
- E2E 测试框架搭建完成

#### 文档

- 完整的 API 文档
- 详细的部署指南
- 开发指南

---

## 🤝 贡献指南

### 如何贡献

我们欢迎各种形式的贡献！

1. **报告 Bug**：在 [GitHub Issues](https://github.com/your-org/cmamsys/issues) 提交问题
2. **建议新功能**：在 [GitHub Discussions](https://github.com/your-org/cmamsys/discussions) 讨论
3. **提交代码**：提交 Pull Request
4. **改进文档**：完善文档和示例

### 贡献流程

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier 格式化代码
- 遵循 TypeScript 严格模式
- 编写单元测试
- 更新相关文档

### Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

---

## 📄 许可证

### 社区版

MIT License - 详见 [LICENSE](LICENSE) 文件。

**自由使用、修改和分发**

### 企业版

商业 License - 需要商业授权。

**联系许可咨询**：[license@cmamsys.com](mailto:license@cmamsys.com)

---

## 📞 联系方式

### 技术支持

- 📧 邮箱：[support@cmamsys.com](mailto:support@cmamsys.com)
- 📚 文档：[docs.cmamsys.com](https://docs.cmamsys.com)
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-org/cmamsys/issues)

### 商业合作

- 💼 商业合作：[business@cmamsys.com](mailto:business@cmamsys.com)
- 🔐 企业授权：[license@cmamsys.com](mailto:license@cmamsys.com)

### 社区

- 💬 讨论区：[GitHub Discussions](https://github.com/your-org/cmamsys/discussions)
- 📱 微信群：扫描二维码加入

---

## 🙏 致谢

感谢以下开源项目和服务：

- [Next.js](https://nextjs.org/) - React 框架
- [React](https://reactjs.org/) - UI 库
- [Prisma](https://www.prisma.io/) - ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [Vitest](https://vitest.dev/) - 测试框架
- [Playwright](https://playwright.dev/) - E2E 测试
- 以及所有贡献者

---

<div align="center">

**用 ❤️ 为数学建模社区构建**

[⬆ 回到顶部](#cmamsys---竞赛数学自动化建模系统)

**如果这个项目对你有帮助，请给个 ⭐ Star 支持！**

</div>
