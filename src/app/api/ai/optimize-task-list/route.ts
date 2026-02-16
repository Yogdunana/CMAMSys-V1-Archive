import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/services/ai-provider';
import { AIProvider, AIModelType } from '@prisma/client';

/**
 * API 路由：优化任务列表
 * POST /api/ai/optimize-task-list
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks, problemType, problemTitle, providerId } = body;

    // 验证输入
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: '任务列表不能为空' },
        { status: 400 }
      );
    }

    // 构建优化提示词
    const prompt = `你是一个数学建模任务优化专家。请优化以下任务列表，使其更清晰、具体、完整。

赛题信息：
- 标题：${problemTitle || '未提供'}
- 类型：${problemType || '未提供'}

当前任务列表：
${tasks.map((task: string, index: number) => `${index + 1}. ${task}`).join('\n')}

请按以下要求进行优化：

1. 任务描述优化：
   - 使任务描述更具体和明确
   - 添加必要的细节和量化指标
   - 使用专业的数学建模术语
   - 确保每个任务都有明确的动作动词

2. 缺失阶段补充：
   - 检查是否缺少关键建模阶段
   - 如数据预处理、模型验证、结果分析等
   - 补充缺失的任务

3. 顺序优化：
   - 确保任务按照合理的建模流程排序
   - 数据准备 → 模型构建 → 求解计算 → 验证分析 → 报告撰写

请以 JSON 格式返回优化后的任务列表：
{
  "optimizedTasks": ["优化后的任务1", "优化后的任务2", ...],
  "changes": [
    {
      "index": 0,
      "original": "原任务",
      "optimized": "优化后任务",
      "reason": "优化原因"
    }
  ],
  "addedTasks": ["新增的任务1", ...],
  "suggestions": ["建议1", "建议2", ...]
}`;

    // 调用 AI 进行优化
    const result = await callAI(
      providerId || 'default',
      'chat',
      prompt,
      {
        modelType: AIModelType.CHAT,
        context: 'modeling',
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'AI 优化失败' },
        { status: 500 }
      );
    }

    // 解析 AI 返回的 JSON
    let optimizationResult;
    try {
      // 提取 JSON 部分
      const jsonMatch = result.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizationResult = JSON.parse(jsonMatch[0]);
      } else {
        // 如果没有 JSON 格式，创建默认结果
        optimizationResult = {
          optimizedTasks: tasks,
          changes: [],
          addedTasks: [],
          suggestions: ['无法解析 AI 返回的优化结果，请手动调整'],
        };
      }
    } catch (error) {
      console.error('Failed to parse AI optimization result:', error);
      optimizationResult = {
        optimizedTasks: tasks,
        changes: [],
        addedTasks: [],
        suggestions: ['AI 返回格式错误，请手动调整'],
      };
    }

    // 计算质量改进
    const qualityImprovement = {
      before: calculateQualityScore(tasks),
      after: calculateQualityScore(optimizationResult.optimizedTasks),
      improvement: 0,
    };
    qualityImprovement.improvement = qualityImprovement.after - qualityImprovement.before;

    return NextResponse.json({
      originalTasks: tasks,
      optimizedTasks: optimizationResult.optimizedTasks,
      changes: optimizationResult.changes || [],
      addedTasks: optimizationResult.addedTasks || [],
      qualityImprovement,
      suggestions: optimizationResult.suggestions || [],
    });
  } catch (error) {
    console.error('Task list optimization error:', error);
    return NextResponse.json(
      { error: '任务列表优化失败' },
      { status: 500 }
    );
  }
}

/**
 * 计算任务列表质量分数（简单版本）
 */
function calculateQualityScore(tasks: string[]): number {
  let score = 0;
  const maxScore = 100;

  // 完整性（30分）
  if (tasks.length >= 5 && tasks.length <= 10) {
    score += 30;
  } else if (tasks.length >= 3 && tasks.length <= 12) {
    score += 20;
  }

  // 清晰度（40分）
  const clearTaskCount = tasks.filter(task => {
    const actionVerbs = ['分析', '收集', '处理', '实现', '验证', '生成', '计算', '建立', '设计', '构建'];
    return actionVerbs.some(verb => task.includes(verb));
  }).length;

  score += (clearTaskCount / tasks.length) * 40;

  // 覆盖度（30分）
  const phases = ['数据', '模型', '验证', '分析', '报告'];
  const coveredPhases = phases.filter(phase =>
    tasks.some(task => task.includes(phase))
  ).length;

  score += (coveredPhases / phases.length) * 30;

  return Math.min(Math.round(score), maxScore);
}
