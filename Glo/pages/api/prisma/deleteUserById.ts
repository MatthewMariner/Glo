import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = req.body;

  if (req.method === 'DELETE') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // if (user.email !== req?.session.user.email) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return res.json({ message: 'User deleted', user: deletedUser });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default withMiddleware(authMiddleware, handle);
