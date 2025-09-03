import { NextApiResponse } from 'next';
import { ApiResponse } from '@/lib/types/api';
import { UserSession } from '@/lib/types/auth';
import { withMiddleware } from '@/middlewares';
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '@/middlewares/auth-middleware';

export type UserApiResponse = ApiResponse<UserSession>;

const getCurrentUserRoute = (
  req: NextApiRequestWithUser,
  res: NextApiResponse<UserApiResponse>,
) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

// export default withMiddleware(authMiddleware, getCurrentUserRoute);

export default getCurrentUserRoute;
