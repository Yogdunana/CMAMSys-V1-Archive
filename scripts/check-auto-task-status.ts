import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查自动化任务状态 ===\n');

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
  console.log(`讨论状态: ${autoTask.discussionStatus}`);
  console.log(`校验状态: ${autoTask.validationStatus}`);
  console.log(`论文状态: ${autoTask.paperStatus}`);
  console.log(`进度: ${autoTask.progress}%`);
  console.log(`更新时间: ${autoTask.updatedAt}\n`);

  console.log('### 讨论记录 ###');
  if (autoTask.discussion) {
    console.log(`讨论 ID: ${autoTask.discussion.id}`);
    console.log(`讨论状态: ${autoTask.discussion.status}`);
    console.log(`当前回合: ${autoTask.discussion.currentRound}/${autoTask.discussion.maxRounds}`);
    console.log(`消息数量: ${autoTask.discussion.id ? '' : '无'}\n`);
  } else {
    console.log('❌ 没有讨论记录\n');
  }

  console.log('### 代码生成 ###');
  if (autoTask.codeGeneration) {
    console.log(`代码 ID: ${autoTask.codeGeneration.id}`);
    console.log(`代码语言: ${autoTask.codeGeneration.codeLanguage}`);
    console.log(`执行状态: ${autoTask.codeGeneration.executionStatus}`);
    console.log(`错误日志: ${autoTask.codeGeneration.errorLog || '(无)'}\n`);
  } else {
    console.log('❌ 没有生成代码\n');
  }

  console.log('### 校验记录 ###');
  if (autoTask.validations && autoTask.validations.length > 0) {
    console.log(`校验数量: ${autoTask.validations.length}`);
    autoTask.validations.forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.validationType} - ${v.status}`);
      if (v.errorMessage) {
        console.log(`     错误: ${v.errorMessage}`);
      }
    });
  } else {
    console.log('❌ 没有校验记录\n');
  }

  console.log('### 论文 ###');
  if (autoTask.paper) {
    console.log(`论文 ID: ${autoTask.paper.id}`);
    console.log(`论文状态: ${autoTask.paper.status}\n`);
  } else {
    console.log('❌ 没有论文\n');
  }

  console.log('=== 检查完成 ===');
}

main().finally(() => prisma.$disconnect());
