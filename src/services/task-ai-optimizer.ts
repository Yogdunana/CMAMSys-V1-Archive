/**
 * AI 辅助任务列表优化服务
 * 使用 AI 自动优化任务描述和补充缺失阶段
 */

export interface OptimizationResult {
  originalTasks: string[];
  optimizedTasks: string[];
  changes: {
    index: number;
    original: string;
    optimized: string;
    reason: string;
  }[];
  addedTasks: string[];
  qualityImprovement: {
    before: number;
    after: number;
    improvement: number;
  };
  suggestions: string[];
}

export interface AIProvider {
  id: string;
  name: string;
  apiKey?: string;
}

/**
 * 构建优化提示词
 */
function buildOptimizationPrompt(
  tasks: string[],
  problemType?: string,
  problemTitle?: string
): string {
  return `你是一个数学建模任务优化专家。请优化以下任务列表，使其更清晰、具体、完整。

赛题信息：
- 标题：${problemTitle || '未提供'}
- 类型：${problemType || '未提供'}

当前任务列表：
${tasks.map((task, index) => `${index + 1}. ${task}`).join('\n')}

请按以下要求进行优化：

1. 任务描述优化：
   - 使任务描述更具体和明确
   - 添加必要的细节和量化指标
   - 使用专业的数学建模术语
   - 确保每个任务都有明确的动作动词

2. 缺失阶段补充：
   - 检查是否缺少必要的建模阶段
   - 补充缺失的关键任务
   - 确保覆盖：数据预处理、模型构建、求解、验证、可视化

3. 任务顺序调整：
   - 按照建模的逻辑流程排序
   - 确保前置任务在后续任务之前

请以 JSON 格式返回优化结果：
{
  "optimizedTasks": ["优化后的任务1", "优化后的任务2", ...],
  "changes": [
    {
      "index": 0,
      "original": "原始任务",
      "optimized": "优化后的任务",
      "reason": "优化原因"
    }
  ],
  "addedTasks": ["新增的任务1", "新增的任务2", ...],
  "suggestions": ["建议1", "建议2", ...]
}`;
}

/**
 * 调用 AI 优化任务列表
 */
async function callAIOptimize(
  tasks: string[],
  problemType?: string,
  problemTitle?: string,
  userId?: string
): Promise<OptimizationResult> {
  try {
    // 这里集成 AI Provider
    // 暂时使用模拟响应
    const mockResult = simulateAIOptimization(tasks, problemType, problemTitle);
    return mockResult;

    // 实际集成时，可以使用以下代码：
    /*
    const prompt = buildOptimizationPrompt(tasks, problemType, problemTitle);

    const response = await callAI(
      selectedProvider,
      prompt,
      userId
    );

    const result = JSON.parse(response);
    return result;
    */
  } catch (error) {
    console.error('AI 优化失败:', error);
    throw new Error('AI 优化失败，请稍后重试');
  }
}

/**
 * 模拟 AI 优化（实际集成时移除此函数）
 */
function simulateAIOptimization(
  tasks: string[],
  problemType?: string,
  problemTitle?: string
): OptimizationResult {
  const optimizedTasks: string[] = [];
  const changes: OptimizationResult['changes'] = [];
  const addedTasks: string[] = [];
  const suggestions: string[] = [];

  // 简单的优化逻辑
  tasks.forEach((task, index) => {
    let optimizedTask = task;

    // 添加更具体的描述
    if (task.includes('分析')) {
      if (!task.includes('数据')) {
        optimizedTask = task.replace('分析', '分析相关数据');
      }
      changes.push({
        index,
        original: task,
        optimized: optimizedTask,
        reason: '增加数据相关描述，使任务更具体',
      });
    }

    if (task.includes('实现') && !task.includes('代码') && !task.includes('算法')) {
      optimizedTask = task.replace('实现', '实现完整的算法代码');
      changes.push({
        index,
        original: task,
        optimized: optimizedTask,
        reason: '明确算法实现的内容',
      });
    }

    if (task.includes('验证') && !task.includes('结果')) {
      optimizedTask = task.replace('验证', '验证结果的准确性和有效性');
      changes.push({
        index,
        original: task,
        optimized: optimizedTask,
        reason: '明确验证的对象和目标',
      });
    }

    optimizedTasks.push(optimizedTask);
  });

  // 检查是否缺少关键阶段
  const hasDataPrep = tasks.some(t => t.includes('数据') && t.includes('预处理'));
  const hasValidation = tasks.some(t => t.includes('验证'));
  const hasVisualization = tasks.some(t => t.includes('可视化') || t.includes('图表'));

  if (!hasDataPrep) {
    addedTasks.push('收集和清洗数据，进行数据预处理和特征工程');
    suggestions.push('建议添加数据预处理阶段，确保数据质量');
  }

  if (!hasValidation) {
    addedTasks.push('进行结果验证和敏感性分析，评估模型的可靠性');
    suggestions.push('建议添加结果验证阶段，确保结果的可信度');
  }

  if (!hasVisualization) {
    addedTasks.push('生成结果可视化图表，包括趋势图、误差图等');
    suggestions.push('建议添加可视化阶段，更好地展示结果');
  }

  return {
    originalTasks: tasks,
    optimizedTasks,
    changes,
    addedTasks,
    qualityImprovement: {
      before: 70,
      after: 85,
      improvement: 15,
    },
    suggestions,
  };
}

