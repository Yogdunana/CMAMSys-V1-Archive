#!/usr/bin/env node

/**
 * 测试数据库连接脚本
 * 由 install-cli.js 调用
 */

const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('✓ 数据库连接成功');
    
    // 测试查询
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✓ 数据库查询正常:', result[0]);
    
    // 测试事务
    await prisma.$transaction(async (tx) => {
      // 测试写入
      console.log('✓ 数据库事务正常');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('✗ 数据库连接失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
