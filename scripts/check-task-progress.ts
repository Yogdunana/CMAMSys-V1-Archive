/**
 * 测试任务详情页面的进度显示
 */

import prisma from '@/lib/prisma';

async function main() {
  console.log('=== 检查任务进度 ===\n');

  const task = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
    select: {
      overallStatus: true,
      progress: true,
      problemTitle: true,
    },
  });

  if (!task) {
    console.log('❌ 任务不存在');
    return;
  }

  console.log('任务标题:', task.problemTitle);
  console.log('整体状态:', task.overallStatus);
  console.log('进度:', task.progress + '%');
  console.log();

  if (task.overallStatus === 'COMPLETED' && task.progress === 100) {
    console.log('✅ 任务状态正确！');
    console.log('   - 状态: COMPLETED');
    console.log('   - 进度: 100%');
    console.log('   - 进度条应该显示满格');
  } else {
    console.log('⚠️ 任务状态可能需要更新');
    console.log(`   - 当前状态: ${task.overallStatus}`);
    console.log(`   - 当前进度: ${task.progress}%`);
  }
}

main()
  .catch((error) => {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
