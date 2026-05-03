import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from './auth';
import { logActivity } from './activityLogger';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function requireAuth(
  req: NextRequest,
  roles?: string[]
): Promise<{ session: AuthSession } | NextResponse> {
  const session = await getServerSession(authOptions) as AuthSession | null;

  if (!session?.user) {
    logActivity('unknown', 'unknown', 'UNAUTHORIZED_ACCESS', req.nextUrl.pathname, 'No session');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (roles && !roles.includes(session.user.role)) {
    logActivity(
      session.user.id,
      session.user.email,
      'FORBIDDEN_ACCESS',
      req.nextUrl.pathname,
      `Required roles: ${roles.join(',')}, has: ${session.user.role}`
    );
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { session };
}
