#!/usr/bin/env node

/**
 * CMAMSys 命令行安装向导
 * 使用方法: node scripts/install-cli.js
 */

const readline = require('readline');
const fs = require('fs/promises');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

function printHeader() {
  console.log('\n' + '='.repeat(60));
  console.log('  CMAMSys 安装向导 - 命令行版本');
  console.log('  企业级数学建模竞赛自动化系统');
  console.log('='.repeat(60) + '\n');
}

function printStep(step, title) {
  console.log(`\n[步骤 ${step}] ${title}`);
  console.log('-'.repeat(60));
}

function printSuccess(message) {
  console.log(`✓ ${message}`);
}

function printError(message) {
  console.log(`✗ ${message}`);
}

function printInfo(message) {
  console.log(`ℹ ${message}`);
}

async function checkEnvironment() {
  printStep(1, '环境检查');
  
  const checks = [];
  
  // 检查 Node.js
  try {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim();
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    if (majorVersion >= 18) {
      printSuccess(`Node.js 版本: ${version}`);
      checks.push(true);
    } else {
      printError(`Node.js 版本过低: ${version} (需要 >= 18)`);
      checks.push(false);
    }
  } catch {
    printError('Node.js 未安装');
    checks.push(false);
  }
  
  // 检查 pnpm
  try {
    const { stdout } = await execAsync('pnpm --version');
    printSuccess(`pnpm 版本: ${stdout.trim()}`);
    checks.push(true);
  } catch {
    printError('pnpm 未安装');
    checks.push(false);
  }
  
  // 检查数据库
  try {
    await execAsync('pg_isready -h localhost -p 5432', { timeout: 5000 });
    printSuccess('PostgreSQL 可用');
    checks.push(true);
  } catch {
    printInfo('PostgreSQL 未检测到，将使用 Docker 部署');
    checks.push(true);
  }
  
  return checks.every(Boolean);
}

async function promptDatabaseConfig() {
  printStep(2, '数据库配置');
  
  const useDocker = await question('是否使用 Docker 部署数据库？(Y/n): ');
  
  if (useDocker.toLowerCase() === 'n') {
    printInfo('配置已有数据库连接...');
    
    const host = await question('数据库地址 (默认: localhost): ') || 'localhost';
    const port = parseInt(await question('数据库端口 (默认: 5432): ')) || 5432;
    const name = await question('数据库名称 (默认: cmamsys): ') || 'cmamsys';
    const user = await question('数据库用户 (默认: postgres): ') || 'postgres';
    const password = await question('数据库密码: ');
    
    return {
      useDocker: false,
      host,
      port,
      name,
      user,
      password,
    };
  }
  
  return {
    useDocker: true,
  };
}

async function promptAdminAccount() {
  printStep(3, '管理员账户');
  
  const username = await question('管理员用户名 (默认: admin): ') || 'admin';
  const email = await question('管理员邮箱: ');
  const password = await question('管理员密码: ');
  const confirmPassword = await question('确认密码: ');
  
  if (password !== confirmPassword) {
    printError('两次输入的密码不一致');
    return promptAdminAccount();
  }
  
  return { username, email, password };
}

async function promptAppConfig() {
  printStep(4, '应用配置');
  
  const appName = await question('应用名称 (默认: CMAMSys): ') || 'CMAMSys';
  const appUrl = await question('应用 URL (默认: http://localhost:5000): ') || 'http://localhost:5000';
  const appPort = parseInt(await question('应用端口 (默认: 5000): ')) || 5000;
  
  const enableRedis = await question('是否启用 Redis？(y/N): ');
  const redisUrl = enableRedis.toLowerCase() === 'y' ? await question('Redis URL (默认: redis://localhost:6379): ') || 'redis://localhost:6379' : '';
  
  return {
    appName,
    appUrl,
    appPort,
    enableRedis: enableRedis.toLowerCase() === 'y',
    redisUrl,
  };
}

function generateSecret() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function promptSecurityConfig() {
  printStep(5, '安全配置');
  
  const autoGenerate = await question('是否自动生成安全密钥？(Y/n): ');
  
  if (autoGenerate.toLowerCase() !== 'n') {
    printSuccess('已自动生成安全密钥');
    return {
      jwtSecret: generateSecret(),
      refreshTokenSecret: generateSecret(),
      encryptionKey: generateSecret(),
      csrfSecret: generateSecret(),
      sessionSecret: generateSecret(),
    };
  }
  
  printInfo('请手动输入安全密钥（或留空自动生成）');
  
  const jwtSecret = await question('JWT Secret (留空自动生成): ') || generateSecret();
  const refreshTokenSecret = await question('Refresh Token Secret (留空自动生成): ') || generateSecret();
  const encryptionKey = await question('Encryption Key (留空自动生成): ') || generateSecret();
  const csrfSecret = await question('CSRF Secret (留空自动生成): ') || generateSecret();
  const sessionSecret = await question('Session Secret (留空自动生成): ') || generateSecret();
  
  return {
    jwtSecret,
    refreshTokenSecret,
    encryptionKey,
    csrfSecret,
    sessionSecret,
  };
}

