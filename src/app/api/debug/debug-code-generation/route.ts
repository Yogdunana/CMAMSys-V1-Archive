import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 调试：查看数据库中的代码生成记录
 * GET /api/debug/debug-code-generation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少 taskId 参数' },
        { status: 400 }
      );
    }

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        taskId: true,
        problemTitle: true,
        overallStatus: true,
        discussionStatus: true,
        validationStatus: true,
        codeGenerationId: true,
        progress: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    // 查询所有代码生成记录
    const allCodeGenerations = await prisma.codeGeneration.findMany({
      where: {
        autoTaskId: taskId,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 查询任务关联的代码生成记录
    const linkedCodeGeneration = task.codeGenerationId
      ? await prisma.codeGeneration.findUnique({
          where: { id: task.codeGenerationId },
        })
      : null;

    // 查询所有验证记录
    const allValidations = await prisma.codeValidation.findMany({
      where: {
        autoTaskId: taskId,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 查询讨论记录是否存在
    const hasDiscussion = await prisma.groupDiscussion.findUnique({
      where: { id: task.discussionId || '' },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        task: {
          id: task.id,
          taskId: task.taskId,
          problemTitle: task.problemTitle,
          overallStatus: task.overallStatus,
          discussionStatus: task.discussionStatus,
          validationStatus: task.validationStatus,
          codeGenerationId: task.codeGenerationId,
          discussionId: task.discussionId,
          progress: task.progress,
        },
        codeGenerations: {
          allCount: allCodeGenerations.length,
          records: allCodeGenerations.map((cg) => ({
            id: cg.id,
            autoTaskId: cg.autoTaskId,
            discussionId: cg.discussionId,
            codeLanguage: cg.codeLanguage,
            executionStatus: cg.executionStatus,
            createdAt: cg.createdAt,
            updatedAt: cg.updatedAt,
          })),
          linked: linkedCodeGeneration
            ? {
                id: linkedCodeGeneration.id,
                autoTaskId: linkedCodeGeneration.autoTaskId,
                discussionId: linkedCodeGeneration.discussionId,
                codeLanguage: linkedCodeGeneration.codeLanguage,
                executionStatus: linkedCodeGeneration.executionStatus,
                createdAt: linkedCodeGeneration.createdAt,
                updatedAt: linkedCodeGeneration.updatedAt,
              }
            : null,
        },
        validations: {
          count: allValidations.length,
          records: allValidations.map((v) => ({
            id: v.id,
            autoTaskId: v.autoTaskId,
            codeGenerationId: v.codeGenerationId,
            validationType: v.validationType,
            status: v.status,
            createdAt: v.createdAt,
          })),
        },
        hasDiscussion: !!hasDiscussion,
      },
    });
  } catch (error) {
    console.error('[DebugCodeGeneration] 调试失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '调试失败',
      },
      { status: 500 }
    );
  }
}
