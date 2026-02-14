/**
 * 代码执行服务
 * 支持真实的 Python 和 MATLAB 代码执行
 */

import { CodeLanguage, ExecutionStatus } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  runtime?: number;
  memory?: number;
}

/**
 * 执行代码
 */
export async function executeCode(code: string, language: CodeLanguage): Promise<ExecutionResult> {
  const tempDir = '/tmp/code-execution';
  const fileId = uuidv4();
  
  try {
    // 创建临时目录
    await fs.mkdir(tempDir, { recursive: true });
    
    // 根据语言执行
    if (language === CodeLanguage.PYTHON) {
      return await executePython(code, tempDir, fileId);
    } else if (language === CodeLanguage.MATLAB) {
      return await executeMatlab(code, tempDir, fileId);
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    // 清理临时文件
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Failed to cleanup temp files:', cleanupError);
    }
  }
}

/**
 * 执行 Python 代码
 */
async function executePython(code: string, tempDir: string, fileId: string): Promise<ExecutionResult> {
  const startTime = Date.now();
  const scriptPath = path.join(tempDir, `${fileId}.py`);
  
  // 写入代码文件
  await fs.writeFile(scriptPath, code, 'utf-8');
  
  // 安全包装代码
  const safeCode = `
import sys
import io
import time
import resource

# 设置资源限制
resource.setrlimit(resource.RLIMIT_CPU, (30, 30))  # 30秒CPU时间
resource.setrlimit(resource.RLIMIT_AS, (500 * 1024 * 1024, 500 * 1024 * 1024))  # 500MB内存

# 重定向输出
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)

# 获取输出
stdout_value = sys.stdout.getvalue()
stderr_value = sys.stderr.getvalue()

# 打印输出（用于捕获）
print(stdout_value)
if stderr_value:
    print(stderr_value, file=sys.stderr)
`;
  
  await fs.writeFile(scriptPath, safeCode, 'utf-8');
  
  try {
    // 执行代码，限制时间
    const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, {
      timeout: 30000, // 30秒超时
      cwd: tempDir,
    });
    
    const runtime = Date.now() - startTime;
    
    return {
      success: true,
      output: stdout.trim(),
      error: stderr.trim(),
      runtime,
    };
  } catch (error: any) {
    const runtime = Date.now() - startTime;
    
    if (error.killed) {
      return {
        success: false,
        error: '代码执行超时（超过30秒）',
        runtime,
      };
    }
    
    return {
      success: false,
      error: error.message || error.stderr || '执行失败',
      runtime,
    };
  }
}

/**
 * 执行 MATLAB 代码
 */
async function executeMatlab(code: string, tempDir: string, fileId: string): Promise<ExecutionResult> {
  const startTime = Date.now();
  const scriptPath = path.join(tempDir, `${fileId}.m`);
  
  // 写入代码文件
  await fs.writeFile(scriptPath, code, 'utf-8');
  
  try {
    // MATLAB 包装代码
    const matlabCode = `
try
    ${code}
    exit(0);
catch ME
    fprintf(2, 'Error: %s\\n', ME.message);
    exit(1);
end
`;
    await fs.writeFile(scriptPath, matlabCode, 'utf-8');
    
    // 执行 MATLAB 代码
    const { stdout, stderr } = await execAsync(`matlab -batch "run('${scriptPath}')"`, {
      timeout: 30000,
      cwd: tempDir,
    });
    
    const runtime = Date.now() - startTime;
    
    return {
      success: true,
      output: stdout.trim(),
      error: stderr.trim(),
      runtime,
    };
  } catch (error: any) {
    const runtime = Date.now() - startTime;
    
    return {
      success: false,
      error: error.message || error.stderr || 'MATLAB执行失败',
      runtime,
    };
  }
}
