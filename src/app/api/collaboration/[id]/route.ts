import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * SSE 协作 API
 * 使用 Server-Sent Events 实现实时协作
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paperId } = await params;

  // 设置 SSE 响应头
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const encoder = new TextEncoder();

  // 创建流
  const stream = new ReadableStream({
    async start(controller) {
      let heartbeatInterval: NodeJS.Timeout | null = null;

      try {
        // 发送初始消息
        const welcomeMessage = `data: ${JSON.stringify({
          type: 'connected',
          paperId,
          timestamp: Date.now(),
        })}\n\n`;
        controller.enqueue(encoder.encode(welcomeMessage));

        // 设置心跳，保持连接活跃
        heartbeatInterval = setInterval(() => {
          const heartbeat = `: heartbeat\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        }, 30000);

        // 这里可以添加实际的消息处理逻辑
        // 例如：监听数据库变化、广播用户操作等
      } catch (error) {
        console.error('SSE stream error:', error);
      } finally {
        // 清理
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        controller.close();
      }
    },
    cancel() {
      // 客户端断开连接
      console.log('SSE client disconnected');
    },
  });

  return new Response(stream, { headers });
}

/**
 * POST 请求：发送协作消息
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paperId } = await params;
    const body = await request.json();
    const { type, userId, message } = body;

    // 处理不同类型的协作消息
    switch (type) {
      case 'cursor_update':
        // 保存或广播光标位置
        // 这里可以将光标位置存储到数据库或内存中
        break;

      case 'content_update':
        // 保存内容更新
        // 注意：实际内容更新应该通过另一个 API 端点
        break;

      case 'user_join':
        // 用户加入协作
        break;

      case 'user_leave':
        // 用户离开协作
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown message type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Collaboration API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
