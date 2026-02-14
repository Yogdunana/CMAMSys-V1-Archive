/**
 * 测试 getAutoTaskStatus 函数
 */

import { getAutoTaskStatus } from '../src/services/auto-process-coordinator';

async function testGetTaskStatus() {
  try {
    console.log('测试 getAutoTaskStatus 函数...\n');
    const taskId = 'cmlhktmot0000uguh5r4wpvgy';

    const result = await getAutoTaskStatus(taskId);

    if (result) {
      console.log('✅ 任务状态获取成功');
      console.log(`ID: ${result.id}`);
      console.log(`标题: ${result.problemTitle}`);
      console.log(`状态: ${result.overallStatus}`);
      console.log(`进度: ${result.progress}%`);
      console.log(`讨论ID: ${result.discussionId}`);
      console.log(`代码生成ID: ${result.codeGenerationId}`);
      console.log(`论文ID: ${result.paperId}`);
    } else {
      console.log('❌ 任务不存在');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testGetTaskStatus();
