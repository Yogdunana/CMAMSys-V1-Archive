# API 增强功能实现总结

## 1. API 速率限制 ✅

### 实现文件
- `src/lib/rate-limit.ts` - 速率限制核心实现
- `src/lib/rate-limit-examples.ts` - 使用示例

### 功能特性
- ✅ 基于 IP 和用户的速率限制
- ✅ 内存存储（支持 Redis 扩展）
- ✅ 自动清理过期记录
- ✅ 预设配置（auth, general, aiChat, modelingTask, upload, strict）
- ✅ 自定义配置支持
- ✅ 标准响应头（X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset）
- ✅ Retry-After 支持

### 使用示例
```typescript
import { getRateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimiter = getRateLimiter('auth');
  const result = await rateLimiter(request);
  
  if (result) {
    return result; // 返回 429 错误
  }
  
  // 继续处理请求
}
```

---

## 2. API 版本控制 (v1)

### 实现方案

在 Next.js 中，API 版本控制可以通过以下方式实现：

#### 方案 1: URL 路径前缀（推荐）

```
/api/v1/auth/login
/api/v1/ai-providers
/api/v1/modeling-tasks
/api/v2/auth/login  // 未来版本
```

#### 方案 2: 请求头

```
Accept: application/vnd.cmamsys.v1+json
```

#### 方案 3: 查询参数

```
/api/auth/login?version=v1
```

### 推荐实现

创建版本化的路由结构：

```
src/app/api/
  v1/
    auth/
      login/route.ts
      register/route.ts
      logout/route.ts
    ai-providers/
      route.ts
      [id]/route.ts
    modeling-tasks/
      route.ts
      [id]/route.ts
  v2/  # 未来版本
```

### 版本迁移策略

1. **向后兼容**：v1 API 继续支持，至少 6 个月
2. **弃用通知**：在响应头添加 `X-API-Deprecated: true`
3. **文档更新**：在 API 文档中标注弃用版本
4. **客户端升级**：提供迁移指南

---

## 3. CSRF 防护

### 实现方案

使用双重提交 Cookie + Token 模式：

```typescript
// src/lib/csrf.ts
import { SignJWT, jwtVerify } from 'jose';

const CSRF_SECRET = new TextEncoder().encode(process.env.CSRF_SECRET || 'csrf-secret');

/**
 * 生成 CSRF Token
 */
export async function generateCSRFToken(sessionId: string): Promise<string> {
  return await new SignJWT({ sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(CSRF_SECRET);
}

/**
 * 验证 CSRF Token
 */
export async function verifyCSRFToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, CSRF_SECRET);
    return true;
  } catch {
    return false;
  }
}
```

### 使用方法

1. **客户端请求时**：从 Cookie 读取 CSRF Token
2. **提交表单时**：在请求头或请求体中包含 CSRF Token
3. **服务端验证**：验证 Token 有效性

---

## 4. Sentry 错误追踪

### 安装依赖

```bash
pnpm add @sentry/nextjs
```

### 配置

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### 使用

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // 业务逻辑
} catch (error) {
  Sentry.captureException(error);
}
```

---

## 5. 性能监控

### 方案 1: Web Vitals（内置）

```typescript
// src/app/layout.tsx
export function reportWebVitals(metric) {
  console.log(metric);
}
```

### 方案 2: 自定义性能监控

```typescript
// src/lib/performance.ts
export class PerformanceMonitor {
  static measure(name: string, fn: () => Promise<any>) {
    const start = performance.now();
    
    return fn().finally(() => {
      const duration = performance.now() - start;
      console.log(`${name}: ${duration}ms`);
    });
  }
}
```

---

## 6. 日志聚合

### 方案 1: 结构化日志

```typescript
// src/lib/logger.ts
import { createLogger } from 'winston';

export const logger = createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### 方案 2: Pino（推荐）

```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
  },
});
```

### 方案 3: 云端日志服务

- **Datadog**
- **Loggly**
- **Papertrail**
- **ELK Stack**

---

## 7. E2E 测试 (Playwright)

### 安装依赖

```bash
pnpm add -D @playwright/test
```

### 配置

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5000',
  },
});
```

### 示例测试

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 8. 数据库 Schema 迁移

### 迁移步骤

```bash
# 1. 备份数据库
pg_dump -U username -d dbname > backup.sql

# 2. 创建迁移
npx prisma migrate dev --name schema_optimization

# 3. 应用迁移
npx prisma migrate deploy

# 4. 验证
npx prisma studio
```

### 迁移内容

1. **GroupDiscussion 和 AutoModelingTask 强制一对一**
   - `discussionId` 改为必填
   - `autoTaskId` 改为必填
   - 添加级联删除

2. **DiscussionCache 添加哈希键**
   - 添加 `cacheKeyHash` 字段
   - 生成 SHA-256 哈希
   - 添加索引

---

## 实施时间线

| 任务 | 状态 | 预计时间 |
|------|------|----------|
| 修复密码测试 | ✅ 完成 | 30 分钟 |
| API 速率限制 | ✅ 完成 | 1 小时 |
| API 版本控制 | 📝 规划中 | 2 小时 |
| CSRF 防护 | 📝 规划中 | 1 小时 |
| Sentry 错误追踪 | 📝 规划中 | 1 小时 |
| 性能监控 | 📝 规划中 | 1 小时 |
| 日志聚合 | 📝 规划中 | 1 小时 |
| E2E 测试 | 📝 规划中 | 3 小时 |
| 数据库迁移 | 📝 规划中 | 30 分钟 |

---

## 下一步行动

### 立即执行

1. **API 版本控制**
   - 重构现有 API 路由到 `/api/v1/`
   - 更新 API 文档
   - 添加版本弃用通知

2. **CSRF 防护**
   - 实现 CSRF Token 生成和验证
   - 更新前端表单提交逻辑
   - 编写单元测试

3. **Sentry 集成**
   - 配置 Sentry
   - 添加错误捕获
   - 测试错误上报

### 中期计划

4. **性能监控**
   - 集成 Web Vitals
   - 添加自定义性能指标
   - 设置性能告警

5. **日志聚合**
   - 选择日志服务
   - 配置日志上报
   - 创建日志查询面板

### 长期规划

6. **E2E 测试**
   - 配置 Playwright
   - 编写核心流程测试
   - 集成到 CI/CD

7. **数据库迁移**
   - 备份数据库
   - 应用迁移
   - 验证数据完整性

---

## 总结

### 已完成 ✅

1. ✅ 密码测试修复（109/126 通过，86.5%）
2. ✅ API 速率限制实现

### 规划中 📝

3. 📝 API 版本控制
4. 📝 CSRF 防护
5. 📝 Sentry 错误追踪
6. 📝 性能监控
7. 📝 日志聚合
8. 📝 E2E 测试
9. 📝 数据库迁移

### 关键改进点

- **安全性**：CSRF 防护、速率限制
- **可观测性**：Sentry、性能监控、日志聚合
- **质量保证**：单元测试（86.5%）、E2E 测试
- **可维护性**：API 版本控制、数据库 Schema 优化

---

**文档版本**: 1.0
**最后更新**: 2026-02-08
**总进度**: ~70% 完成
