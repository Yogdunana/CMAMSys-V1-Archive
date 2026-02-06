import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据初始化...');

  // ============================================
  // 1. 创建默认管理员账户
  // ============================================
  const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@cmamsys.com';
  const defaultAdminUsername = process.env.ADMIN_USERNAME || 'admin';
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';

  console.log(`\n📋 默认管理员账户:`);
  console.log(`   邮箱: ${defaultAdminEmail}`);
  console.log(`   用户名: ${defaultAdminUsername}`);

  let admin: any;
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log('\n⚠️  管理员账户已存在，跳过创建');
    console.log(`   ID: ${existingAdmin.id}`);
    console.log(`   邮箱: ${existingAdmin.email}`);
    console.log(`   用户名: ${existingAdmin.username}`);
    admin = existingAdmin;
  } else {
    // 哈希密码
    const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);

    // 创建管理员
    admin = await prisma.user.create({
      data: {
        email: defaultAdminEmail,
        username: defaultAdminUsername,
        passwordHash,
        role: 'ADMIN',
        authProvider: 'LOCAL',
        isVerified: true,
        organization: 'CMAMSys',
      },
    });

    console.log('\n✅ 默认管理员账户创建成功!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   邮箱: ${admin.email}`);
    console.log(`   用户名: ${admin.username}`);
    console.log(`   密码: ${defaultAdminPassword}`);
    console.log(`   创建时间: ${admin.createdAt}`);
  }

  // ============================================
  // 2. 创建示例竞赛
  // ============================================
  console.log('\n🏆 创建示例竞赛...');

  const competitions = [
    {
      name: '2025 MCM/ICM 美国大学生数学建模竞赛',
      type: 'MCM',
      year: 2025,
      problemId: 'MCM2025-A',
      folderPath: '/competitions/mcm/2025',
      description: 'Mathematical Contest in Modeling (MCM) - 2025 Edition',
      status: 'IN_PROGRESS',
      startDate: new Date('2025-02-06T18:00:00Z'),
      endDate: new Date('2025-02-10T22:00:00Z'),
    },
    {
      name: '2024 全国大学生数学建模竞赛',
      type: 'CUMCM',
      year: 2024,
      problemId: 'CUMCM2024-A',
      folderPath: '/competitions/cumcm/2024',
      description: 'China Undergraduate Mathematical Contest in Modeling',
      status: 'COMPLETED',
      startDate: new Date('2024-09-12T08:00:00Z'),
      endDate: new Date('2024-09-15T20:00:00Z'),
    },
    {
      name: '2025 深圳杯数学建模挑战赛',
      type: 'SHENZHEN_CUP',
      year: 2025,
      problemId: 'SZ2025-A',
      folderPath: '/competitions/shenzhen/2025',
      description: 'Shenzhen Cup Mathematical Modeling Challenge',
      status: 'DRAFT',
      startDate: new Date('2025-05-01T08:00:00Z'),
      endDate: new Date('2025-05-04T20:00:00Z'),
    },
  ];

  for (const compData of competitions) {
    const existingComp = await prisma.competition.findFirst({
      where: {
        type: compData.type,
        year: compData.year,
        problemId: compData.problemId,
      },
    });

    if (!existingComp) {
      const competition = await prisma.competition.create({
        data: {
          ...compData,
          createdById: admin.id,
        },
      });
      console.log(`   ✅ 创建竞赛: ${competition.name}`);
    } else {
      console.log(`   ⚠️  竞赛已存在: ${compData.name}`);
    }
  }

  // ============================================
  // 3. 创建示例团队
  // ============================================
  console.log('\n👥 创建示例团队...');

  const teams = [
    {
      name: 'MCM 2025 团队 A',
      description: '参加 MCM 2025 竞赛的团队',
      maxMembers: 3,
    },
    {
      name: 'CUMCM 2024 冠军队',
      description: '获得 CUMCM 2024 一等奖的团队',
      maxMembers: 3,
    },
  ];

  const createdTeams: any[] = [];

  for (const teamData of teams) {
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: teamData.name,
        ownerId: admin.id,
      },
    });

    if (!existingTeam) {
      const team = await prisma.team.create({
        data: {
          ...teamData,
          ownerId: admin.id,
        },
      });
      createdTeams.push(team);
      console.log(`   ✅ 创建团队: ${team.name}`);

      // 将管理员添加为团队成员
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: admin.id,
          role: 'OWNER',
        },
      });
    } else {
      createdTeams.push(existingTeam);
      console.log(`   ⚠️  团队已存在: ${teamData.name}`);
    }
  }

  // ============================================
  // 4. 获取已创建的竞赛 ID
  // ============================================
  const mcmCompetition = await prisma.competition.findFirst({
    where: {
      type: 'MCM',
      year: 2025,
    },
  });

  // ============================================
  // 5. 创建示例建模任务
  // ============================================
  console.log('\n📊 创建示例建模任务...');

  const tasks = [
    {
      name: 'MCM 2025 Problem A - 数据预处理',
      description: '对竞赛数据进行清洗和预处理',
      problemType: 'EVALUATION',
      status: 'COMPLETED',
      progress: 100,
      algorithm: 'RandomForest',
      approachNumber: 1,
    },
    {
      name: 'MCM 2025 Problem A - 模型训练',
      description: '训练评估模型',
      problemType: 'EVALUATION',
      status: 'MODELING',
      progress: 65,
      algorithm: 'XGBoost',
      approachNumber: 1,
    },
    {
      name: 'CUMCM 2024 - 优化问题求解',
      description: '使用遗传算法求解优化问题',
      problemType: 'OPTIMIZATION',
      status: 'COMPLETED',
      progress: 100,
      algorithm: 'GeneticAlgorithm',
      approachNumber: 2,
    },
    {
      name: '预测模型 - 时间序列分析',
      description: '构建时间序列预测模型',
      problemType: 'PREDICTION',
      status: 'PENDING',
      progress: 0,
      algorithm: 'LSTM',
      approachNumber: 1,
    },
    {
      name: '分类任务 - 客户细分',
      description: '使用聚类算法进行客户细分',
      problemType: 'CLASSIFICATION',
      status: 'MODELING',
      progress: 40,
      algorithm: 'KMeans',
      approachNumber: 1,
    },
  ];

  for (const taskData of tasks) {
    const existingTask = await prisma.modelingTask.findFirst({
      where: {
        name: taskData.name,
        createdById: admin.id,
      },
    });

    if (!existingTask) {
      const task = await prisma.modelingTask.create({
        data: {
          ...taskData,
          createdById: admin.id,
          competitionId: tasks.indexOf(taskData) < 2 ? (mcmCompetition?.id || null) : null,
          dataFilePath: `/data/${taskData.name.toLowerCase().replace(/\s+/g, '_')}/data.csv`,
          problemFilePath: `/data/${taskData.name.toLowerCase().replace(/\s+/g, '_')}/problem.pdf`,
          metrics: {
            accuracy: 0.85,
            precision: 0.82,
            recall: 0.88,
            f1Score: 0.85,
          },
        },
      });

      const statusText: Record<string, string> = {
        PENDING: '待处理',
        PREPROCESSING: '预处理中',
        MODELING: '建模中',
        EVALUATING: '评估中',
        REPORTING: '生成报告中',
        COMPLETED: '已完成',
        FAILED: '失败',
      };

      console.log(`   ✅ 创建任务: ${task.name} (${statusText[task.status as keyof typeof statusText]})`);
    } else {
      console.log(`   ⚠️  任务已存在: ${taskData.name}`);
    }
  }

  // ============================================
  // 5. 创建系统配置
  // ============================================
  console.log('\n⚙️  创建系统配置...');

  const systemSettings = [
    { key: 'app_name', value: 'CMAMSys', category: 'general', description: '应用名称' },
    { key: 'app_version', value: '1.0.0', category: 'general', description: '应用版本' },
    { key: 'max_upload_size', value: '104857600', category: 'general', description: '最大上传文件大小 (字节)' },
    { key: 'default_team_size', value: '3', category: 'general', description: '默认团队规模' },
    { key: 'ai_default_provider', value: 'DEEPSEEK', category: 'ai', description: '默认 AI 提供商' },
    { key: 'ai_max_tokens', value: '4096', category: 'ai', description: 'AI 最大 token 数' },
    { key: 'email_smtp_host', value: 'smtp.gmail.com', category: 'email', description: 'SMTP 主机' },
    { key: 'email_smtp_port', value: '587', category: 'email', description: 'SMTP 端口' },
  ];

  for (const settingData of systemSettings) {
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key: settingData.key },
    });

    if (!existingSetting) {
      const setting = await prisma.systemSetting.create({
        data: settingData,
      });
      console.log(`   ✅ 创建配置: ${setting.key}`);
    } else {
      console.log(`   ⚠️  配置已存在: ${settingData.key}`);
    }
  }

  // ============================================
  // 6. 创建学习配置
  // ============================================
  console.log('\n📚 创建学习配置...');

  const existingLearningConfig = await prisma.learningConfig.findFirst();

  if (!existingLearningConfig) {
    const learningConfig = await prisma.learningConfig.create({
      data: {
        autoLearningEnabled: true,
        dailyVideoTarget: 3,
        learningStartTime: '00:00',
        learningEndTime: '06:00',
        allowedDaysOfWeek: ['0', '1', '2', '3', '4', '5', '6'],
        maxConcurrentTasks: 2,
        pauseOnHighLoad: true,
        cpuThreshold: 80,
        memoryThreshold: 80,
        searchKeywords: ['数学建模', 'matlab', 'python', '机器学习', '数据分析', '优化算法'],
        searchResultsLimit: 10,
        minVideoDuration: 300,
        maxVideoDuration: 3600,
        minViewCount: 1000,
        learningMode: 'auto',
        requiredTags: ['数学建模', '算法', '编程'],
      },
    });
    console.log(`   ✅ 创建学习配置`);
  } else {
    console.log(`   ⚠️  学习配置已存在`);
  }

  // ============================================
  // 统计信息
  // ============================================
  console.log('\n📊 数据统计:');

  const userCount = await prisma.user.count();
  const competitionCount = await prisma.competition.count();
  const taskCount = await prisma.modelingTask.count();
  const teamCount = await prisma.team.count();
  const settingCount = await prisma.systemSetting.count();

  console.log(`   👤 用户: ${userCount}`);
  console.log(`   🏆 竞赛: ${competitionCount}`);
  console.log(`   📊 任务: ${taskCount}`);
  console.log(`   👥 团队: ${teamCount}`);
  console.log(`   ⚙️  配置: ${settingCount}`);

  console.log('\n🌱 种子数据初始化完成!');
  console.log('\n📝 管理员登录信息:');
  console.log(`   邮箱: ${defaultAdminEmail}`);
  console.log(`   用户名: ${defaultAdminUsername}`);
  console.log(`   密码: ${defaultAdminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
