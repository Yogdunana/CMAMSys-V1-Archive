/**
 * AI Providers Types API
 * GET /api/ai-providers/types - Get available provider types
 *
 * NOTE: This feature is currently under development.
 * The AIProvider tables have been simplified for SQLite compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';

/**
 * GET: Get available provider types
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
