import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

type Data = {
  content: string;
  category: string;
  userId: string;
};

const validatePromptContent = (content: string) => {
  return content.length > 0 && content.length <= 300;
};

const validateCategory = (category: string) => {
  return category.length > 0;
};

async function handle(req: NextApiRequestWithUser, res: NextApiResponse) {
  const { content, category, userId }: Data = req.body;

  // Validate prompt content and category
  if (!validatePromptContent(content)) {
    return res.status(400).json({ error: 'Invalid prompt content' });
  }

  if (!validateCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    // If user exists, create new userPrompt
    const userPrompt = await prisma.userPrompt.create({
      data: {
        content,
        category,
        userId,
      },
    });

    res.status(200).json(userPrompt);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create user prompt' });
  } finally {
    await prisma.$disconnect();
  }
}

// export default withMiddleware(authMiddleware, handle);
export default handle;
