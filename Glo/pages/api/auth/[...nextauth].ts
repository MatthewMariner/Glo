import NextAuth, { NextAuthOptions } from 'next-auth';

// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [],
  // adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token }) {
      token.userRole = 'admin';
      return token;
    },
  },
};

export default NextAuth(authOptions);
