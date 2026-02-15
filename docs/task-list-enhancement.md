# 任务列表增强功能说明

## 概述

本文档介绍了 CMAMSys 系统中任务列表的两个新增功能：
1. 任务列表质量检查机制
2. 用户手动调整任务列表功能

## 功能一：任务列表质量检查机制

### 功能描述

自动检查生成的任务列表质量，提供质量评分和改进建议。

### 质量指标

检查机制评估以下四个维度：

1. **完整性** (30%)
   - 任务数量是否在合理范围（5-8个）
   - 任务数量不足或过多的提示

2. **覆盖度** (30%)
   - 是否覆盖所有必需的建模阶段：
     - 数据预处理
     - 核心算法构建
     - 求解/优化
     - 结果验证
     - 可视化报告

3. **清晰度** (20%)
   - 任务描述长度是否足够
   - 是否包含明确的动作动词
   - 是否使用模糊词汇

4. **顺序性** (20%)
   - 任务顺序是否符合建模逻辑流程
   - 是否存在阶段顺序错乱

### 质量评分

- **总体评分**: 0-100 分
- **通过标准**: ≥ 60 分
- **优秀标准**: ≥ 80 分

### 问题分类

问题按严重程度分为三类：

- **❌ 错误**：必须修复的问题（如任务数量严重不足）
- **⚠️ 警告**：建议修复的问题（如缺少某个阶段）
- **ℹ️ 信息**：优化建议（如任务描述可以更具体）

### 使用示例

```typescript
import { checkTaskListQuality, formatQualityReport } from '@/services/task-list-quality-check';

const tasks = [
  '分析电力需求数据和发电站特性，建立数据预处理流程',
  '构建多目标优化数学模型，包含成本和碳排放约束',
  '实现遗传算法基础框架（种群初始化、选择、交叉、变异）',
  '设计求解算法，处理24小时时序优化问题',
  '进行结果验证，对比不同调度方案的优劣',
  '生成电力调度可视化报告，展示24小时调度结果',
];

const report = await checkTaskListQuality(tasks);
console.log(formatQualityReport(report));
```

### 输出示例

```
=== 任务列表质量检查报告 ===

总体评分: 91/100 ✅ 通过

详细指标:
  • 完整性: 100/100
  • 覆盖度: 100/100
  • 清晰度: 100/100
  • 顺序性: 55/100

发现问题:
  ⚠️ [OUT_OF_ORDER] "核心算法" 阶段出现在 "求解" 之后，建议调整顺序
     建议: 将 "核心算法" 相关任务移到 "求解" 之前

改进建议:
  📊 按照建模的逻辑流程调整任务顺序
```

## 功能二：用户手动调整任务列表

### 功能描述

允许用户手动编辑任务列表，包括：
- 添加新任务
- 编辑现有任务
- 删除任务
- 调整任务顺序（上移/下移）
- 质量检查
- 保存修改

### API 接口

#### 获取任务列表

```
GET /api/auto-modeling/[id]/task-list
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "taskId": "cmlnxdhu5000pvf0fa8yrdmbn",
    "taskList": [
      "分析电力需求数据和发电站特性，建立数据预处理流程",
      "构建多目标优化数学模型，包含成本和碳排放约束",
      "实现遗传算法基础框架（种群初始化、选择、交叉、变异）"
    ],
    "source": "discussion"
  }
}
```

#### 更新任务列表

```
PUT /api/auto-modeling/[id]/task-list
```

**请求体**:
```json
{
  "taskList": [
    "分析电力需求数据和发电站特性，建立数据预处理流程",
    "构建多目标优化数学模型，包含成本和碳排放约束",
    "实现遗传算法基础框架（种群初始化、选择、交叉、变异）",
    "新增的任务"
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "taskId": "cmlnxdhu5000pvf0fa8yrdmbn",
    "taskList": [...],
    "modified": true
  }
}
```

### 验证规则

1. **任务数量**: 3-15 个
2. **任务描述**: 不能为空
3. **任务类型**: 必须是字符串

### 前端组件

#### TaskListEditor 组件

位置: `src/components/task-list-editor.tsx`

**功能**:
- 任务列表编辑界面
- 实时质量检查
- 拖拽排序支持（通过上移/下移按钮）
- 质量报告展示

**Props**:
```typescript
interface TaskListEditorProps {
  isOpen: boolean;           // 是否打开对话框
  onClose: () => void;       // 关闭回调
  taskId: string;            // 任务ID
  initialTaskList: string[]; // 初始任务列表
  onSave: (taskList: string[]) => void; // 保存回调
}
```

### 使用流程

1. 在任务详情页，点击任务列表旁边的编辑按钮
2. 打开任务列表编辑对话框
3. 执行编辑操作：
   - 添加新任务
   - 修改任务描述
   - 删除任务
   - 调整顺序
