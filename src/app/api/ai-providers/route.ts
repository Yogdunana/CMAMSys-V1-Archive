/**
 * AI Providers API - List and Create
 * GET /api/ai-providers - List all providers
 * POST /api/ai-providers - Create new provider
 *
 * NOTE: This feature is currently under development.
 * The AIProvider tables have been simplified for SQLite compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';

/**
 * GET: List all AI providers
 * NOTE: This endpoint is currently disabled
 */
export async function GET(request: NextRequest) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code: 'FEATURE_NOT_IMPLEMENTED',
        message: 'AI Providers feature is currently under development',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 501 }
  );
}

/**
 * POST: Create new AI provider
 * NOTE: This endpoint is currently disabled
 */
export async function POST(request: NextRequest) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code: 'FEATURE_NOT_IMPLEMENTED',
        message: 'AI Providers feature is currently under development',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 501 }
  );
}
