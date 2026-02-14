/**
 * 代码生成服务
 * 基于讨论结果自动生成 Python/MATLAB 代码
 */

import { CodeLanguage, ExecutionStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { executeCode as runCodeSafe } from './code-executor';
import { callAI } from '@/services/ai-provider';
import { 
  checkPythonSyntax, 
  validateCodeRequirements,
  quickExecuteValidation 
} from '@/services/code-validation';

/**
 * 生成代码
 */
export async function generateCode(
  autoTaskId: string,
  discussionId: string,
  discussionSummary: any,
  language: CodeLanguage = CodeLanguage.PYTHON,
  userId?: string
) {
  try {
    // 提取核心算法和创新点
    const mainAlgorithm = discussionSummary.consensus?.mainAlgorithm || '';
    const innovations = discussionSummary.consensus?.keyInnovations || '';
    const coreAlgorithms = discussionSummary.coreAlgorithms || [];

    // 构建代码生成 Prompt
    const prompt = `
你是数学建模竞赛代码生成专家。请基于以下解题思路，生成完整的 ${language} 代码。

赛题解题思路：
========================
核心算法：${mainAlgorithm}
创新点：${innovations}
其他算法：${coreAlgorithms.map((a: any) => a.content).join('\n')}
========================

【关键要求 - 必须严格遵守】
1. **完整性要求**：
   - 所有函数必须有完整实现，绝不能只返回 None
   - 每个函数必须有明确的返回值
   - 不要使用 TODO 或 pass 占位符
   - 代码必须能够独立运行，不需要额外输入

2. **代码结构**：
   - 数据预处理模块
   - 核心算法实现（严格匹配上述核心算法）
   - 结果输出模块
   - 可视化模块（图表生成）

3. **代码规范**：
   - 完整的中文注释
   - 代码格式规范，缩进一致
   - 变量命名清晰易懂
   - 函数封装合理

4. **功能要求**：
   - 适配 ${language === CodeLanguage.PYTHON ? '美赛/国赛 Python' : 'MATLAB'} 环境
   - 无第三方复杂依赖（或自动检测并提示安装）
   - 包含输入验证和错误处理
   - 输出结果清晰易读

5. **可视化要求**：
   - 配色方案：美赛使用红色系，国赛使用蓝色系
   - 图表格式：清晰、美观、标注完整
   - 包含图例、标题、坐标轴标签

6. **测试要求**：
   - 必须包含 main 函数
   - main 函数中必须有 print 输出语句
   - 如果需要数据，使用模拟数据（如 np.random）而非读取文件

请生成完整代码，确保可以直接运行。代码必须严格匹配上述解题思路，不能偏离核心算法和创新点。
`;

    // 调用 AI 生成代码
    // TODO: 实现实际的 AI API 调用
    const generatedCode = await generateCodeWithAI(prompt, language);

    // 创建代码生成记录
    const codeGeneration = await prisma.codeGeneration.create({
      data: {
        autoTaskId,
        discussionId,
        codeLanguage: language,
        codeContent: generatedCode.content,
        description: generatedCode.description,
        requirements: {
          mainAlgorithm,
          innovations,
          coreAlgorithms,
        },
        executionStatus: ExecutionStatus.PENDING,
      },
    });

    return codeGeneration;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
}

/**
 * 调用 AI 生成代码（带自动验证）
 */
async function generateCodeWithAI(prompt: string, language: CodeLanguage, userId?: string) {
  const maxRetries = 3; // 最多重试 3 次
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // 获取用户的默认 AI Provider
      const providers = await prisma.aIProvider.findMany({
        where: {
          createdById: userId,
          status: 'ACTIVE',
        },
      });

      if (providers.length === 0) {
        console.warn('No active AI providers found, using fallback code template');
        return getFallbackCode(language);
      }

      // 选择优先级最高的 Provider
      const provider = providers.sort((a, b) => b.priority - a.priority)[0];

      // 调用 AI 生成代码
      const { response: generatedCode } = await callAI(
        provider.id,
        provider.supportedModels[0] || 'default',
        prompt,
        {
          modelType: 'CODING' as any,
          taskId: '',
          context: 'coding',
        },
        userId
      );

      // 验证代码质量
      console.log(`[CodeValidation] 验证第 ${retryCount + 1} 次生成的代码...`);

      // 1. 检查代码基本要求
      const requirementCheck = validateCodeRequirements(generatedCode, language);
      if (!requirementCheck.valid) {
        console.warn(`[CodeValidation] 代码要求检查失败:`, requirementCheck.issues);
        throw new Error(`代码不完整: ${requirementCheck.issues.join(', ')}`);
      }

      // 2. 检查 Python 语法
      if (language === CodeLanguage.PYTHON) {
        const syntaxCheck = await checkPythonSyntax(generatedCode);
        if (!syntaxCheck.valid) {
          console.warn(`[CodeValidation] 语法检查失败:`, syntaxCheck.error);
          throw new Error(`语法错误: ${syntaxCheck.error}`);
        }
      }

      // 3. 快速执行验证
      const executeCheck = await quickExecuteValidation(generatedCode, language);
      if (!executeCheck.canRun) {
        console.warn(`[CodeValidation] 执行验证失败:`, executeCheck.error);
        throw new Error(`执行错误: ${executeCheck.error}`);
      }

      console.log(`[CodeValidation] 代码验证通过！`);
      
      return {
        content: generatedCode,
        description: `${language} 代码，基于 ${provider.name} AI 生成`,
      };

    } catch (error) {
      retryCount++;
      console.error(`[CodeValidation] 第 ${retryCount} 次尝试失败:`, error);

      if (retryCount >= maxRetries) {
        console.error(`[CodeValidation] 达到最大重试次数，使用备用代码模板`);
        return getFallbackCode(language);
      }

      // 修改 prompt，强调上一次的错误
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      prompt = `${prompt}\n\n注意：上次生成的代码有以下问题：${errorMessage}\n\n请重新生成代码，确保：\n1. 所有函数都有完整实现，不要返回 None\n2. 不要使用 TODO 或 pass 占位\n3. 代码必须能够独立运行\n4. 包含完整的中文注释`;
    }
  }

  return getFallbackCode(language);
}

