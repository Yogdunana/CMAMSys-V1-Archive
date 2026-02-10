# CMAMSys 测试指南

本文档提供 CMAMSys 项目的完整测试指南，包括测试策略、测试类型、测试工具和最佳实践。

## 📋 目录

- [测试策略](#测试策略)
- [测试类型](#测试类型)
- [测试环境](#测试环境)
- [测试工具](#测试工具)
- [测试指南](#测试指南)
- [测试覆盖率](#测试覆盖率)
- [持续集成](#持续集成)
- [最佳实践](#最佳实践)

---

## 测试策略

### 测试金字塔

```
        ┌──────────────┐
        │   E2E 测试    │  10%  - 少量但关键的端到端测试
        │   (Playwright)│
        └──────────────┘
             ┌──────┐
             │集成测试 │  30%  - 中等数量的集成测试
             │ (Jest) │
             └──────┘
         ┌──────────────────┐
         │    单元测试       │  60%  - 大量的单元测试
         │    (Jest)         │
         └──────────────────┘
```

### 测试原则

1. **快速反馈**：单元测试应该快速运行（< 1 秒）
2. **独立性**：每个测试应该独立运行，不依赖其他测试
3. **可重复性**：测试结果应该可重复，不受环境影响
4. **可读性**：测试代码应该清晰易懂
5. **维护性**：测试代码应该易于维护和更新

---

## 测试类型

### 1. 单元测试

测试单个函数、组件或类的功能。

**示例**：测试密码加密函数

```typescript
// src/services/auth.test.ts
import { AuthService } from './auth';

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password with BCrypt', async () => {
      const password = 'password123';
      const hash = await AuthService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toHaveLength(60);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'password123';
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'password123';
      const hash = await AuthService.hashPassword(password);

      const isValid = await AuthService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hash = await AuthService.hashPassword(password);

      const isValid = await AuthService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });
});
```

### 2. 集成测试

测试多个模块之间的交互。

**示例**：测试登录 API

```typescript
// src/app/api/auth/login.test.ts
import { POST } from './route';
import { prisma } from '@/lib/db';

describe('/api/auth/login', () => {
  beforeAll(async () => {
    // 创建测试用户
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: await AuthService.hashPassword('password123'),
        role: 'USER',
      },
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' },
    });
  });

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
    expect(data.data.refreshToken).toBeDefined();
    expect(data.data.user.email).toBe('test@example.com');
  });

  it('should reject invalid credentials', async () => {
    const request = new Request('http://localhost:5000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_CREDENTIALS');
  });
});
```

### 3. 组件测试

测试 React 组件的渲染和交互。

**示例**：测试用户菜单组件

```typescript
// src/components/auth/user-menu.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserMenu } from './user-menu';

describe('UserMenu', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    role: 'USER',
    isVerified: true,
  };

  const mockLogout = jest.fn();

  it('should render user information', () => {
    render(<UserMenu user={mockUser} onLogout={mockLogout} />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', () => {
    render(<UserMenu user={mockUser} onLogout={mockLogout} />);

    const logoutButton = screen.getByText('退出登录');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});
```

### 4. E2E 测试

测试完整的用户流程。

**示例**：测试用户注册和登录流程

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register and login a user', async ({ page }) => {
    // 访问注册页面
    await page.goto('http://localhost:5000/auth/register');

    // 填写注册表单
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // 提交表单
    await page.click('button[type="submit"]');

    // 等待重定向到登录页
    await expect(page).toHaveURL('http://localhost:5000/auth/login');

    // 填写登录表单
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // 提交表单
    await page.click('button[type="submit"]');

    // 等待重定向到 Dashboard
    await expect(page).toHaveURL('http://localhost:5000/dashboard');

    // 验证用户已登录
    await expect(page.locator('text=testuser')).toBeVisible();
  });
});
```

---

## 测试环境

### 开发环境

使用内存数据库进行快速测试。

```bash
# 设置测试环境变量
export NODE_ENV=test
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cmamsys_test"

# 运行测试
pnpm test
```

### CI/CD 环境

使用 GitHub Actions 进行持续集成。

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cmamsys_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cmamsys_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 测试工具

### Jest

单元测试和集成测试框架。

**配置文件**：`jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### React Testing Library

React 组件测试库。

**示例**：

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserMenu } from './user-menu';

test('should render user menu', () => {
  render(<UserMenu user={mockUser} onLogout={mockLogout} />);

  expect(screen.getByText('testuser')).toBeInTheDocument();
});
```

### Playwright

E2E 测试框架。

**安装**：

```bash
pnpm add -D @playwright/test
```

**配置文件**：`playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 测试指南

### 认证模块测试

#### 测试用户注册

```typescript
describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe('newuser@example.com');
  });

  it('should reject duplicate email', async () => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // 已存在的邮箱
        username: 'newuser',
        password: 'password123',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });
});
```

### AI Provider 测试

#### 测试 AI Provider 创建

```typescript
describe('POST /api/ai-providers', () => {
  it('should create a new AI provider', async () => {
    const response = await fetch('http://localhost:5000/api/ai-providers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: '测试 Provider',
        type: 'VOLCENGINE',
        apiKey: 'test-api-key',
        priority: 10,
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('测试 Provider');
  });
});
```

#### 测试 AI 调用

```typescript
describe('POST /api/ai-providers/chat', () => {
  it('should call AI provider and return response', async () => {
    const response = await fetch('http://localhost:5000/api/ai-providers/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        providerId: providerId,
        model: 'doubao-pro-128k',
        messages: [
          { role: 'user', content: '你好' },
        ],
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.content).toBeDefined();
  });
});
```

### 建模模块测试

#### 测试创建建模任务

```typescript
describe('POST /api/modeling/tasks', () => {
  it('should create a new modeling task', async () => {
    const response = await fetch('http://localhost:5000/api/modeling/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        competitionId: 'comp-123',
        problemId: 'A',
        description: '测试建模任务',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('PENDING');
  });
});
```

---

## 测试覆盖率

### 查看覆盖率报告

```bash
# 生成覆盖率报告
pnpm test --coverage

# 查看报告
open coverage/lcov-report/index.html
```

### 覆盖率目标

| 类型 | 目标 |
|------|------|
| 语句覆盖率 (Statements) | ≥ 80% |
| 分支覆盖率 (Branches) | ≥ 80% |
| 函数覆盖率 (Functions) | ≥ 80% |
| 行覆盖率 (Lines) | ≥ 80% |

### 提高覆盖率的技巧

1. **测试边界情况**：
   ```typescript
   it('should handle empty input', () => {
     expect(() => validateInput('')).toThrow();
   });

   it('should handle null input', () => {
     expect(() => validateInput(null)).toThrow();
   });
   ```

2. **测试错误路径**：
   ```typescript
   it('should return error when API fails', async () => {
     // Mock API 失败
     jest.spyOn(api, 'call').mockRejectedValue(new Error('API Error'));

     const result = await service.getData();
     expect(result.success).toBe(false);
   });
   ```

3. **测试异步操作**：
   ```typescript
   it('should handle async operations', async () => {
     await expect(asyncOperation()).resolves.toBe(expectedValue);
   });
   ```

---

## 持续集成

### GitHub Actions 工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install
      - name: Run lint
        run: pnpm lint

  test:
    runs-on: ubuntu-latest
    needs: lint

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cmamsys_test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cmamsys_test
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    needs: test

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cmamsys_test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      - name: Run E2E tests
        run: pnpm test:e2e
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 最佳实践

### 1. 测试命名

使用描述性的测试名称：

```typescript
// ❌ Bad
it('should work', () => {});

// ✅ Good
it('should hash password with BCrypt', () => {});
it('should reject invalid credentials', () => {});
```

### 2. 测试隔离

每个测试应该独立运行：

```typescript
// ✅ Good - 使用 beforeEach 清理
beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterEach(async () => {
  await prisma.user.deleteMany();
});
```

### 3. 使用 Mock

Mock 外部依赖：

```typescript
// ✅ Good - Mock API 调用
jest.mock('@/services/ai-provider', () => ({
  callAI: jest.fn().mockResolvedValue({
    content: 'Test response',
  }),
}));
```

### 4. 测试异步代码

正确处理异步代码：

```typescript
// ✅ Good
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expectedValue);
});
```

### 5. 使用测试工具库

使用专业的测试工具库：

```typescript
// ✅ Good - 使用 Testing Library
import { render, screen } from '@testing-library/react';

test('should render component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### 6. 保持测试简单

避免复杂的测试逻辑：

```typescript
// ❌ Bad - 太复杂
it('should do many things', async () => {
  // 100+ 行代码
});

// ✅ Good - 拆分成多个测试
it('should validate input', async () => {});
it('should process data', async () => {});
it('should save to database', async () => {});
```

---

## 常见问题

### Q: 测试运行太慢怎么办？

**A**: 
- 使用 Mock 减少数据库调用
- 并行运行测试
- 只运行相关的测试：`pnpm test -- --testNamePattern="AuthService"`

### Q: 如何测试私有方法？

**A**: 
- 不要直接测试私有方法
- 通过公共接口测试私有方法的行为

### Q: 如何处理日期和时间？

**A**: 
- 使用固定的测试时间
```typescript
jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));
```

### Q: 如何测试文件上传？

**A**: 
- 使用 Mock 文件
```typescript
const file = new File(['content'], 'test.txt', { type: 'text/plain' });
```

---

**最后更新：2026-02-08**
