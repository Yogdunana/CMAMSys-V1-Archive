/**
 * AI Providers API (v1) - List
 * GET /api/v1/ai-providers - List all providers
 */

import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/lib/types';
import { createApiMiddleware, MiddlewarePresets, addSecurityHeaders } from '@/lib/api-middleware';

async function handler(request: NextRequest, context?: { params?: Promise<any> }) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addSecurityHeaders(response);
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addSecurityHeaders(response);
    }

    // Get all providers for the user
    const providers = await prisma.aIProvider.findMany({
      where: {
        createdById: payload.userId,
        deletedAt: null,
      },
      orderBy: [
        { isDefault: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        priority: true,
        isDefault: true,
        supportedModels: true,
        capabilities: true,
        capabilityTags: true,
        scenarioTags: true,
        dailyTokenLimit: true,
        dailyCallLimit: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
        // Exclude sensitive fields
        apiKey: false,
      },
    });

    const response = new Response(
      JSON.stringify({
        success: true,
        data: providers,
        count: providers.length,
        timestamp: new Date().toISOString(),
      } as ApiResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch AI providers',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return addSecurityHeaders(response);
  }
}

// Export with middleware (general preset: standard rate limiting)
export const GET = createApiMiddleware(handler, MiddlewarePresets.general);
