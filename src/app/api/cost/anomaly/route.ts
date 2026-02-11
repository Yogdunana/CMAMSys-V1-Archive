/**
 * 成本异常检测 API
 * POST /api/cost/anomaly
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { taskId } = body;

    // 查询最近 1 小时的成本记录
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const costRecords = await prisma.costControl.findMany({
      where: {
        date: {
          gte: oneHourAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 聚合每分钟的使用情况
    const minuteMap = new Map<number, { tokens: number; cost: number }>();

    const processRecord = (record: any) => {
      const date = record.date;
      const minute = Math.floor(date.getTime() / 60000);

      if (!minuteMap.has(minute)) {
        minuteMap.set(minute, { tokens: 0, cost: 0 });
      }

      const minuteData = minuteMap.get(minute)!; // 确保 minuteData 不为 undefined
      minuteData.tokens += record.tokensUsed;
      minuteData.cost += record.costEstimate || 0;
    };

    costRecords.forEach(processRecord);

    const minutes = Array.from(minuteMap.entries())
      .map(([minute, data]) => ({
        minute,
        tokens: data.tokens,
        cost: data.cost,
      }))
      .sort((a, b) => a.minute - b.minute);

    // 异常检测逻辑
    let hasAnomaly = false;
    let severity: 'low' | 'medium' | 'high' = 'low';
    let message = '';

    // 1. 检测异常峰值（最近 5 分钟的平均值是否显著高于之前的时间段）
    if (minutes.length >= 10) {
      const recent5 = minutes.slice(-5);
      const previous5 = minutes.slice(-10, -5);

      const recent5Avg = recent5.reduce((sum, m) => sum + m.tokens, 0) / 5;
      const previous5Avg = previous5.reduce((sum, m) => sum + m.tokens, 0) / 5;

      if (previous5Avg > 0 && recent5Avg / previous5Avg > 3) {
        hasAnomaly = true;
        severity = 'high';
        message = `检测到异常峰值！最近 5 分钟的 Token 使用量 (${recent5Avg.toFixed(0)}) 是之前的 ${(
          recent5Avg / previous5Avg
        ).toFixed(1)} 倍`;
      }
    }

    // 2. 检测持续高速使用（连续 10 分钟以上高速使用）
    if (minutes.length >= 10) {
      const highUsageCount = minutes.filter(m => m.tokens > 10000).length;

      if (highUsageCount >= 10) {
        hasAnomaly = true;
        severity = 'medium';
        message = '检测到持续高速使用！最近 10 分钟的 Token 使用量均超过 10,000';
      }
    }

    // 3. 检测突然的增长（单分钟增长超过 5 倍）
    if (minutes.length >= 2) {
      for (let i = 1; i < minutes.length; i++) {
        const current = minutes[i].tokens;
        const previous = minutes[i - 1].tokens;

        if (previous > 0 && current / previous > 5) {
          hasAnomaly = true;
          severity = 'medium';
          message = `检测到突然增长！单分钟 Token 使用量从 ${previous} 增长到 ${current}`;
          break;
        }
      }
    }

    // 4. 检测异常的高成本率（每分钟成本超过 ¥1）
    if (minutes.length > 0) {
      const highCostCount = minutes.filter(m => m.cost > 1).length;

      if (highCostCount > 0) {
        hasAnomaly = true;
        severity = 'high';
        message = `检测到异常高成本率！${highCostCount} 分钟的成本超过 ¥1`;
      }
    }

    return NextResponse.json({
      hasAnomaly,
      severity,
      message,
      stats: {
        totalTokens: minutes.reduce((sum, m) => sum + m.tokens, 0),
        totalCost: minutes.reduce((sum, m) => sum + m.cost, 0),
        averageTokensPerMinute: minutes.length > 0
          ? minutes.reduce((sum, m) => sum + m.tokens, 0) / minutes.length
          : 0,
        peakTokensPerMinute: minutes.length > 0
          ? Math.max(...minutes.map(m => m.tokens))
          : 0,
        minutes: minutes.length,
      },
    });
  } catch (error) {
    console.error('Error detecting cost anomaly:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect cost anomaly',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
