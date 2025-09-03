import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

// The handler for your Next.js API route
async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Check that the id is provided
  if (!id) {
    return res.status(400).json({ error: 'Missing conversation id' });
  }

  try {
    // Get the conversation with all its messages
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        messages: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Check if the conversation was found
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // If everything is fine, return the conversation
    return res.status(200).json(conversation);
  } catch (error) {
    // If something went wrong, return the error
    return res.status(500).json({ error: 'Something went wrong' });
  } finally {
    // Close the database connection
    await prisma.$disconnect();
  }
}

// export default withMiddleware(authMiddleware, handle);
export default handle;
