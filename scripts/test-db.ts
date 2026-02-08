import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 正在测试数据库连接...');

    // 测试基本连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功！');

    // 统计表数量
    const tableCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    console.log(`📊 数据库中有 ${tableCount[0].count} 张表`);

    // 统计用户数量
    const userCount = await prisma.user.count();
    console.log(`👤 用户数量: ${userCount}`);

    // 统计竞赛数量
    const competitionCount = await prisma.competition.count();
    console.log(`🏆 竞赛数量: ${competitionCount}`);

    // 统计任务数量
    const taskCount = await prisma.modelingTask.count();
    console.log(`📊 任务数量: ${taskCount}`);

    // 统计团队数量
    const teamCount = await prisma.team.count();
    console.log(`👥 团队数量: ${teamCount}`);

    // 测试查询
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (admin) {
      console.log('\n👑 管理员账户:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   邮箱: ${admin.email}`);
      console.log(`   用户名: ${admin.username}`);
      console.log(`   创建时间: ${admin.createdAt}`);
    }

    console.log('\n✅ 数据库连接测试完成！');

  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
