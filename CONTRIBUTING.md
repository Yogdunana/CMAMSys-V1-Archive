# Contributing to CMAMSys

感谢您对 CMAMSys 项目的关注！我们欢迎各种形式的贡献，包括但不限于代码、文档、问题报告、功能建议等。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交 Pull Request](#提交-pull-request)
- [问题报告](#问题报告)
- [功能建议](#功能建议)

---

## 行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们承诺让每个人都能参与到我们的项目中，无论他们的经验水平、性别、性别认同和表达、性取向、残疾、个人外貌、体型、种族、民族、年龄、宗教或国籍如何。

### 我们的标准

积极行为包括：

- ✅ 使用欢迎和包容的语言
- ✅ 尊重不同的观点和经验
- ✅ 优雅地接受建设性的批评
- ✅ 关注对社区最有利的事情
- ✅ 对其他社区成员表示同理心

不可接受的行为包括：

- ❌ 使用性别化语言或图像，以及不受欢迎的性关注或性暗示
- ❌ 恶意评论、侮辱/贬损评论，以及个人或政治攻击
- ❌ 公开或私下骚扰
- ❌ 未经明确许可发布他人的私人信息（如物理或电子邮件地址）
- ❌ 其他不专业或不适当的行为

## 如何贡献

### 1. 报告 Bug

在提交 bug 报告之前，请确保：

- [ ] 搜索现有的 issue，避免重复报告
- [ ] 提供详细的复现步骤
- [ ] 提供系统环境信息（操作系统、浏览器、Node.js 版本等）
- [ ] 提供完整的错误日志和截图（如适用）
- [ ] 说明预期行为和实际行为的差异

### 2. 提出功能建议

在提出功能建议之前，请确保：

- [ ] 搜索现有的 issue 和 PR
- [ ] 提供清晰的功能描述和使用场景
- [ ] 说明为什么这个功能对用户很重要
- [ ] 尽可能提供设计草图或实现思路

### 3. 提交代码

我们欢迎任何形式的代码贡献！在提交代码之前，请：

- [ ] Fork 项目到你的 GitHub 账号
- [ ] 创建一个描述性的分支（如 `fix/login-error` 或 `feature/user-profile`）
- [ ] 按照开发环境设置指南配置本地环境
- [ ] 遵循代码规范编写代码
- [ ] 添加必要的测试
- [ ] 更新相关文档
- [ ] 提交 Pull Request

---

## 开发环境设置

### 前置要求

- Node.js 24+
- pnpm 9.0.0+
- PostgreSQL 14+
- Git

### 设置步骤

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/YOUR_USERNAME/cmamsys.git
cd cmamsys

# 2. 添加上游仓库
git remote add upstream https://github.com/your-org/cmamsys.git

# 3. 安装依赖
pnpm install

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的配置

# 5. 初始化数据库
pnpm prisma migrate dev

# 6. 启动开发服务器
coze dev
```

### 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
coze dev

# 构建项目
coze build

# 运行测试
pnpm test

# 类型检查
pnpm ts-check

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 数据库迁移
pnpm prisma migrate dev

# 生成 Prisma Client
pnpx prisma generate

# 打开 Prisma Studio
pnpm prisma studio
```

---

## 代码规范

### TypeScript

- 使用 TypeScript strict mode
- 避免使用 `any` 类型
- 为函数参数和返回值添加类型注解
- 使用接口（Interface）定义数据结构

**示例**：

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  });

  return user;
}

// ❌ Bad
async function getUserProfile(userId: any) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}
```

### React 组件

- 使用函数式组件和 Hooks
- 使用 TypeScript 定义 Props 类型
- 避免不必要的组件重新渲染
- 使用 `useCallback` 和 `useMemo` 优化性能

**示例**：

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({
  label,
  onClick,
  variant = 'primary',
}: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
};

// ❌ Bad
export const Button = (props: any) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### 命名规范

- **文件名**: 使用 kebab-case（如 `user-profile.tsx`）
- **组件名**: 使用 PascalCase（如 `UserProfile`）
- **函数/变量**: 使用 camelCase（如 `getUserProfile`）
- **常量**: 使用 UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- **类型/接口**: 使用 PascalCase（如 `UserProfile`）

### 注释规范

- 为复杂的函数添加 JSDoc 注释
- 在关键逻辑处添加行内注释
- 避免注释显而易见的代码

**示例**：

```typescript
/**
 * 获取用户配置文件
 * @param userId - 用户 ID
 * @returns 用户配置文件，如果不存在则返回 null
 * @throws {Error} 当数据库连接失败时抛出错误
 */
