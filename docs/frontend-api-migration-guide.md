# 前端 API v1 迁移指南

## 概述

本指南说明如何将前端代码从旧 API 迁移到 v1 版本 API。

---

## 迁移步骤

### 1. 使用新的 API 客户端

#### 旧代码

```typescript
const response = await fetch('/api/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
```

#### 新代码

```typescript
import api from '@/lib/api-service';

const result = await api.dashboard.getStats();

if (result.success) {
  const stats = result.data;
  // 使用数据
}
```

---

### 2. API 端点映射

| 旧端点 | 新端点 | API 方法 |
|--------|--------|----------|
| `/api/auth/login` | `/api/v1/auth/login` | `api.auth.login()` |
| `/api/auth/register` | `/api/v1/auth/register` | `api.auth.register()` |
| `/api/auth/logout` | `/api/v1/auth/logout` | `api.auth.logout()` |
| `/api/auth/refresh` | `/api/v1/auth/refresh` | `api.auth.refreshToken()` |
| `/api/dashboard/stats` | `/api/v1/dashboard/stats` | `api.dashboard.getStats()` |
| `/api/dashboard/activities` | `/api/v1/dashboard/activities` | `api.dashboard.getActivities()` |
| `/api/user/profile` | `/api/v1/user/profile` | `api.user.getProfile()` |
| `/api/ai-providers` | `/api/v1/ai-providers` | `api.aiProviders.list()` |
| `/api/modeling-tasks` | `/api/v1/modeling-tasks` | `api.modelingTasks.list()` |

---

### 3. 错误处理

#### 旧代码

```typescript
const response = await fetch('/api/dashboard/stats');

if (!response.ok) {
  console.error('API Error:', response.status);
  return;
}

const data = await response.json();
```

#### 新代码

```typescript
import api from '@/lib/api-service';

try {
  const result = await api.dashboard.getStats();

  if (result.success) {
    const stats = result.data;
  } else {
    console.error('API Error:', result.error);
  }
} catch (error: any) {
  // 处理网络错误、超时等
  console.error('Request Error:', error);
}
```

---

### 4. 认证处理

#### 旧代码

```typescript
const token = localStorage.getItem('accessToken');

const response = await fetch('/api/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

#### 新代码

```typescript
import api from '@/lib/api-service';

// API 客户端自动处理认证
const result = await api.dashboard.getStats();
```

---

### 5. CSRF 保护

#### 旧代码

```typescript
// 没有 CSRF 保护
const response = await fetch('/api/modeling-tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: '新任务' }),
});
```

#### 新代码

```typescript
import api from '@/lib/api-service';

// API 客户端自动处理 CSRF Token
const result = await api.modelingTasks.create({
  name: '新任务',
  description: '任务描述',
});
```

---

### 6. 速率限制处理

#### 旧代码

```typescript
// 没有速率限制处理
const response = await fetch('/api/dashboard/stats');
```

#### 新代码

```typescript
import api from '@/lib/api-service';

try {
  const result = await api.dashboard.getStats();
} catch (error: any) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // 显示速率限制提示
    alert('请求过于频繁，请稍后再试');

    // 等待后重试
    setTimeout(() => {
      api.dashboard.getStats();
    }, error.retryAfter);
  }
}
```

---

## 完整示例

### 示例 1: 登录页面

#### 旧代码

```typescript
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.location.href = '/dashboard';
    } else {
      alert('登录失败');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
}
```

#### 新代码

```typescript
import { useState } from 'react';
import { api } from '@/lib/api-service';
import { useAuth } from '@/contexts/auth-context';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await api.auth.login({ email, password });

      if (result.success && result.data) {
        login(
          result.data.accessToken,
          result.data.refreshToken,
          result.data.user
        );
        window.location.href = '/dashboard';
      } else {
        setError(result.error?.message || '登录失败');
      }
    } catch (error: any) {
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* 表单内容 */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
```

---

### 示例 2: 仪表盘页面

#### 旧代码

```typescript
import { useEffect, useState } from 'react';

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setStats(data.data);
      setIsLoading(false);
    }

    fetchStats();
  }, []);

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      <h1>仪表盘</h1>
      <div>活跃竞赛: {stats?.activeCompetitions}</div>
      <div>建模任务: {stats?.modelingTasks}</div>
    </div>
  );
}
```

#### 新代码

```typescript
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-service';

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const result = await api.dashboard.getStats();

        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.error?.message || '加载失败');
        }
      } catch (error: any) {
        setError('网络错误，请重试');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>仪表盘</h1>
      <div>活跃竞赛: {stats?.activeCompetitions}</div>
      <div>建模任务: {stats?.modelingTasks}</div>
      <div>团队成员: {stats?.teamMembers}</div>
      <div>AI 请求: {stats?.aiRequests}</div>
    </div>
  );
}
```

---

### 示例 3: 创建建模任务

#### 旧代码

```typescript
import { useState } from 'react';