/**
 * 获取备用代码模板
 */
function getFallbackCode(language: CodeLanguage) {

  if (language === CodeLanguage.PYTHON) {
    return {
      content: `import numpy as np
import matplotlib.pyplot as plt

# 数据预处理
def preprocess_data(data):
    """
    数据预处理函数
    将数据标准化到 [0, 1] 范围
    """
    data = np.array(data)
    min_val = np.min(data)
    max_val = np.max(data)
    normalized = (data - min_val) / (max_val - min_val + 1e-8)
    return normalized

# 核心算法实现（简单线性回归作为示例）
def core_algorithm(data):
    """
    核心算法实现 - 线性回归
    """
    X = np.arange(len(data)).reshape(-1, 1)
    y = data
    
    # 添加偏置项
    X = np.concatenate([np.ones((X.shape[0], 1)), X], axis=1)
    
    # 最小二乘法求解
    coefficients = np.linalg.inv(X.T @ X) @ X.T @ y
    
    # 预测
    predictions = X @ coefficients
    
    return predictions

# 结果输出
def output_result(result):
    """
    输出结果
    """
    print("=" * 50)
    print("建模结果分析")
    print("=" * 50)
    print(f"预测值范围: [{result.min():.4f}, {result.max():.4f}]")
    print(f"预测值均值: {result.mean():.4f}")
    print(f"预测值标准差: {result.std():.4f}")
    print("=" * 50)

# 可视化模块
def visualize(data, result):
    """
    数据可视化 - 国赛蓝色系
    """
    plt.figure(figsize=(12, 6))
    
    # 使用蓝色系配色（国赛风格）
    plt.plot(data, 'o-', label='原始数据', color='#2E86AB', linewidth=2, markersize=6)
    plt.plot(result, 's--', label='拟合结果', color='#A23B72', linewidth=2, markersize=6)
    
    plt.title('数学建模结果分析', fontsize=16, fontweight='bold')
    plt.xlabel('样本序号', fontsize=12)
    plt.ylabel('数值', fontsize=12)
    plt.legend(loc='best', fontsize=10)
    plt.grid(True, alpha=0.3, linestyle='--')
    plt.tight_layout()
    
    # 保存图片
    plt.savefig('result.png', dpi=300, bbox_inches='tight')
    print("\\n图表已保存为 result.png")
    
    plt.show()

# 主程序
def main():
    """
    主程序入口
    """
    # 生成模拟数据（实际使用时替换为真实数据）
    np.random.seed(42)
    x = np.linspace(0, 10, 100)
    y = 2 * x + 1 + np.random.normal(0, 0.5, size=x.shape)
    
    print("\\n开始处理数据...")
    
    # 预处理
    processed = preprocess_data(y)
    print(f"数据预处理完成，数据形状: {processed.shape}")
    
    # 核心算法
    result = core_algorithm(processed)
    print(f"核心算法执行完成，结果形状: {result.shape}")
    
    # 输出结果
    output_result(result)
    
    # 可视化
    visualize(processed, result)
    
    print("\\n任务完成！")

if __name__ == '__main__':
    main()
`,
      description: 'Python 完整实现，包含数据预处理、核心算法（线性回归）、结果输出和可视化模块',
    };
  } else {
    return {
      content: `% MATLAB 代码生成
% 数据预处理
function processed = preprocess_data(data)
    % 数据预处理函数 - 标准化到 [0, 1] 范围
    min_val = min(data);
    max_val = max(data);
    processed = (data - min_val) / (max_val - min_val + eps);
end

% 核心算法实现
function result = core_algorithm(data)
    % 核心算法实现 - 线性回归
    X = [ones(length(data), 1), (1:length(data))'];
    y = data(:);
    coefficients = (X' * X) \\ (X' * y);
    result = X * coefficients;
end

% 结果输出
function output_result(result)
    % 输出结果
    fprintf('============================================\\n');
    fprintf('建模结果分析\\n');
    fprintf('============================================\\n');
    fprintf('预测值范围: [%.4f, %.4f]\\n', min(result), max(result));
    fprintf('预测值均值: %.4f\\n', mean(result));
    fprintf('预测值标准差: %.4f\\n', std(result));
    fprintf('============================================\\n');
end

% 可视化模块
function visualize(data, result)
    % 数据可视化 - 国赛蓝色系
    figure;
    hold on;
    plot(data, 'o-', 'Color', [0.18, 0.53, 0.67], 'LineWidth', 2, 'MarkerSize', 6);
    plot(result, 's--', 'Color', [0.64, 0.23, 0.45], 'LineWidth', 2, 'MarkerSize', 6);
    hold off;
    
    title('数学建模结果分析', 'FontSize', 16, 'FontWeight', 'bold');
    xlabel('样本序号', 'FontSize', 12);
    ylabel('数值', 'FontSize', 12);
    legend('原始数据', '拟合结果', 'Location', 'best');
    grid on;
    
    % 保存图片
    saveas(gcf, 'result.png');
    fprintf('\\n图表已保存为 result.png\\n');
end

% 主程序
function main()
    % 生成模拟数据
    x = linspace(0, 10, 100)';
    y = 2 * x + 1 + 0.5 * randn(size(x));
    
    fprintf('\\n开始处理数据...\\n');
    
    % 预处理
    processed = preprocess_data(y);
    fprintf('数据预处理完成，数据形状: %s\\n', mat2str(size(processed)));
    
    % 核心算法
    result = core_algorithm(processed);
    fprintf('核心算法执行完成，结果形状: %s\\n', mat2str(size(result)));
    
    % 输出结果
    output_result(result);
    
    % 可视化
    visualize(processed, result);
    
    fprintf('\\n任务完成！\\n');
end

% 执行主程序
main();
`,
      description: 'MATLAB 完整实现，包含数据预处理、核心算法、结果输出和可视化模块',
    };
  }
}

/**
 * 执行生成的代码
 */
export async function executeCode(codeGenerationId: string) {
  try {
    const codeGen = await prisma.codeGeneration.findUnique({
      where: { id: codeGenerationId },
    });

    if (!codeGen) {
      throw new Error('Code generation not found');
    }

    // 更新状态为运行中
    await prisma.codeGeneration.update({
      where: { id: codeGenerationId },
      data: { executionStatus: ExecutionStatus.RUNNING },
    });

    // 执行代码
    const result = await runCode(codeGen.codeContent, codeGen.codeLanguage);

    // 更新状态
    await prisma.codeGeneration.update({
      where: { id: codeGenerationId },
      data: {
        executionStatus: result.success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
        errorLog: result.error,
      },
    });

    return result;
  } catch (error) {
    console.error('Error executing code:', error);

    await prisma.codeGeneration.update({
      where: { id: codeGenerationId },
      data: {
        executionStatus: ExecutionStatus.FAILED,
        errorLog: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

/**
 * 运行代码
 */
async function runCode(code: string, language: CodeLanguage) {
  try {
    // 调用真正的代码执行器
    const result = await runCodeSafe(code, language);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
