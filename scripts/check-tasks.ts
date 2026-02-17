import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking all data in database...\n');

  // 1. 检查用户
  const users = await prisma.user.findMany();
  console.log(`👤 Users: ${users.length}`);
  users.forEach(u => {
    console.log(`   - ${u.email} (${u.role})`);
  });

  // 2. 检查竞赛
  const competitions = await prisma.competition.findMany();
  console.log(`\n🏆 Competitions: ${competitions.length}`);
  competitions.forEach(c => {
    console.log(`   - ${c.name} (${c.id})`);
  });

  // 3. 检查建模任务
  const modelingTasks = await prisma.autoModelingTask.findMany();
  console.log(`\n🤖 Auto Modeling Tasks: ${modelingTasks.length}`);
  modelingTasks.forEach(t => {
    console.log(`   - ${t.problemTitle} (${t.id}) - Status: ${t.overallStatus}`);
  });

  // 4. 检查群组讨论
  const discussions = await prisma.groupDiscussion.findMany();
  console.log(`\n💬 Group Discussions: ${discussions.length}`);
  discussions.forEach(d => {
    console.log(`   - ${d.discussionTitle} (${d.id})`);
  });

  // 5. 检查论文
  const papers = await prisma.generatedPaper.findMany();
  console.log(`\n📄 Generated Papers: ${papers.length}`);
  papers.forEach(p => {
    console.log(`   - ${p.title} (${p.id})`);
  });

  // 6. 检查代码生成
  const codeGenerations = await prisma.codeGeneration.findMany();
  console.log(`\n💻 Code Generations: ${codeGenerations.length}`);

  // 7. 检查登录日志
  const loginLogs = await prisma.loginLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log(`\n📋 Recent Login Logs (latest 5): ${loginLogs.length}`);
  loginLogs.forEach(l => {
    console.log(`   - ${l.email} - Success: ${l.success} - ${l.createdAt}`);
  });

  console.log('\n✅ Data check completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
