#!/usr/bin/env node

/**
 * 创建管理员账户脚本
 * 由 install-cli.js 调用
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL 和 ADMIN_PASSWORD 环境变量必须设置');
    }
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      console.log(`用户 ${email} 已存在`);
      return;
    }
    
    // 生成密码哈希
    const passwordHash = await bcrypt.hash(password, 14);
    
    // 创建管理员用户
    await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
      },
    });
    
    console.log(`管理员账户已创建: ${username} (${email})`);
  } catch (error) {
    console.error('创建管理员账户失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
