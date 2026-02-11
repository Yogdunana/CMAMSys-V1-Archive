import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查任务卡住的原因 ===\n');

  const autoTask = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
    include: {
      discussion: true,
      codeGeneration: true,
      validations: true,
      paper: true,
    },
  });

  if (!autoTask) {
    console.log('❌ 任务不存在');
    return;
  }

  console.log('### 任务基本信息 ###');
  console.log(`ID: ${autoTask.id}`);
  console.log(`标题: ${autoTask.problemTitle}`);
  console.log(`整体状态: ${autoTask.overallStatus}`);
  console.log(`进度: ${autoTask.progress}%`);
  console.log(`创建时间: ${autoTask.createdAt}`);
  console.log(`更新时间: ${autoTask.updatedAt}`);
  console.log(`错误日志: ${autoTask.errorLog || '(无)'}`);

  const timeDiff = Date.now() - new Date(autoTask.updatedAt).getTime();
  const timeDiffMinutes = Math.floor(timeDiff / 60000);
  console.log(`距离上次更新: ${timeDiffMinutes} 分钟\n`);

  console.log('### 各阶段状态 ###');
  console.log(`讨论状态: ${autoTask.discussionStatus}`);
  console.log(`  - 讨论ID: ${autoTask.discussionId || '(空)'}`);
  console.log(`代码生成ID: ${autoTask.codeGenerationId || '(空)'}`);
  console.log(`  - 代码生成状态: ${autoTask.codeGeneration?.executionStatus || '(无)'}`);
  console.log(`校验状态: ${autoTask.validationStatus}`);
  console.log(`  - 校验记录数: ${autoTask.validations?.length || 0}`);
  console.log(`论文状态: ${autoTask.paperStatus}`);
  console.log(`  - 论文ID: ${autoTask.paperId || '(空)'}`);

  console.log('\n### 问题分析 ###');
  if (autoTask.overallStatus === 'CODING' && autoTask.codeGenerationId) {
    console.log('✅ 任务状态正常：代码已生成，等待进入下一阶段');
    console.log('💡 建议：可以继续执行校验阶段');
  } else if (autoTask.overallStatus === 'CODING' && !autoTask.codeGenerationId) {
    console.log('❌ 问题：代码生成阶段没有生成代码');
    console.log('💡 建议：需要生成代码');
  } else if (autoTask.overallStatus === 'COMPLETED') {
    console.log('✅ 任务已完成');
  } else if (timeDiffMinutes > 30) {
    console.log('⚠️  警告：任务可能已卡住（超过30分钟未更新）');
    console.log('💡 建议：检查错误日志或继续执行');
  } else {
    console.log('✅ 任务状态正常，正在执行中');
  }
}

main().finally(() => prisma.$disconnect());
