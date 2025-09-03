import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id, userEmail } = req.body;

  // Retrieve the user with the provided email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  // If the user doesn't exist or is not an admin, return an error
  if (!user || user.role !== 'ADMIN') {
    return res
      .status(403)
      .json({ error: 'You must be an admin to delete a prompt.' });
  }

  try {
    const result = await prisma.prompt.update({
      where: { id: id },
      data: {
        deletedAt: new Date(), // Set the current timestamp as the deletion time
      },
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
}
