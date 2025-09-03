import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequestWithUser } from '@/middlewares/auth-middleware';

type Data = {
  id: number;
  isDefault: boolean;
};

const validatePromptID = (id: number) => {
  return id > 0;
};

async function handle(req: NextApiRequestWithUser, res: NextApiResponse) {
  const { id, isDefault }: Data = req.body;

  // Validate prompt ID
  if (!validatePromptID(id)) {
    return res.status(400).json({ error: 'Invalid prompt ID' });
  }

  try {
    // Check if prompt exists
    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        id: id,
      },
    });

    if (!existingPrompt) {
      return res.status(400).json({ error: 'Prompt does not exist' });
    }

    // If prompt exists, update it
    const prompt = await prisma.prompt.update({
      where: {
        id: id,
      },
      data: {
        isDefault: isDefault,
      },
    });

    res.status(200).json(prompt);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to update prompt' });
  } finally {
    await prisma.$disconnect();
  }
}

// export default withMiddleware(authMiddleware, handle);
export default handle;
