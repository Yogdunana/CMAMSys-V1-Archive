/**
 * 检查单个任务的详细状态
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTaskDetail(taskId: string) {
  try {
    const task = await prisma.autoModelingTask.findUnique({
      where: { id: taskId },
      include: {
        discussion: {
          include: { messages: true },
        },
        codeGeneration: true,
        validations: true,
        paper: true,
      },
    })

    if (!task) {
      console.log(`Task ${taskId} not found`)
      return
    }

    console.log(`Task Detail:\n`)
    console.log(`ID: ${task.id}`)
    console.log(`Title: ${task.problemTitle}`)
    console.log(`Status: ${task.overallStatus}`)
    console.log(`Progress: ${task.progress}%`)
    console.log(`\nDiscussion Status: ${task.discussionStatus}`)
    console.log(`Validation Status: ${task.validationStatus}`)
    console.log(`Paper Status: ${task.paperStatus}`)
    // console.log(`\nIdea:\n${task.idea || 'No idea'}`) // 字段不存在
    // console.log(`\nSummary:\n${task.summary || 'No summary'}`) // 字段不存在

    if (task.discussion) {
      console.log(`\nDiscussion ID: ${task.discussion.id}`)
      console.log(`Messages: ${task.discussion.messages.length}`)
    }

    if (task.codeGeneration) {
      console.log(`\nCode Generation ID: ${task.codeGeneration.id}`)
      console.log(`Execution Status: ${task.codeGeneration.executionStatus}`)
      console.log(`Code Language: ${task.codeGeneration.codeLanguage}`)
      // console.log(`Runtime: ${task.codeGeneration.runtimeMs}ms`) // 字段不存在
      // console.log(`Memory: ${task.codeGeneration.memoryUsageBytes}B`) // 字段不存在
      console.log(`\nCode:\n${task.codeGeneration.codeContent}`)
      // console.log(`\nExecution Output:\n${task.codeGeneration.executionOutput || 'No output'}`) // 字段不存在
    }

    if (task.validations && task.validations.length > 0) {
      console.log(`\nValidations: ${task.validations.length}`)
      task.validations.forEach((validation, index) => {
        console.log(`\nValidation ${index + 1}:`)
        console.log(`  ID: ${validation.id}`)
        console.log(`  Status: ${validation.status}`)
        console.log(`  Error: ${validation.errorMessage || 'None'}`)
        // console.log(`  Issues: ${validation.issues}`) // 字段不存在
        // console.log(`  Suggestions: ${validation.suggestions}`) // 字段不存在
      })
    }

    if (task.paper) {
      console.log(`\nPaper ID: ${task.paper.id}`)
      console.log(`Status: ${task.paper.status}`)
      console.log(`Content Length: ${task.paper.content?.length || 0}`)
      console.log(`\nPaper Content:\n${task.paper.content || 'No content'}`)
    }
  } catch (error) {
    console.error('Error checking task detail:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const taskId = process.argv[2]
if (!taskId) {
  console.log('Usage: npx tsx scripts/check-task-detail.ts <task_id>')
} else {
  checkTaskDetail(taskId)
}
