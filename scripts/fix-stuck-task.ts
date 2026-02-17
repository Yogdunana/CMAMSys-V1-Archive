import prisma from '../src/lib/prisma';

async function fixTask() {
  const taskId = 'cmlhkso8c0001cf20jfprnz4o';

  // 更新任务状态为失败
  const task = await prisma.autoModelingTask.update({
    where: { id: taskId },
    data: {
      overallStatus: 'FAILED',
      validationStatus: 'FAILED',
      errorLog: '校验失败：代码未完全实现讨论中的创新点。建议：1. 检查讨论总结是否完整；2. 提高代码生成质量要求；3. 增加创新点实现细节。',
      progress: 75,
      updatedAt: new Date(),
    },
  });

  console.log('任务状态已更新为 FAILED');
  console.log('任务ID:', task.id);
  console.log('错误信息:', task.errorLog);
}

fixTask().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
