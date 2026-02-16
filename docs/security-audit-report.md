# CMAMSys 安全审计报告

**审计日期**：2026-02-16
**审计人员**：网络安全工程师
**系统版本**：v1.0.0
**审计范围**：全系统安全评估

---

## 📊 执行摘要

### 审计结论

**系统存在多个严重安全漏洞，需要立即修复**

经过全面的安全审计，CMAMSys 系统发现了多个严重的安全问题，包括硬编码的密钥默认值、不安全的 Token 传输方式、过于宽松的 CSP 策略等。这些问题可能导致：

- 🔓 完全绕过身份验证系统
- 🔓 CSRF 攻击
- 🔓 XSS 攻击
- 🔓 敏感信息泄露

### 安全评分

| 维度 | 评分 | 状态 |
|------|------|------|
| **身份验证** | 50/100 | ⚠️ 严重 |
| **授权控制** | 80/100 | ✅ 良好 |
| **数据保护** | 65/100 | ⚠️ 中等 |
| **输入验证** | 85/100 | ✅ 良好 |
| **会话管理** | 70/100 | ⚠️ 中等 |
| **错误处理** | 75/100 | ✅ 良好 |
| **日志安全** | 80/100 | ✅ 良好 |
| **依赖安全** | 85/100 | ✅ 良好 |
| **总体评分** | **74/100** | ⚠️ **需要立即修复** |

---

## 🚨 严重安全问题

### 1. JWT Secret 硬编码默认值 🔴 严重

**问题描述**：
在 `src/lib/jwt.ts` 中，JWT Secret 有硬编码的默认值：

```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || 'your-super-secret-refresh-token-key'
);
```

**安全影响**：
- 🔓 攻击者可以使用默认值生成有效的 JWT token
- 🔓 可以伪造任何用户的身份
- 🔓 完全绕过身份验证系统
- 🔓 获取管理员权限

**攻击场景**：
```javascript
// 攻击者可以使用默认密钥生成管理员 token
const fakeToken = jwt.sign(
  { userId: 'admin-id', role: 'ADMIN', email: 'admin@example.com' },
  'your-super-secret-jwt-key-change-in-production'
);
// 该 token 可以通过验证，攻击者获得管理员权限
```

**修复方案**：
```typescript
// 修复：移除默认值，强制要求环境变量
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const jwtSecretKey = new TextEncoder().encode(JWT_SECRET);

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET environment variable is required');
}
const refreshTokenKey = new TextEncoder().encode(REFRESH_TOKEN_SECRET);
```

**优先级**：🔴 紧急（立即修复）

---

### 2. CSRF Secret 硬编码默认值 🔴 严重

**问题描述**：
在 `src/lib/csrf.ts` 中，CSRF Secret 有硬编码的默认值：

```typescript
const CSRF_SECRET = new TextEncoder().encode(
  process.env.CSRF_SECRET || 'your-super-secret-csrf-key-change-in-production'
);
```

**安全影响**：
- 🔓 攻击者可以使用默认值生成有效的 CSRF token
- 🔓 可以绕过 CSRF 保护
- 🔓 执行跨站请求伪造攻击
- 🔓 窃取用户数据或执行恶意操作

**攻击场景**：
```javascript
// 攻击者可以生成有效的 CSRF token
const fakeCSRFToken = jwt.sign(
  { sessionId: 'victim-session', timestamp: Date.now() },
  'your-super-secret-csrf-key-change-in-production'
);
// 该 token 可以通过验证，CSRF 保护失效
```

**修复方案**：
```typescript
// 修复：移除默认值，强制要求环境变量
const CSRF_SECRET = process.env.CSRF_SECRET;
if (!CSRF_SECRET) {
  throw new Error('CSRF_SECRET environment variable is required');
}
const csrfSecretKey = new TextEncoder().encode(CSRF_SECRET);
```

**优先级**：🔴 紧急（立即修复）

---

### 3. Token 可通过 URL 查询参数传递 🔴 严重

**问题描述**：
在 `src/lib/auth-middleware.ts` 中，Token 可以通过 URL 查询参数提取：

```typescript
export function extractToken(request: NextRequest): string | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const tokenCookie = request.cookies.get('accessToken');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  // ⚠️ 不安全：Try query parameter
  const tokenParam = request.nextUrl.searchParams.get('token');
  if (tokenParam) {
    return tokenParam;
  }

  return null;
}
```