async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // 从数据库查询用户信息
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}
```

### Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**：

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码逻辑）
- `refactor`: 重构（不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

**示例**：

```
feat(auth): add OAuth2 login support

Add support for logging in with OAuth2 providers including
Google, GitHub, and Microsoft.

Closes #123
```

### 测试规范

- 为所有新增功能编写测试
- 测试覆盖率应保持在 80% 以上
- 使用描述性的测试名称
- 测试文件应与源文件在同一目录下，命名为 `.test.ts`

**示例**：

```typescript
// user.service.test.ts
describe('UserService', () => {
  describe('getUserProfile', () => {
    it('should return user profile when user exists', async () => {
      // Arrange
      const userId = 'user-123';

      // Act
      const profile = await getUserProfile(userId);

      // Assert
      expect(profile).toBeDefined();
      expect(profile?.id).toBe(userId);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent';

      // Act
      const profile = await getUserProfile(userId);

      // Assert
      expect(profile).toBeNull();
    });
  });
});
```

---

## 提交 Pull Request

### Pull Request 检查清单

在提交 PR 之前，请确保：

- [ ] 代码通过所有测试（`pnpm test`）
- [ ] 代码通过类型检查（`pnpm ts-check`）
- [ ] 代码通过 lint 检查（`pnpm lint`）
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 遵循了代码规范
- [ ] 提交信息符合 Conventional Commits 规范
- [ ] PR 标题清晰描述了变更内容
- [ ] PR 描述中包含了变更摘要、相关 issue 和测试步骤

### Pull Request 模板

```markdown
## 变更摘要

简要描述这个 PR 的主要变更内容。

## 变更类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 重大变更（可能破坏现有功能）
- [ ] 文档更新
- [ ] 性能优化
- [ ] 代码重构

## 相关 Issue

Closes #(issue number)

## 测试

描述如何测试这些变更：

1. 
2. 
3. 

## 截图

如果适用，请添加截图或 GIF。

## 检查清单

- [ ] 代码通过所有测试
- [ ] 代码通过类型检查
- [ ] 代码通过 lint 检查
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
```

### Review 流程

1. 自动检查会运行，确保所有测试通过
2. 维护者会手动审查代码
3. 可能会要求进行修改
4. 修改完成后，PR 会被合并到主分支

---

## 问题报告

### Bug 报告模板

```markdown
## 问题描述

简要描述遇到的问题。

## 复现步骤

1. 转到 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## 预期行为

描述你期望发生的事情。

## 实际行为

描述实际发生的事情（错误信息、异常行为等）。

## 环境信息

- 操作系统: [例如: Ubuntu 20.04]
- 浏览器: [例如: Chrome 120]
- Node.js 版本: [例如: 24.0.0]
- CMAMSys 版本: [例如: v2.0.0]

## 截图

如果适用，请添加截图或 GIF 来帮助说明问题。

## 额外信息

添加任何其他有助于解决问题的信息（日志、配置文件等）。
```

---

## 功能建议

### 功能建议模板

```markdown
## 问题/需求

描述当前遇到的问题或需要满足的需求。

## 建议的解决方案

描述你希望如何实现这个功能。

## 替代方案

描述你考虑过的其他解决方案或工作流程。

## 附加信息

添加任何其他有助于实现这个功能的信息（示例、设计草图等）。
```

---

## 获取帮助

如果你在贡献过程中遇到问题：

- 📧 发送邮件到：support@cmamsys.com
- 💬 加入我们的社区讨论
- 📚 查看 [开发文档](docs/DEVELOPMENT.md)
- 🔍 搜索已有的 issues 和 PRs

---

## 许可证

通过向 CMAMSys 提交贡献，你同意你的贡献将根据项目的许可证（MIT License）进行授权。

---

感谢你的贡献！❤️
