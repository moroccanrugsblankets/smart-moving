import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { usersStore } from './fileStore';
import { logActivity } from './activityLogger';
import { checkRateLimit, recordFailedAttempt, resetAttempts } from './rateLimiter';
import { headers } from 'next/headers';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Enforce rate limiting server-side using the real client IP from headers
        const headersList = await headers();
        const ip =
          headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
          headersList.get('x-real-ip') ??
          'unknown';

        const { allowed } = checkRateLimit(ip);
        if (!allowed) {
          throw new Error('Too many attempts');
        }

        const user = await usersStore.findByEmail(credentials.email);
        if (!user) {
          recordFailedAttempt(ip);
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          recordFailedAttempt(ip);
          return null;
        }

        // Successful login: clear failed attempts and log activity
        resetAttempts(ip);
        logActivity(user.id, user.email, 'LOGIN', 'auth', 'Successful login');

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/portal-access-secure',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
