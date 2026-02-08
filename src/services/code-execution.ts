/**
 * 代码执行服务
 * 实现安全的沙箱环境执行 Python/MATLAB 代码
 */

import { CodeLanguage as PrismaCodeLanguage, ExecutionStatus } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

// 导出 CodeLanguage 类型
export type CodeLanguage = PrismaCodeLanguage;

const execAsync = promisify(exec);

// 超时时间（毫秒）
const EXECUTION_TIMEOUT = 30000;

// 内存限制（MB）
const MEMORY_LIMIT = 512;

// 工作目录
const WORK_DIR = '/tmp/code_execution';

/**
 * 执行代码
 */
export async function executeCodeSafely(
  code: string,
  language: CodeLanguage,
  input?: string
): Promise<{
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsage?: number;
}> {
  const timestamp = Date.now();
  const codeFileName = `${timestamp}.${language === 'PYTHON' ? 'py' : 'm'}`;
  const codeFilePath = `${WORK_DIR}/${codeFileName}`;
  const inputFileName = `${timestamp}.txt`;
  const inputFilePath = `${WORK_DIR}/${inputFileName}`;

  try {
    // 1. 准备代码文件
    const fs = require('fs');
    const path = require('path');

    // 确保工作目录存在
    if (!fs.existsSync(WORK_DIR)) {
      fs.mkdirSync(WORK_DIR, { recursive: true });
    }

    // 写入代码文件
    fs.writeFileSync(codeFilePath, code, 'utf-8');

    // 写入输入文件（如果有）
    if (input) {
      fs.writeFileSync(inputFilePath, input, 'utf-8');
    }

    // 2. 构建执行命令
    let command = '';
    if (language === 'PYTHON') {
      command = `cd ${WORK_DIR} && timeout ${EXECUTION_TIMEOUT / 1000} python3 ${codeFileName}`;
      if (input) {
        command += ` < ${inputFileName}`;
      }
    } else {
      // MATLAB 执行（需要 MATLAB 环境支持）
      command = `cd ${WORK_DIR} && timeout ${EXECUTION_TIMEOUT / 1000} matlab -batch "run('${codeFileName}'); exit;"`;
    }

    // 3. 执行代码
    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(command, {
      timeout: EXECUTION_TIMEOUT,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    const executionTime = Date.now() - startTime;

    // 4. 清理临时文件
    try {
      fs.unlinkSync(codeFilePath);
      if (fs.existsSync(inputFilePath)) {
        fs.unlinkSync(inputFileName);
      }
      // 清理生成的输出文件
      const outputFiles = fs.readdirSync(WORK_DIR).filter((f: string) => f.startsWith(timestamp.toString()));
      outputFiles.forEach((f: string) => {
        const filePath = path.join(WORK_DIR, f);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp files:', cleanupError);
    }

    // 5. 返回结果
    if (stderr && !stderr.includes('Warning')) {
      return {
        success: false,
        error: stderr.trim(),
        executionTime,
      };
    }

    return {
      success: true,
      output: stdout.trim(),
      executionTime,
      memoryUsage: MEMORY_LIMIT,
    };
  } catch (error: any) {
    // 清理临时文件
    try {
      const fs = require('fs');
      const path = require('path');
      const codeFilePath = `${WORK_DIR}/${codeFileName}`;
      if (fs.existsSync(codeFilePath)) {
        fs.unlinkSync(codeFilePath);
      }
      const inputFilePath = `${WORK_DIR}/${inputFileName}`;
      if (fs.existsSync(inputFilePath)) {
        fs.unlinkSync(inputFilePath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp files:', cleanupError);
    }

    let errorMessage = 'Execution failed';

    if (error.killed) {
      errorMessage = `Execution timeout (${EXECUTION_TIMEOUT}ms exceeded)`;
    } else if (error.signal === 'SIGKILL') {
      errorMessage = 'Execution killed (memory limit exceeded)';
    } else {
      errorMessage = error.message || 'Unknown error';
    }

    return {
      success: false,
      error: errorMessage,
      executionTime: EXECUTION_TIMEOUT,
    };
  }
}

/**
 * 代码安全检查
 */
export function validateCodeSafety(code: string, language: CodeLanguage): {
  isSafe: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // 禁止的危险操作
  const dangerousPatterns = [
    // 文件操作
    /open\s*\(\s*['"]\//gi,
    /f\s*=\s*open\s*\(/gi,
    /file\s*=\s*open\s*\(/gi,
    // 系统命令
    /os\.system/gi,
    /subprocess\.call/gi,
    /exec\s*\(/gi,
    /eval\s*\(/gi,
    // 网络操作
    /urllib/gi,
    /requests\./gi,
    /socket\./gi,
    // 进程操作
    /multiprocessing/gi,
    /threading/gi,
  ];

  for (const pattern of dangerousPatterns) {
    const matches = code.match(pattern);
    if (matches) {
      issues.push(`检测到潜在危险操作: ${matches[0]}`);
    }
  }

  // 检查是否包含死循环
  const loopPatterns = [
    /while\s+True\s*:/gi,
    /for\s+\w+\s+in\s+range\s*\(\s*\d+\s*\)\s*:\s*while\s+/gi,
  ];

  for (const pattern of loopPatterns) {
    if (code.match(pattern)) {
      issues.push('检测到可能的无限循环');
      break;
    }
  }

  return {
    isSafe: issues.length === 0,
    issues,
  };
}

/**
 * 提取代码中的可视化部分
 */
export function extractVisualizationCode(code: string, language: CodeLanguage): string {
  if (language !== 'PYTHON') {
    return '';
  }

  // 查找可视化相关的代码
  const visualizationPatterns = [
    /plt\.(figure|plot|scatter|bar|pie|hist|show|savefig)[^;]*/gi,
    /matplotlib\.pyplot\.[^;]*/gi,
  ];

  const visualizationLines: string[] = [];

  const lines = code.split('\n');
  for (const line of lines) {
    for (const pattern of visualizationPatterns) {
      if (pattern.test(line)) {
        visualizationLines.push(line);
        break;
      }
    }
  }

  return visualizationLines.join('\n');
}
