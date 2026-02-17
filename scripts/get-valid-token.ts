import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Session 模型不存在，改为查找 RefreshToken
  const refreshToken = await prisma.refreshToken.findFirst({
    where: { userId: 'cmlhk5o5500005kisja9kg1iu' },
    orderBy: { createdAt: 'desc' },
  });

  if (refreshToken) {
    console.log('Token exists:', refreshToken.token.substring(0, 20) + '...');
  } else {
    console.log('No refresh token found');
  }
}

main().finally(() => prisma.$disconnect());
