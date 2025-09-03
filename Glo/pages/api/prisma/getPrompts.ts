import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

async function handle(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the active prompts
    const activePrompts = await prisma.prompt.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        deletedAt: true,
        userId: true,
        isDefault: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // If everything is fine, return the active prompts
    return res.status(200).json(activePrompts);
  } catch (error) {
    // If something went wrong, return the error
    return res.status(500).json({ error: 'Something went wrong' });
  } finally {
    // Close the database connection
    await prisma.$disconnect();
  }
}

export default handle;
// export default withMiddleware(authMiddleware, handle);
