# JWT 签名验证失败问题修复

## 问题描述

### 错误信息
```
[JWT] Invalid access token: "JWSSignatureVerificationFailed" "signature verification failed"
    at _callee3$ (src/lib/jwt.ts:88:13)
```

### 错误原因分析

1. **根本原因**：JWT 签名验证失败，通常是因为：
   - Token 生成时使用的 `JWT_SECRET` 与验证时使用的不同
   - Token 在 localStorage 中已过期
   - 环境变量 `JWT_SECRET` 在不同环境之间不一致

2. **具体场景**：
   - 用户之前使用某个 `JWT_SECRET` 生成了 token 并存储在 localStorage
   - 后来 `JWT_SECRET` 被修改或环境切换
   - 现在验证时使用的是新的 `JWT_SECRET`，导致签名验证失败

## 解决方案

### 方案 1：清除 localStorage 中的旧 Token（推荐用于开发环境）

用户需要在浏览器中执行以下操作：

```javascript
// 在浏览器控制台中执行
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');
location.reload();
```

### 方案 2：增强错误处理和自动刷新

修改 `src/contexts/auth-context.tsx`，在 JWT 签名验证失败时自动尝试刷新 token 或引导用户重新登录。

### 方案 3：统一 JWT_SECRET 配置

确保所有环境（开发、测试、生产）使用相同的 `JWT_SECRET`，或者在环境切换时自动清除 token。

## 临时修复（立即可用）

### 浏览器控制台执行
1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 执行以下代码：

```javascript
// 清除旧的认证信息
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');

// 刷新页面
location.reload();
```

### 添加退出登录按钮
如果系统已有退出登录功能，点击退出按钮也可以清除旧的 token。

## 永久修复

### 1. 添加 Token 版本控制

在 `.env` 文件中添加：

```env
# Token 版本号，当 JWT_SECRET 改变时也需要改变此版本号
JWT_TOKEN_VERSION="1.0.0"
```

在生成 token 时包含版本号：

```typescript
export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({
    ...payload,
    type: 'access',
    version: process.env.JWT_TOKEN_VERSION || '1.0.0'
  } as AccessTokenPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(accessTokenExpiry)
    .sign(JWT_SECRET);
}
```

验证时检查版本号：

```typescript
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // 检查 token 版本
    const currentVersion = process.env.JWT_TOKEN_VERSION || '1.0.0';
    if (payload.version && payload.version !== currentVersion) {
      console.error('[JWT] Token version mismatch:', payload.version, currentVersion);
      return null;
    }

    if (payload.type !== 'access') {
      console.error('[JWT] Invalid token type, expected "access", got:', payload.type);
      return null;
    }

    return payload as unknown as AccessTokenPayload;
  } catch (error: any) {
    console.error('[JWT] Invalid access token:', error.name, error.message);
    return null;
  }
}
```

### 2. 增强错误处理

在 `src/contexts/auth-context.tsx` 中添加更好的错误处理：

```typescript
async function verifyToken(token: string): Promise<boolean> {
  try {
    const { verifyAccessToken } = await import('@/lib/jwt');

    // 尝试验证 token
    const payload = await verifyAccessToken(token);

    if (!payload) {
      console.log('[AuthContext] Token invalid, attempting refresh...');
      const refreshSuccess = await refreshAuth();
      return refreshSuccess;
    }

    // Token 有效，验证服务器端
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      console.log('[AuthContext] Server verification failed, attempting refresh...');
      const refreshSuccess = await refreshAuth();
      return refreshSuccess;
    }

    return true;
  } catch (error) {
    console.error('[AuthContext] Token verification error:', error);

    // 如果是签名验证失败，直接退出登录
    const { isJWTSignatureError } = await import('@/lib/jwt');
    if (isJWTSignatureError(error)) {
      console.log('[AuthContext] Signature verification failed, logging out...');
      logout();
      return false;
    }

    // 其他错误，尝试刷新
    const refreshSuccess = await refreshAuth();
    return refreshSuccess;
  }
}
```

### 3. 添加 Token 过期对话框

创建一个用户友好的对话框，在 token 无效时提示用户重新登录：

```typescript
// src/components/auth/token-invalid-dialog.tsx
'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function TokenInvalidDialog({
  isOpen,
  onClose,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>登录已过期</DialogTitle>
          <DialogDescription>
            您的登录信息已过期，需要重新登录以继续访问。
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onLogout}>
            退出登录
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 预防措施

### 1. 固定 JWT_SECRET

确保在生产环境中使用固定的 `JWT_SECRET`，并且：
- 不要频繁更改
- 存储在环境变量中
- 使用足够长的随机字符串（至少 32 字符）
- 在 `.gitignore` 中排除 `.env` 文件

### 2. 定期检查日志

监控 JWT 相关的错误日志，及时发现 token 验证失败的问题。

### 3. 添加环境检查

在应用启动时检查 JWT_SECRET 是否设置：

```typescript
// 在 lib/jwt.ts 中添加
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  console.warn('[JWT] Using default JWT_SECRET. Please set JWT_SECRET in .env file for production.');
}
```

## 验证步骤

### 1. 清除旧 Token
执行浏览器控制台命令清除旧 token

### 2. 重新登录
使用正确的凭证重新登录

### 3. 验证功能
检查系统是否正常工作，JWT 验证是否成功

## 总结

JWT 签名验证失败通常是因为 token 生成和验证使用的密钥不匹配。最简单的解决方法是清除浏览器中的旧 token 并重新登录。长期解决方案是添加 token 版本控制和更好的错误处理机制。
