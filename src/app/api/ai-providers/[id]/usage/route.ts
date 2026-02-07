import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyRefreshToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;

    // Get provider and check ownership
    const provider = await prisma.aIProvider.findUnique({
      where: { id },
      include: { requests: true },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    if (provider.createdById !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate usage statistics
    const totalRequests = provider.requests.length;
    const successfulRequests = provider.requests.filter(r => r.status === 'success').length;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

    const totalTokens = provider.requests.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
    const avgLatency = totalRequests > 0
      ? provider.requests.reduce((sum, r) => sum + r.latencyMs, 0) / totalRequests
      : 0;

    // Calculate requests in last 7 and 30 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const requestsLast7Days = provider.requests.filter(r => new Date(r.createdAt) >= sevenDaysAgo).length;
    const requestsLast30Days = provider.requests.filter(r => new Date(r.createdAt) >= thirtyDaysAgo).length;

    const usage = {
      totalRequests: provider.totalRequests || totalRequests,
      totalTokens: provider.totalTokensUsed || totalTokens,
      successRate: Number(successRate.toFixed(2)),
      avgLatency: Number(avgLatency.toFixed(2)),
      requestsLast7Days,
      requestsLast30Days,
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching provider usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}
