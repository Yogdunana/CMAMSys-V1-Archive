import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 插入优化历史测试数据
 */
async function seedOptimizationData() {
  const taskId = 'cmlnxdhu5000pvf0fa8yrdmbn';

  console.log('🌱 开始插入优化数据...');

  // 清空现有数据
  await prisma.optimizationHistory.deleteMany({ where: { taskId } });
  await prisma.performanceMetrics.deleteMany({ where: { taskId } });
  await prisma.optimizationLog.deleteMany({ where: { taskId } });

  // 插入优化历史数据
  console.log('📊 插入优化历史数据...');
  let bestFitness = 100.0;
  for (let i = 1; i <= 20; i++) {
    bestFitness *= 0.95 + Math.random() * 0.05;
    await prisma.optimizationHistory.create({
      data: {
        taskId,
        iteration: i,
        fitness: 80.0 + Math.random() * 20.0,
        bestSolution: bestFitness,
        populationDiversity: 0.8 - (i * 0.03) + Math.random() * 0.1,
        convergenceRate: 0.5 + (i / 20) * 0.5,
        parameters: {
          populationSize: 100,
          mutationRate: 0.01 + Math.random() * 0.02,
          crossoverRate: 0.7 + Math.random() * 0.2,
        },
        timestamp: new Date(Date.now() - (20 - i) * 5000),
      },
    });
  }

  // 插入性能指标数据
  console.log('⚡ 插入性能指标数据...');
  for (let i = 0; i < 30; i++) {
    await prisma.performanceMetrics.create({
      data: {
        taskId,
        cpuUsage: 30 + Math.random() * 50,
        memoryUsage: 200 + Math.random() * 300,
        gpuUsage: Math.random() > 0.5 ? Math.random() * 80 : null,
        networkUsage: Math.random() * 100,
        diskUsage: Math.random() * 50,
        timestamp: new Date(Date.now() - (30 - i) * 3000),
      },
    });
  }

  // 插入优化日志
  console.log('📝 插入优化日志...');
  const logMessages = [
    { level: 'INFO', source: 'Optimizer', message: '开始优化过程...' },
    { level: 'INFO', source: 'PopulationInit', message: '初始化种群，大小: 100' },
    { level: 'INFO', source: 'Evaluator', message: '评估初始种群适应度...' },
    { level: 'DEBUG', source: 'Optimizer', message: '最优适应度: 95.23' },
    { level: 'INFO', source: 'Selector', message: '选择操作完成' },
    { level: 'DEBUG', source: 'Crossover', message: '交叉操作完成' },
    { level: 'INFO', source: 'Mutator', message: '变异操作完成' },
    { level: 'WARN', source: 'Convergence', message: '种群多样性下降，调整变异率' },
    { level: 'INFO', source: 'Optimizer', message: '迭代 5 完成' },
    { level: 'DEBUG', source: 'Evaluator', message: '当前最优解: 85.67' },
    { level: 'INFO', source: 'Optimizer', message: '迭代 10 完成' },
    { level: 'INFO', source: 'Optimizer', message: '迭代 15 完成' },
    { level: 'DEBUG', source: 'Evaluator', message: '当前最优解: 45.32' },
    { level: 'INFO', source: 'Optimizer', message: '迭代 20 完成' },
    { level: 'INFO', source: 'Optimizer', message: '优化过程完成' },
    { level: 'INFO', source: 'Reporter', message: '生成优化报告...' },
    { level: 'INFO', source: 'Reporter', message: '报告生成完成' },
  ];

  for (let i = 0; i < logMessages.length; i++) {
    await prisma.optimizationLog.create({
      data: {
        taskId,
        level: logMessages[i].level,
        source: logMessages[i].source,
        message: logMessages[i].message,
        timestamp: new Date(Date.now() - (logMessages.length - i) * 10000),
      },
    });
  }

  console.log('✅ 优化数据插入完成');
}

seedOptimizationData()
  .then(() => {
    console.log('🎉 数据插入成功');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 数据插入失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
