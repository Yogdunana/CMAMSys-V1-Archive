/**
 * 任务列表模板服务
 * 提供常用任务列表模板，支持自定义模板
 */

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: 'prediction' | 'optimization' | 'classification' | 'regression' | 'general';
  tasks: string[];
  tags: string[];
  isBuiltIn: boolean;
  createdAt?: string;
  createdBy?: string;
}

/**
 * 内置任务列表模板
 */
const BUILT_IN_TEMPLATES: TaskTemplate[] = [
  {
    id: 'prediction-template',
    name: '预测模型模板',
    description: '适用于预测类问题的标准建模流程',
    category: 'prediction',
    tasks: [
      '收集和分析历史数据，进行数据清洗和预处理',
      '进行探索性数据分析，识别数据特征和趋势',
      '选择合适的预测模型（如时间序列、回归、机器学习等）',
      '实现预测算法，编写训练和预测代码',
      '训练模型并进行参数调优',
      '使用测试数据验证模型性能，计算准确率、均方误差等指标',
      '进行预测结果分析，评估模型的可信度',
      '生成预测结果可视化图表（趋势图、误差图等）',
      '撰写预测分析报告，包含模型说明、结果评估和建议',
    ],
    tags: ['预测', '时间序列', '机器学习'],
    isBuiltIn: true,
  },
  {
    id: 'optimization-template',
    name: '优化问题模板',
    description: '适用于优化类问题的标准建模流程',
    category: 'optimization',
    tasks: [
      '分析优化问题的目标函数和约束条件',
      '收集和处理相关数据，进行数据预处理',
      '建立数学优化模型，明确决策变量、目标和约束',
      '选择合适的优化算法（如线性规划、整数规划、遗传算法等）',
      '实现优化算法，编写求解代码',
      '进行求解计算，获得最优解和最优值',
      '分析求解结果的可行性和敏感性',
      '进行结果验证，对比不同方法的效果',
      '生成优化结果可视化图表（收敛曲线、解分布等）',
      '撰写优化报告，包含模型说明、求解过程和结果分析',
    ],
    tags: ['优化', '数学规划', '算法'],
    isBuiltIn: true,
  },
  {
    id: 'classification-template',
    name: '分类问题模板',
    description: '适用于分类类问题的标准建模流程',
    category: 'classification',
    tasks: [
      '收集和整理分类数据集，进行数据清洗和预处理',
      '分析数据特征分布，进行特征工程',
      '选择合适的分类算法（如决策树、SVM、神经网络等）',
      '实现分类模型，编写训练和预测代码',
      '划分训练集和测试集，训练模型',
      '使用测试数据评估分类性能（准确率、召回率、F1分数等）',
      '进行特征重要性分析和模型解释',
      '进行交叉验证，确保模型稳定性',
      '生成分类结果可视化图表（混淆矩阵、ROC曲线等）',
      '撰写分类报告，包含模型说明、性能评估和应用建议',
    ],
    tags: ['分类', '机器学习', '模式识别'],
    isBuiltIn: true,
  },
  {
    id: 'regression-template',
    name: '回归分析模板',
    description: '适用于回归分析类问题的标准建模流程',
    category: 'regression',
    tasks: [
      '收集和整理回归数据集，进行数据清洗和预处理',
      '分析变量之间的相关性，进行特征选择',
      '探索数据分布，进行必要的转换和标准化',
      '选择合适的回归方法（线性回归、多项式回归、岭回归等）',
      '实现回归模型，编写拟合和预测代码',
      '拟合模型，获得回归系数和拟合优度',
      '分析残差，检验模型假设（正态性、同方差性等）',
      '进行模型验证，使用交叉验证或留一法',
      '生成回归结果可视化图表（散点图、残差图、拟合线等）',
      '撰写回归报告，包含模型说明、统计检验和预测应用',
    ],
    tags: ['回归', '统计分析', '数据拟合'],
    isBuiltIn: true,
  },
  {
    id: 'general-template',
    name: '通用建模模板',
    description: '适用于一般数学建模问题的标准流程',
    category: 'general',
    tasks: [
      '分析题目背景和问题要求，明确建模目标',
      '收集和整理相关数据，进行数据预处理',
      '进行数据分析，识别关键因素和变量',
      '建立数学模型，选择合适的建模方法',
      '实现求解算法，编写计算代码',
      '进行模型求解，获得数值结果',
      '进行结果分析和敏感性检验',
      '验证模型的合理性和有效性',
      '生成结果可视化图表和报告',
      '撰写完整建模报告，包含问题分析、模型建立、求解过程和结果讨论',
    ],
    tags: ['通用', '综合', '数学建模'],
    isBuiltIn: true,
  },
];

/**
 * 模板存储（从 localStorage 读取）
 */
function getCustomTemplates(): TaskTemplate[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('custom-task-templates');
    if (stored) {
      const templates = JSON.parse(stored);
      return templates.filter((t: TaskTemplate) => !t.isBuiltIn);
    }
  } catch (error) {
    console.error('读取自定义模板失败:', error);
  }

  return [];
}

/**
 * 保存自定义模板
 */
function saveCustomTemplates(templates: TaskTemplate[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('custom-task-templates', JSON.stringify(templates));
  } catch (error) {
    console.error('保存自定义模板失败:', error);
  }
}

/**
 * 获取所有模板
 */
