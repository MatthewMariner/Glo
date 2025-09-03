// getUserPrompts.ts
import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import { authMiddleware } from '@/middlewares/auth-middleware';

async function handle(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the active userPrompts
    const activeUserPrompts = await prisma.userPrompt.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        category: true,
        content: true,
        createdAt: true,
        deletedAt: true,
        userId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return res.status(200).json(activeUserPrompts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong' });
  } finally {
    await prisma.$disconnect();
  }
}

// export default withMiddleware(authMiddleware, handle);

export default handle;
