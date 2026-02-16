import { checkTaskListQuality } from '@/services/task-list-quality-check';

// 测试任务列表质量检查
async function testQualityCheck() {
  console.log('开始测试任务列表质量检查...\n');

  // 测试用例 1：优秀的任务列表
  const excellentTaskList = [
    '数据收集与预处理',
    '特征工程与数据清洗',
    '模型选择与训练',
    '模型评估与优化',
    '结果分析与报告撰写',
  ];

  console.log('测试用例 1：优秀的任务列表');
  const report1 = await checkTaskListQuality(excellentTaskList);
  console.log('评分:', report1.overallScore);
  console.log('是否通过:', report1.isValid);
  console.log('问题数量:', report1.issues.length);
  console.log('---\n');

  // 测试用例 2：不完整的任务列表
  const incompleteTaskList = [
    '收集数据',
    '训练模型',
  ];

  console.log('测试用例 2：不完整的任务列表');
  const report2 = await checkTaskListQuality(incompleteTaskList);
  console.log('评分:', report2.overallScore);
  console.log('是否通过:', report2.isValid);
  console.log('问题数量:', report2.issues.length);
  if (report2.issues.length > 0) {
    console.log('问题示例:', report2.issues[0].message);
  }
  console.log('---\n');

  // 测试用例 3：包含不清晰描述的任务列表
  const unclearTaskList = [
    '做点什么',
    '然后做那个',
    '最后搞定',
  ];

  console.log('测试用例 3：包含不清晰描述的任务列表');
  const report3 = await checkTaskListQuality(unclearTaskList);
  console.log('评分:', report3.overallScore);
  console.log('是否通过:', report3.isValid);
  console.log('问题数量:', report3.issues.length);
  if (report3.issues.length > 0) {
    console.log('问题示例:', report3.issues[0].message);
  }
  console.log('---\n');

  // 测试用例 4：标准任务列表
  const standardTaskList = [
    '数据收集',
    '数据预处理',
    '特征工程',
    '模型训练',
    '模型验证',
    '模型部署',
  ];

  console.log('测试用例 4：标准任务列表');
  const report4 = await checkTaskListQuality(standardTaskList);
  console.log('评分:', report4.overallScore);
  console.log('是否通过:', report4.isValid);
  console.log('问题数量:', report4.issues.length);
  console.log('---\n');

  console.log('测试完成！');
}

// 运行测试
testQualityCheck().catch(console.error);
