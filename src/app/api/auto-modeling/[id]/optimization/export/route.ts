import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 导出优化报告
 * GET /api/auto-modeling/[id]/optimization/export
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // 并行获取所有数据
    const [
      optimizationHistory,
      performanceMetrics,
      logs,
      task,
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
      // 获取优化日志
      prisma.optimizationLog.findMany({
        where: { taskId },
        orderBy: { timestamp: 'desc' },
      }),
      // 获取任务信息
      prisma.autoModelingTask.findUnique({
        where: { id: taskId },
      }),
      // 获取生成的论文（使用 autoTaskId）
      prisma.generatedPaper.findFirst({
        where: { autoTaskId: taskId },
        orderBy: { id: 'desc' },
      }),
    ]);

    // 计算统计数据
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
    };

    const finalFitness = optimizationHistory.length > 0
      ? optimizationHistory[optimizationHistory.length - 1].bestSolution
      : null;

    // 构建 HTML 内容
    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>数学建模竞赛优化报告 - ${taskId}</title>
          <style>
            body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            h2 { color: #444; border-bottom: 2px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #007bff; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            tr:hover { background-color: #f5f5f5; }
            .error { color: #dc3545; font-weight: bold; }
            .warning { color: #fd7e14; font-weight: bold; }
            .info { color: #0d6efd; font-weight: bold; }
            .debug { color: #6c757d; }
            ul { padding-left: 20px; }
            li { margin: 10px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #007bff; }
            hr { border: none; border-top: 2px solid #ddd; margin: 30px 0; }
            .stat-box { display: inline-block; padding: 15px; margin: 10px; background-color: #e7f3ff; border-radius: 5px; min-width: 150px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
            .stat-label { font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <h1>数学建模竞赛优化报告</h1>

          <h2>1. 基本信息</h2>
          <div class="stat-box">
            <div class="stat-label">任务 ID</div>
            <div class="stat-value" style="font-size: 18px;">${taskId}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">任务状态</div>
            <div class="stat-value" style="color: ${task?.overallStatus === 'COMPLETED' ? '#28a745' : '#ffc107'};">${task?.overallStatus || 'UNKNOWN'}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">创建时间</div>
            <div class="stat-value" style="font-size: 14px;">${task?.createdAt?.toLocaleString('zh-CN') || 'N/A'}</div>
          </div>

          <h2>2. 优化结果</h2>
          <table>
            <tr><th>指标</th><th>值</th></tr>
            <tr><td>总迭代次数</td><td>${optimizationHistory.length}</td></tr>
            <tr><td>初始适应度</td><td>${optimizationHistory[0]?.fitness.toFixed(4) || 'N/A'}</td></tr>
            <tr><td>最终适应度</td><td>${finalFitness?.toFixed(4) || 'N/A'}</td></tr>
            <tr><td>收敛状态</td><td style="color: ${optimizationHistory.length > 0 && optimizationHistory[optimizationHistory.length - 1].convergenceRate > 0.8 ? '#28a745' : '#dc3545'}; font-weight: bold;">${optimizationHistory.length > 0 && optimizationHistory[optimizationHistory.length - 1].convergenceRate > 0.8 ? '已收敛 ✓' : '未收敛 ✗'}</td></tr>
          </table>

          <h2>3. 性能统计</h2>
          <div class="stat-box">
            <div class="stat-label">平均 CPU 使用率</div>
            <div class="stat-value">${performanceStats.avgCpuUsage.toFixed(2)}%</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">最大 CPU 使用率</div>
            <div class="stat-value">${performanceStats.maxCpuUsage.toFixed(2)}%</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">平均内存使用</div>
            <div class="stat-value">${(performanceStats.avgMemoryUsage / 1024).toFixed(2)} GB</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">最大内存使用</div>
            <div class="stat-value">${(performanceStats.maxMemoryUsage / 1024).toFixed(2)} GB</div>
          </div>

          <h2>4. 优化历史</h2>
          <table>
            <thead>
              <tr>
                <th>迭代</th>
                <th>当前适应度</th>
                <th>最优解</th>
                <th>收敛率</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              ${optimizationHistory.map((h) => `
                <tr>
                  <td>${h.iteration}</td>
                  <td>${h.fitness.toFixed(4)}</td>
                  <td>${h.bestSolution.toFixed(4)}</td>
                  <td>${h.convergenceRate.toFixed(4)}</td>
                  <td>${h.timestamp.toLocaleString('zh-CN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>5. 性能指标</h2>
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>CPU 使用率 (%)</th>
                <th>内存使用 (MB)</th>
                <th>网络使用 (MB/s)</th>
              </tr>
            </thead>
            <tbody>
              ${performanceMetrics.map((m) => `
                <tr>
                  <td>${m.timestamp.toLocaleString('zh-CN')}</td>
                  <td>${m.cpuUsage.toFixed(2)}</td>
                  <td>${m.memoryUsage.toFixed(2)}</td>
                  <td>${(m.networkUsage || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>6. 日志摘要</h2>
          <div class="stat-box">
            <div class="stat-label">总日志数</div>
            <div class="stat-value">${logs.length}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">错误日志</div>
            <div class="stat-value" style="color: #dc3545;">${logs.filter((l) => l.level === 'ERROR').length}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">警告日志</div>
            <div class="stat-value" style="color: #fd7e14;">${logs.filter((l) => l.level === 'WARN').length}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">信息日志</div>
            <div class="stat-value" style="color: #0d6efd;">${logs.filter((l) => l.level === 'INFO').length}</div>
          </div>

          ${logs.length > 0 ? `
            <h3>最新日志</h3>
            <ul>
              ${logs.slice(0, 50).map((log) => `
                <li class="${log.level === 'ERROR' ? 'error' : log.level === 'WARN' ? 'warning' : log.level === 'DEBUG' ? 'debug' : 'info'}">
                  <strong>[${log.level}] ${log.source}:</strong> ${log.message}
                  <br><small style="color: #666;">${log.timestamp.toLocaleString('zh-CN')}</small>
                </li>
              `).join('')}
            </ul>
          ` : ''}

          ${generatedPaper ? `
            <h2>7. 生成论文</h2>
            <table>
              <tr><th>属性</th><th>值</th></tr>
              <tr><td>标题</td><td>${generatedPaper.title}</td></tr>
              <tr><td>字数</td><td>${generatedPaper.wordCount || 0}</td></tr>
              <tr><td>状态</td><td>${generatedPaper.status}</td></tr>
            </table>
          ` : ''}

          <hr>
          <p style="text-align: center; color: #666;">
            <strong>报告生成时间:</strong> ${new Date().toLocaleString('zh-CN')}<br>
            <small>CMAMSys - 数学建模竞赛自动化系统</small>
          </p>
        </body>
      </html>
    `;

    // 返回 HTML 文件
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="optimization-report-${taskId}-${Date.now()}.html"`,
      },
    });
  } catch (error) {
    console.error('导出优化报告失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '导出优化报告失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
