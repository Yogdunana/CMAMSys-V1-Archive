import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking code generation...\n');

  const taskId = 'cmlnxdhu5000pvf0fa8yrdmbn';

  // 查找代码生成记录
  const codeGenerations = await prisma.codeGeneration.findMany({
    where: { autoTaskId: taskId },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`📊 Found ${codeGenerations.length} code generation records`);

  codeGenerations.forEach((gen, index) => {
    console.log(`\n${index + 1}. Code Generation:`);
    console.log(`   ID: ${gen.id}`);
    console.log(`   Language: ${gen.codeLanguage}`);
    console.log(`   Status: ${gen.executionStatus}`);
    console.log(`   Created At: ${gen.createdAt}`);
    console.log(`   Code Length: ${gen.codeContent?.length || 0} chars`);
    console.log(`   Error: ${gen.errorMessage || 'None'}`);
  });

  if (codeGenerations.length === 0) {
    console.log('\n⚠️  No code generation records found');
    console.log('💡 Code generation may have failed or timed out');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
