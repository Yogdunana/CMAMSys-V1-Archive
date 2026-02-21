const fs = require('fs');
const path = require('path');

console.log('🔍 开始安全审计 - 检查敏感信息泄露...\n');

const issues = [];

// 1. 检查硬编码的密码
const passwordPatterns = [
  '***REDACTED_PASSWORD***',
  '***REDACTED_DB_PASSWORD***',
  '***REDACTED_DB_USER***',
  '***REDACTED_DB_IP***',
];

console.log('📋 1. 检查硬编码的密码和数据库信息...');
const allFiles = getAllFiles(path.join(__dirname, '..'), ['.ts', '.tsx', '.js', '.jsx', '.json', '.md']);

allFiles.forEach(filePath => {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);

  // 跳过 node_modules、修复脚本和安全审计脚本
  if (filePath.includes('node_modules') ||
      filePath.includes('fix-password-leak') ||
      filePath.includes('fix-doc-passwords') ||
      filePath.includes('security-audit.js')) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  passwordPatterns.forEach(pattern => {
    if (content.includes(pattern)) {
      issues.push({
        file: relativePath,
        issue: `发现敏感信息: ${pattern}`,
      });
    }
  });
});

// 2. 检查真实的 API Keys（排除 mock keys）
console.log('📋 2. 检查真实 API Keys...');
const realApiKeyPatterns = [
  /sk-deepseek-[a-zA-Z0-9_-]{30,}/,
  /sk-volcengine-[a-zA-Z0-9_-]{30,}/,
  /sk-aliyun-[a-zA-Z0-9_-]{30,}/,
];

allFiles.forEach(filePath => {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);

  if (filePath.includes('node_modules') || filePath.includes('fix-password-leak') || filePath.includes('fix-doc-passwords')) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  realApiKeyPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        file: relativePath,
        issue: `发现真实 API Key: ${matches[0].substring(0, 20)}...`,
      });
    }
  });
});

// 3. 检查 .gitignore 是否包含 .env
console.log('📋 3. 检查 .gitignore 配置...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignore.includes('.env')) {
    issues.push({
      file: '.gitignore',
      issue: '.env 文件未被忽略，可能导致敏感信息泄露到 Git',
    });
  }
} else {
  issues.push({
    file: '.gitignore',
    issue: '.gitignore 文件不存在',
  });
}

// 4. 检查 .env 文件中的密码
console.log('📋 4. 检查 .env 文件配置...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');

  if (envContent.includes('***REDACTED_PASSWORD***')) {
    issues.push({
      file: '.env',
      issue: '.env 文件中仍包含泄露密码 ***REDACTED_PASSWORD***',
    });
  }

  if (envContent.includes('***REDACTED_DB_IP***')) {
    issues.push({
      file: '.env',
      issue: '.env 文件中仍包含生产数据库 IP',
    });
  }

  if (envContent.includes('***REDACTED_DB_PASSWORD***')) {
    issues.push({
      file: '.env',
      issue: '.env 文件中仍包含生产数据库密码',
    });
  }

  if (envContent.includes('***REDACTED_DB_USER***')) {
    issues.push({
      file: '.env',
      issue: '.env 文件中仍包含生产数据库用户名',
    });
  }
}

// 输出结果
console.log('\n' + '='.repeat(60));
if (issues.length === 0) {
  console.log('✅ 安全审计通过！未发现敏感信息泄露。');
} else {
  console.log(`❌ 发现 ${issues.length} 个安全问题：\n`);
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}`);
    console.log(`   ${issue.issue}\n`);
  });
}
console.log('='.repeat(60));

function getAllFiles(dir, extensions) {
  let results = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 递归遍历子目录
      results = results.concat(getAllFiles(fullPath, extensions));
    } else {
      // 检查文件扩展名
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  });

  return results;
}
