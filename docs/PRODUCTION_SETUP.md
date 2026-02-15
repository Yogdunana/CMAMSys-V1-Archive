# Production Setup Guide
# 生产环境配置指南

## 概述

本指南介绍如何配置 CMAMSys 的生产环境，包括邮件服务、安全配置和监控功能。

## 目录

1. [邮件服务配置](#邮件服务配置)
2. [环境变量配置](#环境变量配置)
3. [安全功能](#安全功能)
4. [监控和日志](#监控和日志)
5. [定时任务](#定时任务)
6. [测试](#测试)

## 邮件服务配置

### 开发环境（本地）

使用 MailDev 进行本地邮件测试：

```bash
# 安装依赖
pnpm add nodemailer maildev

# 启动 MailDev
./scripts/start-maildev.sh

# 或直接运行
npx maildev
```

MailDev 会启动：
- Web 界面: http://localhost:1080
- SMTP 服务器: localhost:1025

### 生产环境

配置真实的 SMTP 服务器（推荐 SendGrid、Mailgun 或 AWS SES）：

```env
MAILER_ENABLED="true"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.your-sendgrid-api-key"
EMAIL_FROM="\"CMAMSys\" <noreply@your-domain.com>"
```

#### SendGrid 配置

1. 注册 SendGrid 账户
2. 创建 API Key
3. 配置环境变量：

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.your-api-key-here"
```

#### Mailgun 配置

```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASSWORD="your-mailgun-password"
```

#### AWS SES 配置

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-aws-ses-username"
SMTP_PASSWORD="your-aws-ses-password"
```

## 环境变量配置

复制示例文件并配置：

```bash
cp .env.production.example .env.production
```

### 关键配置项

```env
# 数据库
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# 认证
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
JWT_ACCESS_TOKEN_EXPIRY="15m"
JWT_REFRESH_TOKEN_EXPIRY="7d"

# 密码重置
PASSWORD_RESET_TOKEN_EXPIRY_MINUTES="60"

# 安全
BCRYPT_ROUNDS="12"
MAX_LOGIN_ATTEMPTS="5"
LOCKOUT_DURATION_MS="900000"

# 频率限制
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_ATTEMPTS="5"
PASSWORD_RESET_MAX_ATTEMPTS="3"

# 邮件服务
MAILER_ENABLED="true"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.your-api-key"
EMAIL_FROM="\"CMAMSys\" <noreply@your-domain.com>"

# 清理任务
CLEANUP_EXPIRED_TOKENS_ENABLED="true"
CLEANUP_EXPIRED_TOKENS_INTERVAL_HOURS="24"
CLEANUP_LOGIN_LOGS_DAYS="90"
CLEANUP_AUDIT_LOGS_DAYS="365"
```

## 安全功能

### 1. 密码强度验证

系统会自动验证密码强度：

- 最少 8 个字符
- 至少 1 个大写字母
- 至少 1 个小写字母
- 至少 1 个数字
- 至少 1 个特殊字符

### 2. 登录日志

系统记录所有登录尝试：

- 成功/失败状态
- IP 地址
- User Agent
- 失败原因

查看登录日志：

```typescript
import { getUserRecentLoginLogs } from '@/services/login-logger';

const logs = await getUserRecentLoginLogs(userId, 10);
```

### 3. 频率限制

- 登录请求：15 分钟内最多 5 次
- 密码重置：1 小时内最多 3 次

### 4. 异常检测

系统会自动检测：

- 暴力破解攻击
- 账户锁定异常
- 异常登录位置
- 可疑登录模式

### 5. 验证码

忘记密码时需要输入验证码（防止自动化攻击）。

## 监控和日志

### 日志位置

- 应用日志: `/app/work/logs/bypass/app.log`
- 控制台日志: `/app/work/logs/bypass/console.log`
- 开发日志: `/app/work/logs/bypass/dev.log`

### 安全统计

获取安全统计信息：

```typescript
import { getSecurityStatistics } from '@/services/login-anomaly-service';

const stats = await getSecurityStatistics();
```

## 定时任务

系统会自动运行以下清理任务：

1. **清理过期的密码重置令牌**（每小时）
2. **清理过期的 Refresh Token**（每小时）
3. **清理旧的登录日志**（90 天后）
4. **清理旧的审计日志**（1 年后）

### 手动触发清理

```bash
# 触发初始化 API
curl -X POST http://localhost:5000/api/init
```

## 测试

### 测试邮件服务

```bash
# 启动 MailDev
npx maildev

# 发送测试邮件
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 在浏览器中查看邮件
# http://localhost:1080
```

### 测试密码重置

1. 访问忘记密码页面
2. 输入邮箱地址
3. 查看邮件获取重置链接
4. 使用重置链接重置密码

### 测试频率限制

```bash
# 多次尝试密码重置
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo ""
done

# 应该看到 429 状态码
```

### 测试异常检测

```bash
# 多次尝试错误的密码
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
  echo ""
done

# 检查日志中的安全告警
tail -f /app/work/logs/bypass/app.log | grep "SECURITY ALERT"
```

## 最佳实践

### 1. 定期备份

- 每天备份数据库
- 保留最近 30 天的备份
- 加密备份文件

### 2. 监控告警

- 设置 Sentry 或 Datadog 监控
- 配置邮件告警
- 监控关键指标

### 3. 安全审计

- 定期审查登录日志
- 检查异常登录模式
- 审查失败的登录尝试

### 4. 性能优化

- 使用 Redis 进行分布式缓存
- 配置 CDN 加速静态资源
- 优化数据库查询

## 故障排除

### 邮件发送失败

1. 检查 SMTP 配置
2. 验证 API Key
3. 查看应用日志

### 频率限制过于严格

调整环境变量：

```env
RATE_LIMIT_MAX_ATTEMPTS="10"
PASSWORD_RESET_MAX_ATTEMPTS="5"
```

### 清理任务未运行

检查环境变量配置：

```env
CLEANUP_EXPIRED_TOKENS_ENABLED="true"
```

## 支持

如有问题，请查看：
- [API 文档](/docs/API.md)
- [错误代码](/docs/ERROR_CODES.md)
- [常见问题](/docs/FAQ.md)
