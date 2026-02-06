import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 测试数据库连接...');
    
    // 测试查询
    const result = await prisma.$queryRaw`SELECT datetime('now') as now`;
    console.log('✅ 数据库连接成功');
    console.log('📅 数据库时间:', result[0]);
    
    // 查看表列表
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `;
    console.log('\n📊 数据表列表:');
    tables.forEach((table: any) => console.log(`  - ${table.name}`));
    
    // 查看用户数量
    const userCount = await prisma.user.count();
    console.log('\n👥 当前用户数:', userCount);
    
    console.log('\n✅ 数据库测试完成！');
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
