# CMAMSys 速率限制配置指南

## 概述

本文档详细说明了 CMAMSys 的速率限制配置、最佳实践和调整策略。

---

## 当前配置

### 预设配置

| 预设名称 | 时间窗口 | 最大请求数 | 适用场景 |
|---------|---------|-----------|---------|
| auth | 15 分钟 | 5 | 登录、注册 |
| general | 15 分钟 | 100 | 一般 API |
| aiChat | 1 分钟 | 20 | AI 聊天 |
| modelingTask | 1 分钟 | 5 | 建模任务创建 |
| upload | 1 分钟 | 3 | 文件上传 |
| strict | 1 分钟 | 10 | 严格限制 |
| highFrequency | 1 分钟 | 60 | 高频操作 |
| lowFrequency | 1 小时 | 1000 | 低频操作 |

### 默认限制策略

```typescript
export const MiddlewarePresets = {
  // 认证相关 - 严格限制
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 分钟
    maxRequests: 5,
  },

  // 一般操作 - 中等限制
  general: {
    windowMs: 15 * 60 * 1000,  // 15 分钟
    maxRequests: 100,
  },

  // AI 聊天 - 频率限制
  aiChat: {
    windowMs: 60 * 1000,       // 1 分钟
    maxRequests: 20,
  },

  // 建模任务 - 创建限制
  modelingTask: {
    windowMs: 60 * 1000,       // 1 分钟
    maxRequests: 5,
  },

  // 文件上传 - 严格限制
  upload: {
    windowMs: 60 * 1000,       // 1 分钟
    maxRequests: 3,
  },

  // 严格限制 - 敏感操作
  strict: {
    windowMs: 60 * 1000,       // 1 分钟
    maxRequests: 10,
  },
};
```

---

## 速率限制策略

### 1. 基于用户的限制

```typescript
// 使用用户 ID 进行限制
const result = await applyRateLimit({
  request,
  preset: 'general',
  identifier: userId,  // 使用用户 ID 而非 IP
});
```

**优势：**
- 用户共享 IP 时不会相互影响
- 用户可以更精细地管理自己的配额

**适用场景：**
- 已认证用户
- 需要个性化配额的场景

### 2. 基于 IP 的限制

```typescript
// 使用 IP 地址进行限制（默认）
const result = await applyRateLimit({
  request,
  preset: 'auth',
});
```

**优势：**
- 防止未认证用户的滥用
- 简单有效

**适用场景：**
- 登录、注册等未认证操作
- 公共 API 端点

### 3. 分层限制

```typescript
// VIP 用户有更高的限制
const limit = user.isVIP ? 1000 : 100;
const result = await applyRateLimit({
  request,
  preset: 'general',
  config: {
    windowMs: 15 * 60 * 1000,
    maxRequests: limit,
  },
});
```

**优势：**
- 根据用户等级提供不同服务
- 激励用户升级

**适用场景：**
- SaaS 应用
- 分层订阅模式

### 4. 突发流量处理

```typescript
// 使用 token bucket 算法处理突发流量
const result = await applyRateLimit({
  request,
  preset: 'burst',
  config: {
    windowMs: 60 * 1000,
    maxRequests: 100,  // 长期平均
    burstSize: 50,     // 突发容量
  },
});
```

**优势：**
- 允许短期突发流量
- 防止长期滥用

**适用场景：**
- 批量操作
- 数据导出

---

## 监控和调优

### 1. 监控指标

```typescript
// 记录速率限制命中
if (result.blocked) {
  await logRateLimitHit({
    identifier,
    endpoint,
    limit: result.limit,
    remaining: result.remaining,
  });
}
```

**关键指标：**
- 速率限制触发频率
- 平均每秒请求数
- 峰值并发数
- 拒绝率

### 2. 自动调整

```typescript
// 根据负载动态调整限制
async function dynamicRateLimit(request: NextRequest) {
  const currentLoad = await getSystemLoad();
  let limit = 100;

  if (currentLoad > 0.8) {
    limit = 50;  // 高负载时降低限制
  } else if (currentLoad < 0.3) {
    limit = 200;  // 低负载时提高限制
  }

  return applyRateLimit({
    request,
    config: {
      windowMs: 15 * 60 * 1000,
      maxRequests: limit,
    },
  });
}
```

### 3. A/B 测试

```typescript
// 对不同用户组应用不同限制
const group = getUserGroup(userId);
const limit = group === 'experimental' ? 150 : 100;

return applyRateLimit({
  request,
  config: {
    windowMs: 15 * 60 * 1000,
    maxRequests: limit,
  },
});
```

---

## 配置建议

### 开发环境

```typescript
export const DevelopmentPresets = {
  auth: { windowMs: 60 * 1000, maxRequests: 50 },
  general: { windowMs: 60 * 1000, maxRequests: 1000 },
  aiChat: { windowMs: 60 * 1000, maxRequests: 500 },
};
```

