/**
 * AI 流式输出 API
 * GET /api/ai/stream
 */

import { NextRequest } from 'next/server';
import { createSSEHandler } from '@/services/ai-stream';

export async function GET(request: NextRequest) {
  const handler = createSSEHandler();
  return handler(request);
}
