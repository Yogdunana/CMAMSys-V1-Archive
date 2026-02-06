import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database contents...');

  // Check users
  const userCount = await prisma.user.count();
  console.log(`📊 Users: ${userCount}`);

  if (userCount > 0) {
    const users = await prisma.user.findMany({ take: 3 });
    console.log('Users:', users.map(u => ({ id: u.id, email: u.email, username: u.username })));
  }

  // Check AI providers
  const providerCount = await prisma.aIProvider.count();
  console.log(`📊 AI Providers: ${providerCount}`);

  if (providerCount > 0) {
    const providers = await prisma.aIProvider.findMany({ take: 3 });
    console.log('Providers:', providers.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.status,
      createdById: p.createdById
    })));
  }

  console.log('✅ Check completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
