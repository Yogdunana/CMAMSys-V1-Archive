/**
 * CSRF Token Endpoint (v1)
 * GET /api/v1/auth/csrf-token
 */

import { NextRequest } from 'next/server';
import { getCSRFTokenHandler } from '@/lib/csrf';
import { createApiMiddleware, MiddlewarePresets, addSecurityHeaders } from '@/lib/api-middleware';
import type { ApiVersion } from '@/lib/api-version';

async function handler(request: NextRequest, version: ApiVersion = 'v1') {
  const response = await getCSRFTokenHandler(request);
  return addSecurityHeaders(response);
}

// Export with middleware (general preset: standard rate limiting, no CSRF)
export const GET = createApiMiddleware(handler, MiddlewarePresets.general);