export function CreateTaskForm() {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');

    const response = await fetch('/api/modeling-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (data.success) {
      alert('创建成功');
    } else {
      alert('创建失败');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">创建任务</button>
    </form>
  );
}
```

#### 新代码

```typescript
import { useState } from 'react';
import { api } from '@/lib/api-service';

export function CreateTaskForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await api.modelingTasks.create({
        name,
        description: '任务描述',
        problemType: 'EVALUATION',
      });

      if (result.success) {
        alert('创建成功');
        setName('');
      } else {
        setError(result.error?.message || '创建失败');
      }
    } catch (error: any) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        setError('操作过于频繁，请稍后再试');
      } else {
        setError('网络错误，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="任务名称"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '创建中...' : '创建任务'}
      </button>
    </form>
  );
}
```

---

## 迁移检查清单

### 步骤 1: 安装依赖
- [x] API 客户端已创建（`src/lib/api-client.ts`）
- [x] API 服务层已创建（`src/lib/api-service.ts`）
- [ ] 更新所有页面使用新的 API 客户端

### 步骤 2: 更新认证相关
- [x] 更新 `AuthContext` 使用新的 API 客户端
- [ ] 更新登录页面
- [ ] 更新注册页面

### 步骤 3: 更新仪表盘
- [ ] 更新统计数据显示
- [ ] 更新活动列表
- [ ] 添加错误处理

### 步骤 4: 更新建模任务
- [ ] 更新任务列表
- [ ] 更新任务创建
- [ ] 更新任务编辑
- [ ] 更新任务删除

### 步骤 5: 更新其他页面
- [ ] 更新 AI Provider 页面
- [ ] 更新用户资料页面
- [ ] 更新自动化建模页面

### 步骤 6: 测试
- [ ] 测试所有 API 调用
- [ ] 测试错误处理
- [ ] 测试速率限制
- [ ] 测试 CSRF 保护

---

## 优势总结

使用新的 API 客户端后的优势：

1. **类型安全**: TypeScript 类型定义完整
2. **自动认证**: 自动处理 Bearer Token
3. **CSRF 保护**: 自动处理 CSRF Token
4. **错误处理**: 统一的错误处理机制
5. **速率限制**: 自动处理速率限制
6. **代码简洁**: 减少重复代码
7. **易于维护**: 集中管理 API 调用

---

## 故障排查

### 问题 1: CSRF Token 错误

**症状：** 所有 POST 请求都返回 403 错误

**解决方案：**
```typescript
// 确保在应用启动时初始化 CSRF Token
import apiClient from '@/lib/api-client';

// 在应用初始化时调用
useEffect(() => {
  apiClient.initCSRFToken();
}, []);
```

### 问题 2: 令牌刷新失败

**症状：** 14 分钟后用户自动登出

**解决方案：**
```typescript
// 确保正确处理 TOKEN_REFRESHED 错误
try {
  const result = await api.dashboard.getStats();
} catch (error: any) {
  if (error.code === 'TOKEN_REFRESHED') {
    // 令牌已刷新，重试请求
    const result = await api.dashboard.getStats();
  }
}
```

### 问题 3: 速率限制

**症状：** 频繁请求后被阻止

**解决方案：**
```typescript
// 实现请求重试
async function fetchWithRetry<T>(
  fn: () => Promise<ApiResponse<T>>,
  maxRetries = 3
): Promise<ApiResponse<T>> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        await new Promise(resolve => setTimeout(resolve, error.retryAfter));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 总结

通过使用新的 API 客户端和服务层，前端代码变得更加：

- ✅ 类型安全
- ✅ 易于维护
- ✅ 自动化处理认证和 CSRF
- ✅ 统一的错误处理
- ✅ 更好的用户体验

建议逐步迁移所有页面，确保每个功能都经过充分测试。
