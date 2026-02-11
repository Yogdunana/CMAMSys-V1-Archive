/**
 * 获取所有自动化任务列表
 */

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.autoModelingTask.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        problemTitle: true,
        competitionType: true,
        problemType: true,
        overallStatus: true,
        progress: true,
        createdAt: true,
        updatedAt: true,
        discussionId: true,
        codeGenerationId: true,
        paperId: true,
      },
    });

    return Response.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return Response.json(
      {
        success: false,
        error: '获取任务列表失败',
      },
      { status: 500 }
    );
  }
}
