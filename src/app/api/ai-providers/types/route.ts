/**
 * AI Providers Types API
 * GET /api/ai-providers/types - Get available provider types
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';

/**
 * GET: Get available provider types
 */
export async function GET(request: NextRequest) {
  try {
    const providerTypes = [
      {
        value: 'DEEPSEEK',
        label: 'DeepSeek',
        description: 'DeepSeek AI 提供商',
        models: ['deepseek-chat', 'deepseek-coder'],
      },
      {
        value: 'VOLCENGINE',
        label: 'VolcEngine',
        description: '火山引擎（豆包）',
        models: ['doubao-pro-32k', 'doubao-pro-128k'],
      },
      {
        value: 'ALIYUN',
        label: '阿里云',
        description: '阿里云通义千问',
        models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
      },
      {
        value: 'OPENAI',
        label: 'OpenAI',
        description: 'OpenAI GPT 模型',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
      },
      {
        value: 'ANTHROPIC',
        label: 'Anthropic',
        description: 'Anthropic Claude 模型',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
      },
      {
        value: 'ZHIPU',
        label: '智谱 AI',
        description: '智谱 GLM 模型',
        models: ['glm-4', 'glm-4-flash'],
      },
      {
        value: 'BAIDU',
        label: '百度文心',
        description: '百度文心一言',
        models: ['ernie-bot-4', 'ernie-bot-turbo'],
      },
      {
        value: 'TENCENT',
        label: '腾讯混元',
        description: '腾讯混元大模型',
        models: ['hunyuan-lite', 'hunyuan-pro'],
      },
      {
        value: 'GOOGLE_GEMINI',
        label: 'Google Gemini',
        description: 'Google Gemini 模型',
        models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
      },
      {
        value: 'CUSTOM',
        label: '自定义',
        description: '自定义 AI 提供商',
        models: [],
      },
    ];

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: providerTypes,
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
          message: 'Failed to fetch provider types',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
