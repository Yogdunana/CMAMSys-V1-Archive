import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking AI Providers...\n');

  const providers = await prisma.aIProvider.findMany();

  console.log(`📊 Total Providers: ${providers.length}\n`);

  providers.forEach((provider) => {
    console.log(`🔹 ${provider.name} (${provider.id})`);
    console.log(`   Type: ${provider.type}`);
    console.log(`   Status: ${provider.status}`);
    console.log(`   Priority: ${provider.priority}`);
    console.log(`   Is Default: ${provider.isDefault}`);
    console.log(`   Endpoint: ${provider.endpoint}`);
    console.log(`   Supported Models: ${provider.supportedModels?.join(', ')}`);
    console.log(`   Config: ${JSON.stringify(provider.config || {}, null, 2)}`);
    console.log(`   Created By: ${provider.createdById}`);
    console.log('');
  });

  console.log('✅ AI Providers check completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
