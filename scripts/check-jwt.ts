import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking JWT configuration...\n');

  // 检查环境变量
  const jwtSecret = process.env.JWT_SECRET;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  console.log('📋 Environment Variables:');
  console.log(`   JWT_SECRET: ${jwtSecret}`);
  console.log(`   Length: ${jwtSecret?.length} bytes`);
  console.log(`   REFRESH_TOKEN_SECRET: ${refreshTokenSecret?.substring(0, 20)}...`);
  console.log('');

  // 检查用户的 refresh token（如果有）
  const refreshToken = await prisma.refreshToken.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (refreshToken) {
    console.log('📋 Latest Refresh Token:');
    console.log(`   ID: ${refreshToken.id}`);
    console.log(`   User ID: ${refreshToken.userId}`);
    console.log(`   Expires At: ${refreshToken.expiresAt}`);
    console.log(`   Created At: ${refreshToken.createdAt}`);
    console.log(`   Revoked: ${refreshToken.revoked}`);
  } else {
    console.log('ℹ️  No refresh tokens found');
  }

  console.log('\n💡 Solution: Clear your browser localStorage and login again');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
