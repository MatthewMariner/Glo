import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { conversationId } = req.body;
    try {
      // Check if conversation exists
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Soft delete all messages in the conversation
      await prisma.message.updateMany({
        where: {
          conversationId: conversationId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      // Soft delete the conversation
      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// export default withMiddleware(authMiddleware, handle);
export default handle;
