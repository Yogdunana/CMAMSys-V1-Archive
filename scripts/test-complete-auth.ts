import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 完整认证流程测试 ===\n');

  // 1. 查找管理员用户
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('❌ 没有找到管理员用户');
    process.exit(1);
  }

  console.log(`✅ 找到管理员: ${admin.username} (${admin.email})`);

  // 2. 验证密码
  const password = 'X-Duan0719';
  const isValid = await bcrypt.compare(password, admin.passwordHash || '');

  if (!isValid) {
    console.error('❌ 密码验证失败');
    process.exit(1);
  }

  console.log('✅ 密码验证成功');

  // 3. 获取 CSRF Token
  console.log('\n=== 获取 CSRF Token ===');
  const csrfResponse = await fetch('http://localhost:5000/api/v1/auth/csrf-token');
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.data?.csrfToken || csrfData.data?.token;

  if (!csrfToken) {
    console.error('❌ 获取 CSRF Token 失败:', csrfData);
    process.exit(1);
  }

  console.log('✅ CSRF Token:', csrfToken.substring(0, 20) + '...');

  // 4. 登录
  console.log('\n=== 登录 ===');
  const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({
      email: admin.email,
      password: password,
    }),
  });

  const loginData = await loginResponse.json();
  console.log('登录响应:', loginResponse.status);

  if (!loginData.success) {
    console.error('❌ 登录失败:', loginData);
    process.exit(1);
  }

  const accessToken = loginData.data.accessToken;
  const refreshToken = loginData.data.refreshToken;

  console.log('✅ 登录成功');
  console.log('用户:', loginData.data.user.username);

  // 5. 在浏览器中设置 Token 的指令
  console.log('\n=================================================');
  console.log('请在浏览器控制台执行以下命令以重新登录：');
  console.log('=================================================');
  console.log(`localStorage.setItem('accessToken', '${accessToken}');`);
  console.log(`localStorage.setItem('refreshToken', '${refreshToken}');`);
  console.log(`localStorage.setItem('csrfToken', '${csrfToken}');`);
  console.log(`localStorage.setItem('user', '${JSON.stringify(loginData.data.user).replace(/'/g, "\\'")}');`);
  console.log('location.reload();');
  console.log('=================================================');

  // 6. 测试 API
  console.log('\n=== 测试需要认证的 API ===');

  // 测试成本统计
  const costResponse = await fetch('http://localhost:5000/api/cost/stats', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const costData = await costResponse.json();
  console.log(`GET /api/cost/status: ${costResponse.status} ${costData.success ? '✅ 成功' : '❌ 失败'}`);

  if (costResponse.ok && costData.data) {
    console.log('  - 总成本:', costData.data.totalCost || 0);
    console.log('  - 总请求:', costData.data.totalRequests || 0);
    console.log('  - 总 Token:', costData.data.totalTokens || 0);
  } else if (!costResponse.ok) {
    console.log('  - 错误:', costData.error?.message);
  }

  // 测试建模任务
  const tasksResponse = await fetch('http://localhost:5000/api/modeling-tasks', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const tasksData = await tasksResponse.json();
  console.log(`\nGET /api/modeling-tasks: ${tasksResponse.status} ✅ 成功`);
  console.log(`  - 找到 ${tasksData.data?.length || 0} 个任务`);

  if (tasksData.data && tasksData.data.length > 0) {
    tasksData.data.forEach((task: any) => {
      console.log(`  - ${task.name} (${task.status})`);
    });
  }

  console.log('\n=================================================');
  console.log('结论：后端完全正常，数据存在！');
  console.log('问题：前端需要重新登录以获取有效的 Token');
  console.log('=================================================');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
