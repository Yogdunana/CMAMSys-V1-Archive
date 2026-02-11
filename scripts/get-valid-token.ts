import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const session = await prisma.session.findFirst({
    where: { userId: 'cmlhk5o5500005kisja9kg1iu' },
    orderBy: { createdAt: 'desc' },
  });

  if (session) {
    console.log(session.accessToken);
  }
}

main().finally(() => prisma.$disconnect());
