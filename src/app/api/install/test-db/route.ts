/**
 * 安装向导 - 数据库连接测试 API
 * POST /api/install/test-db
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, useExisting, host, port, name, user, password } = body;
    
    if (useExisting) {
      // 测试连接已有的数据库
      const pool = new Pool({
        host: host || 'localhost',
        port: port || 5432,
        database: name,
        user: user || 'postgres',
        password: password || '',
      });
      
      try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        await pool.end();
        
        return NextResponse.json({
          success: true,
          message: '数据库连接成功',
        });
      } catch (error) {
        await pool.end();
        return NextResponse.json({
          success: false,
          message: `数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
        });
      }
    } else {
      // 将使用 Docker 部署新数据库
      return NextResponse.json({
        success: true,
        message: '将使用 Docker 部署新数据库',
      });
    }
  } catch (error) {
    console.error('数据库测试失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '数据库测试失败',
      },
      { status: 500 }
    );
  }
}
