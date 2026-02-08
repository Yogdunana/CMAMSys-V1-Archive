/**
 * 自动校验服务
 * 实现多维度代码校验：基础校验、结果合理性校验、可视化质量校验
 */

import { ValidationType, ValidationStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * 执行完整的多维度校验
 */
export async function executeFullValidation(
  autoTaskId: string,
  codeGenerationId: string,
  discussionSummary: any
) {
  try {
    const validationResults: any = {
      basic: null,
      result: null,
      visualization: null,
      overallStatus: ValidationStatus.PASSED,
    };

    // 1. 基础校验（语法、运行错误、逻辑死循环）
    validationResults.basic = await validateBasic(autoTaskId, codeGenerationId);
    if (validationResults.basic.status !== ValidationStatus.PASSED) {
      validationResults.overallStatus = ValidationStatus.FAILED;
      return validationResults;
    }

    // 2. 结果合理性校验（数学逻辑、赛题匹配度）
    validationResults.result = await validateResult(
      autoTaskId,
      codeGenerationId,
      discussionSummary
    );
    if (validationResults.result.status !== ValidationStatus.PASSED) {
      validationResults.overallStatus = ValidationStatus.FAILED;
      return validationResults;
    }

    // 3. 可视化质量校验（配色、格式、清晰度）
    validationResults.visualization = await validateVisualization(
      autoTaskId,
      codeGenerationId
    );
    if (validationResults.visualization.status !== ValidationStatus.PASSED) {
      validationResults.overallStatus = ValidationStatus.FAILED;
      return validationResults;
    }

    return validationResults;
  } catch (error) {
    console.error('Error executing full validation:', error);
    throw error;
  }
}

/**
 * 基础校验
 */
export async function validateBasic(
  autoTaskId: string,
  codeGenerationId: string
) {
  try {
    const codeGen = await prisma.codeGeneration.findUnique({
      where: { id: codeGenerationId },
    });

    if (!codeGen) {
      throw new Error('Code generation not found');
    }

    const issues = [];

    // 1. 语法检查
    const syntaxErrors = checkSyntax(codeGen.codeContent, codeGen.codeLanguage);
    if (syntaxErrors.length > 0) {
      issues.push({
        type: 'syntax',
        errors: syntaxErrors,
      });
    }

    // 2. 逻辑死循环检测
    const infiniteLoopErrors = checkInfiniteLoops(codeGen.codeContent);
    if (infiniteLoopErrors.length > 0) {
      issues.push({
        type: 'infinite_loop',
        errors: infiniteLoopErrors,
      });
    }

    // 3. 运行测试
    const runErrors = await checkRuntimeErrors(codeGen);
    if (runErrors.length > 0) {
      issues.push({
        type: 'runtime',
        errors: runErrors,
      });
    }

    // 创建校验记录
    const validation = await prisma.codeValidation.create({
      data: {
        autoTaskId,
        codeGenerationId,
        validationType: ValidationType.BASIC,
        status: issues.length === 0 ? ValidationStatus.PASSED : ValidationStatus.FAILED,
        result: issues.length === 0 ? { passed: true } : { issues },
        errorMessage: issues.length > 0 ? JSON.stringify(issues, null, 2) : null,
        validationDetails: `基础校验完成，发现 ${issues.length} 个问题`,
      },
    });

    return validation;
  } catch (error) {
    console.error('Error validating basic:', error);
    throw error;
  }
}

/**
 * 结果合理性校验
 */
export async function validateResult(
  autoTaskId: string,
  codeGenerationId: string,
  discussionSummary: any
) {
  try {
    const codeGen = await prisma.codeGeneration.findUnique({
      where: { id: codeGenerationId },
    });

    if (!codeGen) {
      throw new Error('Code generation not found');
    }

    const issues = [];

    // 1. 数学逻辑检查
    const mathErrors = checkMathematicalLogic(
      codeGen.codeContent,
      discussionSummary
    );
    if (mathErrors.length > 0) {
      issues.push({
        type: 'math_logic',
        errors: mathErrors,
      });
    }

    // 2. 数值范围检查
    const rangeErrors = checkNumericalRange(codeGen);
    if (rangeErrors.length > 0) {
      issues.push({
        type: 'numerical_range',
        errors: rangeErrors,
      });
    }

    // 3. 赛题匹配度检查
    const matchErrors = checkProblemMatch(codeGen, discussionSummary);
    if (matchErrors.length > 0) {
      issues.push({
        type: 'problem_match',
        errors: matchErrors,
      });
    }

    // 创建校验记录
    const validation = await prisma.codeValidation.create({
      data: {
        autoTaskId,
        codeGenerationId,
        validationType: ValidationType.RESULT,
        status: issues.length === 0 ? ValidationStatus.PASSED : ValidationStatus.FAILED,
        result: issues.length === 0 ? { passed: true } : { issues },
        errorMessage: issues.length > 0 ? JSON.stringify(issues, null, 2) : null,
        validationDetails: `结果合理性校验完成，发现 ${issues.length} 个问题`,
      },
    });

    return validation;
  } catch (error) {
    console.error('Error validating result:', error);
    throw error;
  }
}

/**
 * 可视化质量校验
 */
export async function validateVisualization(
  autoTaskId: string,
  codeGenerationId: string
) {
  try {
    const codeGen = await prisma.codeGeneration.findUnique({
      where: { id: codeGenerationId },
    });

    if (!codeGen) {
      throw new Error('Code generation not found');
    }

    const issues = [];

    // 1. 配色方案检查
    const colorErrors = checkColorScheme(codeGen.codeContent);
    if (colorErrors.length > 0) {
      issues.push({
        type: 'color_scheme',
        errors: colorErrors,
      });
    }

    // 2. 格式检查
    const formatErrors = checkVisualizationFormat(codeGen.codeContent);
    if (formatErrors.length > 0) {
      issues.push({
        type: 'format',
        errors: formatErrors,
      });
    }

    // 3. 清晰度和标注检查
    const clarityErrors = checkClarityAndLabels(codeGen.codeContent);
    if (clarityErrors.length > 0) {
      issues.push({
        type: 'clarity_labels',
        errors: clarityErrors,
      });
    }

    // 创建校验记录
    const validation = await prisma.codeValidation.create({
      data: {
        autoTaskId,
        codeGenerationId,
        validationType: ValidationType.VISUALIZATION,
        status: issues.length === 0 ? ValidationStatus.PASSED : ValidationStatus.FAILED,
        result: issues.length === 0 ? { passed: true } : { issues },
        errorMessage: issues.length > 0 ? JSON.stringify(issues, null, 2) : null,
        validationDetails: `可视化质量校验完成，发现 ${issues.length} 个问题`,
      },
    });

    return validation;
  } catch (error) {
    console.error('Error validating visualization:', error);
    throw error;
  }
}

/**
 * 语法检查
 */
function checkSyntax(code: string, language: string) {
  const errors = [];

  if (language === 'PYTHON') {
    // 检查常见的 Python 语法错误
    if (code.includes('for i in range(10') && !code.includes('):')) {
      errors.push('for 循环缺少冒号');
    }
    if (code.includes('def function') && !code.includes(':')) {
      errors.push('函数定义缺少冒号');
    }
    if (code.includes('if ') && !code.includes(':')) {
      errors.push('if 语句缺少冒号');
    }
  }

  return errors;
}

/**
 * 逻辑死循环检测
 */
function checkInfiniteLoops(code: string) {
  const errors = [];

  // 检查 while True 无 break
  const whileTruePattern = /while\s+True\s*:/g;
  const matches = code.match(whileTruePattern);
  if (matches && !code.includes('break')) {
    errors.push('检测到 while True 循环可能存在无限循环风险');
  }

  return errors;
}

/**
 * 运行错误检查
 */
async function checkRuntimeErrors(codeGen: any) {
  const errors: any[] = [];

  // TODO: 实现实际的代码运行和错误捕获
  // 这里需要运行代码并捕获运行时错误

  return errors;
}

/**
 * 数学逻辑检查
 */
function checkMathematicalLogic(code: string, discussionSummary: any) {
  const errors = [];

  const mainAlgorithm = discussionSummary.consensus?.mainAlgorithm || '';

  // 检查代码中是否包含核心算法的关键词
  if (!code.includes('def') && !code.includes('function')) {
    errors.push('代码中未找到核心算法函数定义');
  }

  // 检查是否包含数学计算
  if (!code.match(/[\+\-\*\/]/)) {
    errors.push('代码中未找到数学计算操作');
  }

  return errors;
}

/**
 * 数值范围检查
 */
function checkNumericalRange(codeGen: any) {
  const errors: any[] = [];

  // TODO: 实现数值范围检查逻辑
  // 需要运行代码并分析输出结果的范围

  return errors;
}

/**
 * 赛题匹配度检查
 */
function checkProblemMatch(codeGen: any, discussionSummary: any) {
  const errors = [];

  // 检查代码是否实现了讨论中的创新点
  const innovations = discussionSummary.consensus?.keyInnovations || '';
  if (!codeGen.codeContent.includes(innovations.substring(0, 20))) {
    errors.push('代码未完全实现讨论中的创新点');
  }

  return errors;
}

/**
 * 配色方案检查
 */
function checkColorScheme(code: string) {
  const errors = [];

  // 检查是否使用红色系（美赛）或蓝色系（国赛）
  const hasRed = code.match(/color=['"]*r|red|firebrick|crimson/i);
  const hasBlue = code.match(/color=['"]*b|blue|royalblue|navy/i);

  if (!hasRed && !hasBlue) {
    errors.push('未检测到明确的配色方案（美赛使用红色系，国赛使用蓝色系）');
  }

  return errors;
}

/**
 * 可视化格式检查
 */
function checkVisualizationFormat(code: string) {
  const errors = [];

  // 检查是否包含图表类型
  const plotTypes = ['plot', 'scatter', 'bar', 'pie', 'hist'];
  const hasPlot = plotTypes.some((type) => code.includes(type));
  if (!hasPlot) {
    errors.push('未检测到图表类型（plot, scatter, bar, pie, hist）');
  }

  return errors;
}

/**
 * 清晰度和标注检查
 */
function checkClarityAndLabels(code: string) {
  const errors = [];

  // 检查是否包含标题
  if (!code.includes('title') && !code.includes('Title')) {
    errors.push('图表缺少标题');
  }

  // 检查是否包含坐标轴标签
  if (!code.includes('xlabel') && !code.includes('ylabel')) {
    errors.push('图表缺少坐标轴标签');
  }

  // 检查是否包含图例
  if (!code.includes('legend') && !code.includes('Legend')) {
    errors.push('图表缺少图例');
  }

  return errors;
}
