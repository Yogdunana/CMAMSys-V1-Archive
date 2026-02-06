/**
 * 测试注册和登录功能
 */

async function testRegister() {
  console.log('\n📝 测试用户注册...\n');

  const userData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#',
  };

  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  console.log('状态码:', response.status);
  console.log('响应:', JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('\n✅ 注册成功！');
    console.log('用户ID:', result.data.user.id);
    console.log('用户名:', result.data.user.username);
    console.log('邮箱:', result.data.user.email);
    console.log('Access Token:', result.data.accessToken.substring(0, 20) + '...');
    console.log('Refresh Token:', result.data.refreshToken.substring(0, 20) + '...');

    return result.data;
  } else {
    console.log('\n❌ 注册失败:', result.error.message);
    return null;
  }
}

async function testLogin(email: string, password: string) {
  console.log('\n🔐 测试用户登录...\n');

  const loginData = {
    email,
    password,
  };

  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });

  const result = await response.json();

  console.log('状态码:', response.status);
  console.log('响应:', JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('\n✅ 登录成功！');
    console.log('用户ID:', result.data.user.id);
    console.log('用户名:', result.data.user.username);
    console.log('上次登录时间:', result.data.user.lastLoginAt);
    console.log('Access Token:', result.data.accessToken.substring(0, 20) + '...');
    console.log('Refresh Token:', result.data.refreshToken.substring(0, 20) + '...');

    return result.data;
  } else {
    console.log('\n❌ 登录失败:', result.error.message);
    return null;
  }
}

async function testLoginWithWrongPassword(email: string) {
  console.log('\n🔐 测试错误密码登录...\n');

  const loginData = {
    email,
    password: 'WrongPassword123!',
  };

  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });

  const result = await response.json();

  console.log('状态码:', response.status);
  console.log('响应:', JSON.stringify(result, null, 2));

  if (!result.success) {
    console.log('\n✅ 错误密码被正确拒绝！');
    console.log('错误信息:', result.error.message);
  } else {
    console.log('\n❌ 安全问题：错误密码登录成功了！');
  }
}

async function testRegisterDuplicateUser() {
  console.log('\n📝 测试重复用户注册...\n');

  const userData = {
    email: 'test@example.com',
    username: 'testuser2',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#',
  };

  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  console.log('状态码:', response.status);
  console.log('响应:', JSON.stringify(result, null, 2));

  if (!result.success && result.error.code === 'USER_EXISTS') {
    console.log('\n✅ 重复用户被正确拒绝！');
    console.log('错误信息:', result.error.message);
  } else {
    console.log('\n❌ 问题：重复用户注册未被正确处理！');
  }
}

// 主测试函数
async function runTests() {
  console.log('========================================');
  console.log('  CMAMSys 注册和登录功能测试');
  console.log('========================================');

  try {
    // 1. 测试注册
    const registerResult = await testRegister();

    if (!registerResult) {
      console.log('\n⚠️  注册失败，无法继续测试登录功能');
      return;
    }

    // 2. 测试登录
    await testLogin('test@example.com', 'Test123!@#');

    // 3. 测试错误密码
    await testLoginWithWrongPassword('test@example.com');

    // 4. 测试重复注册
    await testRegisterDuplicateUser();

    console.log('\n========================================');
    console.log('  ✅ 所有测试完成！');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
runTests();
