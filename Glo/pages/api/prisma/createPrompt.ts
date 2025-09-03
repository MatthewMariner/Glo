import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

type Data = {
  content: string;
  userId: string;
  isDefault: boolean;
};

const validatePromptContent = (content: string) => {
  return content.length > 0 && content.length <= 800;
};

async function handle(req: NextApiRequestWithUser, res: NextApiResponse) {
  const { content, userId, isDefault }: Data = req.body;

  console.log(content.length);
  console.log(validatePromptContent(content));

  // Validate prompt content
  if (!validatePromptContent(content)) {
    return res.status(400).json({
      error: `Please ensure your wordcount is more than 0 and less than 700. Current word count: ${content.length}`,
    });
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

    // If isDefault is true, make sure to set all other prompts' isDefault to false
    if (isDefault) {
      await prisma.prompt.updateMany({
        where: {
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create new prompt
    const prompt = await prisma.prompt.create({
      data: {
        content,
        userId,
        isDefault,
      },
    });

    res.status(200).json(prompt);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create prompt' });
  } finally {
    await prisma.$disconnect();
  }
}

// export default withMiddleware(authMiddleware, handle);
export default handle;
