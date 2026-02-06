import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    console.log('🔐 正在更新管理员账户...');

    // 新的管理员信息
    const newUsername = 'Yogdunana';
    const newEmail = 'yogdunana@yogdunana.com';
    const newPassword = 'X-Duan0719';

    console.log(`\n📋 新的管理员信息:`);
    console.log(`   用户名: ${newUsername}`);
    console.log(`   邮箱: ${newEmail}`);
    console.log(`   密码: ${newPassword}`);

    // 检查是否存在管理员
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!existingAdmin) {
      throw new Error('未找到管理员账户');
    }

    // 哈希新密码
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // 更新管理员账户
    const updatedAdmin = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        username: newUsername,
        email: newEmail,
        passwordHash,
      },
    });

    console.log('\n✅ 管理员账户更新成功！');
    console.log(`   ID: ${updatedAdmin.id}`);
    console.log(`   用户名: ${updatedAdmin.username}`);
    console.log(`   邮箱: ${updatedAdmin.email}`);
    console.log(`   更新时间: ${updatedAdmin.updatedAt}`);

    console.log('\n📝 登录信息:');
    console.log(`   用户名: ${updatedAdmin.username}`);
    console.log(`   邮箱: ${updatedAdmin.email}`);
    console.log(`   密码: ${newPassword}`);

    console.log('\n✅ 更新完成！');

  } catch (error) {
    console.error('❌ 更新管理员账户失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