**安全影响**：
- 🔓 Token 会被记录在服务器访问日志中
- 🔓 Token 会被浏览器历史记录保存
- 🔓 Token 可能被分享或转发，导致泄露
- 🔓 违反 OAuth 2.0 最佳实践

**攻击场景**：
```
# 访问日志泄露
https://example.com/api/data?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# 日志中会记录完整的 URL，包括 token

# 浏览器历史记录
如果用户访问了包含 token 的 URL，token 会保存在浏览器历史记录中
其他使用同一台电脑的人可以找到该 token

# 分享链接
用户不小心分享了包含 token 的链接，接收者可以直接使用该 token
```

**修复方案**：
```typescript
// 修复：移除从查询参数提取 token 的逻辑
export function extractToken(request: NextRequest): string | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const tokenCookie = request.cookies.get('accessToken');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}
```

**优先级**：🔴 紧急（立即修复）

---

### 4. 加密密钥回退到 JWT Secret 🔴 严重

**问题描述**：
在 `src/lib/encryption.ts` 中，加密密钥回退到使用 JWT Secret：

```typescript
function getEncryptionPassword(): string {
  const password = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!password) {
    throw new Error('ENCRYPTION_KEY or JWT_SECRET environment variable is required for encryption');
  }
  return password;
}
```

**安全影响**：
- 🔓 如果 JWT Secret 使用默认值，加密完全失效
- 🔓 API Keys 等敏感数据可以被解密
- 🔓 攻击者可以窃取所有 AI Provider 的 API Keys
- 🔓 财务损失和数据泄露

**攻击场景**：
```javascript
// 如果 JWT_SECRET 使用默认值
// 攻击者可以解密所有敏感数据
const encryptedAPIKey = "..."; // 从数据库获取
const decryptedAPIKey = decrypt(encryptedAPIKey);
// 攻击者获得了用户的 API Key，可以滥用或窃取
```

**修复方案**：
```typescript
// 修复：强制使用独立的加密密钥
function getEncryptionPassword(): string {
  const password = process.env.ENCRYPTION_KEY;
  if (!password) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  return password;
}
```

**优先级**：🔴 紧急（立即修复）

---

### 5. Content-Security-Policy 过于宽松 🔴 高危

**问题描述**：
在 `src/lib/api-middleware.ts` 中，CSP 策略允许 `unsafe-inline` 和 `unsafe-eval`：

```typescript
setHeader(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
);
```

**安全影响**：
- 🔓 允许内联脚本和动态代码执行
- 🔓 XSS 攻击更容易成功
- 🔓 攻击者可以注入恶意脚本
- 🔓 窃取用户数据或执行恶意操作

**攻击场景**：
```html
<!-- 攻击者可以注入内联脚本 -->
<div onclick="alert('XSS')">Click me</div>

<!-- 或者动态执行代码 -->
<script>
  eval(maliciousCode);
</script>
```

