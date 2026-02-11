import { getAutoTaskStatus } from '../src/services/auto-process-coordinator';

async function main() {
  console.log('测试 getAutoTaskStatus 函数导入和调用...\n');

  try {
    const result = await getAutoTaskStatus('cmlhktmot0000uguh5r4wpvgy');
    console.log('Result:', result ? 'found' : 'not found');

    if (result) {
      console.log('\n任务详情:');
      console.log(`ID: ${result.id}`);
      console.log(`标题: ${result.problemTitle}`);
      console.log(`状态: ${result.overallStatus}`);
      console.log(`进度: ${result.progress}%`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
