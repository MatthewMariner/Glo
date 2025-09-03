import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

// The handler for your Next.js API route
async function handle(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the active users
    const activeUsers = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
    });

    // If everything is fine, return the active users
    return res.status(200).json(activeUsers);
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
