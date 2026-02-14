/**
 * 任务监控服务
 * 定期检查任务状态，发现卡住的任务并尝试恢复
 */

import { PrismaClient } from '@prisma/client';
import { OverallStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 检查卡住的任务
 */
export async function findStuckTasks() {
  const stuckThreshold = 10; // 10 分钟未更新认为卡住
  const stuckThresholdForCodeGeneration = 5; // 代码生成阶段 5 分钟

  const now = new Date();
  const stuckTime = new Date(now.getTime() - stuckThreshold * 60 * 1000);
  const stuckTimeForCodeGeneration = new Date(
    now.getTime() - stuckThresholdForCodeGeneration * 60 * 1000
  );

  // 查找卡住的任务
  const stuckTasks = await prisma.autoModelingTask.findMany({
    where: {
      overallStatus: {
        in: ['DISCUSSING', 'CODING'],
      },
      updatedAt: {
        lt: stuckTime,
      },
    },
    include: {
      codeGeneration: true,
    },
  });

  const results = {
    totalStuck: stuckTasks.length,
    tasks: [] as any[],
  };

  for (const task of stuckTasks) {
    const lastUpdate = task.updatedAt;
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / 60000;

    let reason: string;
    let severity: 'low' | 'medium' | 'high';

    if (
      task.overallStatus === 'CODING' &&
      !task.codeGeneration &&
      lastUpdate < stuckTimeForCodeGeneration
    ) {
      reason = `代码生成状态已超过 ${stuckThresholdForCodeGeneration} 分钟未创建代码记录`;
      severity = 'high';
    } else if (
      task.overallStatus === 'CODING' &&
      task.codeGeneration &&
      task.validationStatus === 'PENDING' &&
      lastUpdate < stuckTimeForCodeGeneration
    ) {
      reason = `代码验证状态已超过 ${stuckThresholdForCodeGeneration} 分钟未完成`;
      severity = 'high';
    } else {
      reason = `任务已 ${diffMinutes.toFixed(1)} 分钟未更新，当前状态: ${task.overallStatus}`;
      severity = 'medium';
    }

    results.tasks.push({
      taskId: task.id,
      taskTitle: task.problemTitle,
      status: task.overallStatus,
      lastUpdate: lastUpdate.toISOString(),
      minutesSinceUpdate: diffMinutes,
      reason,
      severity,
    });
  }

  return results;
}

/**
 * 尝试恢复卡住的任务
 */
export async function recoverStuckTask(taskId: string) {
  try {
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: true,
        discussion: true,
      },
    });

    if (!task) {
      return { success: false, error: '任务不存在' };
    }

    // 根据任务状态决定恢复策略
    switch (task.overallStatus) {
      case 'DISCUSSING':
        // 讨论阶段卡住：重新开始讨论
        await prisma.autoModelingTask.update({
          where: { id: taskId },
          data: {
            discussionStatus: 'IN_PROGRESS',
            updatedAt: new Date(),
          },
        });
        return { success: true, message: '已重置讨论状态' };

      case 'CODING':
        if (!task.codeGeneration) {
          // 代码生成卡住且未生成代码：重新生成代码
          await prisma.autoModelingTask.update({
            where: { id: taskId },
            data: {
              discussionStatus: 'COMPLETED',
              overallStatus: 'CODING',
              progress: 50,
              updatedAt: new Date(),
            },
          });

          // 触发代码生成（需要用户手动重新生成）
          return {
            success: true,
            message: '已重置为代码生成阶段，请手动重新生成代码',
            requiresManualAction: true,
          };
        } else if (task.validationStatus === 'PENDING') {
          // 代码验证卡住：重置验证状态
          await prisma.codeValidation.updateMany({
            where: {
              autoTaskId: taskId,
              status: 'PENDING',
            },
            data: {
              status: 'FAILED',
              errorMessage: '验证超时，已重置',
            },
          });

          return {
            success: true,
            message: '已重置代码验证状态',
          };
        }
        break;

      default:
        return { success: false, error: '任务状态不支持恢复' };
    }

    return { success: false, error: '无法恢复此任务' };
  } catch (error) {
    console.error(`[RecoverStuckTask] 恢复任务失败:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 标记失败的任务
 */
export async function markTaskAsFailed(taskId: string, reason: string) {
  try {
    await prisma.autoModelingTask.update({
      where: { id: taskId },
      data: {
        overallStatus: 'FAILED',
        errorLog: `任务监控检测到卡住: ${reason}`,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error(`[MarkTaskAsFailed] 标记失败失败:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
