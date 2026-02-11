import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 生成新的登录 Token ===\n');

  // 查找管理员用户
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('❌ 没有找到管理员用户');
    process.exit(1);
  }

  console.log(`✅ 找到管理员: ${admin.username} (${admin.email})`);

  // 验证密码
  const password = 'X-Duan0719';
  const isValid = await bcrypt.compare(password, admin.passwordHash || '');

  if (!isValid) {
    console.error('❌ 密码验证失败');
    process.exit(1);
  }

  console.log('✅ 密码验证成功\n');

  // 获取 CSRF Token
  const csrfResponse = await fetch('http://localhost:5000/api/v1/auth/csrf-token');
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.data?.csrfToken || csrfData.data?.token;
  const setCookieHeader = csrfResponse.headers.get('set-cookie');

  console.log(`✅ CSRF Token: ${csrfToken?.substring(0, 30)}...`);

  // 登录
  const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': setCookieHeader || '',
    },
    body: JSON.stringify({
      email: admin.email,
      password: password,
    }),
  });

  const loginData = await loginResponse.json();
  console.log(`登录响应: ${loginResponse.status}`);

  if (!loginData.success) {
    console.error('❌ 登录失败:', loginData);
    process.exit(1);
  }

  const accessToken = loginData.data.accessToken;
  const refreshToken = loginData.data.refreshToken;

  console.log('✅ 登录成功\n');
  console.log('=================================================');
  console.log('请在浏览器控制台执行以下命令重新登录：');
  console.log('=================================================');
  console.log('');
  console.log('localStorage.setItem("accessToken", "' + accessToken + '");');
  console.log('localStorage.setItem("refreshToken", "' + refreshToken + '");');
  console.log('localStorage.setItem("csrfToken", "' + csrfToken + '");');
  console.log('localStorage.setItem("user", "' + JSON.stringify(loginData.data.user).replace(/"/g, '\\"') + '");');
  console.log('');
  console.log('location.reload();');
  console.log('');
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