function generateEnvFile(config) {
  const lines = [
    '# CMAMSys Environment Configuration',
    '# Generated by Install CLI',
    '',
    '# Database',
    `DATABASE_URL="postgresql://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}"`,
    '',
    '# Authentication',
    `JWT_SECRET="${config.security.jwtSecret}"`,
    `JWT_ACCESS_TOKEN_EXPIRY="15m"`,
    `JWT_REFRESH_TOKEN_EXPIRY="7d"`,
    `REFRESH_TOKEN_SECRET="${config.security.refreshTokenSecret}"`,
    '',
    '# Encryption',
    `ENCRYPTION_KEY="${config.security.encryptionKey}"`,
    '',
    '# Security',
    `CSRF_SECRET="${config.security.csrfSecret}"`,
    `BCRYPT_ROUNDS="14"`,
    `MAX_LOGIN_ATTEMPTS="5"`,
    `LOCKOUT_DURATION_MS="900000"`,
    '',
    '# Session',
    `SESSION_SECRET="${config.security.sessionSecret}"`,
    `SESSION_MAX_AGE=604800000`,
    '',
    '# Application',
    `APP_NAME="${config.app.appName}"`,
    `APP_URL="${config.app.appUrl}"`,
    `APP_PORT="${config.app.appPort}"`,
    `NODE_ENV="production"`,
    '',
    '# Redis',
    `REDIS_URL="${config.app.enableRedis ? config.app.redisUrl : ''}"`,
    '',
    '# Monitoring',
    `SENTRY_DSN=""`,
    '',
    '# API Versioning',
    `API_DEFAULT_VERSION="v1"`,
    '',
    '# CORS',
    `ALLOWED_ORIGINS="${config.app.appUrl}"`,
    `ALLOWED_METHODS="GET,POST,PUT,DELETE,PATCH,OPTIONS"`,
    `ALLOWED_HEADERS="Content-Type,Authorization,X-CSRF-Token"`,
    '',
    '# Upload',
    `MAX_FILE_SIZE=10485760`,
    `ALLOWED_FILE_TYPES=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif"`,
  ];
  
  return lines.join('\n');
}

async function install(config) {
  printStep(6, '开始安装');
  
  try {
    // 1. 生成环境变量文件
    printInfo('生成环境变量文件...');
    const envContent = generateEnvFile(config);
    await fs.writeFile('.env', envContent);
    printSuccess('环境变量文件已生成');
    
    // 2. 安装依赖
    printInfo('安装依赖...');
    await execAsync('pnpm install', { stdio: 'inherit' });
    printSuccess('依赖安装完成');
    
    // 3. 运行数据库迁移
    printInfo('运行数据库迁移...');
    await execAsync('pnpm prisma migrate deploy', { stdio: 'inherit' });
    printSuccess('数据库迁移完成');
    
    // 4. 生成 Prisma Client
    printInfo('生成 Prisma Client...');
    await execAsync('pnpm prisma generate', { stdio: 'inherit' });
    printSuccess('Prisma Client 已生成');
    
    // 5. 创建管理员账户
    printInfo('创建管理员账户...');
    await execAsync(`node scripts/create-admin.js`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        ADMIN_USERNAME: config.admin.username,
        ADMIN_EMAIL: config.admin.email,
        ADMIN_PASSWORD: config.admin.password,
      },
    });
    printSuccess('管理员账户已创建');
    
    // 6. 创建安装标记文件
    await fs.writeFile('.installed', new Date().toISOString());
    printSuccess('安装标记文件已创建');
    
    return true;
  } catch (error) {
    printError(`安装失败: ${error.message}`);
    return false;
  }
}

async function main() {
  printHeader();
  
  try {
    // 环境检查
    const envOk = await checkEnvironment();
    if (!envOk) {
      printError('环境检查未通过，请解决后重试');
      process.exit(1);
    }
    
    // 收集配置
    const dbConfig = await promptDatabaseConfig();
    const adminConfig = await promptAdminAccount();
    const appConfig = await promptAppConfig();
    const securityConfig = await promptSecurityConfig();
    
    const config = {
      db: dbConfig,
      admin: adminConfig,
      app: appConfig,
      security: securityConfig,
    };
    
    // 确认安装
    printStep(7, '确认安装');
    console.log('\n配置摘要:');
    console.log(`  应用名称: ${config.app.appName}`);
    console.log(`  应用 URL: ${config.app.appUrl}`);
    console.log(`  管理员用户名: ${config.admin.username}`);
    console.log(`  管理员邮箱: ${config.admin.email}`);
    console.log(`  数据库: ${config.db.useDocker ? 'Docker 部署' : `${config.db.host}:${config.db.port}/${config.db.name}`}`);
    console.log('');
    
    const confirm = await question('确认开始安装？(Y/n): ');
    if (confirm.toLowerCase() === 'n') {
      printInfo('安装已取消');
      process.exit(0);
    }
    
    // 执行安装
    const success = await install(config);
    
    if (success) {
      printStep(8, '安装完成');
      console.log('\n' + '='.repeat(60));
      console.log('  安装成功！');
      console.log('='.repeat(60));
      console.log('\n下一步操作:');
      console.log('  1. 启动应用: coze dev');
      console.log(`  2. 访问应用: ${config.app.appUrl}`);
      console.log(`  3. 使用管理员账户登录: ${config.admin.username}`);
      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      printError('安装失败');
      process.exit(1);
    }
  } catch (error) {
    printError(`安装过程中出错: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
