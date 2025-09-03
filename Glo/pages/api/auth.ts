// middleware/auth.ts

import { getServerSession, Session } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

const withAuth =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach the session to the request object
    (req as any).session = session;

    // Call the handler with the request and response
    return handler(req, res);
  };

export default withAuth;
