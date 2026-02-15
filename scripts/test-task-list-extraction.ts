/**
 * 测试任务列表提取逻辑
 */

// 模拟第二轮讨论的消息
const mockDiscussionMessage = `
作为 DeepSeek，我对上述观点进行点评和补充。

【核心思路】
本问题采用多目标优化模型，结合遗传算法和粒子群优化的混合算法来求解。

【创新点】
1. 引入碳交易机制，将碳排放成本纳入目标函数
2. 使用自适应变异率，提高算法收敛速度
3. 实现滚动优化策略，适应实时需求变化

【任务列表】
1. 分析电力需求数据和发电站特性，建立数据预处理流程
2. 构建多目标优化数学模型，包含成本和碳排放约束
3. 实现遗传算法基础框架（种群初始化、选择、交叉、变异）
4. 实现粒子群优化算法，与遗传算法混合
5. 设计求解算法，处理24小时时序优化问题
6. 进行结果验证，对比不同调度方案的优劣
7. 生成电力调度可视化报告，展示24小时调度结果
`;

// 提取任务列表的函数
function extractTaskList(message: string): string[] {
  const taskListMatch = message.match(/【任务列表】([\s\S]*?)(?=\n\n|$|【|$)/);
  if (!taskListMatch) {
    return [];
  }

  const taskListText = taskListMatch[1].trim();
  const taskItems = taskListText.match(/\d+\.\s*([^\n]+)/g);

  if (!taskItems) {
    return [];
  }

  return taskItems.map((item) => {
    // 移除序号和多余空格
    return item.replace(/^\d+\.\s*/, '').trim();
  });
}

console.log('===== 测试任务列表提取功能 =====\n');

console.log('输入消息：');
console.log(mockDiscussionMessage.substring(0, 200) + '...\n');

console.log('提取任务列表：');
const tasks = extractTaskList(mockDiscussionMessage);

if (tasks.length > 0) {
  console.log('✓ 提取成功！\n');
  tasks.forEach((task, idx) => {
    console.log(`${idx + 1}. ${task}`);
  });
  console.log(`\n总计: ${tasks.length} 个任务`);
} else {
  console.log('✗ 提取失败：未找到任务列表');
}

console.log('\n===== 测试完成 =====');
