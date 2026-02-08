/**
 * AI API 流式输出服务
 * 使用 SSE 协议实现实时流式响应
 */

import { AIProvider } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * 调用 AI Provider 并返回流式响应
 */
export async function streamAIResponse(
  provider: AIProvider,
  prompt: string,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string, tokenCount: number) => void,
  onError: (error: string) => void
) {
  try {
    const fullResponse = '';
    let tokenCount = 0;

    // 根据 Provider 类型调用不同的 AI 服务
    if (provider.type === 'VOLCENGINE' || provider.type === 'DEEPSEEK' || provider.type === 'ALIYUN') {
      // 使用 coze-coding-dev-sdk 实现
      await streamWithSDK(provider, prompt, onChunk, (tokens) => {
        tokenCount = tokens;
      });
    } else {
      // 其他 Provider 也可以使用 SDK 或直接调用
      await streamWithSDK(provider, prompt, onChunk, () => {});
    }

    onComplete(fullResponse, tokenCount);

    // 更新 Provider 使用统计
    await updateProviderUsage(provider.id, tokenCount);
  } catch (error) {
    console.error('Error streaming AI response:', error);
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * 使用 coze-coding-dev-sdk 实现流式调用
 */
async function streamWithSDK(
  provider: AIProvider,
  prompt: string,
  onChunk: (chunk: string) => void,
  onTokenUpdate: (tokens: number) => void
): Promise<string> {
  // TODO: 实现实际的 SDK 调用
  // 这里需要使用 load_skill 加载 LLM skill 并实现流式调用

  // 模拟流式输出
  const mockResponse = `这是 ${provider.name} 对赛题的详细分析。

核心算法设计：
1. 遗传算法：模拟自然选择过程，通过选择、交叉、变异操作优化解空间
2. 蚁群算法：模拟蚂蚁觅食行为，通过信息素机制找到最优路径
3. 混合算法：结合遗传算法的全局搜索能力和蚁群算法的局部优化能力

创新点：
1. 自适应交叉概率：根据种群多样性动态调整交叉概率
2. 多目标优化：同时优化时间成本、资源消耗和求解质量
3. 并行计算：使用多线程加速算法执行

可行性分析：
- 时间复杂度：O(n²)，适合中等规模问题
- 空间复杂度：O(n)，内存需求较低
- 实现难度：中等，需要精细的参数调优`;

  const chunks = mockResponse.split('\n');
  let currentResponse = '';

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i] + '\n';
    currentResponse += chunk;
    onChunk(chunk);
    onTokenUpdate(currentResponse.length / 4); // 粗略估算 Token

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  }

  return currentResponse;
}

/**
 * 创建 SSE 流式 API 处理函数
 */
export function createSSEHandler() {
  return async (req: Request) => {
    const encoder = new TextEncoder();

    // 创建可读流
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const { searchParams } = new URL(req.url);
          const providerId = searchParams.get('providerId');
          const prompt = searchParams.get('prompt');

          if (!providerId || !prompt) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Missing parameters' })}\n\n`));
            controller.close();
            return;
          }

          const provider = await prisma.aIProvider.findUnique({
            where: { id: providerId },
          });

          if (!provider) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Provider not found' })}\n\n`));
            controller.close();
            return;
          }

          // 发送开始标记
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));

          // 流式输出
          await streamAIResponse(
            provider,
            prompt,
            (chunk) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`)
              );
            },
            (fullResponse, tokenCount) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'complete', content: fullResponse, tokenCount })}\n\n`)
              );
              controller.close();
            },
            (error) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error })}\n\n`));
              controller.close();
            }
          );
        } catch (error) {
          console.error('SSE stream error:', error);
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
  };
}

/**
 * 更新 Provider 使用统计
 */
async function updateProviderUsage(providerId: string, tokenCount: number) {
  try {
    await prisma.aIProvider.update({
      where: { id: providerId },
      data: {
        totalRequests: { increment: 1 },
        totalTokensUsed: { increment: tokenCount },
        lastUsedAt: new Date(),
      },
    });

    // 更新成本管控记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const costControl = await prisma.costControl.findUnique({
      where: {
        providerId_date: {
          providerId,
          date: today,
        },
      },
    });

    if (costControl) {
      await prisma.costControl.update({
        where: { id: costControl.id },
        data: {
          tokensUsed: { increment: tokenCount },
          callsCount: { increment: 1 },
        },
      });
    } else {
      await prisma.costControl.create({
        data: {
          providerId,
          date: today,
          tokensUsed: tokenCount,
          callsCount: 1,
        },
      });
    }
  } catch (error) {
    console.error('Error updating provider usage:', error);
  }
}
