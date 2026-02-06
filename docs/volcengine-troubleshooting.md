# 火山引擎 API Key 问题诊断与解决

## 问题现象

你提供的 API Key：`sk-REDACTED` 无法连接火山引擎服务。

## 问题分析

### API Key 格式识别

你提供的 Key 以 `sk-` 开头，这是 **OpenAI 格式** 的 API Key，**不是火山引擎的格式**。

| 服务 | API Key 格式示例 |
|------|----------------|
| OpenAI | `sk-xxxxxxxxxxxxxxxxxxxxxxxx` |
| 火山引擎 | `xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx` 或自定义格式 |

### 可能的原因

1. **错误的 API Key 来源**：你可能复制了其他服务（如 OpenAI）的 Key
2. **未在火山引擎创建 API Key**：需要在火山引擎控制台单独创建
3. **混淆了接入点名称和 API Key**：接入点名称是 `ep-xxxxxxxx`，API Key 是另一串字符

## 正确的火山引擎 API Key 获取步骤

### 步骤 1：登录火山引擎控制台

访问：https://console.volcengine.com/ark

### 步骤 2：开通服务

1. 点击「创建应用」
2. 填写应用信息并提交

### 步骤 3：创建推理接入点

1. 在控制台，进入「模型推理」>「在线推理」
2. 点击「创建推理接入点」
3. 选择模型（如：doubao-pro-128k）
4. 创建后记录接入点名称（格式：`ep-xxxxxxxx`）

### 步骤 4：创建 API Key

1. 在控制台，进入「API Key 管理」
2. 点击「创建 API Key」
3. 输入名称（如：cmamsys-key）
4. 创建后复制 API Key（**不是 `sk-` 开头**）

### 步骤 5：配置到 CMAMSys

在 CMAMSys 中创建火山引擎 Provider：

```bash
curl -X POST http://localhost:5000/api/ai-providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "火山引擎豆包",
    "type": "VOLCENGINE",
    "apiKey": "你的真实火山引擎APIKey（不是sk-开头）",
    "endpoint": "https://ark.cn-beijing.volces.com/api/v3",
    "config": {
      "endpointMapping": {
        "doubao-pro-128k": "你的接入点名称（ep-xxxxxxxx）"
      }
    },
    "priority": 10
  }'
```

## 测试连接

创建 Provider 后，使用测试 API 验证：

```bash
curl -X POST http://localhost:5000/api/ai-providers/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "VOLCENGINE",
    "apiKey": "你的真实火山引擎APIKey",
    "endpoint": "https://ark.cn-beijing.volces.com/api/v3",
    "model": "doubao-pro-128k",
    "config": {
      "endpointMapping": {
        "doubao-pro-128k": "你的接入点名称"
      }
    }
  }'
```

## 常见错误与解决方案

### 错误 1：401 Unauthorized

**原因**：API Key 无效或格式错误

**解决方案**：
1. 确认使用的是火山引擎的 API Key（不是 `sk-` 开头）
2. 检查 API Key 是否完整复制
3. 确认 API Key 已激活

### 错误 2：Model not found

**原因**：使用了错误的接入点名称

**解决方案**：
1. 检查接入点名称格式（应为 `ep-xxxxxxxx`）
2. 确认接入点已创建且已接入模型
3. 在 `config.endpointMapping` 中正确配置映射

### 错误 3：403 Forbidden

**原因**：权限不足或 API Key 无权限访问该模型

**解决方案**：
1. 检查 API Key 的权限设置
2. 确认应用已开通对应模型的使用权限
3. 检查账户是否有足够的余额

### 错误 4：Rate limit exceeded

**原因**：超出调用频率限制

**解决方案**：
1. 检查调用频率是否超出限制
2. 升级服务等级或增加配额
3. 实现请求队列和重试机制

## 验证 API Key 正确性

### 方法 1：在火山引擎控制台验证

1. 登录火山引擎控制台
2. 进入「API Key 管理」
3. 查看你的 API Key 是否在列表中
4. 检查 Key 的状态（应为「已启用」）

### 方法 2：使用 Python SDK 测试

```python
import os
from volcenginesdkarkruntime import Ark

# 设置 API Key
os.environ["ARK_API_KEY"] = "你的真实火山引擎APIKey"

# 创建客户端
client = Ark(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
)

# 测试调用
try:
    completion = client.chat.completions.create(
        model="你的接入点名称（ep-xxxxxxxx）",
        messages=[
            {"role": "user", "content": "你好"}
        ],
    )
    print("成功！响应：", completion.choices[0].message.content)
except Exception as e:
    print("失败！错误：", e)
```

### 方法 3：使用 curl 测试

```bash
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Authorization: Bearer 你的真实火山引擎APIKey" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "你的接入点名称",
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'
```

## 获取正确的火山引擎 API Key

### 官方文档

- [火山引擎 Ark 官方文档](https://www.volcengine.com/docs/82379)
- [API Key 管理文档](https://www.volcengine.com/docs/82379/1958523)
- [推理接入点配置](https://www.volcengine.com/docs/82379/1958520)

### 控制台链接

- [火山引擎控制台](https://console.volcengine.com/ark)
- [API Key 管理](https://console.volcengine.com/ark/region:ark+cn-beijing/apikey)
- [在线推理](https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint)

## 总结

**你提供的 `sk-REDACTED` 不是火山引擎的 API Key**，这是 OpenAI 格式的 Key。

**请按以下步骤操作**：

1. 登录火山引擎控制台：https://console.volcengine.com/ark
2. 创建应用和推理接入点
3. 在「API Key 管理」中创建并获取真实的火山引擎 API Key
4. 在 CMAMSys 中配置正确的 API Key 和接入点映射
5. 使用测试 API 验证配置

如果还有问题，请提供：
1. 火山引擎控制台中的真实 API Key
2. 创建的接入点名称（`ep-xxxxxxxx`）
3. 错误信息详情

我会继续帮你解决！
