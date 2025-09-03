import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

enum Role {
  ADMIN,
  USER,
}

type BodyType = {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  role?: Role;
};

async function handle(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id, email, name, image, role } = req.body;
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update the user
      const updatedUser = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          email: email ?? user.email, // Keep the old value if new is not provided
          name: name ?? user.name,
          image: image ?? user.image,
          role: role ?? user.role,
        },
      });

      res
        .status(200)
        .json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong', details: error });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// export default withMiddleware(authMiddleware, handle);
export default handle;
