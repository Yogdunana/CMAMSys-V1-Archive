# 任务列表高级功能集成说明

## 功能概述

本次更新为任务列表编辑器添加了四个高级功能：

1. **智能排序** - 根据任务内容自动推荐最佳顺序
2. **模板功能** - 提供常用任务列表模板，支持自定义
3. **版本历史** - 记录修改历史，支持版本回退
4. **AI 辅助优化** - 使用 AI 自动优化任务描述和补充缺失阶段

## 实现的功能模块

### 1. 智能排序服务

**文件**: `src/services/smart-task-sorter.ts`

**主要功能**:
- `smartSortTasks(tasks)` - 智能排序任务列表
- `getSortSuggestions(tasks)` - 获取排序建议
- `isSorted(tasks)` - 检查任务列表是否已排序
- `getSortReport(tasks)` - 获取完整的排序报告

**排序规则**:
1. 数据预处理（优先级 1）
2. 数据分析（优先级 2）
3. 模型构建（优先级 3）
4. 算法实现（优先级 4）
5. 求解（优先级 5）
6. 优化（优先级 6）
7. 验证（优先级 7）
8. 可视化（优先级 8）
9. 报告（优先级 9）

**使用示例**:
```typescript
import { smartSortTasks } from '@/services/smart-task-sorter';

const result = smartSortTasks(tasks);
console.log('排序后的任务:', result.sortedTasks);
console.log('变化数量:', result.changes.length);
console.log('置信度:', result.confidence);
```

### 2. 任务列表模板系统

**文件**: `src/services/task-templates.ts`

**内置模板**:
- 预测模型模板（5 个任务）
- 优化问题模板（5 个任务）
- 分类问题模板（5 个任务）
- 回归分析模板（5 个任务）
- 通用建模模板（5 个任务）

**主要功能**:
- `getAllTemplates()` - 获取所有模板
- `getTemplatesByCategory(category)` - 按分类获取模板
- `searchTemplates(keyword)` - 搜索模板
- `createCustomTemplate()` - 创建自定义模板
- `updateCustomTemplate()` - 更新自定义模板
- `deleteCustomTemplate()` - 删除自定义模板
- `recommendTemplates()` - 推荐合适的模板
- `exportTemplate()` - 导出模板
- `importTemplate()` - 导入模板

**使用示例**:
```typescript
import {
  getAllTemplates,
  createCustomTemplate,
  recommendTemplates
} from '@/services/task-templates';

// 获取所有模板
const templates = getAllTemplates();

// 推荐模板
const recommended = recommendTemplates(problemTitle, problemDescription);

// 创建自定义模板
const custom = createCustomTemplate(
  '我的模板',
  '描述',
  'general',
  ['任务1', '任务2'],
  ['标签1', '标签2'],
  'user123'
);
```

### 3. 版本历史服务

**文件**: `src/services/task-version-history.ts`

**主要功能**:
- `createVersion()` - 创建新版本
- `getVersionHistoryByTaskId()` - 获取版本历史
- `getLatestVersion()` - 获取最新版本
- `getVersionById()` - 获取指定版本
- `restoreVersion()` - 回退到指定版本
- `compareVersions()` - 比较两个版本
- `deleteVersionHistory()` - 删除版本历史
- `cleanOldVersions()` - 清理旧版本

**使用示例**:
```typescript
import {
  createVersion,
  getVersionHistoryByTaskId,
  restoreVersion
} from '@/services/task-version-history';

// 创建版本
const version = createVersion(
  taskId,
  taskList,
  '更新任务列表',
  'update',
  { qualityScore: 85 },
  'user123'
);

// 获取历史
const history = getVersionHistoryByTaskId(taskId);

// 回退版本
const restored = restoreVersion(taskId, versionId, 'user123');
```

### 4. AI 辅助优化服务

**文件**: `src/services/task-ai-optimizer.ts`

**主要功能**:
- `optimizeTaskDescriptions()` - 优化任务描述
- `addMissingPhases()` - 补充缺失阶段
- `batchOptimizeWithStream()` - 批量优化（支持流式输出）
- `getOptimizationPreview()` - 获取优化预览
- `validateOptimizationResult()` - 验证优化结果

**优化内容**:
1. 任务描述优化
   - 使任务描述更具体和明确
   - 添加必要的细节和量化指标
   - 使用专业的数学建模术语
   - 确保每个任务都有明确的动作动词

2. 缺失阶段补充
   - 检查是否缺少必要的建模阶段
   - 补充缺失的关键任务
   - 确保覆盖：数据预处理、模型构建、求解、验证、可视化

3. 任务顺序调整
   - 按照建模的逻辑流程排序
   - 确保前置任务在后续任务之前

