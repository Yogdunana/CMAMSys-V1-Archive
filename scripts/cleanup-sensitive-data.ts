import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  开始清理数据库中的敏感数据...\n');

  // 1. 删除所有 AI Provider（它们包含加密的 API Keys）
  console.log('📋 1. 删除所有 AI Provider...');
  const deletedProviders = await prisma.aIProvider.deleteMany({});
  console.log(`   ✅ 已删除 ${deletedProviders.count} 个 AI Provider\n`);

  // 2. 检查是否有用户密码需要重置
  console.log('📋 2. 检查用户密码...');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  console.log(`   ✅ 找到 ${users.length} 个用户:`);
  users.forEach(user => {
    console.log(`      - ${user.email} (${user.username})`);
  });
  console.log('');

  console.log('✅ 数据库清理完成！');
  console.log('');
  console.log('📝 重要提示：');
  console.log('   1. 所有 AI Provider 已被删除');
  console.log('   2. 请在 UI 中重新添加 AI Provider');
  console.log('   3. 用户密码已使用环境变量配置，无需修改');
  console.log('   4. 默认管理员密码: REDACTED_PASSWORD (可通过环境变量 ADMIN_PASSWORD 修改)');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
