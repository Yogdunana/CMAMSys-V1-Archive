import { checkTaskListQuality, formatQualityReport } from '../src/services/task-list-quality-check';

async function testQualityCheck() {
  console.log('=== 任务列表质量检查测试 ===\n');

  // 测试用例 1: 高质量任务列表
  console.log('测试用例 1: 高质量任务列表');
  const goodTaskList = [
    '分析电力需求数据和发电站特性，建立数据预处理流程',
    '构建多目标优化数学模型，包含成本和碳排放约束',
    '实现遗传算法基础框架（种群初始化、选择、交叉、变异）',
    '设计求解算法，处理24小时时序优化问题',
    '进行结果验证，对比不同调度方案的优劣',
    '生成电力调度可视化报告，展示24小时调度结果',
  ];

  const goodReport = await checkTaskListQuality(goodTaskList);
  console.log(formatQualityReport(goodReport));
  console.log('\n' + '='.repeat(60) + '\n');

  // 测试用例 2: 任务数量不足
  console.log('测试用例 2: 任务数量不足');
  const tooFewTasks = [
    '分析数据',
    '建立模型',
  ];

  const tooFewReport = await checkTaskListQuality(tooFewTasks);
  console.log(formatQualityReport(tooFewReport));
  console.log('\n' + '='.repeat(60) + '\n');

  // 测试用例 3: 缺少关键阶段
  console.log('测试用例 3: 缺少关键阶段');
  const missingPhasesTasks = [
    '分析电力需求数据和发电站特性，建立数据预处理流程',
    '实现遗传算法基础框架（种群初始化、选择、交叉、变异）',
    '生成电力调度可视化报告，展示24小时调度结果',
  ];

  const missingPhasesReport = await checkTaskListQuality(missingPhasesTasks);
  console.log(formatQualityReport(missingPhasesReport));
  console.log('\n' + '='.repeat(60) + '\n');

  // 测试用例 4: 顺序错误
  console.log('测试用例 4: 顺序错误');
  const outOfOrderTasks = [
    '生成可视化报告',
    '进行结果验证',
    '实现算法',
    '分析数据',
    '设计求解方法',
  ];

  const outOfOrderReport = await checkTaskListQuality(outOfOrderTasks);
  console.log(formatQualityReport(outOfOrderReport));
  console.log('\n' + '='.repeat(60) + '\n');

  // 测试用例 5: 描述模糊
  console.log('测试用例 5: 描述模糊');
  const vagueTasks = [
    '处理相关数据',
    '做一些分析',
    '建立模型',
    '进行验证',
    '生成相关报告',
  ];

  const vagueReport = await checkTaskListQuality(vagueTasks);
  console.log(formatQualityReport(vagueReport));
  console.log('\n' + '='.repeat(60) + '\n');

  // 测试用例 6: 实际生成的任务列表
  console.log('测试用例 6: 实际生成的任务列表');
  const actualTaskList = [
    '分析电力需求数据和发电站特性，建立数据预处理流程',
    '构建多目标优化数学模型，包含成本和碳排放约束',
    '实现遗传算法基础框架（种群初始化、选择、交叉、变异）',
    '实现粒子群优化算法，与遗传算法混合',
    '设计求解算法，处理24小时时序优化问题',
    '进行结果验证，对比不同调度方案的优劣',
    '生成电力调度可视化报告，展示24小时调度结果',
  ];

  const actualReport = await checkTaskListQuality(actualTaskList);
  console.log(formatQualityReport(actualReport));
}

testQualityCheck().catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});
