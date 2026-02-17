import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const LOCK_FILE_PATH = path.join(process.cwd(), 'install.lock');

export async function GET() {
  try {
    // 检查install.lock文件是否存在
    const lockExists = existsSync(LOCK_FILE_PATH);
    
    if (lockExists) {
      // 读取锁文件内容（可选，用于显示安装信息）
      let lockInfo = null;
      try {
        const content = await readFile(LOCK_FILE_PATH, 'utf-8');
        lockInfo = JSON.parse(content);
      } catch (error) {
        // 文件存在但无法读取，仍然视为已安装
      }
      
      return NextResponse.json(
        {
          locked: true,
          message: '系统已完成安装，禁止重复安装',
          installedAt: lockInfo?.installedAt,
          version: lockInfo?.version,
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      locked: false,
      message: '系统尚未安装'
    });
  } catch (error) {
    console.error('检查安装锁失败:', error);
    return NextResponse.json(
      {
        locked: false,
        message: '无法检查安装状态，请检查服务器配置'
      },
      { status: 500 }
    );
  }
}
