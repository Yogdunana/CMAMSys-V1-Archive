import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 调试登录流程 ===\n');

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

  // 3. 登录
  const password = 'X-Duan0719';
  const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({
      email: admin?.email,
      password: password,
    }),
  });

  console.log(`\n登录响应状态: ${loginResponse.status}`);
  console.log(`登录响应类型: ${loginResponse.headers.get('content-type')}`);
  console.log(`登录响应长度: ${loginResponse.headers.get('content-length')}`);

  const textResponse = await loginResponse.text();
  console.log(`\n原始响应 (前500字符):\n${textResponse.substring(0, 500)}`);

  try {
    const loginData = JSON.parse(textResponse);
    console.log(`\n解析后的数据:`, JSON.stringify(loginData, null, 2));

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
        console.log(`数据: ${JSON.stringify(costData.data, null, 2)}`);
      }
    }
  } catch (error) {
    console.error('JSON 解析失败:', error);
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
