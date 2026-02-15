/**
 * 任务列表质量检查服务
 * 用于评估生成的任务列表质量，提供改进建议
 */

export interface TaskListQualityReport {
  overallScore: number; // 0-100
  metrics: {
    completeness: number; // 完整性 0-100
    coverage: number; // 覆盖度 0-100
    clarity: number; // 清晰度 0-100
    ordering: number; // 顺序性 0-100
  };
  issues: QualityIssue[];
  suggestions: string[];
  isValid: boolean; // 是否达到最低质量标准
}

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  suggestion?: string;
}

/**
 * 必需的建模阶段
 */
const REQUIRED_PHASES = [
  { name: '数据预处理', keywords: ['数据', '预处理', '清洗', '分析', '采集'] },
  { name: '核心算法', keywords: ['算法', '模型', '构建', '建立', '设计'] },
  { name: '求解', keywords: ['求解', '优化', '计算', '迭代', '算法实现'] },
  { name: '验证', keywords: ['验证', '测试', '评估', '对比', '分析'] },
  { name: '可视化', keywords: ['可视化', '图表', '报告', '输出', '展示'] },
];

/**
 * 检查任务列表质量
 */
export async function checkTaskListQuality(tasks: string[]): Promise<TaskListQualityReport> {
  const report: TaskListQualityReport = {
    overallScore: 0,
    metrics: {
      completeness: 0,
      coverage: 0,
      clarity: 0,
      ordering: 0,
    },
    issues: [],
    suggestions: [],
    isValid: false,
  };

  // 1. 检查完整性
  checkCompleteness(tasks, report);

  // 2. 检查覆盖度
  checkCoverage(tasks, report);

  // 3. 检查清晰度
  checkClarity(tasks, report);

  // 4. 检查顺序性
  checkOrdering(tasks, report);

  // 计算总体评分
  report.overallScore = Math.round(
    (report.metrics.completeness * 0.3 +
      report.metrics.coverage * 0.3 +
      report.metrics.clarity * 0.2 +
      report.metrics.ordering * 0.2)
  );

  // 判断是否达到最低质量标准
  report.isValid = report.overallScore >= 60;

  // 生成改进建议
  generateSuggestions(report, tasks);

  return report;
}

/**
 * 检查任务列表的完整性
 */
function checkCompleteness(tasks: string[], report: TaskListQualityReport): void {
  const issues: QualityIssue[] = [];

  // 检查任务数量
  if (tasks.length < 5) {
    issues.push({
      severity: 'error',
      code: 'TOO_FEW_TASKS',
      message: `任务数量不足：仅有 ${tasks.length} 个任务，建议 5-8 个`,
      suggestion: '增加更多细化的任务，确保覆盖建模的各个阶段',
    });
  } else if (tasks.length > 10) {
    issues.push({
      severity: 'warning',
      code: 'TOO_MANY_TASKS',
      message: `任务数量过多：有 ${tasks.length} 个任务，建议 5-8 个`,
      suggestion: '合并相似的任务，避免过于细碎',
    });
  } else {
    // 任务数量合适
    report.metrics.completeness = 100;
  }

  // 根据问题严重程度调整评分
  if (issues.length > 0) {
    if (issues.some(i => i.severity === 'error')) {
      report.metrics.completeness = 40;
    } else {
      report.metrics.completeness = 70;
    }
  }

  report.issues.push(...issues);
}

/**
 * 检查任务列表的覆盖度
 */
function checkCoverage(tasks: string[], report: TaskListQualityReport): void {
  const issues: QualityIssue[] = [];
  const coveredPhases: string[] = [];

  // 检查每个必需阶段是否被覆盖
  REQUIRED_PHASES.forEach(phase => {
    const isCovered = tasks.some(task =>
      phase.keywords.some(keyword =>
        task.toLowerCase().includes(keyword)
      )
    );

    if (isCovered) {
      coveredPhases.push(phase.name);
    }
  });

  const coverageRate = (coveredPhases.length / REQUIRED_PHASES.length) * 100;
  report.metrics.coverage = Math.round(coverageRate);

  // 如果覆盖率低于 100%，添加建议
  if (coverageRate < 100) {
    const missingPhases = REQUIRED_PHASES
      .filter(phase => !coveredPhases.includes(phase.name))
      .map(phase => phase.name);

    issues.push({
      severity: coverageRate < 60 ? 'error' : 'warning',
      code: 'MISSING_PHASES',
      message: `缺少以下建模阶段：${missingPhases.join('、')}`,
      suggestion: `添加对应阶段的任务，确保覆盖：${missingPhases.join('、')}`,
    });
  }

  report.issues.push(...issues);
}

/**
 * 检查任务描述的清晰度
 */