**修复方案**：
```typescript
// 修复：使用 nonce 或 hash，移除 unsafe-inline 和 unsafe-eval
// 在服务端生成 nonce
const nonce = crypto.randomBytes(16).toString('base64');

setHeader(
  'Content-Security-Policy',
  `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';`
);
```

**优先级**：🔴 高危（立即修复）

---

## ⚠️ 高优先级问题

### 6. CSRF 保护默认关闭 🟠 高危

**问题描述**：
在 `src/lib/api-middleware.ts` 中，很多预设的 CSRF 保护默认关闭：

```typescript
export const MiddlewarePresets = {
  // Auth endpoints - strict rate limiting, CSRF required
  auth: {
    rateLimit: { enabled: true, preset: 'auth' },
    csrf: { enabled: true, skipMethods: ['GET', 'HEAD', 'OPTIONS'] },
    version: { enabled: true, requireVersion: true },
  },

  // General API - standard rate limiting, CSRF optional
  general: {
    rateLimit: { enabled: true, preset: 'general' },
    csrf: { enabled: false }, // ⚠️ CSRF 保护关闭
    version: { enabled: true, requireVersion: true },
  },

  // AI Chat - strict rate limiting, no CSRF
  aiChat: {
    rateLimit: { enabled: true, preset: 'aiChat' },
    csrf: { enabled: false }, // ⚠️ CSRF 保护关闭
    version: { enabled: true, requireVersion: true },
  },

  // Modeling tasks - strict rate limiting, CSRF optional
  modelingTask: {
    rateLimit: { enabled: true, preset: 'modelingTask' },
    csrf: { enabled: false }, // ⚠️ CSRF 保护关闭
    version: { enabled: true, requireVersion: true },
  },
};
```

**安全影响**：
- 🔓 大部分 API 端点缺少 CSRF 保护
- 🔓 容易受到跨站请求伪造攻击
- 🔓 攻击者可以代表用户执行恶意操作

**修复方案**：
```typescript
// 修复：为所有修改数据的 API 启用 CSRF 保护
export const MiddlewarePresets = {
  general: {
    rateLimit: { enabled: true, preset: 'general' },
    csrf: { enabled: true, skipMethods: ['GET', 'HEAD', 'OPTIONS', 'PATCH'] },
    version: { enabled: true, requireVersion: true },
  },

  aiChat: {
    rateLimit: { enabled: true, preset: 'aiChat' },
    csrf: { enabled: true, skipMethods: ['GET', 'HEAD', 'OPTIONS'] },
    version: { enabled: true, requireVersion: true },
  },

  modelingTask: {
    rateLimit: { enabled: true, preset: 'modelingTask' },
    csrf: { enabled: true, skipMethods: ['GET', 'HEAD', 'OPTIONS'] },
    version: { enabled: true, requireVersion: true },
  },
};
```

**优先级**：🟠 高危（尽快修复）

---

### 7. 错误消息可能泄露用户存在性 🟠 高危

**问题描述**：
在 `src/app/api/auth/login/route.ts` 中，错误消息可能泄露用户是否存在：

```typescript
if (!user) {
  // Log failed login attempt
  await createLoginLog({
    email,
    success: false,
    ipAddress,
    userAgent,
    failureReason: 'USER_NOT_FOUND',
  });

  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password', // ⚠️ 可能泄露用户存在性
      },
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}
```

**安全影响**：
- 🔓 攻击者可以通过暴力枚举确定哪些邮箱已注册
- 🔓 用户隐私泄露
- 🔓 垃圾邮件目标

**修复方案**：
```typescript
// 修复：使用通用错误消息，并添加延迟以防止时序攻击
if (!user) {
  await createLoginLog({
    email,
    success: false,
    ipAddress,
    userAgent,
    failureReason: 'USER_NOT_FOUND',
  });

  // 添加随机延迟（100-500ms）以防止时序攻击
  const delay = Math.random() * 400 + 100;
  await new Promise(resolve => setTimeout(resolve, delay));

  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}
```

**优先级**：🟠 高危（尽快修复）

---

### 8. 用户列表 API 缺少分页和限制 🟠 高危

**问题描述**：
在 `src/app/api/admin/users/route.ts` 中，GET /api/admin/users 没有分页和限制：

```typescript
export async function GET(request: NextRequest) {
  return withPermission(
    request,
    PermissionCategory.USER_MANAGEMENT,
    PermissionAction.READ,
    async (req, user) => {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isVerified: true,
            isMfaEnabled: true,
            createdAt: true,
            lastLoginAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }); // ⚠️ 没有分页，没有限制
```

**安全影响**：
- 🔓 如果用户数量很大，可能导致 DoS 攻击
- 🔓 大量数据传输可能导致内存溢出
- 🔓 数据泄露风险

**修复方案**：
```typescript
// 修复：添加分页和限制
export async function GET(request: NextRequest) {
  return withPermission(
    request,
    PermissionCategory.USER_MANAGEMENT,
    PermissionAction.READ,
    async (req, user) => {
      try {
        // 获取分页参数
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100); // 最大 100

        const skip = (page - 1) * pageSize;

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            select: {
              id: true,
              email: true,
              username: true,
              role: true,
              isVerified: true,
              isMfaEnabled: true,
              createdAt: true,
              lastLoginAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            skip,
            take: pageSize,
          }),
          prisma.user.count(),
        ]);

        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: {
              users,
              pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
              },
            },
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      } catch (error) {
        // ...
      }
    }
  );
}
```

**优先级**：🟠 高危（尽快修复）

---

## 🟡 中优先级问题

### 9. PBKDF2 迭代次数可提升 🟡 中等

**问题描述**：
在 `src/lib/encryption.ts` 中，PBKDF2 迭代次数为 100,000：

```typescript
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}
```

**安全影响**：
- 100,000 次迭代对于现代硬件来说可能不够
- 暴力破解的可能性增加

**修复方案**：
```typescript
// 修复：增加迭代次数到 1,000,000
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 1000000, KEY_LENGTH, 'sha256');
}
```

**优先级**：🟡 中等（建议修复）

---

### 10. bcrypt 轮次可提升 🟢 低危

**问题描述**：
在 `src/lib/password.ts` 中，bcrypt 轮次为 12：

```typescript
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
```

**安全影响**：
- 轮次 12 对于现代硬件来说可以接受
- 但可以增加到 13-14 以增强安全性

**修复方案**：
```typescript
// 修复：将默认轮次增加到 14
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '14');
```

**优先级**：🟢 低危（可选修复）

---

### 11. 开发环境输出敏感日志 🟡 中等

**问题描述**：
在 `src/lib/jwt.ts` 中，开发环境输出敏感信息：

```typescript
// 调试：输出 Secret（只在开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('[JWT] JWT_SECRET loaded:', JWT_SECRET.byteLength, 'bytes');
  console.log('[JWT] REFRESH_TOKEN_SECRET loaded:', REFRESH_TOKEN_SECRET.byteLength, 'bytes');
  console.log('[JWT] JWT_SECRET from env:', !!process.env.JWT_SECRET);
  console.log('[JWT] REFRESH_TOKEN_SECRET from env:', !!process.env.REFRESH_TOKEN_SECRET);
}