**使用示例**:
```typescript
import {
  optimizeTaskDescriptions,
  getOptimizationPreview,
  batchOptimizeWithStream
} from '@/services/task-ai-optimizer';

// 获取优化预览
const preview = getOptimizationPreview(tasks);

// 优化任务
const result = await optimizeTaskDescriptions(tasks, problemType, problemTitle);

// 流式优化
await batchOptimizeWithStream(
  tasks,
  problemType,
  problemTitle,
  userId,
  (progress, message) => {
    console.log(`${progress}% - ${message}`);
  }
);
```

## 集成到 UI

### 更新 TaskListEditor 组件

**新增按钮和功能**:

1. **智能排序按钮**
   - 位置：工具栏
   - 功能：一键智能排序
   - 显示：排序报告和建议

2. **模板按钮**
   - 位置：工具栏
   - 功能：打开模板选择对话框
   - 显示：内置模板和自定义模板

3. **AI 优化按钮**
   - 位置：工具栏
   - 功能：AI 优化任务列表
   - 显示：优化进度和结果

4. **版本历史按钮**
   - 位置：工具栏
   - 功能：查看版本历史
   - 显示：版本列表和回退功能

### 新增对话框

1. **模板选择对话框**
   - 显示所有可用模板
   - 支持搜索和筛选
   - 显示模板预览
   - 支持创建新模板

2. **版本历史对话框**
   - 显示版本历史列表
   - 支持版本对比
   - 支持版本回退
   - 显示版本详情

3. **AI 优化对话框**
   - 显示优化进度
   - 显示优化结果
   - 支持预览和应用优化
   - 显示优化建议

## 使用流程

### 智能排序流程

1. 打开任务列表编辑器
2. 点击"智能排序"按钮
3. 系统自动分析任务内容
4. 显示排序报告：
   - 变化的任务
   - 置信度
   - 排序建议
5. 确认或取消排序

### 使用模板流程

1. 打开任务列表编辑器
2. 点击"使用模板"按钮
3. 打开模板选择对话框
4. 浏览或搜索模板
5. 预览模板内容
6. 应用选定的模板
7. 可进一步编辑和保存

### AI 优化流程

1. 打开任务列表编辑器
2. 点击"AI 优化"按钮
3. 查看优化预览：
   - 预计变化数量
   - 预计新增任务
   - 预计时间
   - 难度评估
4. 开始优化
5. 查看优化进度（实时更新）
6. 查看优化结果：
   - 优化后的任务列表
   - 变化详情
   - 新增任务
   - 优化建议
7. 确认或取消应用优化

### 版本管理流程

1. 打开任务列表编辑器
2. 点击"版本历史"按钮
3. 查看版本历史列表：
   - 版本号
   - 创建时间
   - 变更摘要
   - 创建者
4. 查看版本详情
5. 比较不同版本
6. 回退到指定版本
7. 创建新版本（自动）

## 数据存储

### LocalStorage

**版本历史**:
- Key: `task-version-history-{taskId}`
- 格式: JSON 数组
- 限制: 最多 20 个版本

**自定义模板**:
- Key: `custom-task-templates`
- 格式: JSON 数组
- 限制: 无限制

### 数据库

**讨论总结**:
- 存储位置: `GroupDiscussion.summary.taskList`
- 标记: `manuallyModified`, `modifiedAt`

## 后续优化

### 短期优化

1. **AI 集成**
   - 集成真实的 AI Provider
   - 支持流式输出
   - 添加更多优化选项

2. **UI 优化**
   - 添加拖拽排序
   - 改进版本对比界面
   - 优化模板预览

### 长期优化

1. **协作功能**
   - 支持多人协作编辑
   - 实时同步修改
   - 评论和讨论

2. **高级功能**
   - 任务依赖关系
   - 时间线视图
   - 进度跟踪

## 测试

### 单元测试

```bash
# 测试智能排序
npx tsx scripts/test-smart-sort.ts

# 测试模板系统
npx tsx scripts/test-task-templates.ts

# 测试版本历史
npx tsx scripts/test-version-history.ts

# 测试 AI 优化
npx tsx scripts/test-ai-optimizer.ts
```

### 集成测试

1. 打开任务列表编辑器
2. 测试智能排序功能
3. 测试模板应用功能
4. 测试 AI 优化功能
5. 测试版本历史功能
6. 验证数据持久化

## 文档

### API 文档

- `src/services/smart-task-sorter.ts` - 智能排序 API
- `src/services/task-templates.ts` - 模板系统 API
- `src/services/task-version-history.ts` - 版本历史 API
- `src/services/task-ai-optimizer.ts` - AI 优化 API

### 用户文档

- `docs/task-list-advanced-features.md` - 本文档

## 总结

本次更新为任务列表编辑器添加了四个强大的高级功能：

1. **智能排序** - 自动优化任务顺序，提高建模效率
2. **模板系统** - 提供常用模板，支持自定义，快速开始
3. **版本历史** - 记录修改历史，支持回退，安全可靠
4. **AI 优化** - 自动优化任务描述，补充缺失阶段，提升质量

这些功能大大增强了任务列表管理的智能化和便捷性，使用户能够更高效地完成数学建模任务。
