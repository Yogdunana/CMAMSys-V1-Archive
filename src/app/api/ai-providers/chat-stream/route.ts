/**
 * Streaming Chat API for AI Providers
 * POST /api/ai-providers/chat-stream - Stream chat response from AI provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import * as aiProviderService from '@/services/ai-provider';

/**
 * POST: Stream chat response
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { providerId, messages, model } = body;

    if (!providerId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'providerId and messages are required',
          },
        },
        { status: 400 }
      );
    }

    // Get provider to verify ownership
    const provider = await aiProviderService.getProviderById(providerId, payload.userId);
    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'AI provider not found',
          },
        },
        { status: 404 }
      );
    }

    // Select best model if not specified
    const selectedModel = model || aiProviderService.selectBestModel(provider, {
      modelType: 'CHAT',
      capabilities: ['chat', 'completion'],
    });

    // Call AI with streaming
    const stream = await aiProviderService.callAIStream(
      providerId,
      selectedModel,
      messages,
      {
        modelType: 'CHAT',
        context: 'modeling',
      },
      payload.userId,
      Object.fromEntries(request.headers.entries())
    );

    // Return SSE stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to stream chat response',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
      },
      { status: 500 }
    );
  }
}
