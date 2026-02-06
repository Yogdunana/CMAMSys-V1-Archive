/**
 * AI Providers API - List and Create
 * GET /api/ai-providers - List all providers
 * POST /api/ai-providers - Create new provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler, asyncHandler, successResponse } from '@/middleware/error-handler';
import * as aiProviderService from '@/services/ai-provider';
import { AIProviderType } from '@prisma/client';
import { verifyAccessToken } from '@/lib/jwt';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ category: 'AI_PROVIDERS_API' });

// Validation schemas
const createProviderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(AIProviderType),
  apiKey: z.string().min(1, 'API key is required'),
  endpoint: z.string().optional(),
  region: z.string().optional(),
  priority: z.number().int().min(0).optional().default(0),
  config: z.any().optional(),
});

// GET: List all AI providers
export const GET = asyncHandler(async (request: NextRequest) => {
  // Verify authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        timestamp: new Date().toISOString(),
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
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  const providers = await aiProviderService.getAllProviders(payload.userId);

  logger.info('Listed AI providers', {
    userId: payload.userId,
    count: providers.length,
  });

  return successResponse(providers);
});

// POST: Create new AI provider
export const POST = asyncHandler(async (request: NextRequest) => {
  // Verify authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        timestamp: new Date().toISOString(),
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
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  // Parse and validate request body
  const body = await request.json();
  const validationResult = createProviderSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validationResult.error.errors,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // Create provider
  const provider = await aiProviderService.createProvider(
    payload.userId,
    validationResult.data
  );

  logger.info('Created AI provider', {
    userId: payload.userId,
    providerId: provider.id,
    type: provider.type,
  });

  return successResponse(provider, 201);
});
