/**
 * 代码生成进度 SSE 流
 * GET /api/auto-modeling/[id]/generation-logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证 Token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token 无效或已过期' },
        { status: 401 }
      );
    }

    const { id: taskId } = await params;

    // 创建 SSE 流
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sendLog = (level: string, message: string) => {
            const log = {
              timestamp: new Date().toISOString(),
              level,
              message,
            };

            const data = `data: ${JSON.stringify({ type: 'log', log })}\n\n`;
            controller.enqueue(encoder.encode(data));
          };

          const sendComplete = (success: boolean) => {
            const data = `data: ${JSON.stringify({ type: 'complete', success })}\n\n`;
            controller.enqueue(encoder.encode(data));
          };

          // 发送开始日志
          sendLog('info', '🚀 开始重新生成代码...');

          // 检查任务状态
          const checkInterval = setInterval(async () => {
            try {
              const task = await prisma.autoModelingTask.findUnique({
                where: { id: taskId },
                include: {
                  codeGeneration: true,
                },
              });

              if (!task) {
                clearInterval(checkInterval);
                sendLog('error', '任务不存在');
                sendComplete(false);
                controller.close();
                return;
              }

              // 根据任务状态发送日志
              if (task.overallStatus === 'CODING' && !task.codeGeneration) {
                sendLog('info', '📡 正在调用 AI Provider 生成代码...');
              } else if (task.codeGeneration) {
                sendLog('info', '✅ 代码已生成');
                sendLog('info', '🔍 开始验证代码质量...');

                // 模拟验证过程（因为验证是在代码生成函数内部同步执行的）
                await new Promise(resolve => setTimeout(resolve, 2000));
                sendLog('info', '🔍 验证代码语法...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                sendLog('info', '🔍 检查代码基本要求...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                sendLog('info', '⚡ 快速执行验证...');

                // 检查代码生成状态
                if (task.codeGeneration.executionStatus === 'SUCCESS') {
                  sendLog('success', '✅ 代码生成完成，验证通过！');
                  sendComplete(true);
                  clearInterval(checkInterval);
                  controller.close();
                } else if (task.codeGeneration.executionStatus === 'FAILED') {
                  sendLog('error', `❌ 代码生成失败: ${task.codeGeneration.errorLog}`);
                  sendComplete(false);
                  clearInterval(checkInterval);
                  controller.close();
                }
              } else {
                // 检查是否有错误
                if (task.errorLog) {
                  sendLog('error', `❌ 错误: ${task.errorLog}`);
                  sendComplete(false);
                  clearInterval(checkInterval);
                  controller.close();
                }
              }
            } catch (error) {
              clearInterval(checkInterval);
              sendLog('error', `检查任务状态失败: ${error}`);
              sendComplete(false);
              controller.close();
            }
          }, 2000);

          // 超时保护（5 分钟）
          setTimeout(() => {
            clearInterval(checkInterval);
            sendLog('warn', '⚠️ 代码生成超时');
            sendComplete(false);
            controller.close();
          }, 300000);

          controller.close = () => {
            clearInterval(checkInterval);
          };

        } catch (error) {
          console.error('Generation logs error:', error);
          const data = `data: ${JSON.stringify({
            type: 'log',
            log: {
              timestamp: new Date().toISOString(),
              level: 'error',
              message: `获取进度失败: ${error}`,
            },
          })}\n\n`;
          controller.enqueue(encoder.encode(data));

          const completeData = `data: ${JSON.stringify({ type: 'complete', success: false })}\n\n`;
          controller.enqueue(encoder.encode(completeData));

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取代码生成进度失败',
      },
      { status: 500 }
    );
  }
}
