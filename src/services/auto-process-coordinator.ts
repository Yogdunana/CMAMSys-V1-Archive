/**
 * 自动回溯机制和主流程协调服务
 * 实现全自动化流程：讨论 → 代码生成 → 校验 → 回溯 → 论文生成
 */

import { OverallStatus, ValidationStatus, CodeLanguage } from '@prisma/client';
import prisma from '@/lib/prisma';
import { executeFullDiscussion } from './group-discussion';
import { generateCode, executeCode } from './code-generation';
import { executeFullValidation } from './auto-validation';
import { generatePaper } from './paper-generation';
import { selectOptimalProvider, TaskType } from './auto-provider-selector';
import { callAI } from '@/services/ai-provider';

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
      data: {
        overallStatus: OverallStatus.CODING,
        progress: 45,
      },
    });

    const codeGeneration = await generateCode(
      autoTask.id,
      discussionResult.discussion.id,
      discussionResult.summary,
      CodeLanguage.PYTHON,
      userId
    );

    await prisma.autoModelingTask.update({
      where: { id: autoTask.id },
      data: {
        progress: 50,
      },
    });

    const executionResult = await executeCode(codeGeneration.id);

    await prisma.autoModelingTask.update({
      where: { id: autoTask.id },
      data: {
        codeGenerationId: codeGeneration.id,
        progress: 55,
      },
    });

    console.log('代码生成完成');

    // 4. 自动校验阶段（带回溯）
    console.log('开始自动校验阶段...');
    autoTask.overallStatus = OverallStatus.VALIDATING;
    await prisma.autoModelingTask.update({
      where: { id: autoTask.id },
      data: {
        overallStatus: OverallStatus.VALIDATING,
        progress: 60,
      },
    });

    let validationPassed = false;
    let retryCount = 0;

    while (!validationPassed && retryCount < MAX_RETRY_ROUNDS) {
      console.log(`执行第 ${retryCount + 1} 轮校验...`);

      // 更新校验进度
      await prisma.autoModelingTask.update({
        where: { id: autoTask.id },
        data: {
          progress: 65 + (retryCount * 5),
        },
      });

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

          try {
            // 回溯：重新讨论
            console.log(`[${retryCount}/${MAX_RETRY_ROUNDS}] 重新开始群聊讨论...`);
            const newDiscussionResult = await executeFullDiscussion(
              competitionType,
              problemType,
              problemTitle,
              problemContent,
              userId,
              autoTask.id
            );

            // 重新生成代码
            console.log(`[${retryCount}/${MAX_RETRY_ROUNDS}] 重新生成代码...`);
            const newCodeGeneration = await generateCode(
              autoTask.id,
              newDiscussionResult.discussion.id,
              newDiscussionResult.summary,
              CodeLanguage.PYTHON,
              userId
            );

            console.log(`[${retryCount}/${MAX_RETRY_ROUNDS}] 执行代码...`);
            const newExecutionResult = await executeCode(newCodeGeneration.id);

            // 执行结果讨论阶段
            console.log(`[${retryCount}/${MAX_RETRY_ROUNDS}] 讨论代码执行结果...`);
            const resultDiscussion = await discussExecutionResult(
              competitionType,
              problemType,
              problemTitle,
              newDiscussionResult.summary,
              newCodeGeneration,
              newExecutionResult,
              userId,
              autoTask.id
            );

            // 判断结果讨论的结论
            const summary = resultDiscussion.summary as any;
            const conclusion = summary?.consensus?.conclusion || 'UNKNOWN';
            console.log(`[${retryCount}/${MAX_RETRY_ROUNDS}] 结果讨论结论: ${conclusion}`);

            if (conclusion === 'PASS') {
              // C. 代码按照思路了没问题，结果也没问题 → 退出回溯，进入论文生成
              console.log(`[${retryCount}/${MAX_RETRY_ROUNDS}] 代码和结果都通过，准备生成论文...`);
              validationPassed = true;
              break;
            } else if (conclusion === 'CHANGE_ALGORITHM') {
              // A. 代码按照思路了没问题，结果不行 → 换思路
              console.log(`[${retryCount}/${MAX_RETRY_ROUNDS}] 结果不理想，需要换思路...`);
              // 继续下一轮回溯，会重新讨论并生成新代码
            } else if (conclusion === 'FIX_CODE') {
              // B. 代码有问题，没按照思路走 → 重新修改代码
              console.log(`[${retryCount}/${MAX_RETRY_ROUNDS}] 代码有问题，需要重新生成...`);
              // 继续下一轮回溯，会重新生成代码
            } else {
              // 未知结论，继续回溯
              console.log(`[${retryCount}/${MAX_RETRY_ROUNDS}] 未知结论，继续回溯...`);
            }

            await prisma.autoModelingTask.update({
              where: { id: autoTask.id },
              data: {
                discussionId: newDiscussionResult.discussion.id,
                codeGenerationId: newCodeGeneration.id,
              },
            });

            await prisma.autoModelingTask.update({
              where: { id: autoTask.id },
              data: {
                discussionId: newDiscussionResult.discussion.id,
                codeGenerationId: newCodeGeneration.id,
              },
            });

            // 更新代码生成引用，用于下一轮校验
            codeGeneration.id = newCodeGeneration.id;
            codeGeneration.codeContent = newCodeGeneration.codeContent;
            // executionStatus 是 ExecutionStatus 类型，不能直接赋值
            // 使用 codeExecutionResult 代替

            // 更新讨论总结，用于下一轮校验
            discussionResult.summary = newDiscussionResult.summary;
          } catch (retryError) {
            console.error(`回溯第 ${retryCount} 轮失败:`, retryError);
            // 如果回溯过程中出错，标记任务失败
            await prisma.autoModelingTask.update({
              where: { id: autoTask.id },
              data: {
                validationStatus: 'FAILED' as any,
                errorLog: `回溯第 ${retryCount} 轮失败: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`,
                overallStatus: OverallStatus.FAILED,
              },
            });

            return {
              success: false,
              task: autoTask,
              error: `回溯失败: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`,
            };
          }
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
        paperLanguage as any,
        userId
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
    console.log(`[getAutoTaskStatus] Starting for task: ${autoTaskId}`);

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

    console.log(`[getAutoTaskStatus] Query result:`, task ? 'found' : 'not found');

    if (!task) {
      console.log(`[getAutoTaskStatus] Task not found, returning null`);
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
        // 使用任务中已保存的进度，如果没有则使用默认值
        progress = task.progress || 50;
        break;
      case 'VALIDATING':
        // 校验阶段：60-80%
        // 使用任务中已保存的进度，如果没有则根据校验轮次计算
        if (task.progress) {
          progress = task.progress;
        } else if (task.validations && task.validations.length > 0) {
          const validationProgress = 65 + (Math.min(task.validations.length, 3) * 5);
          progress = validationProgress;
        } else {
          progress = 65;
        }
        break;
      case 'RETRYING':
        // 回溯优化阶段：70-85%
        progress = task.progress || 75;
        break;
      case 'PAPER_GENERATING':
        // 论文生成阶段：85-95%
        progress = task.progress || 90;
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

/**
 * 讨论代码执行结果
 */
export async function discussExecutionResult(
  competitionType: string,
  problemType: string,
  problemTitle: string,
  previousSummary: any,
  codeGeneration: any,
  executionResult: any,
  userId: string,
  autoTaskId: string
) {
  try {
    // 构建结果讨论 Prompt
    const discussionPrompt = `
请讨论以下代码的执行结果，并给出结论。

原始讨论思路：
========================
核心算法：${previousSummary.consensus?.mainAlgorithm || ''}
创新点：${previousSummary.consensus?.keyInnovations || ''}
========================

生成的代码摘要：
========================
${codeGeneration.description || ''}
========================

代码执行结果：
========================
状态：${executionResult.success ? '成功' : '失败'}
输出：${executionResult.output || '无输出'}
运行时间：${executionResult.runtime || 0}秒
${executionResult.error ? `错误信息：${executionResult.error}` : ''}
========================

讨论要求：
1. 评估代码是否完全遵循了原始讨论思路
2. 分析代码执行结果是否合理
3. 如果有问题，判断是什么问题
4. 给出结论和建议

结论选项（必须选择一个）：
- PASS: 代码完全按照思路实现了，执行结果合理，可以进入下一步（论文生成）
- FIX_CODE: 代码没有完全按照思路实现，需要重新生成代码
- CHANGE_ALGORITHM: 代码按照思路实现了，但执行结果不理想，需要换思路（重新讨论）

请给出明确的结论，并说明理由。
`;

    // 创建结果讨论
    const resultDiscussion = await prisma.groupDiscussion.create({
      data: {
        autoTaskId,
        discussionTitle: `代码执行结果讨论 - ${problemTitle}`,
        problemTitle,
        competitionType: competitionType as any,
        problemType: problemType as any,
        status: 'IN_PROGRESS',
        currentRound: 0,
        maxRounds: 1,
        participants: [
          {
            id: 'deepseek-result',
            name: 'DeepSeek-Reasoner',
            type: 'DEEPSEEK',
          },
          {
            id: 'volcengine-result',
            name: '豆包-Volcengine',
            type: 'VOLCENGINE',
          },
        ],
        summary: {
          type: 'RESULT_DISCUSSION',
          discussionPrompt,
          consensus: {
            conclusion: 'UNKNOWN',
            reason: '',
          },
        },
      },
    });

    // 选择合适的 AI Provider 进行结果讨论
    const provider = await selectOptimalProvider(competitionType as any, problemType as any, TaskType.VALIDATION, userId);
    
    if (!provider) {
      throw new Error('No active AI provider found for result discussion');
    }
    
    // 调用 AI 进行讨论
    const { response: aiResponse } = await callAI(
      provider.id,
      provider.supportedModels[0] || 'default',
      '请分析代码执行结果并给出结论。\n\n' + discussionPrompt,
      {
        modelType: 'DISCUSSION' as any,
        taskId: autoTaskId,
        context: 'modeling',
      },
      userId
    );
    
    // 解析 AI 回复
    let conclusion = 'UNKNOWN';
    let reason = '';
    
    if (aiResponse) {
      // 尝试从回复中提取结论
      if (aiResponse.includes('PASS') || aiResponse.includes('通过')) {
        conclusion = 'PASS';
      } else if (aiResponse.includes('FIX_CODE') || aiResponse.includes('修改代码')) {
        conclusion = 'FIX_CODE';
      } else if (aiResponse.includes('CHANGE_ALGORITHM') || aiResponse.includes('换思路')) {
        conclusion = 'CHANGE_ALGORITHM';
      }
      
      reason = aiResponse.substring(0, 500); // 保存前500字符作为理由
    }
    
    // 更新讨论状态
    await prisma.groupDiscussion.update({
      where: { id: resultDiscussion.id },
      data: {
        status: 'COMPLETED',
        summary: {
          type: 'RESULT_DISCUSSION',
          discussionPrompt,
          consensus: {
            conclusion,
            reason,
          },
        },
      },
    });

    console.log(`[结果讨论] 结论: ${conclusion}, 理由: ${reason}`);
    
    return resultDiscussion;
  } catch (error) {
    console.error('Error discussing execution result:', error);
    throw error;
  }
}
