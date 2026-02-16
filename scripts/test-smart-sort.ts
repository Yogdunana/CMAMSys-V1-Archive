import { sortTasksSmartly } from '@/services/smart-task-sorter';

// 测试智能排序
async function testSmartSort() {
  console.log('开始测试智能排序...\n');

  // 测试用例 1：乱序的任务列表
  const unsortedTasks = [
    '结果分析与报告撰写',
    '数据收集',
    '模型训练',
    '数据预处理',
    '模型评估',
  ];

  console.log('原始任务列表:');
  unsortedTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });

  console.log('\n排序后的任务列表:');
  const sortedTasks = await sortTasksSmartly(unsortedTasks);
  sortedTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
  console.log('---\n');

  // 测试用例 2：已经有序的任务列表
  const sortedTasksInput = [
    '数据收集',
    '数据预处理',
    '模型训练',
    '模型评估',
    '结果分析与报告撰写',
  ];

  console.log('已经有序的任务列表:');
  sortedTasksInput.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });

  console.log('\n排序后的任务列表:');
  const sortedTasks2 = await sortTasksSmartly(sortedTasksInput);
  sortedTasks2.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
  console.log('---\n');

  // 测试用例 3：包含中间阶段的任务列表
  const complexTasks = [
    '模型选择',
    '数据收集与清洗',
    '报告撰写',
    '模型优化',
    '特征工程',
    '结果验证',
  ];

  console.log('复杂的任务列表:');
  complexTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });

  console.log('\n排序后的任务列表:');
  const sortedTasks3 = await sortTasksSmartly(complexTasks);
  sortedTasks3.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
  console.log('---\n');

  console.log('测试完成！');
}

// 运行测试
testSmartSort().catch(console.error);
