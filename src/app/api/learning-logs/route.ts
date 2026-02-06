import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/learning-logs
 * Get learning logs for the authenticated user
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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const logs = await prisma.learningLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.learningLog.count();

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching learning logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/learning-logs
 * Create a new learning log entry
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, taskType, videoId, videoTitle, message, status } = body;

    if (!action || !message) {
      return NextResponse.json(
        { error: 'Action and message are required' },
        { status: 400 }
      );
    }

    const log = await prisma.learningLog.create({
      data: {
        action,
        taskType: taskType || null,
        videoId: videoId || null,
        videoTitle: videoTitle || null,
        message,
        status: status || 'info',
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('Error creating learning log:', error);
    return NextResponse.json(
      { error: 'Failed to create learning log' },
      { status: 500 }
    );
  }
}
