/**
 * AI Providers API - List and Create
 * GET /api/ai-providers - List all providers
 * POST /api/ai-providers - Create new provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/jwt';
import * as aiProviderService from '@/services/ai-provider';
import { ApiResponse, UserRole } from '@/lib/types';

// Validation schemas
const createProviderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum([
    'DEEPSEEK',
    'VOLCENGINE',
    'ALIYUN',
    'OPENAI',
    'ANTHROPIC',
    'ZHIPU',
    'BAIDU',
    'TENCENT',
    'HUNGYUAN',
    'MINIMAX',
    'GOOGLE_GEMINI',
    'AZURE_OPENAI',
    'ALIYUN_QWEN',
    'BAIDU_WENXIN',
    'CUSTOM',
  ]),
  apiKey: z.string().min(1, 'API key is required'),
  endpoint: z.string().optional(),
  region: z.string().optional(),
  priority: z.number().int().min(0).optional().default(0),
  config: z.any().optional(),
});

/**
 * GET: List all AI providers
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
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

    // Get all providers for the user
    const providers = await aiProviderService.getAllProviders(payload.userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: providers,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch AI providers',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Create new AI provider
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createProviderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid provider configuration',
            details: validationResult.error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Create provider
    const provider = await aiProviderService.createProvider(payload.userId, validationResult.data);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: provider,
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
          message: 'Failed to create AI provider',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
