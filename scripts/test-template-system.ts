import { getAvailableTemplates, applyTemplate } from '@/services/task-templates';

// 测试模板系统
async function testTemplateSystem() {
  console.log('开始测试模板系统...\n');

  // 获取可用模板
  const templates = getAvailableTemplates();
  console.log(`可用模板数量: ${templates.length}\n`);

  templates.forEach(template => {
    console.log(`模板名称: ${template.name}`);
    console.log(`模板标签: ${template.label}`);
    console.log(`模板描述: ${template.description}`);
    console.log(`任务数量: ${template.tasks.length}`);
    console.log('---');
  });

  console.log('\n测试应用模板...\n');

  // 测试应用预测建模模板
  const predictionTasks = await applyTemplate('prediction-template');
  console.log('预测模型模板任务列表:');
  predictionTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
  console.log('---\n');

  // 测试应用优化模型模板
  const optimizationTasks = await applyTemplate('optimization-template');
  console.log('优化问题模板任务列表:');
  optimizationTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
  console.log('---\n');

  // 测试应用通用建模模板
  const generalTasks = await applyTemplate('general-template');
  console.log('通用建模模板任务列表:');
  generalTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
  console.log('---\n');

  console.log('测试完成！');
}

// 运行测试
testTemplateSystem().catch(console.error);
