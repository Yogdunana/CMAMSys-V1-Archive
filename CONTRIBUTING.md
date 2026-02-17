# 贡献指南

感谢您对 CMAMSys 项目的兴趣！我们欢迎任何形式的贡献。

---

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题反馈](#问题反馈)

---

## 行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们承诺尊重所有参与者，无论他们的经验水平、性别、性别认同和表达、性取向、残疾、个人外貌、体型、种族、民族、年龄、宗教或国籍。

### 我们的标准

积极行为的示例包括：

- 使用欢迎和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 专注于对社区最有利的事情
- 对其他社区成员表示同理心

不可接受的行为示例包括：

- 使用性化的语言或图像
- 恶意攻击或侮辱性评论
- 私人骚扰
- 未经许可发布他人的私人信息
- 其他不专业或不适当的行为

---

## 如何贡献

### 报告 Bug

在提交 Bug 报告前，请：

1. 检查 [Issues](https://github.com/Yogdunana/CMAMSys/issues) 确认 Bug 是否已被报告
2. 确保使用的是最新版本
3. 准备复现步骤

提交 Bug 报告时请包含：

- 清晰的描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（操作系统、Node.js 版本等）
- 截图或日志（如适用）

### 提出功能建议

在提交功能建议前，请：

1. 检查 [Issues](https://github.com/Yogdunana/CMAMSys/issues) 确认功能是否已被建议
2. 清晰地描述功能需求
3. 说明功能的使用场景和价值
4. 如果可能，提供实现思路

### 提交代码

我们欢迎任何形式的代码贡献，包括但不限于：

- Bug 修复
- 新功能
- 性能优化
- 文档改进
- 代码重构
- 测试用例

---

## 开发流程

### 环境准备

1. Fork 仓库到您的 GitHub 账户
2. 克隆您的 Fork：

```bash
git clone https://github.com/YOUR_USERNAME/CMAMSys.git
cd CMAMSys
```

3. 添加上游仓库：

```bash
git remote add upstream https://github.com/Yogdunana/CMAMSys.git
```

4. 安装依赖：

```bash
pnpm install
```

5. 复制环境变量文件：

```bash
cp .env.example .env
```

6. 配置 `.env` 文件（参考 [部署文档](DEPLOYMENT.md)）

7. 启动开发服务器：

```bash
pnpm dev
```

### 创建功能分支

为每个功能或修复创建单独的分支：

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 分支命名规范

- `feature/`：新功能
- `fix/`：Bug 修复
- `docs/`：文档更新
- `test/`：测试相关
- `refactor/`：代码重构
- `style/`：代码风格调整
- `chore/`：构建/工具相关

示例：
- `feature/add-email-notification`
- `fix/login-authentication-error`
- `docs/update-api-documentation`
- `refactor/optimize-database-queries`

---

## 代码规范

### TypeScript

- 使用 TypeScript 类型注解
- 避免使用 `any` 类型
- 使用 `const` 和 `let`，避免 `var`
- 使用箭头函数
- 使用模板字符串

### React

- 使用函数组件和 Hooks
- 遵循 React 最佳实践
- 组件使用 PascalCase
- 文件名使用 kebab-case

### CSS/Tailwind

- 使用 Tailwind CSS 工具类
- 避免内联样式
- 使用响应式设计
- 遵循设计规范

### 数据库

- 使用 Prisma ORM
- 遵循数据库命名规范
- 添加适当的索引
- 编写迁移文件

### 测试

- 为新功能编写测试
- 使用 Vitest 测试框架
- 测试覆盖率应 > 80%
- 使用描述性的测试名称

---

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type（类型）

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式调整（不影响功能） |
| `refactor` | 代码重构 |
| `test` | 测试相关 |
| `chore` | 构建/工具相关 |
| `perf` | 性能优化 |
| `ci` | CI/CD 相关 |
| `revert` | 回退提交 |

### 示例

```bash
# 新功能
feat(auth): add two-factor authentication

# Bug 修复
fix(api): resolve token expiration issue

# 文档更新
docs(readme): update installation instructions

# 性能优化
perf(database): optimize query performance

# 代码重构
refactor(components): simplify user profile component
```

### 提交消息示例

```
feat(ai): add DeepSeek provider support

- Add DeepSeek provider configuration
- Implement chat completion API
- Add provider testing functionality
- Update documentation

Closes #123
```

---

## Pull Request 流程

### 提交 PR 前

1. 确保代码通过所有测试：
```bash
pnpm test
```

2. 确保代码通过 Lint 检查：
```bash
pnpm lint
```

3. 确保类型检查通过：
```bash
pnpm ts-check
```

4. 确保构建成功：
```bash
pnpm build
```

5. 更新相关文档

6. 同步上游仓库最新代码：
```bash
git fetch upstream
git rebase upstream/main
```

### 创建 Pull Request

1. 推送您的分支到 GitHub：
```bash
git push origin feature/your-feature-name
```

2. 在 GitHub 上创建 Pull Request

3. 填写 PR 模板：

```markdown
## 描述
简要描述此 PR 的目的和变更内容。

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重大变更（Breaking Change）
- [ ] 文档更新
- [ ] 性能优化
- [ ] 代码重构

## 测试
描述已执行的测试。

## 截图/演示
如果有 UI 变更，请提供截图或演示。

## 相关 Issue
Closes #(issue number)

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加测试
- [ ] 已更新文档
- [ ] 已通过所有测试
- [ ] 无新的警告
```

### PR 审查

1. 所有 PR 必须经过至少一位维护者审查
2. 审查者可能会要求修改
3. 修改后请推送更新
4. 审查通过后会合并到主分支

### 合并策略

我们使用以下合并策略：

- `squash and merge`：压缩提交，保持历史整洁
- `rebase and merge`：保留提交历史，基于最新代码

---

## 问题反馈

### Issue 模板

提交 Issue 时，请使用相应的模板：

#### Bug 报告模板

```markdown
**描述**
清晰简洁地描述 Bug。

**复现步骤**
1. 前往 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

**预期行为**
描述您期望发生的情况。

**实际行为**
描述实际发生的情况。

**截图**
如果适用，添加截图来说明问题。

**环境信息**
- OS: [e.g. Windows 10, macOS 13.0]
- Browser: [e.g. Chrome 120, Firefox 120]
- Node.js Version: [e.g. 20.10.0]
- CMAMSys Version: [e.g. 1.0.0]

**附加信息**
添加其他关于问题的信息。
```

#### 功能建议模板

```markdown
**问题/需求描述**
清晰简洁地描述您想要的功能或解决的问题。

**建议的解决方案**
描述您希望实现该功能的方式。

**替代方案**
描述您考虑过的任何替代解决方案或功能。

**附加信息**
添加关于功能建议的其他信息、截图等。
```

---

## 版本发布

版本遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- `MAJOR.MINOR.PATCH`
- 不兼容的 API 修改：MAJOR
- 向下兼容的功能性新增：MINOR
- 向下兼容的问题修正：PATCH

---

## 获取帮助

如果您在贡献过程中遇到问题：

1. 查看 [文档](README.md)
2. 搜索 [Issues](https://github.com/Yogdunana/CMAMSys/issues)
3. 在 [Discussions](https://github.com/Yogdunana/CMAMSys/discussions) 提问
4. 联系维护者

---

## 许可证

通过贡献代码，您同意您的贡献将按照项目的许可证进行授权。

---

**再次感谢您的贡献！** 🎉