4. 点击"检查质量"按钮查看质量报告
5. 根据质量报告调整任务列表
6. 点击"保存"按钮保存修改
7. 系统更新讨论总结中的任务列表
8. 前端刷新显示新的任务列表

### 状态标记

当用户手动修改任务列表后，讨论总结会包含以下标记：

```json
{
  "taskList": [...],
  "manuallyModified": true,
  "modifiedAt": "2026-02-16T01:45:00.000Z"
}
```

## 集成说明

### 后端集成

1. **质量检查服务**
   - 位置: `src/services/task-list-quality-check.ts`
   - 导出函数:
     - `checkTaskListQuality(tasks: string[]): Promise<TaskListQualityReport>`
     - `formatQualityReport(report: TaskListQualityReport): string`

2. **任务列表管理 API**
   - 位置: `src/app/api/auto-modeling/[id]/task-list/route.ts`
   - 支持方法: GET, PUT

### 前端集成

1. **任务详情页**
   - 位置: `src/app/dashboard/auto-modeling/[id]/page.tsx`
   - 新增功能:
     - 编辑按钮（在任务列表标题旁）
     - TaskListEditor 组件集成
     - 任务列表更新回调

2. **UI 组件**
   - 位置: `src/components/task-list-editor.tsx`
   - 依赖:
     - shadcn/ui 组件库
     - 任务列表质量检查服务

## 测试

### 质量检查测试

运行测试脚本验证质量检查功能：

```bash
npx tsx scripts/test-task-list-quality-check.ts
```

### 手动测试流程

1. 创建一个自动化建模任务
2. 等待讨论完成
3. 在任务详情页查看任务列表
4. 点击编辑按钮打开编辑对话框
5. 执行编辑操作：
   - 添加新任务
   - 修改任务描述
   - 调整顺序
6. 点击"检查质量"按钮
7. 查看质量报告
8. 保存修改
9. 验证任务列表已更新

## 常见问题

### Q1: 质量检查评分低怎么办？

**A**: 查看质量报告中的建议，根据以下优先级调整：
1. 首先修复"错误"级别的问题
2. 然后修复"警告"级别的问题
3. 最后考虑"信息"级别的优化建议

### Q2: 如何确保任务列表顺序正确？

**A**: 遵循建模的标准流程：
1. 数据预处理和分析
2. 核心算法/模型构建
3. 求解/优化
4. 结果验证
5. 可视化和报告

### Q3: 用户修改的任务列表会影响后续流程吗？

**A**: 
- 任务列表主要用于进度展示
- 不会影响代码生成和论文生成的逻辑
- 但可以根据需要扩展功能，使任务列表影响执行流程

### Q4: 修改后的任务列表在哪里保存？

**A**:
- 保存在讨论总结的 `taskList` 字段中
- 添加了 `manuallyModified` 和 `modifiedAt` 标记
- 可以通过 API 获取和更新

## 后续优化建议

1. **智能排序**
   - 根据任务内容自动推荐最佳顺序
   - 提供一键排序功能

2. **模板功能**
   - 提供常用任务列表模板
   - 支持用户自定义模板

3. **版本历史**
   - 记录任务列表的修改历史
   - 支持版本回退

4. **AI 辅助优化**
   - 使用 AI 自动优化任务描述
   - 根据任务内容自动补充缺失阶段

5. **协作编辑**
   - 支持团队成员协作编辑任务列表
   - 实时同步修改

## 文件清单

### 新增文件

1. `src/services/task-list-quality-check.ts` - 质量检查服务
2. `src/app/api/auto-modeling/[id]/task-list/route.ts` - 任务列表管理 API
3. `src/components/task-list-editor.tsx` - 任务列表编辑器组件
4. `scripts/test-task-list-quality-check.ts` - 质量检查测试脚本
5. `docs/task-list-enhancement.md` - 本文档

### 修改文件

1. `src/app/dashboard/auto-modeling/[id]/page.tsx` - 任务详情页集成
2. `scripts/check-all-messages.ts` - 修复类型错误
3. `scripts/check-code-generation.ts` - 修复类型错误
4. `scripts/check-completed-tasks.ts` - 修复类型错误
5. `scripts/check-current-task.ts` - 修复类型错误
6. `scripts/check-discussion-details.ts` - 修复类型错误
7. `scripts/check-discussion-messages.ts` - 修复类型错误
8. `scripts/check-discussion-task-relation.ts` - 修复类型错误
9. `scripts/check-paper-task.ts` - 修复类型错误
10. `scripts/check-stuck-task-status.ts` - 修复类型错误

## 总结

本次更新为 CMAMSys 系统添加了两个重要的任务列表增强功能：

1. **质量检查机制**: 自动评估任务列表质量，提供评分和改进建议
2. **手动调整功能**: 允许用户自定义任务列表，提高灵活性

这些功能显著提升了系统的用户体验和任务列表的实用性，使系统能够更好地适应不同的建模需求。