/**
 * 优化任务描述
 */
export async function optimizeTaskDescriptions(
  tasks: string[],
  problemType?: string,
  problemTitle?: string,
  userId?: string
): Promise<OptimizationResult> {
  return callAIOptimize(tasks, problemType, problemTitle, userId);
}

/**
 * 补充缺失阶段
 */
export async function addMissingPhases(
  tasks: string[],
  problemType?: string,
  problemTitle?: string,
  userId?: string
): Promise<{
  existingTasks: string[];
  addedTasks: string[];
  completeTaskList: string[];
  suggestions: string[];
}> {
  const result = await callAIOptimize(tasks, problemType, problemTitle, userId);

  return {
    existingTasks: tasks,
    addedTasks: result.addedTasks,
    completeTaskList: result.optimizedTasks,
    suggestions: result.suggestions,
  };
}

/**
 * 批量优化（支持流式输出）
 */
export async function batchOptimizeWithStream(
  tasks: string[],
  problemType?: string,
  problemTitle?: string,
  userId?: string,
  onProgress?: (progress: number, message: string) => void
): Promise<OptimizationResult> {
  onProgress?.(10, '正在分析任务列表...');

  // 模拟分步优化
  await new Promise(resolve => setTimeout(resolve, 500));
  onProgress?.(30, '正在优化任务描述...');

  await new Promise(resolve => setTimeout(resolve, 800));
  onProgress?.(60, '正在检查缺失阶段...');

  await new Promise(resolve => setTimeout(resolve, 600));
  onProgress?.(80, '正在生成优化建议...');

  const result = await callAIOptimize(tasks, problemType, problemTitle, userId);

  onProgress?.(100, '优化完成');

  return result;
}

/**
 * 获取优化预览
 */
export function getOptimizationPreview(
  tasks: string[],
  problemType?: string,
  problemTitle?: string
): {
  estimatedChanges: number;
  estimatedAddedTasks: number;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
} {
  const estimatedChanges = tasks.filter(task => {
    return (
      task.length < 10 ||
      task.includes('相关') ||
      task.includes('一些') ||
      !task.includes('实现') && !task.includes('建立') && !task.includes('设计')
    );
  }).length;

  const hasDataPrep = tasks.some(t => t.includes('数据') && t.includes('预处理'));
  const hasValidation = tasks.some(t => t.includes('验证'));
  const hasVisualization = tasks.some(t => t.includes('可视化') || t.includes('图表'));

  const estimatedAddedTasks = (hasDataPrep ? 0 : 1) + (hasValidation ? 0 : 1) + (hasVisualization ? 0 : 1);

  const estimatedTime = Math.max(5, estimatedChanges * 2 + estimatedAddedTasks * 3);

  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  if (estimatedChanges > 5 || estimatedAddedTasks > 2) {
    difficulty = 'hard';
  } else if (estimatedChanges > 2 || estimatedAddedTasks > 1) {
    difficulty = 'medium';
  }

  return {
    estimatedChanges,
    estimatedAddedTasks,
    estimatedTime: `${estimatedTime}秒`,
    difficulty,
  };
}

/**
 * 验证优化结果
 */
export function validateOptimizationResult(
  originalTasks: string[],
  optimizedTasks: string[]
): {
  isValid: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // 检查任务数量
  if (optimizedTasks.length < originalTasks.length) {
    issues.push('优化后的任务数量少于原始任务数量');
  }

  if (optimizedTasks.length > 15) {
    warnings.push('优化后的任务数量过多，建议合并部分任务');
  }

  // 检查任务描述
  optimizedTasks.forEach((task, index) => {
    if (task.trim().length === 0) {
      issues.push(`任务 ${index + 1} 描述为空`);
    }
    if (task.length < 5) {
      warnings.push(`任务 ${index + 1} 描述过短`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}
