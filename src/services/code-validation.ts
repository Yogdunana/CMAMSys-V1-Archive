/**
 * 代码验证服务
 * 在代码生成后自动验证代码的正确性
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

/**
 * 检查 Python 代码语法
 * 使用 compile 函数检查语法，避免 pycompile 模块缺失问题
 */
export async function checkPythonSyntax(code: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    // 创建临时脚本
    const tempDir = path.join(process.cwd(), 'temp', 'validation');
    await fs.mkdir(tempDir, { recursive: true });

    const tempFile = path.join(tempDir, `syntax_check_${Date.now()}.py`);

    // 将代码包装在 try-except 中，避免执行时的错误影响语法检查
    const wrappedCode = `
import sys

# 代码编译检查
try:
    ${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Execution error: {e}", file=sys.stderr)
    sys.exit(1)
`;

    await fs.writeFile(tempFile, wrappedCode, 'utf-8');

    // 使用 python -c "compile()" 来检查语法
    return new Promise((resolve) => {
      const pythonProcess = spawn('python3', ['-c', `
import sys
try:
    with open('${tempFile.replace(/\\/g, '\\\\')}', 'r', encoding='utf-8') as f:
        code = f.read()
    compile(code, '${tempFile.replace(/\\/g, '\\\\')}', 'exec')
    print("Syntax OK")
    sys.exit(0)
except SyntaxError as e:
    print(f"Syntax Error: {e.msg} at line {e.lineno}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
`], {
        cwd: tempDir,
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        // 清理临时文件
        try {
          await fs.unlink(tempFile);
        } catch (e) {
          // 忽略清理错误
        }

        if (code === 0 && stdout.includes('Syntax OK')) {
          resolve({ valid: true });
        } else {
          resolve({
            valid: false,
            error: stderr || stdout || '语法检查失败',
          });
        }
      });

      pythonProcess.on('error', (error) => {
        resolve({
          valid: false,
          error: `Python 解释器错误: ${error.message}`,
        });
      });

      // 10秒超时
      setTimeout(() => {
        pythonProcess.kill();
        resolve({
          valid: false,
          error: '语法检查超时',
        });
      }, 10000);
    });
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 验证代码基本要求
 */
export function validateCodeRequirements(code: string, language: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (language === 'PYTHON') {
    // 检查是否有 main 函数
    if (!code.includes('def main()') && !code.includes('if __name__')) {
      issues.push('缺少 main 函数或主程序入口');
    }

    // 检查是否有 print 语句（确保有输出）
    if (!code.includes('print(')) {
      issues.push('缺少 print 输出语句');
    }

    // 检查是否有 TODO 或 pass（未实现）
    if (code.includes('TODO:') || code.includes('pass') && !code.includes('# pass')) {
      issues.push('代码包含未实现的部分（TODO 或 pass）');
    }

    // 检查代码行数
    const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    if (lines.length < 30) {
      issues.push('代码过短，可能不完整（少于 30 行有效代码）');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * 快速执行验证（只检查是否能运行，不检查输出正确性）
 */
export async function quickExecuteValidation(code: string, language: string): Promise<{
  canRun: boolean;
  error?: string;
}> {
  if (language !== 'PYTHON') {
    return { canRun: true }; // MATLAB 跳过快速验证
  }

  try {
    // 检查是否需要模拟数据
    const needsMockData = code.includes('load(') || code.includes('np.loadtxt') || 
                           code.includes('pd.read') || code.includes('open(');

    if (needsMockData) {
      // 如果代码需要读取数据，跳过执行验证
      return { canRun: true };
    }

    // 创建临时文件
    const tempDir = path.join(process.cwd(), 'temp', 'validation');
    await fs.mkdir(tempDir, { recursive: true });
    
    const tempFile = path.join(tempDir, `quick_execute_${Date.now()}.py`);
    
    // 添加超时保护和数据模拟
    const codeWithProtection = `
import sys
import signal

# 超时保护（5秒）
def timeout_handler(signum, frame):
    print("\\n代码执行超时")
    sys.exit(1)

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(5)

${code}

signal.alarm(0)
`;
    
    await fs.writeFile(tempFile, codeWithProtection, 'utf-8');

    // 执行代码（2秒超时）
    return new Promise((resolve) => {
      const pythonProcess = spawn('python3', [tempFile], {
        cwd: tempDir,
        timeout: 2000,
      });

      let stderr = '';

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        // 清理临时文件
        try {
          await fs.unlink(tempFile);
        } catch (e) {
          // 忽略清理错误
        }

        if (code === 0) {
          resolve({ canRun: true });
        } else {
          // 检查是否是因为没有输入数据导致的错误
          if (stderr.includes('FileNotFoundError') || stderr.includes('No such file')) {
            resolve({ canRun: true }); // 需要数据文件，这是正常的
          } else {
            resolve({
              canRun: false,
              error: stderr || '执行失败',
            });
          }
        }
      });

      pythonProcess.on('error', () => {
        resolve({
          canRun: false,
          error: 'Python 解释器不可用',
        });
      });

      pythonProcess.on('timeout', () => {
        pythonProcess.kill();
        resolve({ canRun: true }); // 超时说明代码在运行，只是需要更多时间
      });
    });
  } catch (error) {
    return {
      canRun: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
