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
  // 解密 API Key
  const crypto = require('crypto');
  const { decrypt } = require('@/lib/encryption');

  const decryptedKey = decrypt(provider.apiKey);

  // 获取 Provider 配置的模型和端点
  const model = provider.supportedModels?.[0] || 'deepseek-chat';
  const endpoint = provider.endpoint;

  // 构建请求
  try {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decryptedKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false, // 使用非流式调用
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 调用失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 模拟流式输出（一次性发送所有内容）
    onChunk(content);
    onTokenUpdate(content.length);

    return content;
  } catch (error) {
    console.error('AI API error:', error);
    throw new Error(`AI 调用失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
