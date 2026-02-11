// 测试 SSE 日志流
async function testSSEStream() {
  console.log('=== 测试 SSE 日志流 ===\n');

  const taskId = 'cmlhk5oj400055kishzwp0ynk'; // 使用存在的任务 ID
  const url = `http://localhost:5000/api/modeling-tasks/${taskId}/logs`;

  console.log(`连接到: ${url}`);
  console.log('等待消息...\n');

  let messageCount = 0;
  let startTime = Date.now();

  try {
    const response = await fetch(url);
    console.log(`响应状态: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}\n`);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      console.error('无法获取 reader');
      return;
    }

    // 设置超时，30 秒后停止
    const timeout = setTimeout(() => {
      console.log('\n达到测试超时 (30秒)，停止接收...');
      reader.cancel();
    }, 30000);

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('\n流已关闭');
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // 处理 SSE 格式 (data: {...}\n\n)
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          try {
            const message = JSON.parse(data);
            messageCount++;
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[${elapsed}s] [${message.level}] ${message.message}`);
            if (message.data) {
              console.log(`  Data: ${JSON.stringify(message.data)}`);
            }

            // 如果收到完成消息，停止
            if (message.message === '模拟日志流演示完成') {
              console.log('\n收到完成消息，停止接收...');
              clearTimeout(timeout);
              reader.cancel();
              return;
            }
          } catch (e) {
            console.log(`无法解析消息: ${data}`);
          }
        }
      }
    }

    clearTimeout(timeout);
  } catch (error) {
    console.error('错误:', error);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== 测试完成 ===`);
  console.log(`总消息数: ${messageCount}`);
  console.log(`总时长: ${duration} 秒`);
}

testSSEStream();
