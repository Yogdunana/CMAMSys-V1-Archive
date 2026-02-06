# 用户系统测试指南

## 快速开始

### 1. 访问应用

```
http://localhost:5000
```

### 2. 登录系统

访问登录页面：
```
http://localhost:5000/auth/login
```

使用测试账号登录：
```
邮箱: admin@example.com
密码: ***REDACTED_PASSWORD***
```

### 3. 验证登录成功

登录成功后，您应该：
- ✅ 自动跳转到 Dashboard
- ✅ 右上角显示用户头像（首字母：YO）
- ✅ 点击头像可以看到用户菜单

## 功能测试

### 测试 1: 用户菜单显示

**步骤**：
1. 登录系统
2. 查看右上角用户头像
3. 点击头像打开用户菜单

**预期结果**：
```
显示内容：
- 用户名: Yogdunana
- 邮箱: admin@example.com
- 状态: 已验证
- 角色: 管理员

菜单项：
- 个人资料
- 设置
- 许可证
- 安全设置
- 退出登录
```

### 测试 2: 个人资料页面

**步骤**：
1. 登录系统
2. 点击用户头像 → 个人资料
3. 查看个人资料信息

**预期结果**：
```
页面显示：
- 头像（首字母：YO）
- 用户名: Yogdunana
- 邮箱: admin@example.com
- 组织/公司: (空)
- 个人简介: (空)

账户信息：
- 账户状态: 已激活
- 两步验证: 已启用/未启用
- 注册时间: [当前时间]

快速操作：
- 通知设置
- 安全设置
```

### 测试 3: 修改个人资料

**步骤**：
1. 访问个人资料页面
2. 修改用户名（例如：Yogdunana2）
3. 填写组织/公司（例如：CMAMSys Team）
4. 填写个人简介（例如：数学建模爱好者）
5. 点击"保存更改"

**预期结果**：
```
显示消息：Profile updated successfully

用户菜单中的用户名已更新为新用户名
```

### 测试 4: 退出登录

**步骤**：
1. 登录系统
2. 点击用户头像
3. 点击"退出登录"

**预期结果**：
```
1. 按钮显示"退出中..."
2. 自动跳转到登录页
3. localStorage 已清除
```

### 测试 5: 路由保护

**步骤**：
1. 在浏览器中打开开发者工具（F12）
2. Application → Local Storage → Clear
3. 访问：`http://localhost:5000/dashboard/ai-providers`

**预期结果**：
```
自动跳转到登录页：
http://localhost:5000/auth/login?redirect=/dashboard/ai-providers
```

**继续测试**：
1. 使用测试账号登录
2. 验证自动跳转回原页面（AI Providers 页面）

### 测试 6: 已登录重定向

**步骤**：
1. 已登录状态下
2. 访问登录页：`http://localhost:5000/auth/login`

**预期结果**：
```
自动重定向到 Dashboard
```

### 测试 7: Token 自动刷新

**步骤**：
1. 登录系统
2. 在开发者工具中查看 Local Storage
3. 记录 access_token 和 refresh_token
4. 等待 15 分钟（或修改代码中的刷新时间为 10 秒测试）
5. 刷新页面

**预期结果**：
```
access_token 已自动刷新
用户无感知，继续使用系统
```

### 测试 8: API 端点测试

#### 测试 Token 验证

```bash
# 先登录获取 token
TOKEN="YOUR_ACCESS_TOKEN"

# 验证 token
curl http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

#### 测试 Token 刷新

```bash
REFRESH_TOKEN="YOUR_REFRESH_TOKEN"

curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "'"$REFRESH_TOKEN"'"}'
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900,
    "user": {
      "id": "...",
      "email": "admin@example.com",
      ...
    }
  }
}
```

#### 测试登出

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**预期响应**：
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 测试获取用户资料

```bash
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "admin@example.com",
    "username": "Yogdunana",
    "role": "ADMIN",
    "isVerified": true,
    "isMfaEnabled": false,
    ...
  }
}
```

#### 测试更新用户资料

```bash
curl -X PUT http://localhost:5000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "Yogdunana",
    "bio": "数学建模爱好者",
    "organization": "CMAMSys Team"
  }'
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "admin@example.com",
    "username": "Yogdunana",
    "bio": "数学建模爱好者",
    "organization": "CMAMSys Team",
    ...
  }
}
```

## 安全测试

### 测试 1: 未授权访问受保护页面

**步骤**：
1. 清除 Local Storage
2. 直接访问：`http://localhost:5000/dashboard`

**预期结果**：
```
自动重定向到登录页
```

### 测试 2: 无效 Token

**步骤**：
```bash
curl http://localhost:5000/api/ai-providers \
  -H "Authorization: Bearer invalid_token"
```

**预期结果**：
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 测试 3: 过期 Token

**步骤**：
```bash
# 使用过期或撤销的 token
curl http://localhost:5000/api/ai-providers \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```

**预期结果**：
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 测试 4: Token 刷新后旧 Token 失效

**步骤**：
1. 记录当前 access_token
2. 调用刷新 API 获取新 token
3. 使用旧 token 访问 API

**预期结果**：
```
旧 token 仍然有效（在 15 分钟内）
```

**注意**：如果需要严格失效旧 token，需要实现 Token 黑名单。

## 常见问题

### Q1: 登录后页面显示空白

**原因**：AuthContext 加载中

**解决**：等待几秒，页面会自动显示

### Q2: 用户菜单不显示

**原因**：未登录或 AuthContext 加载失败

**解决**：
1. 检查 Local Storage 是否有 accessToken
2. 打开浏览器控制台查看错误
3. 重新登录

### Q3: 退出登录后仍能访问受保护页面

**原因**：缓存问题

**解决**：
1. 清除浏览器缓存
2. 硬刷新页面（Ctrl + Shift + R）

### Q4: Token 刷新失败

**原因**：refresh_token 已过期或被撤销

**解决**：重新登录

### Q5: 修改用户名失败

**原因**：用户名已被占用

**解决**：选择其他用户名

## 性能测试

### 测试 1: 登录响应时间

```bash
time curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"***REDACTED_PASSWORD***"}'
```

**预期**：< 500ms

### 测试 2: Token 验证响应时间

```bash
time curl http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

**预期**：< 100ms

### 测试 3: Token 刷新响应时间

```bash
time curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'"$REFRESH_TOKEN"'"}'
```

**预期**：< 300ms

## 测试清单

- [ ] 登录功能正常
- [ ] 退出登录功能正常
- [ ] 用户菜单显示正确
- [ ] 个人资料页面正常
- [ ] 修改个人资料功能正常
- [ ] 路由保护功能正常
- [ ] Token 自动刷新功能正常
- [ ] 未登录访问受保护页面被拦截
- [ ] 已登录访问登录页重定向
- [ ] API 端点正常工作
- [ ] 无效 Token 被拒绝
- [ ] 过期 Token 被拒绝

---

**测试账号**：`admin@example.com` / `***REDACTED_PASSWORD***`
**应用地址**：`http://localhost:5000`
