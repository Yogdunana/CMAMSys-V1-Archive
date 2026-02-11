import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 测试登录流程 ===\n');

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

  // 3. 生成 Access Token
  const accessToken = jwt.sign(
    {
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    {
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    },
    process.env.REFRESH_TOKEN_SECRET || 'your-super-secret-refresh-token-key',
    { expiresIn: '7d' }
  );

  console.log('\n✅ Token 生成成功');
  console.log('\n=== 登录信息 ===');
  console.log('Access Token:', accessToken);
  console.log('Refresh Token:', refreshToken);
  console.log('\n=== 使用此 Token 测试 API ===');
  console.log('\n在浏览器控制台执行:');
  console.log(`localStorage.setItem('accessToken', '${accessToken}');`);
  console.log(`localStorage.setItem('refreshToken', '${refreshToken}');`);
  console.log('location.reload();');

  // 4. 测试 API
  console.log('\n=== 测试 API ===');
  const response = await fetch('http://localhost:5000/api/cost/stats', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  console.log('/api/cost/status:', response.status, data);

  const tasksResponse = await fetch('http://localhost:5000/api/modeling-tasks', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const tasksData = await tasksResponse.json();
  console.log('/api/modeling-tasks:', tasksResponse.status, `Found ${tasksData.data?.length || 0} tasks`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
