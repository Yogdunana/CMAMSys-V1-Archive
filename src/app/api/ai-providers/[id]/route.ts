/**
 * AI Provider API - Get, Update, Delete
 * GET /api/ai-providers/[id] - Get provider by ID
 * PUT /api/ai-providers/[id] - Update provider
 * DELETE /api/ai-providers/[id] - Delete provider
 *
 * NOTE: This feature is currently under development.
 * The AIProvider tables have been simplified for SQLite compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';

/**
 * GET: Get provider by ID
 * NOTE: This endpoint is currently disabled
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
 * PUT: Update provider
 * NOTE: This endpoint is currently disabled
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
 * DELETE: Delete provider
 * NOTE: This endpoint is currently disabled
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
