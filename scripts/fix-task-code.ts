/**
 * 修复任务代码
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

async function fixTaskCode() {
  try {
    const codeId = 'cmlhob3sf0000jrc48u2htycs';
    const taskId = 'cmlhktmot0000uguh5r4wpvgy';

    // 读取修复后的代码
    const fixedCode = await fs.readFile('/workspace/projects/scripts/fixed-code.py', 'utf-8');

    // 更新数据库中的代码
    await prisma.codeGeneration.update({
      where: { id: codeId },
      data: {
        codeContent: fixedCode,
        description: '城市共享单车投放优化 - 遗传算法求解（已修复）',
        executionStatus: 'PENDING',
        errorLog: null,
      },
    });

    console.log('✅ 代码已修复并更新到数据库');
    console.log('✅ 执行状态已重置');
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTaskCode();