**特点：**
- 宽松的限制
- 便于开发和测试

### 测试环境

```typescript
export const TestPresets = {
  auth: { windowMs: 60 * 1000, maxRequests: 100 },
  general: { windowMs: 60 * 1000, maxRequests: 1000 },
  aiChat: { windowMs: 60 * 1000, maxRequests: 500 },
};
```

**特点：**
- 类似生产环境
- 确保测试真实性

### 生产环境

```typescript
export const ProductionPresets = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  general: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  aiChat: { windowMs: 60 * 1000, maxRequests: 20 },
  modelingTask: { windowMs: 60 * 1000, maxRequests: 5 },
  upload: { windowMs: 60 * 1000, maxRequests: 3 },
};
```

**特点：**
- 严格限制
- 保护系统稳定性

---

## 常见场景

### 场景 1: 防止暴力破解

```typescript
// 登录端点使用严格限制
const result = await applyRateLimit({
  request,
  preset: 'auth',
});

if (result.blocked) {
  // 锁定账户
  await lockAccount(identifier);
  return NextResponse.json(
    { error: 'Too many attempts, account locked' },
    { status: 429 }
  );
}
```

### 场景 2: 保护昂贵操作

```typescript
// AI 调用使用中等限制
const result = await applyRateLimit({
  request,
  preset: 'aiChat',
});

if (result.blocked) {
  return NextResponse.json(
    { error: 'Rate limit exceeded, please try again later' },
    { status: 429 }
  );
}
```

### 场景 3: 公共 API 限流

```typescript
// 公共 API 使用较宽松的限制
const result = await applyRateLimit({
  request,
  preset: 'general',
  identifier: apiKey,  // 使用 API Key
});
```

### 场景 4: 优先级队列

```typescript
// VIP 用户优先
const isVIP = await checkVIPStatus(userId);
const result = await applyRateLimit({
  request,
  config: {
    windowMs: 60 * 1000,
    maxRequests: isVIP ? 50 : 10,
  },
});
```

---

## 错误处理

### 标准响应

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2024-01-01T00:15:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 响应头

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
Retry-After: 900
```

### 客户端重试

```typescript
async function fetchWithRetry(url: string, options: RequestInit) {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, options);
  }

  return response;
}
```

---

## 最佳实践

### 1. 渐进式限制

```typescript
// 首次违规：警告
if (result.blocked && violations === 1) {
  return warning();
}

// 二次违规：临时限制
if (result.blocked && violations === 2) {
  return temporaryBan(5 * 60 * 1000);
}

// 三次违规：永久限制
if (result.blocked && violations >= 3) {
  return permanentBan();
}
```

### 2. 白名单

```typescript
// 跳过白名单用户的限制
if (isWhitelisted(userId)) {
  return;  // 不应用限制
}

await applyRateLimit({ request, preset: 'general' });
```

### 3. 分级限制

```typescript
// 第一级：宽松限制
let result = await applyRateLimit({ request, preset: 'general' });

if (!result.blocked) {
  return proceed();
}

// 第二级：严格限制
result = await applyRateLimit({ request, preset: 'strict' });

if (!result.blocked) {
  return proceedWithWarning();
}

// 第三级：拒绝
return reject();
```

### 4. 动态配额

```typescript
// 根据使用历史调整配额
const history = await getUserUsageHistory(userId);
const avgUsage = calculateAverageUsage(history);

const limit = Math.max(
  10,
  Math.min(100, Math.floor(avgUsage * 1.5))
);

await applyRateLimit({
  request,
  config: { windowMs: 15 * 60 * 1000, maxRequests: limit },
});
```

---

## 故障排查

### 问题 1: 限制过于严格

**症状：** 合法用户频繁被拒绝

**解决方案：**
```typescript
// 提高限制
export const MiddlewarePresets = {
  general: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 200,  // 从 100 提高到 200
  },
};
```

### 问题 2: 限制过于宽松

**症状：** 系统负载过高

**解决方案：**
```typescript
// 降低限制
export const MiddlewarePresets = {
  aiChat: {
    windowMs: 60 * 1000,
    maxRequests: 10,  // 从 20 降低到 10
  },
};
```

### 问题 3: 用户被误判

**症状：** 用户报告莫名其妙被限制

**解决方案：**
```typescript
// 添加详细的日志
logger.info('Rate limit check', {
  identifier,
  limit: result.limit,
  remaining: result.remaining,
  endpoint: request.nextUrl.pathname,
});
```

---

## 总结

CMAMSys 的速率限制系统提供了灵活、强大的 API 保护功能。通过合理配置和持续监控，可以：

- ✅ 防止滥用和攻击
- ✅ 保护系统稳定性
- ✅ 提供公平的服务
- ✅ 支持个性化配额
- ✅ 适应不同场景

建议定期审查和调整速率限制配置，以确保系统的最佳性能和安全性。
