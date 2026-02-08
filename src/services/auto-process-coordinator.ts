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

    return task;
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
