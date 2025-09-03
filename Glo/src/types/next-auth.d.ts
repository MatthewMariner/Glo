// types/next-auth.d.ts

import { Session } from 'next-auth';
import 'next-auth/jwt';
import { NextApiRequest } from 'next';

declare module 'next' {
  export interface NextApiRequest {
    session?: Session;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** The user's role. */
    userRole?: 'admin';
  }
}
