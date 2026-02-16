/**
 * 安装向导 - 环境检查 API
 * GET /api/install/check-env
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const checks: Record<string, boolean> = {};
    
    // 检查 Node.js 版本
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      checks['Node.js 版本'] = majorVersion >= 18;
    } catch {
      checks['Node.js 版本'] = false;
    }
    
    // 检查 pnpm
    try {
      await execAsync('pnpm --version');
      checks['pnpm 包管理器'] = true;
    } catch {
      checks['pnpm 包管理器'] = false;
    }
    
    // 检查必需的环境变量
    const requiredEnvVars = [];
    if (!process.env.JWT_SECRET) requiredEnvVars.push('JWT_SECRET');
    if (!process.env.REFRESH_TOKEN_SECRET) requiredEnvVars.push('REFRESH_TOKEN_SECRET');
    if (!process.env.ENCRYPTION_KEY) requiredEnvVars.push('ENCRYPTION_KEY');
    if (!process.env.CSRF_SECRET) requiredEnvVars.push('CSRF_SECRET');
    if (!process.env.SESSION_SECRET) requiredEnvVars.push('SESSION_SECRET');
    
    checks['环境变量'] = requiredEnvVars.length === 0;
    
    // 检查数据库连接
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$connect();
      checks['数据库连接'] = true;
      await prisma.$disconnect();
    } catch {
      checks['数据库连接'] = false;
    }
    
    // 检查写入权限
    try {
      const fs = await import('fs/promises');
      await fs.access('.env', fs.constants.W_OK);
      checks['文件写入权限'] = true;
    } catch {
      checks['文件写入权限'] = false;
    }
    
    return NextResponse.json({
      success: true,
      checks,
      allPassed: Object.values(checks).every(Boolean),
    });
  } catch (error) {
    console.error('环境检查失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '环境检查失败',
        checks: {},
      },
      { status: 500 }
    );
  }
}
