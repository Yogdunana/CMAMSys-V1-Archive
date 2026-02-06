import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/learning-logs/export
 * Export learning logs as CSV
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const logs = await prisma.learningLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = ['Action', 'Task Type', 'Video ID', 'Video Title', 'Message', 'Status', 'Created At'];
    const rows = logs.map((log) => [
      log.action,
      log.taskType || '',
      log.videoId || '',
      log.videoTitle || '',
      `"${log.message.replace(/"/g, '""')}"`, // Escape quotes
      log.status,
      log.createdAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="learning-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting learning logs:', error);
    return NextResponse.json(
      { error: 'Failed to export learning logs' },
      { status: 500 }
    );
  }
}
