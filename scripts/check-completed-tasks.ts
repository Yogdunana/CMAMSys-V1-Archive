import prisma from '../src/lib/prisma.ts';

async function checkCompletedTasks() {
  const completedTasks = await prisma.autoModelingTask.findMany({
    where: { overallStatus: 'COMPLETED' },
    include: {
      paper: true,
      codeGeneration: true,
    },
  });

  console.log(`找到 ${completedTasks.length} 个已完成的任务\n`);

  for (const task of completedTasks) {
    console.log('任务ID:', task.id);
    console.log('任务标题:', task.problemTitle);
    console.log('论文ID:', task.paperId);
    console.log('论文内容长度:', task.paper?.content?.length || 0);
    console.log('代码执行状态:', task.codeGeneration?.executionStatus);
    console.log('---');
  }
}

checkCompletedTasks().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
