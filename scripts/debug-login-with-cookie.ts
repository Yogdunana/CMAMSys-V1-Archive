import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 调试登录流程（带 Cookie）===\n');

  // 1. 查找管理员用户
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  console.log(`✅ 管理员: ${admin?.username}`);

  // 2. 获取 CSRF Token
  const csrfResponse = await fetch('http://localhost:5000/api/v1/auth/csrf-token');
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.data?.csrfToken || csrfData.data?.token;
  console.log(`✅ CSRF Token: ${csrfToken?.substring(0, 30)}...`);

  // 提取 Set-Cookie header
  const setCookieHeader = csrfResponse.headers.get('set-cookie');
  console.log(`✅ Set-Cookie: ${setCookieHeader?.substring(0, 50)}...`);

  // 3. 登录（带 Cookie）
  const password = 'X-Duan0719';
  const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': setCookieHeader || '',
    },
    body: JSON.stringify({
      email: admin?.email,
      password: password,
    }),
  });

  console.log(`\n登录响应状态: ${loginResponse.status}`);

  const loginData = await loginResponse.json();
  console.log(`登录响应:`, JSON.stringify(loginData, null, 2));

  if (loginData.success) {
    const accessToken = loginData.data.accessToken;
    const refreshToken = loginData.data.refreshToken;

    console.log('\n=================================================');
    console.log('请在浏览器控制台执行以下命令：');
    console.log('=================================================');
    console.log(`localStorage.setItem('accessToken', '${accessToken}');`);
    console.log(`localStorage.setItem('refreshToken', '${refreshToken}');`);
    console.log(`localStorage.setItem('csrfToken', '${csrfToken}');`);
    console.log(`localStorage.setItem('user', '${JSON.stringify(loginData.data.user).replace(/'/g, "\\'")}');`);
    console.log('location.reload();');
    console.log('=================================================');

    // 测试 API
    const costResponse = await fetch('http://localhost:5000/api/cost/stats', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const costData = await costResponse.json();
    console.log(`\nGET /api/cost/stats: ${costResponse.status} ${costData.success ? '✅' : '❌'}`);
    if (costData.data) {
      console.log(`数据:`, costData.data);
    }

    // 测试建模任务
    const tasksResponse = await fetch('http://localhost:5000/api/modeling-tasks', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const tasksData = await tasksResponse.json();
    console.log(`\nGET /api/modeling-tasks: ${tasksResponse.status} ${tasksData.success ? '✅' : '❌'}`);
    console.log(`任务数量: ${tasksData.data?.length || 0}`);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
