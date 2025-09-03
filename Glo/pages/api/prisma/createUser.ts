import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';
import bcrypt from 'bcrypt';

type Data = {
  email: string;
  ipAddress: string;
};

// Basic Email validation
const validateEmail = (email: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email) && email.length <= 40;
};

async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { email, ipAddress }: Data = req.body;

  // Validate email
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    //Send email with login link?

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // If user doesn't exist, create new user
    // Generate salt & hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(email, salt);

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        ipAddress: ipAddress,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create user' });
  } finally {
    await prisma.$disconnect();
  }
}

// export default withMiddleware(authMiddleware, handle);
export default handle;