export function getAllTemplates(): TaskTemplate[] {
  const builtIn = [...BUILT_IN_TEMPLATES];
  const custom = getCustomTemplates();
  return [...builtIn, ...custom];
}

/**
 * 根据分类获取模板
 */
export function getTemplatesByCategory(category: TaskTemplate['category']): TaskTemplate[] {
  return getAllTemplates().filter(t => t.category === category);
}

/**
 * 根据标签搜索模板
 */
export function searchTemplatesByTag(tag: string): TaskTemplate[] {
  const lowerTag = tag.toLowerCase();
  return getAllTemplates().filter(t =>
    t.tags.some(tg => tg.toLowerCase().includes(lowerTag))
  );
}

/**
 * 根据关键词搜索模板
 */
export function searchTemplates(keyword: string): TaskTemplate[] {
  const lowerKeyword = keyword.toLowerCase();
  return getAllTemplates().filter(t =>
    t.name.toLowerCase().includes(lowerKeyword) ||
    t.description.toLowerCase().includes(lowerKeyword) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * 获取模板详情
 */
export function getTemplateById(id: string): TaskTemplate | null {
  return getAllTemplates().find(t => t.id === id) || null;
}

/**
 * 创建自定义模板
 */
export function createCustomTemplate(
  name: string,
  description: string,
  category: TaskTemplate['category'],
  tasks: string[],
  tags: string[],
  createdBy: string
): TaskTemplate {
  const template: TaskTemplate = {
    id: `custom-${Date.now()}`,
    name,
    description,
    category,
    tasks,
    tags,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
    createdBy,
  };

  const customTemplates = getCustomTemplates();
  customTemplates.push(template);
  saveCustomTemplates(customTemplates);

  return template;
}

/**
 * 更新自定义模板
 */
export function updateCustomTemplate(
  id: string,
  updates: Partial<Omit<TaskTemplate, 'id' | 'isBuiltIn' | 'createdAt'>>
): TaskTemplate | null {
  const customTemplates = getCustomTemplates();
  const index = customTemplates.findIndex(t => t.id === id);

  if (index === -1) {
    return null;
  }

  const updated = { ...customTemplates[index], ...updates };
  customTemplates[index] = updated;
  saveCustomTemplates(customTemplates);

  return updated;
}

/**
 * 删除自定义模板
 */
export function deleteCustomTemplate(id: string): boolean {
  const customTemplates = getCustomTemplates();
  const index = customTemplates.findIndex(t => t.id === id);

  if (index === -1) {
    return false;
  }

  customTemplates.splice(index, 1);
  saveCustomTemplates(customTemplates);

  return true;
}

/**
 * 推荐模板
 */
export function recommendTemplates(problemTitle: string, problemDescription: string): {
  template: TaskTemplate;
  score: number;
  reason: string;
}[] {
  const text = (problemTitle + ' ' + problemDescription).toLowerCase();
  const templates = getAllTemplates();

  const scoredTemplates = templates.map(template => {
    let score = 0;

    // 根据名称匹配
    if (template.name.toLowerCase().includes('预测') && text.includes('预测')) {
      score += 10;
    }
    if (template.name.toLowerCase().includes('优化') && text.includes('优化')) {
      score += 10;
    }
    if (template.name.toLowerCase().includes('分类') && text.includes('分类')) {
      score += 10;
    }
    if (template.name.toLowerCase().includes('回归') && text.includes('回归')) {
      score += 10;
    }

    // 根据标签匹配
    template.tags.forEach(tag => {
      if (text.includes(tag.toLowerCase())) {
        score += 5;
      }
    });

    // 根据描述匹配
    if (template.description.toLowerCase().includes('通用')) {
      score += 2;
    }

    return {
      template,
      score,
      reason: score > 0 ? `匹配度: ${score}分` : '通用模板',
    };
  });

  // 按分数排序，取前 3 个
  return scoredTemplates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/**
 * 导出模板为 JSON
 */
export function exportTemplate(template: TaskTemplate): string {
  return JSON.stringify(template, null, 2);
}

/**
 * 从 JSON 导入模板
 */
export function importTemplate(jsonString: string): TaskTemplate | null {
  try {
    const template = JSON.parse(jsonString);

    // 验证必需字段
    if (!template.id || !template.name || !template.tasks || !Array.isArray(template.tasks)) {
      throw new Error('无效的模板格式');
    }

    // 生成新的 ID（避免冲突）
    const newTemplate: TaskTemplate = {
      ...template,
      id: `imported-${Date.now()}`,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      createdBy: 'imported',
    };

    const customTemplates = getCustomTemplates();
    customTemplates.push(newTemplate);
    saveCustomTemplates(customTemplates);

    return newTemplate;
  } catch (error) {
    console.error('导入模板失败:', error);
    return null;
  }
}

/**
 * 获取模板统计信息
 */
export function getTemplateStats(): {
  total: number;
  builtIn: number;
  custom: number;
  byCategory: Record<string, number>;
} {
  const allTemplates = getAllTemplates();
  const byCategory: Record<string, number> = {};

  allTemplates.forEach(template => {
    byCategory[template.category] = (byCategory[template.category] || 0) + 1;
  });

  return {
    total: allTemplates.length,
    builtIn: BUILT_IN_TEMPLATES.length,
    custom: getCustomTemplates().length,
    byCategory,
  };
}
