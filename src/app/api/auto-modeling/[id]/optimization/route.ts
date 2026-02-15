import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/auto-modeling/[id]/optimization
 * 获取优化过程的详细数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // 获取任务详情
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: {
          include: {
            validations: true,
          },
        },
        discussion: {
          include: {
            messages: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    // 构建优化数据
    const optimizationData = {
      taskId: task.id,
      title: task.problemTitle,
      overallStatus: task.overallStatus,
      progress: task.progress,
      timestamp: new Date().toISOString(),

      // 讨论阶段数据
      discussion: {
        id: task.discussionId,
        status: task.discussionStatus,
        messageCount: task.discussion?.messages.length || 0,
        consensus: task.discussion?.summary && typeof task.discussion.summary === 'object'
          ? (task.discussion.summary as any).consensus || null
          : null,
        // 模拟优化历史数据（实际应从数据库获取）
        optimizationHistory: generateOptimizationHistory(),
      },

      // 代码生成数据
      codeGeneration: task.codeGeneration ? {
        id: task.codeGeneration.id,
        language: task.codeGeneration.codeLanguage,
        status: task.codeGeneration.executionStatus,
        codeLength: task.codeGeneration.codeContent.length,
        qualityScore: task.codeGeneration.qualityScore,
        validations: task.codeGeneration.validations.map(v => ({
          id: v.id,
          type: v.validationType,
          status: v.status,
          result: v.result,
          errorMessage: v.errorMessage,
        })),
      } : null,

      // 收敛曲线数据（模拟）
      convergence: generateConvergenceData(),

      // 实时日志（模拟）
      logs: generateRealTimeLogs(task.overallStatus, task.progress),

      // 性能指标
      metrics: {
        executionTime: calculateExecutionTime(task),
        memoryUsage: generateMemoryUsageData(),
        cpuUsage: generateCpuUsageData(),
      },
    };

    return NextResponse.json({
      success: true,
      data: optimizationData,
    });
  } catch (error) {
    console.error('[Optimization API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取优化数据失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 生成优化历史数据（模拟）
 */
function generateOptimizationHistory() {
  const history = [];
  for (let i = 1; i <= 10; i++) {
    history.push({
      iteration: i,
      fitness: Math.random() * 100,
      bestSolution: Math.random() * 100,
      populationDiversity: Math.random(),
      convergenceRate: Math.random(),
      timestamp: new Date(Date.now() - (10 - i) * 1000).toISOString(),
    });
  }
  return history;
}

/**
 * 生成收敛曲线数据（模拟）
 */
function generateConvergenceData() {
  const data = {
    labels: [] as string[],
    datasets: [
      {
        label: '最优解',
        data: [] as number[],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: '平均解',
        data: [] as number[],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  let best = 100;
  let avg = 80;
  for (let i = 0; i < 20; i++) {
    best *= 0.95 + Math.random() * 0.05;
    avg *= 0.93 + Math.random() * 0.07;

    data.labels.push(`Iter ${i + 1}`);
    data.datasets[0].data.push(best);
    data.datasets[1].data.push(avg);
  }

  return data;
}

/**
 * 生成实时日志（模拟）
 */
function generateRealTimeLogs(status: string, progress: number) {
  const logs = [];

  // 根据状态生成不同的日志
  if (status === 'CODING' || status === 'CODE_GENERATION') {
    logs.push({
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: 'INFO',
      message: '开始代码生成阶段...',
      source: 'CodeGenerator',
    });
    logs.push({
      timestamp: new Date(Date.now() - 3000).toISOString(),
      level: 'INFO',
      message: `进度: ${progress}%`,
      source: 'ProgressMonitor',
    });
  }

  if (status === 'VALIDATING') {
    logs.push({
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: 'INFO',
      message: '验证代码语法...',
      source: 'CodeValidator',
    });
    logs.push({
      timestamp: new Date(Date.now() - 2000).toISOString(),
      level: 'INFO',
      message: '验证代码逻辑...',
      source: 'CodeValidator',
    });
  }

  if (status === 'PAPER_GENERATION') {
    logs.push({
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: 'INFO',
      message: '开始论文生成...',
      source: 'PaperGenerator',
    });
    logs.push({
      timestamp: new Date(Date.now() - 3000).toISOString(),
      level: 'INFO',
      message: '生成摘要部分...',
      source: 'PaperGenerator',
    });
  }

  // 添加通用日志
  logs.push({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: `当前状态: ${status}, 进度: ${progress}%`,
    source: 'TaskMonitor',
  });

  return logs;
}

/**
 * 计算执行时间
 */
function calculateExecutionTime(task: any) {
  const now = new Date();
  const created = new Date(task.createdAt);
  const diff = now.getTime() - created.getTime();

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${minutes}m ${seconds}s`;
}

/**
 * 生成内存使用数据（模拟）
 */
function generateMemoryUsageData() {
  return {
    labels: [] as string[],
    datasets: [
      {
        label: '内存使用 (MB)',
        data: [] as number[],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
    ],
  };
}

/**
 * 生成 CPU 使用数据（模拟）
 */
function generateCpuUsageData() {
  return {
    labels: [] as string[],
    datasets: [
      {
        label: 'CPU 使用率 (%)',
        data: [] as number[],
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
      },
    ],
  };
}