function checkClarity(tasks: string[], report: TaskListQualityReport): void {
  const issues: QualityIssue[] = [];
  let clarityScore = 100;
  let vagueTasks = 0;

  tasks.forEach((task, index) => {
    // 检查任务长度
    if (task.length < 5) {
      clarityScore -= 10;
      issues.push({
        severity: 'warning',
        code: 'TASK_TOO_SHORT',
        message: `任务 ${index + 1} 描述过短："${task}"`,
        suggestion: '增加任务描述的细节，明确任务目标',
      });
    }

    // 检查是否包含模糊词汇
    const vagueWords = ['相关', '等', '等等', '部分', '一些', '合适'];
    const hasVagueWord = vagueWords.some(word =>
      task.toLowerCase().includes(word)
    );

    if (hasVagueWord) {
      vagueTasks++;
      issues.push({
        severity: 'info',
        code: 'VAGUE_TASK',
        message: `任务 ${index + 1} 描述可能不够具体："${task}"`,
        suggestion: '使用更具体的词汇，明确任务的具体内容',
      });
    }

    // 检查是否包含动词（应该包含明确的动作）
    const actionVerbs = ['分析', '设计', '实现', '建立', '构建', '验证', '测试', '优化', '计算', '生成', '处理'];
    const hasActionVerb = actionVerbs.some(verb =>
      task.includes(verb)
    );

    if (!hasActionVerb) {
      clarityScore -= 5;
      issues.push({
        severity: 'info',
        code: 'MISSING_ACTION_VERB',
        message: `任务 ${index + 1} 缺少明确的动作动词："${task}"`,
        suggestion: '在任务描述开头添加明确的动作动词',
      });
    }
  });

  // 根据模糊任务比例调整评分
  if (vagueTasks > 0) {
    const vagueRatio = vagueTasks / tasks.length;
    clarityScore -= Math.round(vagueRatio * 20);
  }

  report.metrics.clarity = Math.max(0, Math.min(100, clarityScore));
  report.issues.push(...issues);
}

/**
 * 检查任务列表的顺序性
 */
function checkOrdering(tasks: string[], report: TaskListQualityReport): void {
  const issues: QualityIssue[] = [];
  let orderingScore = 100;
  let outOfOrderCount = 0;

  // 定义阶段的预期顺序
  const phaseOrder = ['数据预处理', '核心算法', '求解', '验证', '可视化'];

  // 检查每个阶段是否按顺序出现
  phaseOrder.forEach((expectedPhase, expectedIndex) => {
    const phase = REQUIRED_PHASES.find(p => p.name === expectedPhase);
    if (!phase) return;

    // 找到这个阶段在任务列表中的位置
    let foundAt = -1;
    for (let i = 0; i < tasks.length; i++) {
      if (phase.keywords.some(keyword =>
        tasks[i].toLowerCase().includes(keyword)
      )) {
        foundAt = i;
        break;
      }
    }

    if (foundAt !== -1) {
      // 检查是否有前面的阶段在后面出现
      for (let prevPhaseIndex = 0; prevPhaseIndex < expectedIndex; prevPhaseIndex++) {
        const prevPhase = REQUIRED_PHASES[prevPhaseIndex];
        const hasPrevPhaseLater = tasks.slice(foundAt + 1).some(task =>
          prevPhase.keywords.some(keyword =>
            task.toLowerCase().includes(keyword)
          )
        );

        if (hasPrevPhaseLater) {
          outOfOrderCount++;
          issues.push({
            severity: 'warning',
            code: 'OUT_OF_ORDER',
            message: `"${prevPhase.name}" 阶段出现在 "${expectedPhase}" 之后，建议调整顺序`,
            suggestion: `将 "${prevPhase.name}" 相关任务移到 "${expectedPhase}" 之前`,
          });
        }
      }
    }
  });

  // 根据乱序数量调整评分
  if (outOfOrderCount > 0) {
    orderingScore -= Math.min(50, outOfOrderCount * 15);
  }

  report.metrics.ordering = Math.max(0, Math.min(100, orderingScore));
  report.issues.push(...issues);
}

/**
 * 生成改进建议
 */
function generateSuggestions(report: TaskListQualityReport, tasks: string[]): void {
  const suggestions: string[] = [];

  // 基于各个指标的得分生成建议
  if (report.metrics.completeness < 70) {
    suggestions.push('📝 调整任务数量至 5-8 个，确保既不遗漏也不过于细碎');
  }

  if (report.metrics.coverage < 80) {
    suggestions.push('🎯 确保任务列表覆盖建模的各个阶段：数据预处理、算法构建、求解、验证、可视化');
  }

  if (report.metrics.clarity < 70) {
    suggestions.push('✍️ 优化任务描述，使用具体的词汇和明确的动作动词');
  }

  if (report.metrics.ordering < 80) {
    suggestions.push('📊 按照建模的逻辑流程调整任务顺序');
  }

  // 根据具体问题生成建议
  report.issues.forEach(issue => {
    if (issue.severity === 'error' && issue.suggestion) {
      if (!suggestions.includes(issue.suggestion)) {
        suggestions.push(issue.suggestion);
      }
    }
  });

  report.suggestions = suggestions;
}

/**
 * 格式化质量报告为可读文本
 */
export function formatQualityReport(report: TaskListQualityReport): string {
  const lines: string[] = [];

  lines.push('=== 任务列表质量检查报告 ===\n');
  lines.push(`总体评分: ${report.overallScore}/100 ${report.isValid ? '✅ 通过' : '❌ 未达标'}\n`);

  lines.push('详细指标:');
  lines.push(`  • 完整性: ${report.metrics.completeness}/100`);
  lines.push(`  • 覆盖度: ${report.metrics.coverage}/100`);
  lines.push(`  • 清晰度: ${report.metrics.clarity}/100`);
  lines.push(`  • 顺序性: ${report.metrics.ordering}/100\n`);

  if (report.issues.length > 0) {
    lines.push('发现问题:');
    report.issues.forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      lines.push(`  ${icon} [${issue.code}] ${issue.message}`);
      if (issue.suggestion) {
        lines.push(`     建议: ${issue.suggestion}`);
      }
    });
    lines.push('');
  }

  if (report.suggestions.length > 0) {
    lines.push('改进建议:');
    report.suggestions.forEach(suggestion => {
      lines.push(`  ${suggestion}`);
    });
  }

  return lines.join('\n');
}
