# 火山引擎快速开始指南（已开通试用）

## 你现在的情况

✅ 已开通火山引擎试用  
✅ API Key 已获取：`REDACTED-UUID`  
❌ 缺少推理接入点（Endpoint）

## 问题原因

即使开通了试用，也必须创建**推理接入点**才能调用 API。推理接入点是 API 调用的入口，每个模型需要单独创建。

## 创建推理接入点（3步完成）

### 第 1 步：登录控制台

访问：https://console.volcengine.com/ark

### 第 2 步：创建接入点

1. 在左侧菜单，找到「模型推理」
2. 点击「在线推理」
3. 点击右上角 **「创建推理接入点」** 按钮
4. 填写信息：
   - **接入点名称**：可以自定义，或使用系统生成的
   - **推理模型**：选择 `doubao-pro-128k`
   - （其他选项使用默认值）
5. 点击 **「接入模型」**
6. 等待创建完成（通常几秒钟）

### 第 3 步：获取接入点名称

创建成功后，你会看到类似这样的信息：

```
接入点名称: ep-20240911185450-f9vl2
模型: doubao-pro-128k
状态: 运行中 ✅
```

**重要**：复制这个接入点名称（`ep-20240911185450-f9vl2`），这就是你调用 API 时需要使用的。

## 立即测试

将下面的脚本保存为 `test.sh`，将 `你的接入点名称` 替换为实际值：

```bash
#!/bin/bash

API_KEY="REDACTED-UUID"
ENDPOINT_NAME="你的接入点名称"  # 替换为实际值，如 ep-20240911185450-f9vl2

echo "测试火山引擎 API..."
echo "API Key: $API_KEY"
echo "接入点名称: $ENDPOINT_NAME"
echo ""

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

运行测试：
```bash
chmod +x test.sh
./test.sh
```

如果成功，你会看到类似这样的响应：
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "你好！我是豆包，很高兴为你服务。"
      }
    }
  ]
}
```

## 在 CMAMSys 中配置

### 方法 1：通过 API 创建

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
        "doubao-pro-128k": "你的接入点名称"
      }
    },
    "priority": 10
  }'
```

### 方法 2：通过 UI 创建

1. 登录 CMAMSys
2. 进入「设置」>「AI Providers」
3. 点击「添加 Provider」
4. 填写：
   - **名称**: 火山引擎豆包
   - **类型**: VolcEngine
   - **API Key**: `REDACTED-UUID`
   - **Endpoint**: `https://ark.cn-beijing.volces.com/api/v3`
   - **接入点映射**（JSON 格式）：
     ```json
     {
       "endpointMapping": {
         "doubao-pro-128k": "你的接入点名称"
       }
     }
     ```
5. 点击「测试连接」
6. 保存

## 常见问题

### Q: 我在哪里找到推理接入点页面？

**A**: 
1. 登录 https://console.volcengine.com/ark
2. 左侧菜单 >「模型推理」>「在线推理」
3. 页面右上角有「创建推理接入点」按钮

### Q: 我没有看到「创建推理接入点」按钮？

**A**: 
1. 确认已开通试用
2. 确认在正确的页面（「模型推理」>「在线推理」）
3. 如果还是没有，可能是权限问题，请联系火山引擎客服

### Q: 可以创建多个接入点吗？

**A**: 可以！如果你需要使用多个模型，为每个模型创建一个接入点：

| 接入点名称 | 对应模型 |
|-----------|---------|
| ep-xxx-xxx | doubao-pro-128k |
| ep-yyy-yyy | doubao-lite-128k |

然后在配置中添加多个映射：
```json
{
  "endpointMapping": {
    "doubao-pro-128k": "ep-xxx-xxx",
    "doubao-lite-128k": "ep-yyy-yyy"
  }
}
```

### Q: 接入点名称是什么格式？

**A**: 格式为 `ep-YYYYMMDDHHMMSS-随机字符`，例如：
- `ep-20240911185450-f9vl2`
- `ep-20250120120000-abc12`

### Q: 接入点名称在哪里显示？

**A**: 
1. 在「在线推理」页面
2. 找到你创建的接入点卡片
3. 接入点名称显示在卡片上（通常在「接入点名称」或「Endpoint Name」字段）

## 截图示例（概念图）

```
┌─────────────────────────────────────┐
│  模型推理 > 在线推理                  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 接入点名称                  │   │
│  │ ep-20240911185450-f9vl2    │   │ ← 复制这个！
│  ├─────────────────────────────┤   │
│  │ 模型: doubao-pro-128k      │   │
│  │ 状态: 运行中 ✅            │   │
│  │ 创建时间: 2024-09-11 18:54 │   │
│  └─────────────────────────────┘   │
│                                     │
│  [创建推理接入点]                    │
└─────────────────────────────────────┘
```

## 下一步

1. ✅ 登录控制台创建推理接入点
2. ✅ 复制接入点名称
3. ✅ 运行上面的测试脚本验证
4. ✅ 在 CMAMSys 中配置
5. ✅ 开始使用！

如果创建接入点后还有问题，请告诉我你的接入点名称，我会帮你验证配置是否正确！
