/**
 * 代码执行 API
 * POST /api/code/execute
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken } from '@/lib/jwt';
import { executeCodeSafely, validateCodeSafety, CodeLanguage } from '@/services/code-execution';

export async function POST(request: NextRequest) {
  try {
    // 验证身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyRefreshToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { code, language = 'PYTHON', input } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // 安全检查
    const safetyCheck = validateCodeSafety(code, language as CodeLanguage);
    if (!safetyCheck.isSafe) {
      return NextResponse.json({
        error: 'Code contains dangerous operations',
        issues: safetyCheck.issues,
      }, { status: 403 });
    }

    // 执行代码
    const result = await executeCodeSafely(
      code,
      language as CodeLanguage,
      input
    );

    return NextResponse.json({
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      memoryUsage: result.memoryUsage,
    });
  } catch (error) {
    console.error('Error executing code:', error);
    return NextResponse.json(
      {
        error: 'Code execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
