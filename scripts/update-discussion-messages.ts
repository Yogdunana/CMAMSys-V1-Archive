import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 更新现有讨论消息的内容 ===\n');

  // 获取所有消息内容为空或过短的消息
  const messages = await prisma.discussionMessage.findMany({
    where: {
      OR: [
        { messageContent: '' },
        { messageContent: { startsWith: '模拟回复：' } },
      ],
    },
  });

  console.log(`找到 ${messages.length} 条需要更新的消息\n`);

  let updatedCount = 0;

  for (const message of messages) {
    const provider = await prisma.aIProvider.findUnique({
      where: { id: message.senderProviderId },
    });

    if (!provider) {
      console.log(`跳过消息 ${message.id}: 找不到 Provider`);
      continue;
    }

    // 生成详细的模拟回复
    let newContent = '';

    if (message.round === 1) {
      // 第一轮：初始思路
      switch (provider.type) {
        case 'DEEPSEEK':
          newContent = `【DeepSeek-Reasoner 初始思路】

针对"城市共享单车投放优化问题"，我提出以下解题方案：

1. 核心算法：
   - 采用遗传算法（GA）进行全局搜索
   - 结合模拟退火算法（SA）避免局部最优
   - 使用粒子群优化（PSO）提升收敛速度

2. 创新点：
   - 引入区域需求预测模型，基于历史数据和时间序列分析
   - 设计自适应调度策略，根据实时需求动态调整单车投放
   - 建立成本效益函数，同时考虑运营成本和用户满意度

3. 可行性分析：
   - 时间复杂度：O(n²) 对于20个区域是可接受的
   - 数据需求：历史骑行数据、地理坐标、区域特征
   - 实现难度：中等，需要合理设计适应度函数`;
          break;

        case 'VOLCENGINE':
          newContent = `【豆包 初始思路】

我对这个问题的建议是：

1. 核心算法：
   - 基于贪心算法的站点选址
   - 使用整数线性规划（ILP）进行优化
   - 采用强化学习（RL）进行动态调度

2. 创新点：
   - 建立需求-供给匹配模型，考虑空间和时间维度
   - 引入用户出行模式识别，预测不同区域的需求变化
   - 设计分层调度策略，宏观规划+微观调整

3. 可行性分析：
   - 时间复杂度：O(n³)，但对于小规模问题可行
   - 数据需求：历史订单数据、用户画像、交通流量
   - 实现难度：较高，需要大量训练数据`;
          break;

        case 'ALIYUN':
          newContent = `【阿里百炼 初始思路】

我的解题思路如下：

1. 核心算法：
   - 采用聚类算法（K-Means）进行区域分组
   - 使用多目标优化算法（NSGA-II）同时优化多个目标
   - 基于深度学习（LSTM）进行需求预测

2. 创新点：
   - 建立多目标优化框架，平衡成本、覆盖率和效率
   - 引入图神经网络（GNN）建模区域间的影响关系
   - 设计鲁棒性强的投放策略，应对不确定性

3. 可行性分析：
   - 时间复杂度：O(n log n)，效率较高
   - 数据需求：区域特征、历史需求、约束条件
   - 实现难度：中等，需要合理设置权重参数`;
          break;

        default:
          newContent = `【${provider.name} 初始思路】

针对本题，我建议采用以下方法：
1. 建立数学模型描述问题
2. 选择合适的优化算法
3. 进行数值求解和验证`;
      }
    } else {
      // 第二轮：点评和补充
      switch (provider.type) {
        case 'DEEPSEEK':
          newContent = `【DeepSeek-Reasoner 点评补充】

对上述观点，我有以下补充：

1. 算法改进：
   - 遗传算法容易早熟收敛，建议引入混沌优化机制
   - 模拟退火的退火策略需要根据问题规模调整
   - 可以考虑多种算法的融合，发挥各自优势

2. 创新点补充：
   - 考虑天气因素对需求的影响
   - 引入用户满意度指标，不仅是成本最小化
   - 建立滚动优化机制，定期更新投放策略

3. 数学依据：
   - 使用马尔可夫决策过程（MDP）建模动态调度
   - 拉格朗日松弛法处理多约束问题`;
          break;

        case 'VOLCENGINE':
          newContent = `【豆包 点评补充】

我同意前面的思路，并提出以下建议：

1. 算法补充：
   - 贪心算法局部最优性强，需要全局搜索策略
   - 强化学习需要设计合适的状态空间和奖励函数
   - ILP 对于大规模问题可能计算量大，可考虑启发式方法

2. 创新点补充：
   - 考虑共享单车与公共交通的协同效应
   - 建立需求预测的不确定性模型
   - 引入用户行为偏好分析

3. 数学依据：
   - 使用博弈论建模竞争性需求
   - 蒙特卡洛模拟评估策略效果`;
          break;

        case 'ALIYUN':
          newContent = `【阿里百炼 点评补充】

我前面的观点需要进一步细化：

1. 算法改进：
   - K-Means 的初始聚类中心需要优化
   - NSGA-II 的拥挤度距离计算可以改进
   - LSTM 的网络结构需要根据数据特点设计

2. 创新点补充：
   - 考虑不同时间段的需求模式差异
   - 建立单车的生命周期管理模型
   - 引入环保指标，如碳排放减少量

3. 数学依据：
   - 使用支持向量机（SVM）进行分类预测
   - 主成分分析（PCA）降维处理高维数据`;
          break;

        default:
          newContent = `【${provider.name} 点评补充】

我认同前面的方案，建议进一步优化细节。`;
      }
    }

    // 更新消息
    await prisma.discussionMessage.update({
      where: { id: message.id },
      data: {
        messageContent: newContent,
        tokenCount: newContent.length,
      },
    });

    updatedCount++;
    console.log(`✅ 已更新消息 ${updatedCount}: ${message.senderName} (回合 ${message.round})`);
  }

  console.log(`\n=== 完成 ===`);
  console.log(`共更新 ${updatedCount} 条消息`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
