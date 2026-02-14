/**
 * 测试 API 调用
 */

import { getAutoTaskStatus } from '../src/services/auto-process-coordinator';

async function testAPI() {
  const taskId = 'cmlhktmot0000uguh5r4wpvgy';

  try {
    console.log('测试 getAutoTaskStatus 函数...\n');
    const result = await getAutoTaskStatus(taskId);

    if (result) {
      console.log('✅ 任务存在');
      console.log(`ID: ${result.id}`);
      console.log(`标题: ${result.problemTitle}`);
      console.log(`状态: ${result.overallStatus}`);
      console.log(`进度: ${result.progress}%`);
    } else {
      console.log('❌ 任务不存在');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
