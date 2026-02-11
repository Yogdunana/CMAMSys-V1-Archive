import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 完整测试 ===\n');

  // 1. 获取 CSRF Token
  const csrfResponse = await fetch('http://localhost:5000/api/v1/auth/csrf-token');
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.data?.csrfToken;
  const setCookieHeader = csrfResponse.headers.get('set-cookie');

  // 2. 登录
  const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': setCookieHeader || '',
    },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: '***REDACTED_PASSWORD***',
    }),
  });

  const loginData = await loginResponse.json();
  const accessToken = loginData.data.accessToken;

  console.log('✅ 登录成功');

  // 3. 测试成本统计 API
  const costResponse = await fetch('http://localhost:5000/api/cost/stats', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const costText = await costResponse.text();
  console.log(`\nGET /api/cost/status: ${costResponse.status}`);
  console.log(`Content-Type: ${costResponse.headers.get('content-type')}`);
  console.log(`Response: ${costText}`);

  try {
    const costData = JSON.parse(costText);
    console.log(`Success: ${costData.success}`);
    if (costData.data) {
      console.log('Data:', JSON.stringify(costData.data, null, 2));
    } else if (costData.error) {
      console.log('Error:', costData.error);
    }
  } catch (e) {
    console.log('Failed to parse JSON');
  }

  // 4. 测试建模任务 API
  const tasksResponse = await fetch('http://localhost:5000/api/modeling-tasks', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const tasksData = await tasksResponse.json();
  console.log(`\nGET /api/modeling-tasks: ${tasksResponse.status} ${tasksData.success ? '✅' : '❌'}`);
  console.log(`任务数量: ${tasksData.data?.length || 0}`);

  if (tasksData.data && tasksData.data.length > 0) {
    console.log('\n任务列表:');
    tasksData.data.forEach((task: any) => {
      console.log(`  - ${task.name} (${task.status}) - ${task.progress}%`);
    });
  }

  console.log('\n=================================================');
  console.log('请在浏览器控制台执行以下命令重新登录：');
  console.log('=================================================');
  console.log(`localStorage.setItem('accessToken', '${accessToken}');`);
  console.log(`localStorage.setItem('csrfToken', '${csrfToken}');`);
  console.log(`localStorage.setItem('user', '${JSON.stringify(loginData.data.user).replace(/'/g, "\\'")}');`);
  console.log('location.reload();');
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
