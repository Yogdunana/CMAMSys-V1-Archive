import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔓 Unlocking account: yogdunana@yogdunana.com');

  // 1. 查找用户
  const user = await prisma.user.findUnique({
    where: { email: 'yogdunana@yogdunana.com' },
  });

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  console.log('📊 Current user status:', {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  });

  // 2. 清除所有登录失败记录
  const deletedLogs = await prisma.loginLog.deleteMany({
    where: {
      userId: user.id,
      success: false,
    },
  });

  console.log(`🗑️  Deleted ${deletedLogs.count} failed login attempts`);

  // 3. 检查并清除密码重置令牌（如果有）
  const deletedTokens = await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  if (deletedTokens.count > 0) {
    console.log(`🗑️  Deleted ${deletedTokens.count} password reset tokens`);
  }

  // 4. 重置用户的失败登录次数和锁定状态
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  console.log('🔓 Reset user login state:', {
    failedLoginAttempts: updatedUser.failedLoginAttempts,
    lockedUntil: updatedUser.lockedUntil,
  });

  console.log('✅ Account unlocked successfully!');
  console.log('');
  console.log('📝 You can now login with:');
  console.log('   Email: yogdunana@yogdunana.com');
  console.log('   Password: X-Duan0719');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
