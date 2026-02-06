# 火山引擎 404 错误解决方案

## 错误信息

```
HTTP 404: {
  "error": {
    "code": "InvalidEndpointOrModel.NotFound",
    "message": "The model or endpoint doubao-pro-128k does not exist or you do not have access to it.",
    "type": "Not Found"
  }
}
```

## 问题分析

✅ **API Key 正确**：`REDACTED-UUID`（UUID 格式，正确）

❌ **Model 参数错误**：使用了 `doubao-pro-128k`（通用模型名称）

## 核心问题

火山引擎 API 调用**不能直接使用通用模型名称**（如 `doubao-pro-128k`），必须使用**推理接入点名称**（格式：`ep-xxxxxxxx`）。

### 正确 vs 错误对比

| | 错误用法 | 正确用法 |
|--|---------|---------|
| **Model 参数** | `doubao-pro-128k` ❌ | `ep-20240911185450-f9vl2` ✅ |
| **类型** | 通用模型名称 | 推理接入点名称 |
| **格式** | 无固定格式 | `ep-` 开头 + 时间戳 + 随机字符 |

## 解决步骤

### 步骤 1：创建推理接入点

1. 登录火山引擎控制台：https://console.volcengine.com/ark
2. 进入左侧菜单「模型推理」>「在线推理」
3. 点击右上角「创建推理接入点」
4. 填写以下信息：
   - **接入点名称**：可以自定义，或使用系统生成的
   - **推理模型**：选择 `doubao-pro-128k`
5. 点击「接入模型」
6. 创建成功后，复制**接入点名称**（格式：`ep-20240911185450-f9vl2`）

### 步骤 2：记录接入点信息

创建完成后，你会看到类似这样的信息：

```
接入点名称: ep-20240911185450-f9vl2
模型: doubao-pro-128k
状态: 运行中
```

### 步骤 3：使用接入点名称调用 API

#### 方法 1：使用 curl 直接测试

```bash
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Authorization: Bearer REDACTED-UUID" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ep-20240911185450-f9vl2",
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "stream": false
  }'
```

**注意**：将 `ep-20240911185450-f9vl2` 替换为你实际创建的接入点名称！

#### 方法 2：在 CMAMSys 中配置

创建 Provider 时配置接入点映射：

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "火山引擎豆包",
    "type": "VOLCENGINE",
    "apiKey": "REDACTED-UUID",
    "endpoint": "https://ark.cn-beijing.volces.com/api/v3",
    "config": {
      "endpointMapping": {
        "doubao-pro-128k": "ep-20240911185450-f9vl2"
      }
    },
    "priority": 10
  }'
```

配置后，你就可以使用通用模型名称调用，系统会自动映射到接入点名称：

```bash
curl -X POST http://localhost:5000/api/ai-providers/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "your-provider-id",
    "model": "doubao-pro-128k",
    "messages": [
      {"role": "system", "content": "你是一个数学建模专家"},
      {"role": "user", "content": "你好"}
    ]
  }'
```

### 步骤 4：验证配置

使用测试 API 验证：

```bash
curl -X POST http://localhost:5000/api/ai-providers/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "VOLCENGINE",
    "apiKey": "REDACTED-UUID",
    "endpoint": "https://ark.cn-beijing.volces.com/api/v3",
    "model": "doubao-pro-128k",
    "config": {
      "endpointMapping": {
        "doubao-pro-128k": "ep-20240911185450-f9vl2"
      }
    }
  }'
```

## 推理接入点管理

### 为多个模型创建接入点

如果你需要使用多个模型，需要为每个模型创建独立的接入点：

| 模型 | 接入点名称 | 配置映射 |
|------|-----------|---------|
| doubao-pro-128k | ep-20240911185450-f9vl2 | `"doubao-pro-128k": "ep-20240911185450-f9vl2"` |
| doubao-lite-128k | ep-20240911215626-tg985 | `"doubao-lite-128k": "ep-20240911215626-tg985"` |
| doubao-pro-256k | ep-20240911220000-ab12c | `"doubao-pro-256k": "ep-20240911220000-ab12c"` |

### 配置多个映射

```json
{
  "config": {
    "endpointMapping": {
      "doubao-pro-128k": "ep-20240911185450-f9vl2",
      "doubao-lite-128k": "ep-20240911215626-tg985",
      "doubao-pro-256k": "ep-20240911220000-ab12c"
    }
  }
}
```

## 常见问题

### Q: 我没有看到「创建推理接入点」选项？

**A**: 
1. 确认已登录火山引擎控制台
2. 确认已开通火山引擎 Ark 服务
3. 在左侧菜单找到「模型推理」>「在线推理」

### Q: 接入点名称在哪里找？

**A**: 
1. 在「在线推理」页面，找到已创建的接入点
2. 接入点名称显示在接入点卡片上
3. 格式通常为：`ep-YYYYMMDDHHMMSS-随机字符`

### Q: 创建接入点后多久可以使用？

**A**: 通常创建后**立即可用**，无需等待。

### Q: 一个接入点可以对应多个模型吗？

**A**: 不可以。每个接入点只能对应一个模型。如果需要使用多个模型，需要创建多个接入点。

### Q: 接入点名称可以自定义吗？

**A**: 可以自定义，但建议使用系统生成的名称，确保格式正确。

## 快速验证脚本

创建一个测试脚本 `test-volcengine.sh`：

```bash
#!/bin/bash

API_KEY="REDACTED-UUID"
ENDPOINT_NAME="你的接入点名称"  # 替换为实际的接入点名称

curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$ENDPOINT_NAME\",
    \"messages\": [
      {\"role\": \"user\", \"content\": \"你好\"}
    ],
    \"stream\": false
  }"
```

运行脚本：
```bash
chmod +x test-volcengine.sh
./test-volcengine.sh
```

## 总结

**你的问题**：使用了通用模型名称 `doubao-pro-128k` 而不是推理接入点名称

**解决方法**：

1. ✅ API Key 已正确：`REDACTED-UUID`
2. ⚠️ 需要创建推理接入点：登录控制台创建
3. ✅ 获取接入点名称：格式 `ep-xxxxxxxx`
4. ✅ 使用接入点名称调用：替换 model 参数

**下一步**：

1. 登录 https://console.volcengine.com/ark
2. 进入「模型推理」>「在线推理」
3. 创建推理接入点
4. 复制接入点名称
5. 使用上面的测试脚本验证

如果还有问题，请提供你创建的接入点名称，我会帮你验证！
