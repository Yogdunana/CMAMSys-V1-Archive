/**
 * 智能任务排序服务
 * 根据任务内容自动推荐最佳顺序
 */

export interface TaskItem {
  id: number;
  text: string;
  status?: 'pending' | 'in-progress' | 'completed';
  estimatedTime?: string;
}

/**
 * 建模阶段定义
 */
interface ModelPhase {
  name: string;
  keywords: string[];
  priority: number; // 优先级，数字越小越靠前
  category: string;
}

/**
 * 建模阶段列表（按优先级排序）
 */
const MODEL_PHASES: ModelPhase[] = [
  {
    name: '数据预处理',
    keywords: ['数据', '预处理', '清洗', '分析', '采集', '收集', '导入', '读取', '准备'],
    priority: 1,
    category: 'preparation',
  },
  {
    name: '数据分析',
    keywords: ['探索性分析', '统计分析', '特征工程', '特征提取', '数据探索', '数据描述'],
    priority: 2,
    category: 'preparation',
  },
  {
    name: '模型构建',
    keywords: ['建立', '构建', '设计', '定义', '模型', '算法', '数学模型', '建模'],
    priority: 3,
    category: 'modeling',
  },
  {
    name: '算法实现',
    keywords: ['实现', '编写', '编码', '开发', '函数', '类', '算法实现', '程序'],
    priority: 4,
    category: 'modeling',
  },
  {
    name: '求解',
    keywords: ['求解', '计算', '运行', '执行', '计算结果', '求解器', '优化求解'],
    priority: 5,
    category: 'solving',
  },
  {
    name: '优化',
    keywords: ['优化', '调优', '参数优化', '超参数', '改进', '迭代', '调整'],
    priority: 6,
    category: 'solving',
  },
  {
    name: '验证',
    keywords: ['验证', '测试', '评估', '检验', '对比', '性能评估', '准确率', '误差分析'],
    priority: 7,
    category: 'validation',
  },
  {
    name: '可视化',
    keywords: ['可视化', '图表', '绘图', '展示', '呈现', '图形', '可视化报告'],
    priority: 8,
    category: 'reporting',
  },
  {
    name: '报告',
    keywords: ['报告', '论文', '文档', '撰写', '生成', '总结', '报告输出'],
    priority: 9,
    category: 'reporting',
  },
];

/**
 * 分析任务所属阶段
 */
function analyzeTaskPhase(taskText: string): ModelPhase | null {
  const text = taskText.toLowerCase();

  // 查找匹配的关键词
  for (const phase of MODEL_PHASES) {
    const matchCount = phase.keywords.filter(keyword =>
      text.includes(keyword.toLowerCase())
    ).length;

    if (matchCount > 0) {
      return phase;
    }
  }

  return null;
}

/**
 * 计算任务优先级分数
 */
function calculateTaskScore(task: TaskItem, index: number): number {
  const phase = analyzeTaskPhase(task.text);

  if (!phase) {
    // 如果无法确定阶段，使用原始位置
    return 100 + index;
  }

  // 基础分数：阶段优先级 * 10
  let score = phase.priority * 10;

  // 根据关键词匹配度调整分数
  const text = task.text.toLowerCase();
  const matchCount = phase.keywords.filter(keyword =>
    text.includes(keyword.toLowerCase())
  ).length;

  // 匹配度越高，分数越低（越靠前）
  score -= matchCount;

  return score;
}

/**
 * 智能排序任务列表
 */
