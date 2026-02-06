/**
 * AI Provider API - Single Provider Operations
 * GET /api/ai-providers/[id] - Get provider by ID
 * PUT /api/ai-providers/[id] - Update provider
 * DELETE /api/ai-providers/[id] - Delete provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { asyncHandler, successResponse } from '@/middleware/error-handler';
import * as aiProviderService from '@/services/ai-provider';
import { AIProviderStatus } from '@prisma/client';
import { verifyAccessToken } from '@/lib/jwt';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ category: 'AI_PROVIDER_API' });

// Validation schemas
const updateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  endpoint: z.string().optional(),
  status: z.nativeEnum(AIProviderStatus).optional(),
  priority: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
  config: z.any().optional(),
});

// GET: Get provider by ID
export const GET = asyncHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
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

  const provider = await aiProviderService.getProviderById(
    params.id,
    payload.userId
  );

  if (!provider) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'AI provider not found' },
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  logger.info('Retrieved AI provider', {
    userId: payload.userId,
    providerId: provider.id,
  });

  return successResponse(provider);
});

// PUT: Update provider
export const PUT = asyncHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
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
  const validationResult = updateProviderSchema.safeParse(body);

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

  // Update provider
  const provider = await aiProviderService.updateProvider(
    params.id,
    payload.userId,
    validationResult.data
  );

  logger.info('Updated AI provider', {
    userId: payload.userId,
    providerId: provider.id,
  });

  return successResponse(provider);
});

// DELETE: Delete provider
export const DELETE = asyncHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
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

  await aiProviderService.deleteProvider(params.id, payload.userId);

  logger.info('Deleted AI provider', {
    userId: payload.userId,
    providerId: params.id,
  });

  return successResponse({ message: 'AI provider deleted successfully' });
});
