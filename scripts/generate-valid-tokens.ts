import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode('your-super-secret-jwt-key-change-this-in-production');
const REFRESH_TOKEN_SECRET = new TextEncoder().encode('your-super-secret-refresh-token-key');

async function main() {
  const now = Math.floor(Date.now() / 1000);

  // 生成 Access Token (15 分钟)
  const accessToken = await new SignJWT({
    userId: 'cmlhk5o5500005kisja9kg1iu',
    email: 'yogdunana@yogdunana.com',
    role: 'ADMIN',
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60) // 15 分钟
    .sign(JWT_SECRET);

  // 生成 Refresh Token (7 天)
  const refreshToken = await new SignJWT({
    userId: 'cmlhk5o5500005kisja9kg1iu',
    email: 'yogdunana@yogdunana.com',
    role: 'ADMIN',
    type: 'refresh',
    tokenId: crypto.randomUUID(),
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 天
    .sign(REFRESH_TOKEN_SECRET);

  // 生成 CSRF Token (1 小时)
  const csrfToken = await new SignJWT({
    sessionId: crypto.randomUUID(),
    timestamp: Date.now(),
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60) // 1 小时
    .sign(JWT_SECRET);

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
    id: 'cmlhk5o5500005kisja9kg1iu',
    email: 'yogdunana@yogdunana.com',
    username: 'Yogdunana',
    role: 'ADMIN',
    isVerified: true,
    isMfaEnabled: false,
    createdAt: '2026-02-11T04:57:01.049Z',
  }))});`);
  console.log('');
  console.log('location.reload();');
}

main().catch(console.error);
