import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking discussion participants...\n');

  const discussionId = 'cmlnxdhx5000qvf0flyyl3l9i';

  const discussion = await prisma.groupDiscussion.findUnique({
    where: { id: discussionId },
  });

  if (!discussion) {
    console.error('❌ Discussion not found');
    process.exit(1);
  }

  console.log('📋 Discussion Info:');
  console.log(`   ID: ${discussion.id}`);
  console.log(`   Title: ${discussion.discussionTitle}`);
  console.log(`   Status: ${discussion.status}`);
  console.log(`   Competition Type: ${discussion.competitionType}`);
  console.log(`   Problem Type: ${discussion.problemType}`);
  console.log(`   Problem Title: ${discussion.problemTitle}`);
  console.log('');

  console.log('👥 Participants (JSON):');
  console.log(JSON.stringify(discussion.participants, null, 2));
  console.log('');

  // 检查所有可用的 AI Providers
  console.log('🤖 Available AI Providers:');
  const providers = await prisma.aIProvider.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { priority: 'asc' },
  });

  providers.forEach(p => {
    console.log(`   - ${p.name} (${p.id})`);
    console.log(`     Type: ${p.type}`);
    console.log(`     Priority: ${p.priority}`);
    console.log(`     Is Default: ${p.isDefault}`);
    console.log(`     Models: ${p.supportedModels?.join(', ')}`);
  });

  // 检查讨论是否应该参与讨论
  console.log('\n🎯 Expected Discussion Flow:');
  console.log('   1. Discussion has participants field with Provider IDs');
  console.log('   2. Each Provider (DeepSeek, Aliyun, Volcengine) generates their view');
  console.log('   3. Each message has: role (provider name), content (their analysis)');
  console.log('   4. Format: "Core Algorithm + Innovation Points + Feasibility Analysis"');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
