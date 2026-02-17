import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 获取优化状态数据
 * GET /api/auto-modeling/[id]/optimization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const logLevel = searchParams.get('logLevel');
    const logSource = searchParams.get('logSource');
    const logSearch = searchParams.get('logSearch');
    const logLimit = parseInt(searchParams.get('logLimit') || '50');

    // 并行获取所有数据
    const [
      optimizationHistory,
      performanceMetrics,
      logs,
      task,
      discussion,
      codeGeneration,
      generatedPaper,
    ] = await Promise.all([
      // 获取优化历史数据
      prisma.optimizationHistory.findMany({
        where: { taskId },
        orderBy: { iteration: 'asc' },
      }),
      // 获取性能指标数据
      prisma.performanceMetrics.findMany({
        where: { taskId },
        orderBy: { timestamp: 'asc' },
      }),
      // 获取优化日志（带筛选）
      prisma.optimizationLog.findMany({
        where: {
          taskId,
          ...(logLevel && { level: logLevel }),
          ...(logSource && { source: logSource }),
          ...(logSearch && {
            message: {
              contains: logSearch,
              mode: 'insensitive',
            },
          }),
        },
        orderBy: { timestamp: 'desc' },
        take: logLimit,
      }),
      // 获取任务信息
      prisma.autoModelingTask.findUnique({
        where: { id: taskId },
        include: {
          discussion: {
            include: {
              messages: true,
            },
          },
          codeGeneration: true,
        },
      }),
      // 获取讨论（通过 autoTaskId）
      prisma.groupDiscussion.findFirst({
        where: { autoTaskId: taskId },
        include: {
          messages: true,
        },
      }),
      // 获取代码生成（通过 autoTaskId）
      prisma.codeGeneration.findFirst({
        where: { autoTaskId: taskId },
      }),
      // 获取生成的论文（使用 autoTaskId）
      prisma.generatedPaper.findFirst({
        where: { autoTaskId: taskId },
        orderBy: { id: 'desc' },
      }),
    ]);

    // 处理数据格式
    const processedHistory = optimizationHistory.map((h) => ({
      iteration: h.iteration,
      fitness: h.fitness,
      bestSolution: h.bestSolution,
      populationDiversity: h.populationDiversity,
      convergenceRate: h.convergenceRate,
      parameters: h.parameters,
      timestamp: h.timestamp,
    }));

    const processedMetrics = performanceMetrics.map((m) => ({
      cpuUsage: m.cpuUsage,
      memoryUsage: m.memoryUsage,
      gpuUsage: m.gpuUsage,
      networkUsage: m.networkUsage,
      diskUsage: m.diskUsage,
      timestamp: m.timestamp,
    }));

    const processedLogs = logs.map((log) => ({
      id: log.id,
      level: log.level,
      source: log.source,
      message: log.message,
      timestamp: log.timestamp,
    }));

    // 计算收敛曲线数据
    const convergenceData = processedHistory.map((h) => ({
      iteration: h.iteration,
      fitness: h.fitness,
      bestSolution: h.bestSolution,
    }));

    // 计算性能统计数据
    const performanceStats = {
      avgCpuUsage: performanceMetrics.length > 0
        ? performanceMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / performanceMetrics.length
        : 0,
      avgMemoryUsage: performanceMetrics.length > 0
        ? performanceMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / performanceMetrics.length
        : 0,
      maxCpuUsage: performanceMetrics.length > 0
        ? Math.max(...performanceMetrics.map(m => m.cpuUsage))
        : 0,
      maxMemoryUsage: performanceMetrics.length > 0
        ? Math.max(...performanceMetrics.map(m => m.memoryUsage))
        : 0,
      hasGpuData: performanceMetrics.some(m => m.gpuUsage !== null),
      avgGpuUsage: performanceMetrics.filter(m => m.gpuUsage !== null).length > 0
        ? performanceMetrics.filter(m => m.gpuUsage !== null).reduce((sum, m) => sum + m.gpuUsage!, 0) / performanceMetrics.filter(m => m.gpuUsage !== null).length
        : 0,
    };

    // 获取讨论数据（用于回放）
    const discussions = discussion ? [{
      id: discussion.id,
      timestamp: discussion.createdAt,
      participant: discussion.participants ? (typeof discussion.participants === 'string' ? discussion.participants : JSON.stringify(discussion.participants)) : 'Unknown',
      message: discussion.summary ? (typeof discussion.summary === 'string' ? discussion.summary : JSON.stringify(discussion.summary)) : '',
    }] : [];

    // 获取代码生成数据（用于回放）
    const codeGenerations = codeGeneration ? [{
      id: codeGeneration.id,
      timestamp: codeGeneration.createdAt,
      language: codeGeneration.codeLanguage,
      codeLength: codeGeneration.codeContent?.length || 0,
      isValid: true, // CodeGeneration 模型没有 validationStatus 字段
      errorMessage: codeGeneration.errorLog,
    }] : [];

    return NextResponse.json({
      success: true,
      data: {
        taskId,
        status: task?.overallStatus || 'UNKNOWN',
        convergence: {
          data: convergenceData,
          isConverged: processedHistory.length > 0
            ? processedHistory[processedHistory.length - 1].convergenceRate > 0.8
            : false,
          finalFitness: processedHistory.length > 0
            ? processedHistory[processedHistory.length - 1].bestSolution
            : null,
        },
        performance: {
          metrics: processedMetrics,
          stats: performanceStats,
        },
        logs: processedLogs,
        discussions,
        codeGenerations,
        paper: generatedPaper ? {
          id: generatedPaper.id,
          title: generatedPaper.title,
          version: 1, // PaperVersion 模型需要单独查询
          contentLength: generatedPaper.content?.length || 0,
          wordCount: generatedPaper.wordCount || 0,
        } : null,
      },
    });
  } catch (error) {
    console.error('获取优化状态数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取优化状态数据失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
