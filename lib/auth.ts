import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './dbConnect';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check for admin login using env
        const envEmail = process.env.ADMIN_EMAIL;
        const envPassword = process.env.ADMIN_PASSWORD;
        const envName = process.env.ADMIN_NAME || 'Admin';
        const envRole = process.env.ADMIN_ROLE || 'admin';
        const envWallet = process.env.ADMIN_WALLET || '';
        const envBalance = Number(process.env.ADMIN_BALANCE || 0);

        if (
          credentials.email === envEmail &&
          credentials.password === envPassword
        ) {
          return {
            id: 'env-admin',
            email: envEmail,
            name: envName,
            role: envRole,
            walletAddress: envWallet,
            balance: envBalance,
          };
        }

        // All other users use database
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user || user.isBlocked) {
          return null;
        }
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          walletAddress: user.walletAddress,
          balance: user.balance,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.walletAddress = user.walletAddress;
        token.balance = user.balance;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.walletAddress = token.walletAddress as string;
        session.user.balance = token.balance as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};