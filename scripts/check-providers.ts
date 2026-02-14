/**
 * 检查数据库中的 AI Provider 状态
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProviders() {
  try {
    const providers = await prisma.aIProvider.findMany({
      include: {
        createdBy: true,
      },
    });

    console.log(`找到 ${providers.length} 个 AI Provider:\n`)

    providers.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name}`)
      console.log(`   Type: ${provider.type}`)
      console.log(`   Status: ${provider.status}`)
      console.log(`   Priority: ${provider.priority}`)
      console.log(`   Is Default: ${provider.isDefault}`)
      console.log(`   API Key: ${provider.apiKey ? '已配置' : '未配置'}`)
      console.log(`   Capability Tags: ${provider.capabilityTags.join(', ') || '无'}`)
      console.log(`   Scenario Tags: ${provider.scenarioTags.join(', ') || '无'}`)
      console.log(`   Created By: ${provider.createdBy.username}`)
      console.log(`   Created At: ${provider.createdAt}`)
      console.log('')
    })

    const activeProviders = providers.filter(p => p.status === 'ACTIVE')
    console.log(`活跃的 AI Provider: ${activeProviders.length}`)

    const defaultProviders = providers.filter(p => p.isDefault)
    console.log(`默认的 AI Provider: ${defaultProviders.length}`)
  } catch (error) {
    console.error('Error checking providers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProviders()
