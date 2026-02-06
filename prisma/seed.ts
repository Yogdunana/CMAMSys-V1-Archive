import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据初始化...');

  // 创建默认管理员账户
  const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@cmamsys.com';
  const defaultAdminUsername = process.env.ADMIN_USERNAME || 'admin';
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';

  console.log(`\n📋 默认管理员账户:`);
  console.log(`   邮箱: ${defaultAdminEmail}`);
  console.log(`   用户名: ${defaultAdminUsername}`);

  // 检查是否已存在管理员
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log('\n⚠️  管理员账户已存在，跳过创建');
    console.log(`   ID: ${existingAdmin.id}`);
    console.log(`   邮箱: ${existingAdmin.email}`);
    console.log(`   用户名: ${existingAdmin.username}`);
  } else {
    // 哈希密码
    const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);

    // 创建管理员
    const admin = await prisma.user.create({
      data: {
        email: defaultAdminEmail,
        username: defaultAdminUsername,
        passwordHash,
        role: 'ADMIN',
        authProvider: 'LOCAL',
        isVerified: true,
        organization: 'CMAMSys',
      },
    });

    console.log('\n✅ 默认管理员账户创建成功!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   邮箱: ${admin.email}`);
    console.log(`   用户名: ${admin.username}`);
    console.log(`   密码: ${defaultAdminPassword}`);
    console.log(`   创建时间: ${admin.createdAt}`);
  }

  console.log('\n🌱 种子数据初始化完成!');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
