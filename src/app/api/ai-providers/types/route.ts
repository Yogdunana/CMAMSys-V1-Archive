/**
 * AI Providers Types API
 * GET /api/ai-providers/types - Get available provider types
 */

import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler, successResponse } from '@/middleware/error-handler';
import * as aiProviderService from '@/services/ai-provider';

// GET: Get available provider types
export const GET = asyncHandler(async (request: NextRequest) => {
  const providerTypes = aiProviderService.getAvailableProviderTypes();

  return successResponse(providerTypes);
});