export function smartSortTasks(tasks: TaskItem[]): {
  sortedTasks: TaskItem[];
  changes: {
    taskId: number;
    from: number;
    to: number;
    reason: string;
  }[];
  confidence: number;
} {
  // 创建带分数的任务副本
  const scoredTasks = tasks.map((task, index) => ({
    task,
    score: calculateTaskScore(task, index),
    originalIndex: index,
    phase: analyzeTaskPhase(task.text),
  }));

  // 按分数排序
  scoredTasks.sort((a, b) => a.score - b.score);

  // 记录变化
  const changes = scoredTasks
    .filter((item, index) => item.originalIndex !== index)
    .map(item => ({
      taskId: item.task.id,
      from: item.originalIndex,
      to: scoredTasks.findIndex(s => s.task.id === item.task.id),
      reason: item.phase
        ? `移动到"${item.phase.name}"阶段（优先级 ${item.phase.priority}）`
        : '无法确定阶段，保持原位置',
    }));

  // 计算置信度
  const classifiedTasks = scoredTasks.filter(item => item.phase !== null).length;
  const confidence = Math.round((classifiedTasks / tasks.length) * 100);

  return {
    sortedTasks: scoredTasks.map(item => item.task),
    changes,
    confidence,
  };
}

/**
 * 获取排序建议
 */
export function getSortSuggestions(tasks: TaskItem[]): string[] {
  const suggestions: string[] = [];
  const phases = new Map<string, TaskItem[]>();

  // 按阶段分组
  tasks.forEach(task => {
    const phase = analyzeTaskPhase(task.text);
    if (phase) {
      if (!phases.has(phase.name)) {
        phases.set(phase.name, []);
      }
      phases.get(phase.name)!.push(task);
    }
  });

  // 检查是否缺少关键阶段
  const presentPhases = Array.from(phases.keys());
  const requiredPhases = MODEL_PHASES.filter(p => p.priority <= 5).map(p => p.name);
  const missingPhases = requiredPhases.filter(p => !presentPhases.includes(p));

  if (missingPhases.length > 0) {
    suggestions.push(
      `建议添加以下关键阶段的任务：${missingPhases.join('、')}`
    );
  }

  // 检查是否有重复的任务
  const taskTexts = tasks.map(t => t.text.toLowerCase());
  const duplicates = taskTexts.filter(
    (text, index) => taskTexts.indexOf(text) !== index
  );

  if (duplicates.length > 0) {
    suggestions.push('发现重复的任务描述，建议合并或删除');
  }

  // 检查是否有无法分类的任务
  const unclassified = tasks.filter(t => !analyzeTaskPhase(t.text));
  if (unclassified.length > 0) {
    suggestions.push(
      `有 ${unclassified.length} 个任务无法自动分类，建议手动调整`
    );
  }

  return suggestions;
}

/**
 * 检查任务列表是否已排序
 */
export function isSorted(tasks: TaskItem[]): {
  isSorted: boolean;
  violations: { taskId: number; description: string }[];
} {
  const violations: { taskId: number; description: string }[] = [];

  // 检查相邻任务的优先级
  for (let i = 1; i < tasks.length; i++) {
    const prevPhase = analyzeTaskPhase(tasks[i - 1].text);
    const currPhase = analyzeTaskPhase(tasks[i].text);

    if (prevPhase && currPhase) {
      if (prevPhase.priority > currPhase.priority) {
        violations.push({
          taskId: tasks[i].id,
          description: `"${currPhase.name}"阶段出现在"${prevPhase.name}"阶段之前`,
        });
      }
    }
  }

  return {
    isSorted: violations.length === 0,
    violations,
  };
}

/**
 * 获取任务排序报告
 */
export function getSortReport(tasks: TaskItem[]): {
  originalOrder: TaskItem[];
  sortedOrder: TaskItem[];
  changes: number;
  confidence: number;
  violations: { taskId: number; description: string }[];
  suggestions: string[];
} {
  // 检查是否已排序
  const sortCheck = isSorted(tasks);

  // 执行智能排序
  const sortResult = smartSortTasks(tasks);

  // 获取建议
  const suggestions = getSortSuggestions(tasks);

  return {
    originalOrder: tasks,
    sortedOrder: sortResult.sortedTasks,
    changes: sortResult.changes.length,
    confidence: sortResult.confidence,
    violations: sortCheck.violations,
    suggestions,
  };
}