// 在验证失败时输出详细信息
if (process.env.NODE_ENV === 'development') {
  console.error('[JWT] Token:', token.substring(0, 50) + '...');
  console.error('[JWT] Secret length:', JWT_SECRET.byteLength);
}
```

**安全影响**：
- 🔓 开发环境日志可能泄露敏感信息
- 🔓 如果开发环境日志被意外提交到版本控制
- 🔓 如果开发环境与生产环境共享日志系统

**修复方案**：
```typescript
// 修复：移除敏感日志输出
// 或使用专门的调试标志
const DEBUG_JWT = process.env.DEBUG_JWT === 'true';

if (DEBUG_JWT) {
  console.log('[JWT] JWT_SECRET loaded:', JWT_SECRET.byteLength, 'bytes');
  console.log('[JWT] REFRESH_TOKEN_SECRET loaded:', REFRESH_TOKEN_SECRET.byteLength, 'bytes');
}
```

**优先级**：🟡 中等（建议修复）

---

### 12. 环境变量示例文件包含敏感信息 🟡 中等

**问题描述**：
在 `.env.example` 中包含敏感信息：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cmamsys"
EMAIL_SMTP_PASSWORD="your-app-password"
S3_SECRET_ACCESS_KEY="your-secret-access-key"
```

**安全影响**：
- 🔓 用户可能直接复制并使用示例值
- 🔓 如果 .env.example 被提交到公开仓库
- 🔓 泄露数据库密码、SMTP 密码等

**修复方案**：
```env
# 修复：使用占位符，不包含真实敏感信息
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
EMAIL_SMTP_PASSWORD=""
S3_SECRET_ACCESS_KEY=""

# 添加明确的说明
# ⚠️ IMPORTANT: Replace all placeholder values with your actual values
# ⚠️ Do not commit .env file to version control
```

**优先级**：🟡 中等（建议修复）

---

### 13. Next.js allowedDevOrigins 配置 🟢 低危

**问题描述**：
在 `next.config.ts` 中，allowedDevOrigins 允许 `*.dev.coze.site`：

```typescript
const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site'],
  // ...
};
```

**安全影响**：
- 在生产环境中可能过于宽松
- 可能被滥用

**修复方案**：
```typescript
// 修复：仅在开发环境使用
const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['*.dev.coze.site'] : [],
  // ...
};
```

**优先级**：🟢 低危（可选修复）

---

## ✅ 安全良好实践

系统已经实现了一些良好的安全实践：

### 1. ✅ 密码哈希
- 使用 bcrypt 进行密码哈希（默认 12 轮）
- 有密码强度检查

### 2. ✅ 输入验证
- 使用 zod 进行输入验证
- 严格的类型检查

### 3. ✅ 权限控制
- 实现了 RBAC（基于角色的访问控制）
- 权限中间件保护 API

