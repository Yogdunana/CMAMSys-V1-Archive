/**
 * 检查数据库中的自动化任务状态
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTasks() {
  try {
    const tasks = await prisma.autoModelingTask.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        discussion: true,
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    })

    console.log(`找到 ${tasks.length} 个最近的自动化任务:\n`)

    tasks.forEach((task, index) => {
      console.log(`${index + 1}. Task ID: ${task.id}`)
      console.log(`   Title: ${task.problemTitle}`)
      console.log(`   Status: ${task.overallStatus}`)
      console.log(`   Progress: ${task.progress}%`)
      console.log(`   Discussion Status: ${task.discussionStatus}`)
      console.log(`   Validation Status: ${task.validationStatus}`)
      console.log(`   Paper Status: ${task.paperStatus}`)
      console.log(`   Idea: ${task.idea ? '已生成' : '未生成'}`)
      console.log(`   Discussion ID: ${task.discussionId || '无'}`)
      console.log(`   Created At: ${task.createdAt}`)
      console.log(`   Updated At: ${task.updatedAt}`)

      if (task.codeGeneration) {
        console.log(`   Code Generation:`)
        console.log(`     - Status: ${task.codeGeneration.status}`)
        console.log(`     - Execution Status: ${task.codeGeneration.executionStatus}`)
        console.log(`     - Runtime: ${task.codeGeneration.runtimeMs}ms`)
        console.log(`     - Memory: ${task.codeGeneration.memoryUsageBytes}B`)
      }

      if (task.paperGeneration) {
        console.log(`   Paper Generation:`)
        console.log(`     - Status: ${task.paperGeneration.status}`)
        console.log(`     - Content Length: ${task.paperGeneration.content?.length || 0}`)
      }

      console.log('')
    })
  } catch (error) {
    console.error('Error checking tasks:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTasks()
