/**
 * AI 辅助任务列表优化服务（客户端版本）
 * 通过 API 调用服务器端的 AI 优化功能
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

/**
 * 优化任务列表（通过 API 调用）
 */
export async function optimizeTaskList(
  tasks: string[],
  taskId?: string,
  providerId?: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/ai/optimize-task-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        tasks,
        providerId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '任务列表优化失败');
    }

    return data.optimizedTasks;
  } catch (error) {
    console.error('优化任务列表失败:', error);
    throw error;
  }
}

/**
 * 完整的优化结果（包含详细信息）
 */
export async function optimizeTaskListWithDetails(
  tasks: string[],
  taskId?: string,
  providerId?: string
): Promise<OptimizationResult> {
  try {
    const response = await fetch('/api/ai/optimize-task-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        tasks,
        providerId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '任务列表优化失败');
    }

    return {
      originalTasks: data.originalTasks || tasks,
      optimizedTasks: data.optimizedTasks || [],
      changes: data.changes || [],
      addedTasks: data.addedTasks || [],
      qualityImprovement: data.qualityImprovement || {
        before: 70,
        after: 75,
        improvement: 5,
      },
      suggestions: data.suggestions || [],
    };
  } catch (error) {
    console.error('优化任务列表失败:', error);
    throw error;
  }
}
