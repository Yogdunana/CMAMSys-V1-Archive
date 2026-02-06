/**
 * Team Members API
 * POST /api/teams/[id]/members - 邀请成员
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST: 邀请成员加入团队
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    // 验证认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const { email } = body;

    // 验证必填字段
    if (!email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 检查团队是否存在
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Team not found',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 检查用户是否是团队所有者或管理员
    const teamMember = team.members.find((m) => m.userId === payload.userId);
    if (!teamMember || (teamMember.role !== 'OWNER' && teamMember.role !== 'ADMIN')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only team owners and admins can invite members',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 检查团队是否已满
    if (team.members.length >= team.maxMembers) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'TEAM_FULL',
            message: 'Team is already full',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 检查用户是否已经在团队中
    const existingMember = team.members.find((m) => m.userId === user.id);
    if (existingMember) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'ALREADY_MEMBER',
            message: 'User is already a member of this team',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 添加成员到团队
    const teamMemberRecord = await prisma.teamMember.create({
      data: {
        teamId: params.id,
        userId: user.id,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // TODO: 发送邀请邮件通知

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: teamMemberRecord,
        message: 'Member added successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add member',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
