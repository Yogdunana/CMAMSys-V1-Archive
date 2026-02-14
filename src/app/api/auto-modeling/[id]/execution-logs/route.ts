/**
 * 代码执行日志 SSE 流
 * GET /api/auto-modeling/[id]/execution-logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

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

    // 查询任务
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        codeGeneration: true,
      },
    });

    if (!task || !task.codeGeneration) {
      return NextResponse.json(
        { success: false, error: '任务或代码不存在' },
        { status: 404 }
      );
    }

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
          sendLog('info', '🚀 开始执行代码...');
          sendLog('info', `任务 ID: ${taskId}`);
          sendLog('info', `代码语言: ${task.codeGeneration.codeLanguage}`);

          // 创建临时文件保存代码
          const tempDir = path.join(process.cwd(), 'temp', 'execution');
          await fs.mkdir(tempDir, { recursive: true });

          const timestamp = Date.now();
          const codeFilePath = path.join(tempDir, `task_${taskId}_${timestamp}.py`);

          // 写入代码文件
          await fs.writeFile(codeFilePath, task.codeGeneration.codeContent, 'utf-8');
          sendLog('success', '✅ 代码文件创建成功');

          // 执行代码
          sendLog('info', '⚙️ 正在执行代码...');
          sendLog('info', '⏰ 超时限制: 60 秒');

          const startTime = Date.now();
          const TIMEOUT_MS = 60000; // 60 秒超时

          const pythonProcess = spawn('python3', [codeFilePath], {
            cwd: tempDir,
          });

          // 设置超时保护
          const timeout = setTimeout(() => {
            sendLog('warn', '⚠️ 执行超时，终止进程...');
            pythonProcess.kill('SIGKILL');
          }, TIMEOUT_MS);

          let stdout = '';
          let stderr = '';

          pythonProcess.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            sendLog('info', output.trim());
          });

          pythonProcess.stderr.on('data', (data) => {
            const error = data.toString();
            stderr += error;
            sendLog('warn', error.trim());
          });

          pythonProcess.on('close', async (code, signal) => {
            clearTimeout(timeout);

            // 如果是被超时终止的
            if (signal === 'SIGKILL') {
              const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
              sendLog('error', `❌ 执行超时 (${executionTime}秒)`);
              sendLog('error', `⏱️ 超时限制: ${TIMEOUT_MS / 1000}秒`);

              // 更新代码生成状态
              await prisma.codeGeneration.update({
                where: { id: task.codeGeneration!.id },
                data: {
                  executionStatus: 'FAILED',
                  errorLog: `执行超时（超过${TIMEOUT_MS / 1000}秒）`,
                },
              });

              sendComplete(false);
              controller.close();
              return;
            }

            const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

            // 清理临时文件
            try {
              await fs.unlink(codeFilePath);
              sendLog('info', '🗑️ 临时文件已清理');
            } catch (error) {
              sendLog('warn', '清理临时文件失败');
            }

            if (code === 0) {
              sendLog('success', `✅ 执行成功 (退出码: 0)`);
              sendLog('info', `⏱️ 执行时间: ${executionTime}秒`);
              sendLog('info', `📤 输出长度: ${stdout.length} 字符`);
              if (stdout) {
                sendLog('info', `📋 输出预览: ${stdout.substring(0, 200)}${stdout.length > 200 ? '...' : ''}`);
              }

              // 更新代码生成状态（只更新模型中存在的字段）
              await prisma.codeGeneration.update({
                where: { id: task.codeGeneration!.id },
                data: {
                  executionStatus: 'SUCCESS',
                  errorLog: null,
                },
              });

              sendComplete(true);
            } else {
              sendLog('error', `❌ 执行失败 (退出码: ${code})`);
              sendLog('error', `⏱️ 执行时间: ${executionTime}秒`);
              sendLog('error', `📤 错误输出: ${stderr}`);

              // 更新代码生成状态（只更新模型中存在的字段）
              await prisma.codeGeneration.update({
                where: { id: task.codeGeneration!.id },
                data: {
                  executionStatus: 'FAILED',
                  errorLog: stderr,
                },
              });

              sendComplete(false);
            }

            controller.close();
          });

          pythonProcess.on('error', (error) => {
            clearTimeout(timeout);
            sendLog('error', `❌ 进程错误: ${error.message}`);
            sendComplete(false);
            controller.close();
          });

          // 心跳
          const heartbeat = setInterval(() => {
            controller.enqueue(encoder.encode(': heartbeat\n\n'));
          }, 30000);

          controller.close = () => {
            clearInterval(heartbeat);
            pythonProcess.kill();
          };

        } catch (error) {
          console.error('Execution error:', error);
          const data = `data: ${JSON.stringify({
            type: 'log',
            log: {
              timestamp: new Date().toISOString(),
              level: 'error',
              message: `执行错误: ${error}`,
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
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
