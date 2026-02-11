/**
 * 获取讨论消息 API
 * GET /api/discussion/[id]/messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;

    // 获取讨论信息
    const discussion = await prisma.groupDiscussion.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: [
            { round: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!discussion) {
      return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 });
    }

    // 格式化消息数据
    const formattedMessages = discussion.messages.map((message) => ({
      id: message.id,
      senderName: message.senderName,
      senderProviderId: message.senderProviderId,
      content: message.messageContent,
      round: message.round,
      role: message.messageType,
      coreAlgorithms: message.coreAlgorithms,
      innovations: message.innovations,
      feasibility: message.feasibility,
      disagreements: message.disagreements,
      tokenCount: message.tokenCount,
      createdAt: message.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        discussion: {
          id: discussion.id,
          title: discussion.discussionTitle,
          status: discussion.status,
          currentRound: discussion.currentRound,
          maxRounds: discussion.maxRounds,
          participants: discussion.participants,
        },
        messages: formattedMessages,
      },
    });
  } catch (error) {
    console.error('Error fetching discussion messages:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
