/**
 * 代码生成测试工具
 */

import { generateCode } from './code-generation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CodeGenerationTestResult {
  success: boolean;
  taskId: string;
  discussionId: string;
  language: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
  codeGenerationId?: string;
  codeLength?: number;
}

/**
 * 测试代码生成流程
 */
export async function testCodeGeneration(
  taskId: string,
  discussionId: string,
  discussionSummary: any,
  language: string = 'PYTHON',
  userId: string
): Promise<CodeGenerationTestResult> {
  const startTime = Date.now();
  const result: CodeGenerationTestResult = {
    success: false,
    taskId,
    discussionId,
    language,
    startTime,
  };

  try {
    console.log(`[TestCodeGeneration] 开始测试代码生成，任务 ID: ${taskId}`);

    // 检查任务状态
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      result.error = `任务不存在: ${taskId}`;
      return result;
    }

    if (!task.discussionId) {
      result.error = `任务没有关联的讨论`;
      return result;
    }

    // 获取讨论摘要
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id: task.discussionId },
      include: {
        messages: {
          orderBy: { round: 'desc' },
          take: 1,
        },
      },
    });

    if (!discussion) {
      result.error = `讨论不存在: ${task.discussionId}`;
      return result;
    }

    console.log(`[TestCodeGeneration] 获取到讨论摘要，开始生成代码...`);

    // 设置超时保护（5分钟）
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('代码生成超时（5分钟）'));
      }, 5 * 60 * 1000);
    });

    // 执行代码生成
    const codeGeneration = await Promise.race([
      generateCode(taskId, discussionId, discussionSummary, language as any, userId),
      timeoutPromise,
    ]);

    const endTime = Date.now();
    result.endTime = endTime;
    result.duration = endTime - startTime;
    result.codeGenerationId = codeGeneration.id;
    result.codeLength = codeGeneration.codeContent.length;
    result.success = true;

    console.log(
      `[TestCodeGeneration] 代码生成成功，耗时: ${result.duration}ms，代码长度: ${result.codeLength} 字符`
    );

    return result;
  } catch (error) {
    const endTime = Date.now();
    result.endTime = endTime;
    result.duration = endTime - startTime;
    result.error = error instanceof Error ? error.message : '未知错误';

    console.error(`[TestCodeGeneration] 代码生成失败:`, error);

    return result;
  }
}

/**
 * 测试代码执行流程
 */
export async function testCodeExecution(
  taskId: string,
  codeLanguage: string = 'PYTHON'
): Promise<{
  success: boolean;
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
  output?: string;
}> {
  const startTime = Date.now();
  const result: any = {
    success: false,
    startTime,
  };

  try {
    console.log(`[TestCodeExecution] 开始测试代码执行，任务 ID: ${taskId}`);

    // 查询代码生成记录
    const codeGeneration = await prisma.codeGeneration.findFirst({
      where: {
        autoTaskId: taskId,
      },
    });

    if (!codeGeneration) {
      result.error = `未找到代码生成记录`;
      return result;
    }

    // 检查代码执行记录
    const codeValidation = await prisma.codeValidation.findFirst({
      where: {
        codeGenerationId: codeGeneration.id,
        validationType: 'RESULT',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (codeValidation) {
      result.success = codeValidation.status === 'PASSED';
      result.output = codeValidation.result;
      result.error = codeValidation.errorMessage || undefined;
    } else {
      result.error = `未找到代码执行记录`;
    }

    const endTime = Date.now();
    result.endTime = endTime;
    result.duration = endTime - startTime;

    console.log(
      `[TestCodeExecution] 代码执行测试完成，状态: ${result.success ? '成功' : '失败'}`
    );

    return result;
  } catch (error) {
    const endTime = Date.now();
    result.endTime = endTime;
    result.duration = endTime - startTime;
    result.error = error instanceof Error ? error.message : '未知错误';

    console.error(`[TestCodeExecution] 代码执行测试失败:`, error);

    return result;
  }
}

/**
 * 检查任务是否卡住
 */
export async function checkTaskStuck(
  taskId: string
): Promise<{
  isStuck: boolean;
  reason: string | null;
  taskStatus: string;
  lastUpdate: Date;
  minutesSinceUpdate: number;
}> {
  try {
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return {
        isStuck: false,
        reason: null,
        taskStatus: 'NOT_FOUND',
        lastUpdate: new Date(),
        minutesSinceUpdate: 0,
      };
    }

    const now = new Date();
    const lastUpdate = task.updatedAt;
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / 60000;

    let isStuck = false;
    let reason: string | null = null;

    // 检查是否在中间状态卡住
    if (
      (task.overallStatus === 'CODING' || task.overallStatus === 'DISCUSSING') &&
      diffMinutes > 10
    ) {
      isStuck = true;
      reason = `任务已 ${diffMinutes.toFixed(1)} 分钟未更新，当前状态: ${task.overallStatus}`;
    }

    // 检查是否在代码生成阶段卡住
    if (
      task.overallStatus === 'CODING' &&
      !task.codeGenerationId &&
      diffMinutes > 5
    ) {
      isStuck = true;
      reason = `代码生成状态已超过 5 分钟未创建代码记录`;
    }

    // 检查是否在代码验证阶段卡住
    if (
      task.overallStatus === 'CODING' &&
      task.codeGenerationId &&
      task.validationStatus === 'PENDING' &&
      diffMinutes > 5
    ) {
      isStuck = true;
      reason = `代码验证状态已超过 5 分钟未完成`;
    }

    return {
      isStuck,
      reason,
      taskStatus: task.overallStatus,
      lastUpdate,
      minutesSinceUpdate: diffMinutes,
    };
  } catch (error) {
    console.error(`[checkTaskStuck] 检查失败:`, error);
    return {
      isStuck: false,
      reason: error instanceof Error ? error.message : '未知错误',
      taskStatus: 'ERROR',
      lastUpdate: new Date(),
      minutesSinceUpdate: 0,
    };
  }
}
