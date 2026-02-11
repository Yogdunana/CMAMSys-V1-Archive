/**
 * 成本统计 API
 * GET /api/cost/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 验证身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');

    // 查询成本管控记录（按 Provider 分组）
    const costRecords = await prisma.costControl.findMany({
      where: {},
      orderBy: {
        date: 'desc',
      },
    });

    // 按 Provider 聚合数据
    const providerMap = new Map<string, any>();

    costRecords.forEach(record => {
      if (!providerMap.has(record.providerId)) {
        providerMap.set(record.providerId, {
          providerId: record.providerId,
          providerName: record.providerId, // 暂时使用 ID，可以后续关联 AI Provider 表
          inputTokens: Math.floor(record.tokensUsed * 0.4), // 假设输入占 40%
          outputTokens: Math.floor(record.tokensUsed * 0.6), // 假设输出占 60%
          totalTokens: record.tokensUsed,
          cost: record.costEstimate || 0,
          requests: record.callsCount,
        });
      } else {
        const existing = providerMap.get(record.providerId);
        existing.inputTokens += Math.floor(record.tokensUsed * 0.4);
        existing.outputTokens += Math.floor(record.tokensUsed * 0.6);
        existing.totalTokens += record.tokensUsed;
        existing.cost += record.costEstimate || 0;
        existing.requests += record.callsCount;
      }
    });

    const providers = Array.from(providerMap.values());

    // 计算总统计
    const totalTokens = providers.reduce((sum, p) => sum + p.totalTokens, 0);
    const totalCost = providers.reduce((sum, p) => sum + p.cost, 0);
    const totalRequests = providers.reduce((sum, p) => sum + p.requests, 0);
    const averageTokensPerRequest = totalRequests > 0 ? totalTokens / totalRequests : 0;

    // 找出最常用的 Provider
    const topProvider = providers.length > 0
      ? providers.reduce((max, p) => p.totalTokens > max.totalTokens ? p : max, providers[0]).providerName
      : '-';

    // 计算每小时使用情况（使用成本记录的日期时间）
    const hourlyUsageMap = new Map<number, { tokens: number; cost: number }>();

    costRecords.forEach(record => {
      const date = record.date;
      const hour = date.getHours();

      if (!hourlyUsageMap.has(hour)) {
        hourlyUsageMap.set(hour, { tokens: 0, cost: 0 });
      }

      const hourData = hourlyUsageMap.get(hour)!;
      hourData.tokens += record.tokensUsed;
      hourData.cost += record.costEstimate || 0;
    });

    const hourlyUsage = Array.from(hourlyUsageMap.entries())
      .map(([hour, data]) => ({
        hour,
        tokens: data.tokens,
        cost: data.cost,
      }))
      .sort((a, b) => a.hour - b.hour);

    return NextResponse.json({
      totalTokens,
      totalCost,
      totalRequests,
      averageTokensPerRequest,
      topProvider,
      hourlyUsage,
      providers,
    });
  } catch (error) {
    console.error('Error fetching cost stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cost stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
