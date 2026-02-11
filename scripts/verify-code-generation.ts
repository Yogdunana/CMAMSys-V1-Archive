import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== 验证代码生成结果 ===\n');

  const autoTask = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
    include: {
      codeGeneration: true,
    },
  });

  if (!autoTask) {
    console.log('❌ 任务不存在');
    return;
  }

  console.log('任务状态:', autoTask.overallStatus);
  console.log('进度:', autoTask.progress, '%');
  console.log('讨论状态:', autoTask.discussionStatus);
  console.log('校验状态:', autoTask.validationStatus);

  if (autoTask.codeGeneration) {
    console.log('\n✅ 代码生成记录:');
    console.log('代码 ID:', autoTask.codeGeneration.id);
    console.log('代码语言:', autoTask.codeGeneration.codeLanguage);
    console.log('执行状态:', autoTask.codeGeneration.executionStatus);
    console.log('质量评分:', autoTask.codeGeneration.qualityScore);
    console.log('描述:', autoTask.codeGeneration.description);
    console.log('\n代码内容:');
    console.log('---');
    console.log(autoTask.codeGeneration.codeContent.substring(0, 500) + '...');
    console.log('---');
    console.log('\n完整代码长度:', autoTask.codeGeneration.codeContent.length, '字符');
  } else {
    console.log('\n❌ 没有代码生成记录');
  }
}

main().finally(() => prisma.$disconnect());
