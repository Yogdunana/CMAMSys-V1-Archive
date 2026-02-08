/**
 * 群聊讨论流式 API
 * GET /api/discussion/stream/[id]
 */

import { NextRequest } from 'next/server';
import { verifyRefreshToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { streamAIResponse } from '@/services/ai-stream';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 验证身份
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Unauthorized' })}\n\n`));
          controller.close();
          return;
        }

        const payload = await verifyRefreshToken(token);
        if (!payload) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Invalid token' })}\n\n`));
          controller.close();
          return;
        }

        const { id } = await params;

        // 获取讨论信息
        const discussion = await prisma.groupDiscussion.findUnique({
          where: { id },
        });

        if (!discussion) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Discussion not found' })}\n\n`));
          controller.close();
          return;
        }

        // 获取参与讨论的 Providers
        const participants = discussion.participants as Array<{ id: string; name: string }>;
        const providers = participants && Array.isArray(participants)
          ? await prisma.aIProvider.findMany({
              where: {
                id: { in: participants.map((p: any) => p.id) },
              },
            })
          : [];

        if (providers.length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'No providers found' })}\n\n`));
          controller.close();
          return;
        }

        // 为每个 Provider 流式输出
        for (const provider of providers) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'provider_start', provider: { id: provider.id, name: provider.name } })}\n\n`));

          // 构建讨论 Prompt
          const prompt = buildDiscussionPrompt(discussion, provider);

          // 流式输出
          await streamAIResponse(
            provider,
            prompt,
            (chunk) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'chunk', providerId: provider.id, content: chunk })}\n\n`)
              );
            },
            (fullResponse, tokenCount) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'provider_complete', providerId: provider.id, content: fullResponse, tokenCount })}\n\n`)
              );
            },
            (error) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'provider_error', providerId: provider.id, error })}\n\n`)
              );
            }
          );
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'all_complete' })}\n\n`));
        controller.close();
      } catch (error) {
        console.error('Discussion stream error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Internal server error' })}\n\n`));
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
}

/**
 * 构建讨论 Prompt
 */
function buildDiscussionPrompt(discussion: any, provider: any) {
  return `
你是参与数学建模竞赛讨论的 AI 助手。请严格遵守以下规则：

1. 输出格式要求：
   - 核心思路格式：「核心算法 + 创新点 + 可行性分析」
   - 核心算法：明确算法名称、数学模型、计算步骤
   - 创新点：列出 2-3 个创新点，每个创新点需有数学依据
   - 可行性分析：评估算法的时间复杂度、数据需求、实现难度

2. 点评其他 API 观点时：
   - 仅补充缺失的创新点
   - 明确指出分歧点，并提供数学依据
   - 不重复已有观点

3. 内容控制：
   - 输出内容控制在 2000 Token 以内
   - 使用简洁、专业的数学建模术语
   - 避免冗长的开场白和结束语

4. 讨论轮次：
   - 第一轮：输出初始思路
   - 第二轮：点评其他观点并补充

请作为 ${provider.name}（${provider.type}），输出你对这道题目的解题思路。
要求：严格遵循「核心算法 + 创新点 + 可行性分析」的格式，控制在 2000 Token 以内。

赛题信息：
- 竞赛类型：${discussion.competitionType}
- 题目类型：${discussion.problemType}
- 题目标题：${discussion.problemTitle}
`;
}
