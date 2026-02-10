/**
 * CSRF Token Endpoint (v1)
 * GET /api/v1/auth/csrf-token
 */

import { NextRequest } from 'next/server';
import { getCSRFTokenHandler } from '@/lib/csrf';
import { createApiMiddleware, MiddlewarePresets, addSecurityHeaders } from '@/lib/api-middleware';

async function handler(request: NextRequest, context?: { params?: Promise<any> }) {
  const response = await getCSRFTokenHandler(request);
  return addSecurityHeaders(response);
}

// Export with middleware (general preset: standard rate limiting, no CSRF)
export const GET = createApiMiddleware(handler, MiddlewarePresets.general);
