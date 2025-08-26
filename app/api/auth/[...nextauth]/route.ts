import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {label: 'Email', type: 'text'},
        password: {label: 'Password', type: 'password'}
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({email: credentials?.email});
        if (user && bcrypt.compareSync(credentials!.password, user.password)) {
          return {id: user._id, name: user.name, email: user.email, role: user.role};
        }
        return null;
      }
    })
  ],
  session: {strategy: 'jwt'},
  callbacks: {
    async jwt({token, user}) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({session, token}) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    }
  }
});

export {handler as GET, handler as POST};
