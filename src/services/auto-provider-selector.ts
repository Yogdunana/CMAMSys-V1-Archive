/**
 * AI Provider 自动选型路由服务
 * 基于赛题类型和 API 标签匹配，自动选择最优 AI Provider
 */

import { AIProvider, CompetitionType, ProblemType } from '@prisma/client';
import prisma from '@/lib/prisma';

// 能力标签定义
export const CAPABILITY_TAGS = {
  MATHEMATICAL_MODELING: 'mathematical_modeling', // 数学建模算法
  CODE_GENERATION: 'code_generation',           // 代码生成
  DATA_PREPROCESSING: 'data_preprocessing',     // 数据预处理
  OPTIMIZATION_ALGORITHM: 'optimization_algorithm', // 优化算法
  STATISTICAL_ANALYSIS: 'statistical_analysis', // 统计分析
  VISUALIZATION: 'visualization',               // 可视化设计
  CRITICAL_THINKING: 'critical_thinking',       // 批判性思维
  PROBLEM_SOLVING: 'problem_solving',           // 问题求解
} as const;

// 场景标签定义
export const SCENARIO_TAGS = {
  MCM_OPTIMIZATION: 'mcm_optimization',        // 美赛优化题
  MCM_EVALUATION: 'mcm_evaluation',            // 美赛评价题
  MCM_PREDICTION: 'mcm_prediction',            // 美赛预测题
  CUMCM_OPTIMIZATION: 'cumcm_optimization',    // 国赛优化题
  CUMCM_PREDICTION: 'cumcm_prediction',        // 国赛预测题
  DATA_ANALYSIS: 'data_analysis',              // 数据分析
  VISUALIZATION_DESIGN: 'visualization_design', // 可视化设计
  NUMERICAL_SIMULATION: 'numerical_simulation', // 数值模拟
  STATISTICAL_ANALYSIS: 'statistical_analysis', // 统计分析
} as const;

// 任务类型定义
export enum TaskType {
  DISCUSSION = 'discussion',       // 思路讨论
  CODE_GENERATION = 'code_generation', // 代码生成
  VALIDATION = 'validation',       // 校验
  PAPER_GENERATION = 'paper_generation', // 论文生成
}

// 赛题类型与场景标签的映射
const PROBLEM_TYPE_TO_SCENARIO: Record<ProblemType, string[]> = {
  EVALUATION: [SCENARIO_TAGS.MCM_EVALUATION, SCENARIO_TAGS.DATA_ANALYSIS],
  PREDICTION: [SCENARIO_TAGS.MCM_PREDICTION, SCENARIO_TAGS.CUMCM_PREDICTION],
  OPTIMIZATION: [SCENARIO_TAGS.MCM_OPTIMIZATION, SCENARIO_TAGS.CUMCM_OPTIMIZATION],
  CLASSIFICATION: [SCENARIO_TAGS.DATA_ANALYSIS, SCENARIO_TAGS.NUMERICAL_SIMULATION],
  REGRESSION: [SCENARIO_TAGS.DATA_ANALYSIS, SCENARIO_TAGS.STATISTICAL_ANALYSIS],
  CLUSTERING: [SCENARIO_TAGS.DATA_ANALYSIS, SCENARIO_TAGS.VISUALIZATION_DESIGN],
};

// 竞赛类型与场景标签的映射
const COMPETITION_TYPE_TO_SCENARIO: Record<CompetitionType, string> = {
  MCM: SCENARIO_TAGS.MCM_OPTIMIZATION,
  ICM: SCENARIO_TAGS.MCM_EVALUATION,
  CUMCM: SCENARIO_TAGS.CUMCM_OPTIMIZATION,
  SHENZHEN_CUP: SCENARIO_TAGS.CUMCM_PREDICTION,
  IMMC: SCENARIO_TAGS.MCM_OPTIMIZATION,
  MATHORCUP: SCENARIO_TAGS.CUMCM_OPTIMIZATION,
  EMMC: SCENARIO_TAGS.MCM_PREDICTION,
  TEDDY_CUP: SCENARIO_TAGS.DATA_ANALYSIS,
  BLUE_BRIDGE_MATH: SCENARIO_TAGS.CUMCM_PREDICTION,
  REGIONAL: SCENARIO_TAGS.CUMCM_OPTIMIZATION,
  OTHER: SCENARIO_TAGS.DATA_ANALYSIS,
};

