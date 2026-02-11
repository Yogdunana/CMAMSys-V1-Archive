import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 生成新的 Token ===\n');

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.log('❌ 找不到管理员用户');
    return;
  }

  const now = Math.floor(Date.now() / 1000);

  // 生成 Access Token (15 分钟)
  const accessTokenPayload = {
    userId: admin.id,
    email: admin.email,
    role: admin.role,
    type: 'access',
    iat: now,
    exp: now + 15 * 60, // 15 分钟
  };

  // 生成 Refresh Token (7 天)
  const refreshTokenPayload = {
    userId: admin.id,
    email: admin.email,
    role: admin.role,
    type: 'refresh',
    tokenId: crypto.randomUUID(),
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 天
  };

  // 生成 CSRF Token (1 小时)
  const csrfPayload = {
    sessionId: crypto.randomUUID(),
    timestamp: Date.now(),
    iat: now,
    exp: now + 60 * 60, // 1 小时
  };

  // 使用简单的 base64 编码（实际应该使用 JWT）
  const encode = (obj: any) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(obj));
    const signature = btoa(`${header}.${payload}.secret`);
    return `${header}.${payload}.${signature}`;
  };

  const accessToken = encode(accessTokenPayload);
  const refreshToken = encode(refreshTokenPayload);
  const csrfToken = encode(csrfPayload);

  console.log('=== 新的 Token ===\n');
  console.log('Access Token (15 分钟):');
  console.log(accessToken);
  console.log('');
  console.log('Refresh Token (7 天):');
  console.log(refreshToken);
  console.log('');
  console.log('CSRF Token (1 小时):');
  console.log(csrfToken);
  console.log('');
  console.log('=== 浏览器控制台命令 ===\n');
  console.log(`localStorage.setItem("accessToken", "${accessToken}");`);
  console.log(`localStorage.setItem("refreshToken", "${refreshToken}");`);
  console.log(`localStorage.setItem("csrfToken", "${csrfToken}");`);
  console.log(`localStorage.setItem("user", ${JSON.stringify(JSON.stringify({
    id: admin.id,
    email: admin.email,
    username: admin.username,
    role: admin.role,
    isVerified: true,
    isMfaEnabled: false,
    createdAt: admin.createdAt.toISOString(),
  }))});`);
  console.log('');
  console.log('location.reload();');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
