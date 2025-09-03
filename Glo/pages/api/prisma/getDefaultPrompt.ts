import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const defaultPrompt = await prisma.prompt.findFirst({
        where: { isDefault: true },
      });

      if (!defaultPrompt) {
        return res
          .status(404)
          .json({ error: 'No default prompt found in the database' });
      }

      return res
        .status(200)
        .json({ content: defaultPrompt.content, id: defaultPrompt.id });
    } catch (error) {
      return res.status(500).json({ error: error });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handle;
