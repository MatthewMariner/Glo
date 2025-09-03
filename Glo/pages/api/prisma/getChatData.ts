import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    const userConversations = await prisma.conversation.findMany({
      where: {
        userId: String(userId),
        deletedAt: null,
      },
      include: {
        messages: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return res.status(200).json(userConversations);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error fetching data' });
  } finally {
    await prisma.$disconnect();
  }
}

// export default withMiddleware(authMiddleware, handle);

export default handle;
