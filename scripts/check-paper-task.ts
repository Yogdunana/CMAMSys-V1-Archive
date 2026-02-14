import prisma from '../src/lib/prisma.ts';

async function checkTaskWithPaper() {
  const task = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhktmot0000uguh5r4wpvgy' },
    include: {
      discussion: true,
      codeGeneration: true,
      validations: true,
      paper: true,
    },
  });

  if (!task) {
    console.log('任务不存在');
    return;
  }

  console.log('任务状态:', task.overallStatus);
  console.log('校验状态:', task.validationStatus);
  console.log('论文状态:', task.paperStatus);
  console.log('代码执行状态:', task.codeGeneration?.executionStatus);
  console.log('代码质量:', task.codeGeneration?.qualityScore);
  console.log('校验结果数:', task.validations?.length || 0);

  if (task.validations && task.validations.length > 0) {
    console.log('\n校验结果:');
    task.validations.forEach((v, i) => {
      console.log(`${i + 1}. ${v.validationType}: ${v.status}`);
      if (v.errorMessage) {
        console.log('   错误:', v.errorMessage);
      }
    });
  }

  if (task.paper) {
    console.log('\n论文内容前500字:');
    console.log(task.paper.content?.substring(0, 500));
  }
}

checkTaskWithPaper().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
