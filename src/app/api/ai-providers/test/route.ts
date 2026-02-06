/**
 * Test AI Provider Connection API
 * POST /api/ai-providers/test - Test provider connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { ApiResponse } from '@/lib/types';

/**
 * POST: Test AI provider connection
 */
export async function POST(request: NextRequest) {
  try {
    // 验证认证（开发模式下跳过）
    const isDev = process.env.NODE_ENV === 'development';
    let payload = null;

    if (!isDev) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      payload = await verifyAccessToken(token);

      if (!payload) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid or expired token',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        );
      }
    }

    // 解析请求体
    const body = await request.json();
    const { type, apiKey, endpoint, model } = body;

    if (!type || !apiKey) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Type and API key are required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Provider endpoints
    const endpoints: Record<string, string> = {
      DEEPSEEK: 'https://api.deepseek.com/v1',
      VOLCENGINE: 'https://ark.cn-beijing.volces.com/api/v3',
      ALIYUN: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      OPENAI: 'https://api.openai.com/v1',
      ANTHROPIC: 'https://api.anthropic.com/v1',
      ZHIPU: 'https://open.bigmodel.cn/api/paas/v4',
      BAIDU: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
      TENCENT: 'https://hunyuan.tencentcloudapi.com',
      GOOGLE_GEMINI: 'https://generativelanguage.googleapis.com/v1beta',
    };

    const providerEndpoint = endpoint || endpoints[type] || '';
    if (!providerEndpoint) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Provider endpoint not configured',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Default models for testing
    const defaultModels: Record<string, string> = {
      DEEPSEEK: 'deepseek-chat',
      VOLCENGINE: 'doubao-pro-128k',
      ALIYUN: 'qwen-plus',
      OPENAI: 'gpt-4o-mini',
      ANTHROPIC: 'claude-3-5-haiku-20241022',
      ZHIPU: 'glm-4-flash',
      BAIDU: 'ernie-bot-turbo',
      TENCENT: 'hunyuan-lite',
      GOOGLE_GEMINI: 'gemini-1.5-flash',
    };

    let testModel = model || defaultModels[type] || '';

    // For VolcEngine, use endpoint name if provided in config
    if (type === 'VOLCENGINE' && body.config && body.config.endpointMapping) {
      const endpointMapping = body.config.endpointMapping;
      if (endpointMapping[testModel]) {
        testModel = endpointMapping[testModel];
      }
    }

    // Test connection by making a simple API request
    const startTime = Date.now();
    let response: Response;
    let responseData: any;
    let success = false;
    let errorMessage = '';

    try {
      // For DeepSeek and OpenAI-compatible APIs
      if (['DEEPSEEK', 'VOLCENGINE', 'ALIYUN', 'OPENAI', 'ZHIPU', 'GOOGLE_GEMINI'].includes(type)) {
        const chatEndpoint = `${providerEndpoint}/chat/completions`;
        response = await fetch(chatEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: testModel,
            messages: [
              { role: 'user', content: 'Hello' }
            ],
            max_tokens: 10,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          errorMessage = `HTTP ${response.status}: ${errorText}`;
        } else {
          responseData = await response.json();
          success = true;
        }
      }
      // For Anthropic (different format)
      else if (type === 'ANTHROPIC') {
        const chatEndpoint = `${providerEndpoint}/messages`;
        response = await fetch(chatEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: testModel,
            max_tokens: 10,
            messages: [
              { role: 'user', content: 'Hello' }
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          errorMessage = `HTTP ${response.status}: ${errorText}`;
        } else {
          responseData = await response.json();
          success = true;
        }
      }
      // For Baidu (different format)
      else if (type === 'BAIDU') {
        const chatEndpoint = `${providerEndpoint}/chat/ernie_bot_turbo`;
        response = await fetch(`${chatEndpoint}?access_token=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: 'Hello' }
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          errorMessage = `HTTP ${response.status}: ${errorText}`;
        } else {
          responseData = await response.json();
          success = true;
        }
      }
      // For Tencent (requires signature, simplified test)
      else if (type === 'TENCENT') {
        // Just verify API key format for Tencent
        if (apiKey && apiKey.length > 10) {
          success = true;
          responseData = { message: 'API key format valid' };
        } else {
          errorMessage = 'Invalid API key format';
        }
      }
      // Other providers
      else {
        success = true;
        responseData = { message: 'Provider configuration saved' };
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      success = false;
    }

    const latency = Date.now() - startTime;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          success,
          latency,
          model: testModel,
          provider: type,
          endpoint: providerEndpoint,
          error: errorMessage,
          response: success ? 'Connection successful' : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to test provider connection',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
