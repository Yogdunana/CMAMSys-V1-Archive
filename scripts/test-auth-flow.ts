import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { verifyAccessToken } from '@/lib/jwt';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 测试登录和认证 ===\n');

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

  // 3. 调用登录 API
  console.log('\n=== 调用登录 API ===');
  const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  console.log('\n=== Token 信息 ===');
  console.log('Access Token (前20字符):', accessToken.substring(0, 20) + '...');
  console.log('Refresh Token (前20字符):', refreshToken.substring(0, 20) + '...');

  // 4. 在浏览器中设置 Token 的指令
  console.log('\n=== 请在浏览器控制台执行以下命令 ===');
  console.log(`localStorage.setItem('accessToken', '${accessToken}');`);
  console.log(`localStorage.setItem('refreshToken', '${refreshToken}');`);
  console.log(`localStorage.setItem('user', '${JSON.stringify(loginData.data.user).replace(/'/g, "\\'")}');`);
  console.log('location.reload();');

  // 5. 测试 API
  console.log('\n=== 测试需要认证的 API ===');

  // 测试成本统计
  const costResponse = await fetch('http://localhost:5000/api/cost/stats', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const costData = await costResponse.json();
  console.log('GET /api/cost/status:', costResponse.status, costData.success ? '✅ 成功' : '❌ 失败');

  if (costResponse.ok) {
    console.log('返回数据:', JSON.stringify(costData.data, null, 2));
  } else {
    console.log('错误:', costData);
  }

  // 测试建模任务
  const tasksResponse = await fetch('http://localhost:5000/api/modeling-tasks', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const tasksData = await tasksResponse.json();
  console.log(`GET /api/modeling-tasks: ${tasksResponse.status}, 找到 ${tasksData.data?.length || 0} 个任务`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
