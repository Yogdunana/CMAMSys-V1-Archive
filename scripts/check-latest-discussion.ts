/**
 * 查看最近的讨论结果
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLatestDiscussion() {
  try {
    const discussion = await prisma.groupDiscussion.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { round: 'asc' },
          take: 10,
        },
      },
    });

    if (!discussion) {
      console.log('No discussions found');
      return;
    }

    console.log(`Discussion ID: ${discussion.id}`);
    console.log(`Title: ${discussion.discussionTitle}`);
    console.log(`Status: ${discussion.status}`);
    console.log(`Rounds: ${discussion.currentRound}/${discussion.maxRounds}`);
    console.log(`Participants: ${discussion.participants.length}`);

    console.log(`\nMessages (${discussion.messages.length}):`);
    for (const message of discussion.messages) {
      console.log(`\n[${message.round}] ${message.senderName} (${message.messageType}):`);
      console.log(message.messageContent.substring(0, 500) + '...');
      console.log(`Core Algorithms: ${message.coreAlgorithms}`);
      console.log(`Innovations: ${message.innovations}`);
    }

    console.log(`\nSummary:`);
    console.log(JSON.stringify(discussion.summary, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestDiscussion();