// 任务类型与能力标签的映射
const TASK_TYPE_TO_CAPABILITY: Record<TaskType, string[]> = {
  [TaskType.DISCUSSION]: [
    CAPABILITY_TAGS.MATHEMATICAL_MODELING,
    CAPABILITY_TAGS.CRITICAL_THINKING,
    CAPABILITY_TAGS.PROBLEM_SOLVING,
  ],
  [TaskType.CODE_GENERATION]: [
    CAPABILITY_TAGS.CODE_GENERATION,
    CAPABILITY_TAGS.MATHEMATICAL_MODELING,
    CAPABILITY_TAGS.OPTIMIZATION_ALGORITHM,
  ],
  [TaskType.VALIDATION]: [
    CAPABILITY_TAGS.CRITICAL_THINKING,
    CAPABILITY_TAGS.STATISTICAL_ANALYSIS,
    CAPABILITY_TAGS.PROBLEM_SOLVING,
  ],
  [TaskType.PAPER_GENERATION]: [
    CAPABILITY_TAGS.MATHEMATICAL_MODELING,
    CAPABILITY_TAGS.CRITICAL_THINKING,
    CAPABILITY_TAGS.VISUALIZATION,
  ],
};

/**
 * 根据赛题信息和任务类型选择最优 AI Provider
 */
export async function selectOptimalProvider(
  competitionType: CompetitionType,
  problemType: ProblemType,
  taskType: TaskType,
  userId: string
): Promise<AIProvider | null> {
  try {
    // 1. 获取用户的所有活跃 AI Provider
    const providers = await prisma.aIProvider.findMany({
      where: {
        createdById: userId,
        status: 'ACTIVE',
      },
    });

    if (providers.length === 0) {
      console.warn('No active AI providers found for user:', userId);
      return null;
    }

    // 2. 确定所需的场景标签和能力标签
    const requiredScenarioTags = [
      COMPETITION_TYPE_TO_SCENARIO[competitionType],
      ...PROBLEM_TYPE_TO_SCENARIO[problemType],
    ];

    const requiredCapabilityTags = TASK_TYPE_TO_CAPABILITY[taskType];

    // 3. 对每个 Provider 进行评分
    const scoredProviders = providers.map((provider) => {
      let score = 0;

      // 基础分：优先级
      score += provider.priority * 10;

      // 能力标签匹配度（每个匹配的标签加 20 分）
      provider.capabilityTags.forEach((tag) => {
        if (requiredCapabilityTags.includes(tag)) {
          score += 20;
        }
      });

      // 场景标签匹配度（每个匹配的标签加 15 分）
      provider.scenarioTags.forEach((tag) => {
        if (requiredScenarioTags.includes(tag)) {
          score += 15;
        }
      });

      // 首选 Provider 额外加分
      if (provider.isDefault) {
        score += 30;
      }

      // 检查调用限制
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // TODO: 实现调用限制检查

      return { provider, score };
    });

    // 4. 选择得分最高的 Provider
    scoredProviders.sort((a, b) => b.score - a.score);

    return scoredProviders[0]?.provider || null;
  } catch (error) {
    console.error('Error selecting optimal provider:', error);
    return null;
  }
}

/**
 * 根据赛题类型选择多个参与讨论的 AI Provider
 * 至少返回 2 个，最多返回 4 个
 */
export async function selectDiscussionProviders(
  competitionType: CompetitionType,
  problemType: ProblemType,
  userId: string
): Promise<AIProvider[]> {
  try {
    // 获取所有活跃的 Provider
    const providers = await prisma.aIProvider.findMany({
      where: {
        createdById: userId,
        status: 'ACTIVE',
      },
    });

    if (providers.length === 0) {
      return [];
    }

    // 确定所需标签
    const requiredScenarioTags = [
      COMPETITION_TYPE_TO_SCENARIO[competitionType],
      ...PROBLEM_TYPE_TO_SCENARIO[problemType],
    ];

    const requiredCapabilityTags = TASK_TYPE_TO_CAPABILITY[TaskType.DISCUSSION];

    // 评分排序
    const scoredProviders = providers.map((provider) => {
      let score = 0;
      score += provider.priority * 10;
      provider.capabilityTags.forEach((tag) => {
        if (requiredCapabilityTags.includes(tag)) {
          score += 20;
        }
      });
      provider.scenarioTags.forEach((tag) => {
        if (requiredScenarioTags.includes(tag)) {
          score += 15;
        }
      });
      if (provider.isDefault) {
        score += 30;
      }
      return { provider, score };
    });

    scoredProviders.sort((a, b) => b.score - a.score);

    // 返回前 2-4 个 Provider
    const maxProviders = Math.min(scoredProviders.length, 4);
    const minProviders = Math.min(scoredProviders.length, 2);

    return scoredProviders.slice(0, Math.max(minProviders, maxProviders)).map((sp) => sp.provider);
  } catch (error) {
    console.error('Error selecting discussion providers:', error);
    return [];
  }
}
