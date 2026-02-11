/**
 * 自动回溯机制和主流程协调服务
 * 实现全自动化流程：讨论 → 代码生成 → 校验 → 回溯 → 论文生成
 */

import { OverallStatus, ValidationStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { executeFullDiscussion } from './group-discussion';
import { generateCode, executeCode } from './code-generation';
import { executeFullValidation } from './auto-validation';
import { generatePaper } from './paper-generation';
import { selectOptimalProvider, TaskType } from './auto-provider-selector';

const MAX_RETRY_ROUNDS = 3;

/**
 * 执行完整的全自动化流程
 */
export async function executeFullAutoProcess(
  userId: string,
  competitionType: string,
  problemType: string,
  problemTitle: string,
  problemContent: string,
  paperFormat: string = 'MCM',
  paperLanguage: string = 'ENGLISH'
) {
  try {
    console.log('开始执行全自动化流程...');

    // 1. 创建自动化任务记录
    const autoTask = await prisma.autoModelingTask.create({
      data: {
        competitionType: competitionType as any,
        problemType: problemType as any,
        problemTitle,
        problemContent,
        discussionStatus: 'PENDING' as any,
        validationStatus: 'PENDING' as any,
        paperStatus: 'DRAFT' as any,
        overallStatus: OverallStatus.PENDING,
      },
    });

    console.log(`自动化任务创建成功，ID: ${autoTask.id}`);

    // 2. 群聊讨论阶段
    console.log('开始群聊讨论阶段...');
    autoTask.overallStatus = OverallStatus.DISCUSSING;
    await prisma.autoModelingTask.update({
      where: { id: autoTask.id },
      data: { overallStatus: OverallStatus.DISCUSSING },
    });

    const discussionResult = await executeFullDiscussion(
      competitionType,
      problemType,
      problemTitle,
      problemContent,
      userId,
      autoTask.id
    );

    await prisma.autoModelingTask.update({
      where: { id: autoTask.id },
      data: {
        discussionId: discussionResult.discussion.id,
        discussionStatus: 'COMPLETED' as any,
      },
    });

    console.log('群聊讨论完成');

    // 3. 代码生成阶段
    console.log('开始代码生成阶段...');
    autoTask.overallStatus = OverallStatus.CODING;
    await prisma.autoModelingTask.update({
      where: { id: autoTask.id },
      data: { overallStatus: OverallStatus.CODING },
    });

    const codeGeneration = await generateCode(
      autoTask.id,
      discussionResult.discussion.id,
      discussionResult.summary
    );

    const executionResult = await executeCode(codeGeneration.id);

    await prisma.autoModelingTask.update({
      where: { id: autoTask.id },
      data: {
        codeGenerationId: codeGeneration.id,
      },
    });

    console.log('代码生成完成');

    // 4. 自动校验阶段（带回溯）
    console.log('开始自动校验阶段...');
    autoTask.overallStatus = OverallStatus.VALIDATING;
    await prisma.autoModelingTask.update({
      where: { id: autoTask.id },
      data: { overallStatus: OverallStatus.VALIDATING },
    });

    let validationPassed = false;
    let retryCount = 0;

    while (!validationPassed && retryCount < MAX_RETRY_ROUNDS) {
      console.log(`执行第 ${retryCount + 1} 轮校验...`);

      const validationResults = await executeFullValidation(
        autoTask.id,
        codeGeneration.id,
        discussionResult.summary
      );

      const allPassed =
        validationResults.basic?.status === ValidationStatus.PASSED &&
        validationResults.result?.status === ValidationStatus.PASSED &&
        validationResults.visualization?.status === ValidationStatus.PASSED;

      if (allPassed) {
        console.log('校验全部通过！');
        validationPassed = true;
        await prisma.autoModelingTask.update({
          where: { id: autoTask.id },
          data: {
            validationStatus: 'PASSED' as any,
            overallStatus: OverallStatus.PAPER_GENERATING,
          },
        });
      } else {
        console.log('校验未通过，触发回溯...');
        retryCount++;

        if (retryCount < MAX_RETRY_ROUNDS) {
          autoTask.overallStatus = OverallStatus.RETRYING;
          await prisma.autoModelingTask.update({
            where: { id: autoTask.id },
            data: {
              validationRounds: retryCount,
              overallStatus: OverallStatus.RETRYING,
            },
          });

          // 回溯：重新讨论
          console.log('重新开始群聊讨论...');
          const newDiscussionResult = await executeFullDiscussion(
            competitionType,
            problemType,
            problemTitle,
            problemContent,
            userId,
            autoTask.id
          );

          // 重新生成代码
          console.log('重新生成代码...');
          const newCodeGeneration = await generateCode(
            autoTask.id,
            newDiscussionResult.discussion.id,
            newDiscussionResult.summary
          );

          const newExecutionResult = await executeCode(newCodeGeneration.id);

          await prisma.autoModelingTask.update({
            where: { id: autoTask.id },
            data: {
              discussionId: newDiscussionResult.discussion.id,
              codeGenerationId: newCodeGeneration.id,
            },
          });

          // 更新讨论总结，用于下一轮校验
          discussionResult.summary = newDiscussionResult.summary;
        } else {
          console.log(`已达到最大回溯次数 ${MAX_RETRY_ROUNDS}，停止回溯`);
          await prisma.autoModelingTask.update({
            where: { id: autoTask.id },
            data: {
              validationStatus: 'FAILED' as any,
              errorLog: '达到最大回溯次数，校验仍未通过',
              overallStatus: OverallStatus.FAILED,
            },
          });

          return {
            success: false,
            task: autoTask,
            error: '达到最大回溯次数，校验仍未通过',
          };
        }
      }
    }

    // 5. 论文生成阶段
    if (validationPassed) {
      console.log('开始论文生成阶段...');

      const paper = await generatePaper(
        autoTask.id,
        discussionResult.discussion.id,
        discussionResult.summary,
        executionResult,
        paperFormat as any,
        paperLanguage as any
      );

      await prisma.autoModelingTask.update({
        where: { id: autoTask.id },
        data: {
          paperId: paper.id,
          paperStatus: 'COMPLETED' as any,
          overallStatus: OverallStatus.COMPLETED,
        },
      });

      console.log('论文生成完成！');
      console.log('全自动化流程全部完成！');

      return {
        success: true,
        task: autoTask,
        discussion: discussionResult.discussion,
        codeGeneration,
        paper,
      };
    }

    return {
      success: false,
      task: autoTask,
      error: '未知错误',
    };
  } catch (error) {
    console.error('全自动化流程执行失败:', error);

    // 更新任务状态为失败
    await prisma.autoModelingTask.update({
      where: { id: (await prisma.autoModelingTask.findFirst({}))?.id || '' },
      data: {
        overallStatus: OverallStatus.FAILED,
        errorLog: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

/**
 * 获取自动化任务状态
 */
export async function getAutoTaskStatus(autoTaskId: string) {
  try {
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: autoTaskId },
      include: {
        discussion: {
          include: {
            messages: {
              orderBy: { round: 'asc' },
            },
          },
        },
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    });

    if (!task) {
      return null;
    }

    // 计算任务进度
    let progress = 0;

    // 根据整体状态计算进度
    switch (task.overallStatus) {
      case 'PENDING':
        progress = 0;
        break;
      case 'DISCUSSING':
        // 讨论阶段：根据当前回合计算进度
        if (task.discussion) {
          const roundProgress = (task.discussion.currentRound / task.discussion.maxRounds) * 40;
          progress = roundProgress;
        } else {
          progress = 5;
        }
        break;
      case 'CODING':
        // 代码生成阶段：40-60%
        progress = 50;
        break;
      case 'VALIDATING':
        // 校验阶段：60-80%
        if (task.validations && task.validations.length > 0) {
          const validationProgress = 60 + (Math.min(task.validations.length, 3) / 3) * 20;
          progress = validationProgress;
        } else {
          progress = 65;
        }
        break;
      case 'RETRYING':
        // 回溯优化阶段：70-85%
        progress = 75;
        break;
      case 'PAPER_GENERATING':
        // 论文生成阶段：85-95%
        progress = 90;
        break;
      case 'COMPLETED':
        // 已完成：100%
        progress = 100;
        break;
      case 'FAILED':
        // 失败：保持当前进度
        progress = task.progress || 0;
        break;
      default:
        progress = 0;
    }

    // 更新任务进度
    await prisma.autoModelingTask.update({
      where: { id: autoTaskId },
      data: { progress },
    });

    // 返回包含进度的任务
    return {
      ...task,
      progress,
    };
  } catch (error) {
    console.error('Error getting auto task status:', error);
    return null;
  }
}

/**
 * 取消自动化任务
 */
export async function cancelAutoTask(autoTaskId: string) {
  try {
    await prisma.autoModelingTask.update({
      where: { id: autoTaskId },
      data: {
        overallStatus: OverallStatus.FAILED,
        errorLog: '用户取消任务',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error canceling auto task:', error);
    return { success: false, error };
  }
}