### 4. ✅ 速率限制
- 实现了速率限制
- 多种预设配置

### 5. ✅ 登录保护
- 登录失败次数限制
- 账户锁定机制
- 暴力破解检测
- MFA 支持

### 6. ✅ 加密
- 使用 AES-256-GCM 加密敏感数据
- 使用 PBKDF2 派生密钥

### 7. ✅ 日志审计
- 记录登录日志
- 异常检测
- 操作审计

---

## 📋 修复优先级清单

### 🔴 紧急（立即修复）

1. **JWT Secret 硬编码默认值** - `src/lib/jwt.ts`
2. **CSRF Secret 硬编码默认值** - `src/lib/csrf.ts`
3. **Token 可通过 URL 查询参数传递** - `src/lib/auth-middleware.ts`
4. **加密密钥回退到 JWT Secret** - `src/lib/encryption.ts`
5. **Content-Security-Policy 过于宽松** - `src/lib/api-middleware.ts`

### 🟠 高危（尽快修复）

6. **CSRF 保护默认关闭** - `src/lib/api-middleware.ts`
7. **错误消息可能泄露用户存在性** - `src/app/api/auth/login/route.ts`
8. **用户列表 API 缺少分页和限制** - `src/app/api/admin/users/route.ts`

### 🟡 中等（建议修复）

9. **PBKDF2 迭代次数可提升** - `src/lib/encryption.ts`
10. **开发环境输出敏感日志** - `src/lib/jwt.ts`
11. **环境变量示例文件包含敏感信息** - `.env.example`

### 🟢 低危（可选修复）

12. **bcrypt 轮次可提升** - `src/lib/password.ts`
13. **Next.js allowedDevOrigins 配置** - `next.config.ts`

---

## 🎯 总结

### 关键发现

1. **5 个严重安全问题**需要立即修复
2. **3 个高优先级问题**需要尽快修复
3. **3 个中等优先级问题**建议修复
4. **2 个低优先级问题**可选修复

### 总体评估

CMAMSys 系统在权限控制、输入验证、速率限制等方面有良好的安全实践，但在密钥管理、Token 传输、CSP 策略等方面存在严重的安全漏洞。

**建议立即修复所有严重和高危问题，然后再进行生产部署。**

### 修复后预期

修复所有严重和高危问题后，系统安全评分将提升到 **85-90/100**，达到企业级安全标准。

---

## 📝 附录

### A. 安全检查清单

- [ ] 移除所有硬编码的密钥默认值
- [ ] 强制要求所有密钥通过环境变量配置
- [ ] 移除从 URL 查询参数提取 Token 的逻辑
- [ ] 使用独立的加密密钥，不回退到 JWT Secret
- [ ] 修改 CSP 策略，移除 unsafe-inline 和 unsafe-eval
- [ ] 为所有修改数据的 API 启用 CSRF 保护
- [ ] 使用通用错误消息，添加延迟防止时序攻击
- [ ] 为所有列表 API 添加分页和限制
- [ ] 增加 PBKDF2 迭代次数
- [ ] 移除或保护敏感日志输出
- [ ] 清理环境变量示例文件中的敏感信息

### B. 安全最佳实践

1. **密钥管理**
   - 使用强随机密钥（至少 32 字节）
   - 定期轮换密钥
   - 使用密钥管理服务（如 AWS KMS、Azure Key Vault）

2. **Token 管理**
   - 仅通过 Authorization header 或 cookie 传递 Token
   - 使用短期 Access Token（15 分钟）
   - 使用 Refresh Token 进行长期认证

3. **输入验证**
   - 验证所有输入数据
   - 使用白名单而非黑名单
   - 防止 SQL 注入、XSS、CSRF 等攻击

4. **错误处理**
   - 使用通用错误消息
   - 不泄露系统内部信息
   - 记录详细错误日志但不在响应中返回

5. **日志和监控**
   - 记录所有关键操作
   - 设置日志轮转和归档
   - 实时监控异常行为

### C. 安全测试建议

1. **渗透测试**：定期进行渗透测试
2. **代码审计**：定期进行代码审计
3. **依赖扫描**：定期扫描依赖漏洞
4. **自动化测试**：集成安全测试到 CI/CD

---

**审计结束**

**建议立即开始修复严重和高危问题。**
