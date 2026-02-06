import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProblems() {
  console.log('📝 开始添加题目数据...');

  // 获取 MCM 2025 竞赛
  const mcmCompetition = await prisma.competition.findFirst({
    where: {
      type: 'MCM',
      year: 2025,
    },
  });

  if (!mcmCompetition) {
    console.log('⚠️  未找到 MCM 2025 竞赛');
    return;
  }

  // 创建题目 A
  const problemA = await prisma.problem.upsert({
    where: {
      competitionId_problemNumber: {
        competitionId: mcmCompetition.id,
        problemNumber: 'A',
      },
    },
    update: {},
    create: {
      competitionId: mcmCompetition.id,
      problemNumber: 'A',
      title: 'Mathematical Modeling of Climate Change Impact',
      originalContent: `
# Problem A: Mathematical Modeling of Climate Change Impact

Climate change is one of the most pressing challenges facing humanity today. Your team is tasked with developing mathematical models to understand and predict the impact of climate change on various ecosystems.

## Sub-problems:

1. Develop a model to predict temperature changes over the next 50 years based on current trends.
2. Analyze the impact of temperature changes on agricultural productivity.
3. Propose mitigation strategies and estimate their effectiveness.

## Data Provided:

- Historical temperature data from 1900 to present
- Agricultural yield data for major crops
- CO2 emission data

## Requirements:

- Your model should be mathematically rigorous
- Provide clear assumptions and justifications
- Include sensitivity analysis
- Present results with appropriate visualizations
      `,
      translatedContent: `
# 题目A：气候变化影响的数学建模

气候变化是当今人类面临的最紧迫的挑战之一。您的团队负责开发数学模型，以理解和预测气候变化对各种生态系统的影响。

## 子问题：

1. 开发一个模型，基于当前趋势预测未来50年的温度变化。
2. 分析温度变化对农业生产率的影响。
3. 提出缓解策略并估算其有效性。

## 提供的数据：

- 1900年至今的历史温度数据
- 主要作物的农业产量数据
- CO2排放数据

## 要求：

- 您的模型应在数学上严谨
- 提供清晰的假设和理由
- 包括敏感性分析
- 用适当的可视化展示结果
      `,
      type: 'EVALUATION',
      difficulty: 'medium',
      keywords: ['climate change', 'temperature prediction', 'agriculture', 'mitigation'],
    },
  });

  console.log(`   ✅ 创建题目 A: ${problemA.title}`);

  // 为题目 A 创建系统解法
  const systemSolution = await prisma.solution.upsert({
    where: { id: `${problemA.id}-system` },
    update: {},
    create: {
      id: `${problemA.id}-system`,
      problemId: problemA.id,
      type: 'SYSTEM',
      title: 'CMAMSys 建模系统解法',
      description: '使用随机森林和LSTM混合模型的系统解法',
      content: `
# CMAMSys 建模系统解法

## 方法概述

我们采用随机森林（Random Forest）和长短期记忆网络（LSTM）的混合模型来解决温度预测问题。

## 子问题1：温度预测

使用以下方法：
1. 数据预处理：去除异常值，标准化
2. 特征工程：提取季节性特征、趋势特征
3. 模型训练：使用LSTM模型
4. 结果验证：RMSE = 2.3°C

## 子问题2：农业影响分析

建立作物产量与温度的回归模型：
- 小麦：产量每升高1°C下降5%
- 玉米：产量每升高1°C下降3%

## 子问题3：缓解策略

提出三种策略：
1. 碳中和计划
2. 植树造林
3. 农业技术改进
      `,
      author: 'CMAMSys',
      files: {
        model: '/solutions/mcm2025-a/model.pkl',
        report: '/solutions/mcm2025-a/report.pdf',
        visualizations: [
          '/solutions/mcm2025-a/temp_prediction.png',
          '/solutions/mcm2025-a/agriculture_impact.png',
        ],
      },
    },
  });

  console.log(`   ✅ 创建系统解法: ${systemSolution.title}`);

  // 创建 AI 生成的内容
  const aiPaper = await prisma.aIGeneratedContent.upsert({
    where: { id: `${problemA.id}-paper-1` },
    update: {},
    create: {
      id: `${problemA.id}-paper-1`,
      problemId: problemA.id,
      solutionId: systemSolution.id,
      type: 'PAPER',
      subProblemNumber: '1',
      content: `
# AI Generated Paper: Temperature Prediction Model

## Abstract

This paper presents a novel approach to temperature prediction using deep learning techniques...

## Introduction

Climate change has become a critical issue affecting global ecosystems...

## Methodology

We employed Long Short-Term Memory (LSTM) networks for time series prediction...

## Results

Our model achieved an RMSE of 2.3°C on test data...

## Conclusion

The proposed method demonstrates superior performance in temperature prediction...
      `,
      metadata: {
        model: 'deepseek-chat',
        prompt: 'Write a research paper about temperature prediction',
        tokensUsed: 2456,
        generatedAt: new Date().toISOString(),
      },
    },
  });

  console.log(`   ✅ 创建 AI 论文: ${aiPaper.type}`);

  const aiChart = await prisma.aIGeneratedContent.upsert({
    where: { id: `${problemA.id}-chart-1` },
    update: {},
    create: {
      id: `${problemA.id}-chart-1`,
      problemId: problemA.id,
      solutionId: systemSolution.id,
      type: 'CHART',
      subProblemNumber: '1',
      fileUrl: '/ai/charts/mcm2025-a-temp-forecast.png',
      metadata: {
        chartType: 'line',
        title: 'Temperature Forecast (2025-2075)',
        xAxis: 'Year',
        yAxis: 'Temperature (°C)',
        model: 'deepseek-code',
      },
    },
  });

  console.log(`   ✅ 创建 AI 图表: ${aiChart.type}`);

  console.log('\n📝 题目数据添加完成！');
}

seedProblems()
  .catch((e) => {
    console.error('❌ 添加题目数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
