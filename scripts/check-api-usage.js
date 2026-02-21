#!/usr/bin/env node

/**
 * API 使用情况扫描脚本
 * 扫描项目中所有 API 的配置和使用情况
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  API 使用情况扫描                                        ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// API 配置列表
const apis = {
  // AI 服务
  'DEEPSEEK_API_KEY': {
    name: 'DeepSeek AI',
    category: 'AI Services',
    description: 'DeepSeek 大语言模型 API',
    provider: 'https://platform.deepseek.com/',
    risk: '🔴 High',
  },
  'VOLCENGINE_API_KEY': {
    name: 'VolcEngine AI',
    category: 'AI Services',
    description: '火山引擎 AI 服务',
    provider: 'https://console.volcengine.com/',
    risk: '🔴 High',
  },
  'ALIYUN_API_KEY': {
    name: 'Aliyun AI',
    category: 'AI Services',
    description: '阿里云人工智能服务',
    provider: 'https://www.aliyun.com/',
    risk: '🔴 High',
  },
  'OPENAI_API_KEY': {
    name: 'OpenAI',
    category: 'AI Services',
    description: 'OpenAI GPT API',
    provider: 'https://platform.openai.com/',
    risk: '🔴 High',
  },

  // 对象存储
  'S3_ENDPOINT': {
    name: 'AWS S3 / S3 Compatible',
    category: 'Storage',
    description: 'S3 兼容对象存储服务',
    provider: 'AWS / MinIO / 其他 S3 兼容服务',
    risk: '🟠 Medium',
  },
  'S3_ACCESS_KEY_ID': {
    name: 'AWS S3 Access Key',
    category: 'Storage',
    description: 'S3 访问密钥',
    provider: 'AWS / MinIO / 其他 S3 兼容服务',
    risk: '🔴 High',
  },
  'S3_SECRET_ACCESS_KEY': {
    name: 'AWS S3 Secret Key',
    category: 'Storage',
    description: 'S3 访问密钥',
    provider: 'AWS / MinIO / 其他 S3 兼容服务',
    risk: '🔴 High',
  },

  // 短信服务
  'SMS_API_KEY': {
    name: 'SMS Service',
    category: 'Communication',
    description: '短信服务 API Key',
    provider: '未指定（需要配置）',
    risk: '🟠 Medium',
  },

  // Bilibili
  'BILIBILI_COOKIE': {
    name: 'Bilibili',
    category: 'Video',
    description: 'Bilibili Cookie / Token',
    provider: 'https://www.bilibili.com/',
    risk: '🟠 Medium',
  },
  'BILIBILI_API_KEY': {
    name: 'Bilibili API',
    category: 'Video',
    description: 'Bilibili API Key',
    provider: 'https://www.bilibili.com/',
    risk: '🟠 Medium',
  },

  // 邮件服务
  'SMTP_HOST': {
    name: 'SMTP Email',
    category: 'Communication',
    description: 'SMTP 邮件服务',
    provider: 'Gmail / SendGrid / 其他 SMTP',
    risk: '🟡 Low',
  },
  'SMTP_USER': {
    name: 'SMTP User',
    category: 'Communication',
    description: 'SMTP 用户名',
    provider: 'Gmail / SendGrid / 其他 SMTP',
    risk: '🟡 Low',
  },
  'SMTP_PASSWORD': {
    name: 'SMTP Password',
    category: 'Communication',
    description: 'SMTP 密码',
    provider: 'Gmail / SendGrid / 其他 SMTP',
    risk: '🟠 Medium',
  },

  // 监控服务
  'SENTRY_DSN': {
    name: 'Sentry',
    category: 'Monitoring',
    description: '错误追踪和性能监控',
    provider: 'https://sentry.io/',
    risk: '🟡 Low',
  },
  'SENTRY_AUTH_TOKEN': {
    name: 'Sentry Auth Token',
    category: 'Monitoring',
    description: 'Sentry 认证令牌',
    provider: 'https://sentry.io/',
    risk: '🟠 Medium',
  },

  // 数据库
  'DATABASE_URL': {
    name: 'PostgreSQL Database',
    category: 'Database',
    description: '数据库连接字符串',
    provider: 'PostgreSQL',
    risk: '🔴 High',
  },

  // Redis
  'REDIS_URL': {
    name: 'Redis',
    category: 'Cache',
    description: 'Redis 缓存服务',
    provider: 'Redis',
    risk: '🟡 Low',
  },
};

// 依赖包列表
const dependencies = {
  'AI Services': [
    { name: '@aws-sdk/client-s3', description: 'AWS S3 客户端 SDK', used: true },
    { name: 'coze-coding-dev-sdk', description: 'Coze Coding 开发 SDK', used: true },
  ],
  'Storage': [
    { name: '@aws-sdk/client-s3', description: 'AWS S3 客户端 SDK', used: true },
    { name: '@aws-sdk/lib-storage', description: 'AWS S3 上传库', used: true },
  ],
  'Monitoring': [
    { name: '@sentry/nextjs', description: 'Sentry 错误追踪', used: true },
  ],
  'Cache': [
    { name: 'ioredis', description: 'Redis 客户端', used: true },
  ],
  'Authentication': [
    { name: 'bcrypt', description: '密码加密', used: true },
    { name: 'bcryptjs', description: '密码加密（兼容）', used: true },
    { name: 'jsonwebtoken', description: 'JWT Token 生成', used: true },
    { name: 'jose', description: 'JWT 处理库', used: true },
  ],
};

// 检查 .env 文件
console.log('📋 环境变量配置中的 API');
console.log('─'.repeat(60));

const envExamplePath = path.join(projectRoot, '.env.example');
const envPath = path.join(projectRoot, '.env');

if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');

  Object.entries(apis).forEach(([key, api]) => {
    if (envExample.includes(`${key}=`)) {
      console.log(`✅ ${api.name}`);
      console.log(`   环境变量: ${key}`);
      console.log(`   分类: ${api.category}`);
      console.log(`   描述: ${api.description}`);
      console.log(`   提供商: ${api.provider}`);
      console.log(`   风险等级: ${api.risk}`);
      console.log('');
    }
  });
} else {
  console.log('❌ 未找到 .env.example 文件');
}

console.log('');

// 检查 .env 实际配置
console.log('🔍 实际配置状态 (.env)');
console.log('─'.repeat(60));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');

  Object.entries(apis).forEach(([key, api]) => {
    const line = envContent.split('\n').find(l => l.startsWith(`${key}=`));
    if (line) {
      const value = line.split('=')[1].trim();
      const isEmpty = value === '""' || value === '' || value.includes('your-') || value.includes('change_this');

      console.log(`${api.name}: ${isEmpty ? '⚪ 未配置' : '🟢 已配置'}`);

      if (!isEmpty && api.risk.includes('High')) {
        console.log(`   ⚠️  警告：高风险 API 已配置，请确认是否安全！`);
      }
    }
  });
} else {
  console.log('⚪ .env 文件不存在');
}

console.log('');
console.log('');

// 检查数据库中的 AI Provider 配置
console.log('🤖 数据库中的 AI Provider');
console.log('─'.repeat(60));

const schemaPath = path.join(projectRoot, 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');

  if (schema.includes('enum AIProviderType')) {
    const match = schema.match(/enum AIProviderType \{([^}]+)\}/);
    if (match) {
      const providers = match[1].trim().split('\n').map(p => p.trim());
      console.log(`支持 ${providers.length} 种 AI Provider：`);
      providers.forEach(p => {
        console.log(`   - ${p}`);
      });
    }
  }
}

console.log('');
console.log('');

// 显示依赖包
console.log('📦 已安装的 SDK/依赖包');
console.log('─'.repeat(60));

const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  Object.entries(dependencies).forEach(([category, deps]) => {
    const usedDeps = deps.filter(dep => allDeps[dep.name]);

    if (usedDeps.length > 0) {
      console.log(`${category}:`);
      usedDeps.forEach(dep => {
        console.log(`   ✓ ${dep.name}`);
        console.log(`     ${dep.description}`);
        console.log(`     版本: ${allDeps[dep.name]}`);
      });
      console.log('');
    }
  });
}

console.log('');
console.log('');

// 总结
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  API 使用总结                                             ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

const apiCategories = {};
Object.values(apis).forEach(api => {
  if (!apiCategories[api.category]) {
    apiCategories[api.category] = [];
  }
  apiCategories[api.category].push(api);
});

Object.entries(apiCategories).forEach(([category, apiList]) => {
  console.log(`${category}: ${apiList.length} 个服务`);
  apiList.forEach(api => {
    console.log(`   - ${api.name} (${api.risk})`);
  });
  console.log('');
});

console.log('');
console.log('📝 重要提示：');
console.log('1. 检查所有高风险 API 的凭据是否已撤销');
console.log('2. 确保所有 API Keys 都存储在环境变量中，不要硬编码');
console.log('3. 定期轮换 API Keys');
console.log('4. 监控 API 使用情况，发现异常立即处理');
console.log('');
