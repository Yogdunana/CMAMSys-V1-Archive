import { PrismaClient } from '@prisma/client';
import { OverallStatus } from '@prisma/client';
import { executeFullAutoProcess } from '@/services/auto-process-coordinator';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 真实自动化建模测试 ===\n');

  // 1. 创建测试用户
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('找不到管理员用户');
    process.exit(1);
  }

  console.log(`✅ 使用用户: ${admin.username}`);

  // 2. 定义真实的建模任务
  const problemTitle = '城市共享单车投放优化问题';
  const problemContent = `
某城市计划在全市范围内投放共享单车系统，以满足市民短距离出行需求。该城市共有20个主要区域（包括商业区、住宅区、学校、医院等），每个区域的出行需求特征不同。

### 问题
1. 需求预测：基于历史数据和区域特征，预测未来一周各区域的共享单车需求量。
2. 站点选址：在预算限制下，确定共享单车站点的最优位置和数量。
3. 调度优化：设计一套动态调度方案，在满足需求的同时最小化运营成本。

### 数据
- 20个区域的地理位置坐标（经纬度）
- 过去30天各区域的日均骑行次数
- 各区域的人口密度、商业面积、公共交通站点数量
- 单车成本：500元/辆
- 站点建设成本：20000元/个
- 运营成本：2元/天/辆

### 要求
1. 建立数学模型预测需求
2. 确定最优的站点布局和单车投放数量
3. 设计调度算法并评估其效果
4. 给出实施建议

### 约束
- 总预算不超过200万元
- 每个站点至少投放20辆单车
- 单车利用率不低于60%
`;

  console.log('=== 开始执行全自动化流程 ===\n');
  console.log(`✅ 问题标题: ${problemTitle}`);
  console.log(`✅ 问题类型: OPTIMIZATION`);
  console.log(`✅ 赛题类型: CUMCM`);

  // 4. 开始执行自动化流程
  console.log('=== 开始执行全自动化流程 ===\n');
  console.log('流程包含以下阶段：');
  console.log('1. 群聊讨论 - 多个 AI 模型协作讨论解题思路');
  console.log('2. 代码生成 - 基于讨论结果生成 Python/MATLAB 代码');
  console.log('3. 代码执行 - 运行代码并获得结果');
  console.log('4. 自动校验 - 检验代码正确性、结果合理性、可视化效果');
  console.log('5. 回溯优化 - 如果校验失败，重新讨论和生成');
  console.log('6. 论文生成 - 基于最终结果生成完整论文\n');

  try {
    const result = await executeFullAutoProcess(
      admin.id,
      'CUMCM',
      'OPTIMIZATION',
      problemTitle,
      problemContent,
      'CUMCM',
      'CHINESE'
    );

    console.log('\n=== 流程执行完成 ===\n');

    if (result.success) {
      console.log('✅ 任务成功完成！');
      console.log(`✅ 任务 ID: ${result.task.id}`);
      console.log(`✅ 最终状态: ${result.task.overallStatus}`);

      if (result.task.paperId) {
        console.log(`✅ 论文 ID: ${result.task.paperId}`);
      }

      console.log('\n您可以在浏览器中访问以下链接查看结果：');
      console.log(`http://localhost:5000/dashboard/auto-modeling`);
      console.log(`\nTask ID: ${result.task.id}`);
    } else {
      console.log('❌ 任务执行失败');
      console.log(`错误: ${result.error}`);
      console.log(`任务 ID: ${result.task?.id}`);
    }
  } catch (error) {
    console.error('\n❌ 流程执行异常:', error);
    console.log('\n请检查日志以获取更多信息');
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
