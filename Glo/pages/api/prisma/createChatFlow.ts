import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

async function handle(req: NextApiRequest, res: NextApiResponse) {
  const {
    userId,
    userInput,
    aiResponse,
    conversationId,
    systemPromptId,
    userPromptId,
  } = req.body;

  try {
    let currentConversationId = conversationId;

    // Create a new conversation if there's no conversationId
    if (!conversationId) {
      const newConversation = await prisma.conversation.create({
        data: {
          userId: userId,
          promptId: systemPromptId,
          userPromptId: userPromptId,
        },
      });
      //set after creating
      currentConversationId = newConversation.id;
    }

    // Save the user's message
    await prisma.message.create({
      data: {
        content: userInput,
        userId: userId,
        conversationId: currentConversationId,
      },
    });

    // Save the AI's response
    if (aiResponse) {
      await prisma.message.create({
        data: {
          content: aiResponse,
          userId: null, // AI doesn't have a userId
          conversationId: currentConversationId,
        },
      });
    }

    res.status(200).json({
      message: 'Conversation and Messages saved successfully!',
      conversationId: currentConversationId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to save conversation and messages' });
  } finally {
    await prisma.$disconnect();
  }
}

// export default withMiddleware(authMiddleware, handle);

export default handle;
